import { ExperienceResolver } from '../src/experience/experience.resolver';
import { DataLoaderFactory } from '../src/graphql/dataloader.factory';
import { ProfileResolver } from '../src/profile/profile.resolver';
import { ProjectResolver } from '../src/project/project.resolver';
import { SkillResolver } from '../src/skill/skill.resolver';
import { domainTestModule } from './domain-test-module';
import {
  achievementRow,
  experienceRow,
  linkRow,
  profileRow,
  projectRow,
  skillRow,
} from './fixtures';

describe('Resolvers (real services and request loaders, mocked repositories)', () => {
  let setup: Awaited<ReturnType<typeof domainTestModule>>;
  beforeEach(async () => {
    setup = await domainTestModule();
  });
  afterEach(async () => {
    await setup.module.close();
  });

  it('delegates root queries to the profile service', async () => {
    const profile = profileRow('p');
    setup.profile.findBySlug
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce(null);
    setup.profile.findAll.mockResolvedValue([profile]);
    const resolver = setup.module.get(ProfileResolver);
    await expect(resolver.profile('p')).resolves.toEqual(profile);
    await expect(resolver.profile('missing')).resolves.toBeNull();
    await expect(resolver.profiles()).resolves.toEqual([profile]);
    expect(setup.profile.findBySlug.mock.calls).toEqual([['p'], ['missing']]);
    expect(setup.profile.findAll).toHaveBeenCalledTimes(1);
  });

  it('loads each relation by its parent id through the request context', async () => {
    const profile = profileRow('p');
    const experience = experienceRow('p');
    setup.profile.findLinksByProfileIds.mockResolvedValue([linkRow('p')]);
    setup.experience.findByProfileIds.mockResolvedValue([experience]);
    setup.experience.findAchievementsByExperienceIds.mockResolvedValue([
      achievementRow(experience.id),
    ]);
    setup.project.findByProfileIds.mockResolvedValue([projectRow('p')]);
    const context = { loaders: setup.module.get(DataLoaderFactory).create() };
    const resolver = setup.module.get(ProfileResolver);
    const [links, experiences, projects] = await Promise.all([
      resolver.links(profile, context),
      resolver.experiences(profile, context),
      setup.module.get(ProjectResolver).projects(profile, context),
    ]);
    expect(links).toEqual([linkRow('p')]);
    expect(experiences).toEqual([
      {
        ...experience,
        startDate: '2025-01',
        endDate: null,
        isCurrent: true,
      },
    ]);
    expect(projects).toEqual([projectRow('p')]);
    const achievements = await setup.module
      .get(ExperienceResolver)
      .achievements(experiences[0]!, context);
    expect(achievements).toEqual([achievementRow(experience.id)]);
    for (const method of [
      setup.profile.findLinksByProfileIds,
      setup.experience.findByProfileIds,
      setup.project.findByProfileIds,
    ]) {
      expect(method).toHaveBeenCalledTimes(1);
      expect(method).toHaveBeenCalledWith(['p']);
    }
    expect(
      setup.experience.findAchievementsByExperienceIds,
    ).toHaveBeenCalledTimes(1);
    expect(
      setup.experience.findAchievementsByExperienceIds,
    ).toHaveBeenCalledWith([experience.id]);
  });

  it('supports all category aliases and null without polluting the shared skill cache', async () => {
    const rows = [
      skillRow('p', 0),
      { ...skillRow('p', 1), category: 'INTEGRATIONS_OPERATIONS' as const },
      { ...skillRow('p', 2), category: 'QUALITY_AUTOMATION' as const },
    ];
    setup.skill.findByProfileIds.mockResolvedValue(rows);
    const context = { loaders: setup.module.get(DataLoaderFactory).create() };
    const resolver = setup.module.get(SkillResolver);
    const profile = profileRow('p');
    const result = await Promise.all([
      resolver.skills(profile, context, 'DEVELOPMENT'),
      resolver.skills(profile, context, 'INTEGRATIONS_OPERATIONS'),
      resolver.skills(profile, context, 'QUALITY_AUTOMATION'),
      resolver.skills(profile, context),
      resolver.skills(profile, context, null),
    ]);
    expect(result).toEqual([[rows[0]], [rows[1]], [rows[2]], rows, rows]);
    expect(await context.loaders.skills.load('p')).toBe(result[3]);
    expect(result[4]).toBe(result[3]);
    expect(setup.skill.findByProfileIds).toHaveBeenCalledTimes(1);
    expect(setup.skill.findByProfileIds).toHaveBeenCalledWith(['p']);
  });
});
