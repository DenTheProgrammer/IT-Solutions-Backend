import { type INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { getIntrospectionQuery } from 'graphql';
import { randomUUID } from 'node:crypto';
import { candidateData } from '../prisma/seed/candidate.data';
import { AppModule } from '../src/app.module';
import { validateEnvironment } from '../src/config/environment';
import type { Prisma } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureHttp } from '../src/config/http';
import { ProfileRepository } from '../src/profile/profile.repository';
import {
  fullProfileFields,
  fullProfileQuery,
} from '../src/graphql/full-profile-query';

interface GraphqlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

interface ProfileResult {
  id: string;
  slug: string;
  fullName: string;
  headline: string;
  summary: string;
  location: string | null;
  workFormat: string | null;
  links: { id: string; kind: string; label: string; url: string }[];
  skills: {
    id: string;
    name: string;
    category: string;
    details: string | null;
  }[];
  experiences: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    achievements: { id: string; text: string }[];
  }[];
  projects: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    repositoryUrl: string | null;
    isRepositoryPrivate: boolean;
    technologies: string[];
  }[];
}

describe('GraphQL API (real PostgreSQL, production mode)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let endpoint: string;
  const queries: Prisma.QueryEvent[] = [];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>({
      logger: false,
    });
    configureHttp(app as NestExpressApplication);
    prisma = app.get(PrismaService);
    prisma.$on('query', (event) => {
      queries.push(event);
    });
    await app.listen(0, '127.0.0.1');
    endpoint = `${await app.getUrl()}/graphql`;
  });

  afterAll(async () => {
    await app?.close();
  });

  async function post<T>(
    query: string,
    variables: Record<string, unknown> = {},
  ) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as GraphqlResponse<T>;
    expect(body.errors).toBeUndefined();
    return body.data;
  }

  // Six SELECTs: profiles, profile_links, skills, experiences, projects, achievements.
  // Connection/startup/setup SQL is outside the measured HTTP request.
  function expectSixQueries() {
    expect(queries).toHaveLength(6);
    expect(
      queries
        .map(({ query }) => query.match(/FROM "card"\."(\w+)"/)?.[1])
        .sort(),
    ).toEqual([
      'achievements',
      'experiences',
      'profile_links',
      'profiles',
      'projects',
      'skills',
    ]);
  }

  it('returns every public seed field and all relations with exactly six SQL queries', async () => {
    queries.length = 0;
    const { profile } = await post<{ profile: ProfileResult | null }>(
      fullProfileQuery,
      { slug: candidateData.profile.slug },
    );
    expectSixQueries();
    const id: unknown = expect.stringMatching(/^[a-f0-9-]{36}$/);
    expect(profile).toEqual({
      id,
      ...candidateData.profile,
      links: candidateData.links.map(({ kind, label, url }) => ({
        id,
        kind,
        label,
        url,
      })),
      skills: candidateData.skills.map((skill) => ({
        id,
        name: skill.name,
        category: skill.category,
        details: 'details' in skill ? skill.details : null,
      })),
      experiences: candidateData.experiences.map((experience) => ({
        id,
        company: experience.company,
        position: experience.position,
        startDate: experience.startDate.toISOString().slice(0, 7),
        endDate: experience.endDate?.toISOString().slice(0, 7) ?? null,
        isCurrent: experience.endDate === null,
        achievements: experience.achievements.map(({ text }) => ({ id, text })),
      })),
      projects: candidateData.projects.map((project) => ({
        id,
        name: project.name,
        description: project.description,
        url: 'url' in project ? project.url : null,
        repositoryUrl:
          'repositoryUrl' in project ? project.repositoryUrl : null,
        isRepositoryPrivate:
          'isRepositoryPrivate' in project
            ? project.isRepositoryPrivate
            : false,
        technologies: project.technologies,
      })),
    });
    expect(profile?.links.map(({ kind }) => kind)).toEqual([
      'GITHUB',
      'TELEGRAM',
      'EMAIL',
      'PHONE',
      'PROFI_RU',
      'YOUTUBE',
      'BEHANCE',
    ]);
    expect(profile?.links[3]).toEqual({
      id,
      kind: 'PHONE',
      label: '+7 (964) 634-35-76',
      url: 'tel:+79646343576',
    });
    expect(
      profile?.links.some(({ url }) =>
        /^https?:\/\/([^/]+\.)?linkedin\.com\//i.test(url),
      ),
    ).toBe(false);
    console.log(`Full profile SQL: ${queries.length}`);
  });

  it('returns null for an unknown slug and supports profiles', async () => {
    await expect(post('{ profile(slug: "nope") { id } }')).resolves.toEqual({
      profile: null,
    });
    const result = await post<{ profiles: { slug: string }[] }>(
      '{ profiles { slug } }',
    );
    expect(result.profiles).toEqual([{ slug: candidateData.profile.slug }]);
  });

  it('migrates, seeds and reads card without creating public tables', async () => {
    expect(new URL(process.env.DATABASE_URL!).searchParams.get('schema')).toBe(
      'card',
    );
    const rows = await prisma.$queryRaw<{ table_schema: string }[]>`
      SELECT table_schema FROM information_schema.tables
      WHERE table_name = 'profiles' AND table_schema IN ('public', 'card')
    `;
    expect(rows).toEqual([{ table_schema: 'card' }]);
    expect(await prisma.profile.count()).toBe(1);
  });

  it.each(['\u0000', '', 'UPPER', '-slug', 'two--hyphens', 'a'.repeat(101)])(
    'rejects invalid slug %j before reaching the repository',
    async (slug) => {
      const find = jest.spyOn(app.get(ProfileRepository), 'findBySlug');
      queries.length = 0;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: fullProfileQuery,
            variables: { slug },
          }),
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          data: { profile: null },
          errors: [
            {
              message: expect.stringContaining('slug must contain') as unknown,
              extensions: { code: 'BAD_USER_INPUT' },
            },
          ],
        });
        expect(find).not.toHaveBeenCalled();
        expect(queries).toHaveLength(0);
      } finally {
        find.mockRestore();
      }
    },
  );

  it('masks unexpected production errors and logs their original details', async () => {
    const original = new Error(
      'private PostgreSQL error: secret connection details',
    );
    const find = jest
      .spyOn(app.get(ProfileRepository), 'findBySlug')
      .mockRejectedValueOnce(original);
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: fullProfileQuery,
          variables: { slug: 'valid-slug' },
        }),
      });
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(JSON.parse(body)).toMatchObject({
        errors: [
          {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      });
      expect(body).not.toContain('private PostgreSQL');
      expect(body).not.toContain('stacktrace');
      expect(body).not.toContain('originalError');
      expect(log).toHaveBeenCalledWith(original.stack);
    } finally {
      find.mockRestore();
      log.mockRestore();
    }
  });

  it.each([
    [
      'aliases',
      `{ profile(slug: "denis-mozhayskiy") { ${Array.from({ length: 500 }, (_, i) => `p${i}: projects { name description }`).join(' ')} } }`,
      'alias limit of 50',
    ],
    [
      'selections',
      `{ profiles { ${'slug '.repeat(1001)} } }`,
      'selection limit of 1000',
    ],
    [
      'fragment expansion',
      `{ profiles { ${'...Fields '.repeat(40)} } } fragment Fields on Profile { ${fullProfileFields} }`,
      'selection limit of 1000',
    ],
  ])(
    'rejects excessive %s before executing SQL',
    async (_name, query, message) => {
      queries.length = 0;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      expect(response.status).toBe(400);
      const body = (await response.json()) as GraphqlResponse<unknown>;
      expect(body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(message) as unknown,
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
          }),
        ]),
      );
      expect(queries).toHaveLength(0);
    },
  );

  it('shares skill batches across category aliases without leaking filters or request caches', async () => {
    const query = `{
      profile(slug: "denis-mozhayskiy") {
        all: skills { name category }
        development: skills(category: DEVELOPMENT) { name category }
        integrations: skills(category: INTEGRATIONS_OPERATIONS) { name category }
        quality: skills(category: QUALITY_AUTOMATION) { name category }
        unfiltered: skills(category: null) { name category }
      }
    }`;
    type Skill = { name: string; category: string };
    type Aliases = Record<
      'all' | 'development' | 'integrations' | 'quality' | 'unfiltered',
      Skill[]
    >;
    const expected = candidateData.skills.map(({ name, category }) => ({
      name,
      category,
    }));
    for (let request = 0; request < 2; request++) {
      queries.length = 0;
      const { profile } = await post<{ profile: Aliases }>(query);
      expect(queries).toHaveLength(2);
      expect(profile).toEqual({
        all: expected,
        unfiltered: expected,
        development: expected.filter(
          ({ category }) => category === 'DEVELOPMENT',
        ),
        integrations: expected.filter(
          ({ category }) => category === 'INTEGRATIONS_OPERATIONS',
        ),
        quality: expected.filter(
          ({ category }) => category === 'QUALITY_AUTOMATION',
        ),
      });
    }
  });

  it('keeps six SQL queries as the number of profiles and experiences grows, and returns empty lists', async () => {
    const candidate = await prisma.profile.findUniqueOrThrow({
      where: { slug: candidateData.profile.slug },
    });
    const extra = await prisma.profile.create({
      data: {
        slug: 'e2e-extra',
        fullName: 'E2E',
        headline: 'E2E',
        summary: 'E2E',
        links: { create: candidateData.links },
        skills: { create: candidateData.skills },
        projects: { create: candidateData.projects },
      },
    });
    const empty = await prisma.profile.create({
      data: {
        slug: 'e2e-empty',
        fullName: 'Empty',
        headline: 'Empty',
        summary: 'Empty',
      },
    });
    const addedIds: string[] = Array.from({ length: 24 }, () => randomUUID());
    try {
      await prisma.experience.createMany({
        data: addedIds.map((id, index) => ({
          id,
          profileId: index % 2 === 0 ? candidate.id : extra.id,
          company: 'E2E',
          position: 'E2E',
          startDate: new Date('2020-01-01Z'),
          sortOrder: 100 + index,
        })),
      });
      await prisma.achievement.createMany({
        data: addedIds.slice(1).map((experienceId, sortOrder) => ({
          experienceId,
          text: 'E2E',
          sortOrder,
        })),
      });
      queries.length = 0;
      const single = await post<{ profile: ProfileResult }>(fullProfileQuery, {
        slug: candidateData.profile.slug,
      });
      expectSixQueries();
      expect(single.profile.experiences).toHaveLength(
        candidateData.experiences.length + 12,
      );
      queries.length = 0;
      const { profiles } = await post<{ profiles: ProfileResult[] }>(
        `{ profiles { ${fullProfileFields} } }`,
      );
      expectSixQueries();
      expect(profiles.map(({ slug }) => slug)).toEqual([
        'denis-mozhayskiy',
        'e2e-empty',
        'e2e-extra',
      ]);
      expect(profiles.find(({ slug }) => slug === 'e2e-empty')).toMatchObject({
        links: [],
        skills: [],
        experiences: [],
        projects: [],
      });
      const addedExperiences = profiles
        .flatMap(({ experiences }) => experiences)
        .filter(({ id }) => addedIds.includes(id));
      expect(addedExperiences).toHaveLength(24);
      for (const experience of addedExperiences) {
        expect(experience.achievements).toHaveLength(
          experience.id === addedIds[0] ? 0 : 1,
        );
      }
      console.log(
        `3 profiles / ${candidateData.experiences.length + 24} experiences SQL: ${queries.length}`,
      );
    } finally {
      await prisma.experience.deleteMany({ where: { id: { in: addedIds } } });
      await prisma.profile.deleteMany({
        where: { id: { in: [extra.id, empty.id] } },
      });
    }
  });

  it('serves the embedded Sandbox in production with a preflight header configured', async () => {
    expect(process.env.NODE_ENV).toBe('production');
    const response = await fetch(endpoint, {
      headers: { Accept: 'text/html' },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('embeddable-sandbox');
    expect(html).toContain('Apollo-Require-Preflight');
    expect(html).toContain(JSON.stringify(fullProfileQuery));
    expect(html).toContain(JSON.stringify({ slug: 'denis-mozhayskiy' }));
    const introspection = await post<{
      __schema: { queryType: { name: string } };
    }>(
      getIntrospectionQuery({
        descriptions: true,
        specifiedByUrl: true,
        directiveIsRepeatable: true,
        schemaDescription: true,
        inputValueDeprecation: true,
        oneOf: true,
      }),
    );
    expect(introspection.__schema.queryType.name).toBe('Query');
  });

  it('keeps Apollo CSRF prevention enabled and accepts the configured Sandbox header', async () => {
    const url = new URL(endpoint);
    url.searchParams.set('query', '{ profiles { slug } }');
    const blocked = await fetch(url);
    expect(blocked.status).toBe(400);
    expect(await blocked.text()).toContain('Cross-Site Request Forgery');
    const allowed = await fetch(url, {
      headers: { 'Apollo-Require-Preflight': 'true' },
    });
    expect(allowed.status).toBe(200);
    expect(await allowed.json()).toEqual({
      data: { profiles: [{ slug: candidateData.profile.slug }] },
    });
  });

  it('logs SQL only when explicitly enabled in development', async () => {
    const debug = jest
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => undefined);
    try {
      for (const [nodeEnv, flag, expectedLogs] of [
        ['development', undefined, 0],
        ['development', 'true', 1],
        ['production', 'true', 0],
      ] as const) {
        debug.mockClear();
        const config = validateEnvironment({
          DATABASE_URL: process.env.DATABASE_URL,
          NODE_ENV: nodeEnv,
          PRISMA_LOG_QUERIES: flag,
        });
        const client = new PrismaService(new ConfigService(config));
        try {
          await client.$queryRawUnsafe('SELECT 1');
          expect(debug).toHaveBeenCalledTimes(expectedLogs);
          if (expectedLogs > 0) {
            expect(debug).toHaveBeenCalledWith(
              expect.stringContaining('SELECT 1'),
            );
          }
        } finally {
          await client.$disconnect();
        }
      }
    } finally {
      debug.mockRestore();
    }
  });
});
