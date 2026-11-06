import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getIntrospectionQuery } from 'graphql';
import { AppModule } from '../src/app.module';
import { configureHttp } from '../src/config/http';
import { validateEnvironment } from '../src/config/environment';
import { GRAPHQL_RATE_LIMIT } from '../src/graphql/rate-limit';

describe.each(['false', 'private'] as const)(
  'GraphQL rate limit (TRUST_PROXY=%s)',
  (trust) => {
    let app: NestExpressApplication;
    let url: string;

    beforeAll(async () => {
      process.env.TRUST_PROXY = trust;
      const module = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ConfigService)
        .useValue(
          new ConfigService(
            validateEnvironment({ ...process.env, TRUST_PROXY: trust }),
          ),
        )
        .compile();
      app = module.createNestApplication<NestExpressApplication>({
        logger: false,
      });
      configureHttp(app);
      await app.listen(0, '127.0.0.1');
      url = await app.getUrl();
    });

    afterAll(async () => {
      await app?.close();
      process.env.TRUST_PROXY = 'false';
    });

    function request(query: string, forwarded: string) {
      return fetch(`${url}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': forwarded,
        },
        body: JSON.stringify({ query }),
      });
    }

    it('allows 120 requests including polling, shares the IP budget across operations, and rejects request 121', async () => {
      for (let i = 0; i < GRAPHQL_RATE_LIMIT; i++) {
        const response = await request(
          i % 2 === 0
            ? getIntrospectionQuery()
            : '{ a: __typename b: __typename }',
          // A forged leftmost address cannot bypass the last untrusted hop.
          `198.51.100.${i + 1}, 203.0.113.9`,
        );
        expect(response.status).toBe(200);
        expect((await response.json()) as object).not.toHaveProperty('errors');
      }
      const blocked = await request(
        '{ profiles { slug } }',
        '192.0.2.1, 203.0.113.9',
      );
      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
      expect(await blocked.json()).toMatchObject({
        errors: [
          {
            message: expect.stringContaining(
              '120 requests per minute',
            ) as unknown,
            extensions: { code: 'TOO_MANY_REQUESTS' },
          },
        ],
      });
      expect((await fetch(`${url}/health`)).status).toBe(200);
      if (trust === 'private') {
        const other = await request('{ __typename }', '203.0.113.10');
        expect(other.status).toBe(200);
      }
    });

    it('trusts only the configured local/private proxy ranges', () => {
      const proxy = app
        .getHttpAdapter()
        .getInstance()
        .get('trust proxy fn') as (ip: string) => boolean;
      expect(proxy('203.0.113.9')).toBe(false);
      for (const ip of [
        '127.0.0.1',
        '::1',
        '10.0.0.1',
        '172.18.0.1',
        '192.168.1.1',
        'fc00::1',
      ]) {
        expect(proxy(ip)).toBe(trust === 'private');
      }
    });
  },
);
