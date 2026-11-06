import { DataLoaderFactory } from '../src/graphql/dataloader.factory';
import { domainTestModule } from './domain-test-module';
import {
  achievementRow,
  experienceRow,
  linkRow,
  projectRow,
  skillRow,
} from './fixtures';

describe('Request DataLoaders (real services, mocked repositories)', () => {
  let setup: Awaited<ReturnType<typeof domainTestModule>>;
  beforeEach(async () => {
    setup = await domainTestModule();
  });
  afterEach(async () => {
    await setup.module.close();
  });

  it.each([
    'links',
    'skills',
    'experiences',
    'achievements',
    'projects',
  ] as const)(
    '%s: N parents use one repository call, preserve key order and supply empty lists',
    async (name) => {
      setup.profile.findLinksByProfileIds.mockResolvedValue([
        linkRow('a'),
        linkRow('b', 1),
        linkRow('b'),
      ]);
      setup.skill.findByProfileIds.mockResolvedValue([
        skillRow('a'),
        skillRow('b', 1),
        skillRow('b'),
      ]);
      setup.experience.findByProfileIds.mockResolvedValue([
        experienceRow('a'),
        experienceRow('b', 1),
        experienceRow('b'),
      ]);
      setup.experience.findAchievementsByExperienceIds.mockResolvedValue([
        achievementRow('a'),
        achievementRow('b', 1),
        achievementRow('b'),
      ]);
      setup.project.findByProfileIds.mockResolvedValue([
        projectRow('a'),
        projectRow('b', 1),
        projectRow('b'),
      ]);
      const calls = {
        links: setup.profile.findLinksByProfileIds,
        skills: setup.skill.findByProfileIds,
        experiences: setup.experience.findByProfileIds,
        achievements: setup.experience.findAchievementsByExperienceIds,
        projects: setup.project.findByProfileIds,
      };
      const loader = setup.module.get(DataLoaderFactory).create()[name];
      const keys = ['b', 'missing', 'a', 'b'];
      const result = await Promise.all(keys.map((key) => loader.load(key)));
      expect(calls[name]).toHaveBeenCalledTimes(1);
      expect(calls[name]).toHaveBeenCalledWith(['b', 'missing', 'a']);
      expect(result.map((rows) => rows.map((row) => row.sortOrder))).toEqual([
        [0, 1],
        [],
        [0],
        [0, 1],
      ]);
      expect(
        result.map((rows) =>
          rows.map((row) =>
            'profileId' in row ? row.profileId : row.experienceId,
          ),
        ),
      ).toEqual([['b', 'b'], [], ['a'], ['b', 'b']]);
      expect(result[0]).toBe(result[3]);
    },
  );

  it('creates independent caches for different requests', async () => {
    setup.profile.findLinksByProfileIds
      .mockResolvedValueOnce([linkRow('p')])
      .mockResolvedValueOnce([]);
    const factory = setup.module.get(DataLoaderFactory);
    const first = factory.create();
    const second = factory.create();
    expect(await first.links.load('p')).toEqual([linkRow('p')]);
    expect(await second.links.load('p')).toEqual([]);
    expect(await first.links.load('p')).toEqual([linkRow('p')]);
    expect(setup.profile.findLinksByProfileIds).toHaveBeenCalledTimes(2);
    for (const name of [
      'links',
      'skills',
      'experiences',
      'achievements',
      'projects',
    ] as const) {
      expect(first[name]).not.toBe(second[name]);
    }
  });

  it('propagates repository errors instead of hiding them as empty results', async () => {
    const error = new Error('Database unavailable');
    setup.skill.findByProfileIds.mockRejectedValue(error);
    const loader = setup.module.get(DataLoaderFactory).create().skills;
    await expect(
      Promise.all([loader.load('a'), loader.load('b')]),
    ).rejects.toThrow(error);
    expect(setup.skill.findByProfileIds).toHaveBeenCalledTimes(1);
  });
});
