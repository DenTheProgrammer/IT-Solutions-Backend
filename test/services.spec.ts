import { ExperienceService } from '../src/experience/experience.service';
import { ProfileService } from '../src/profile/profile.service';
import { ProjectService } from '../src/project/project.service';
import { SkillService } from '../src/skill/skill.service';
import { domainTestModule } from './domain-test-module';
import {
  achievementRow,
  experienceRow,
  linkRow,
  profileRow,
  projectRow,
  skillRow,
} from './fixtures';

describe('Domain services', () => {
  let setup: Awaited<ReturnType<typeof domainTestModule>>;
  beforeEach(async () => {
    setup = await domainTestModule();
  });
  afterEach(async () => {
    await setup.module.close();
  });

  it('puts current experiences first, then startDate desc, then sortOrder', async () => {
    const rows = [
      experienceRow('p', 5, {
        startDate: new Date('2024-01-01Z'),
        endDate: new Date('2026-02-01Z'),
      }),
      experienceRow('p', 4, {
        startDate: new Date('2025-12-01Z'),
        endDate: new Date('2026-01-01Z'),
      }),
      experienceRow('p', 3, { startDate: new Date('2023-01-01Z') }),
      experienceRow('p', 2, { startDate: new Date('2023-01-01Z') }),
      experienceRow('p', 1, { startDate: new Date('2025-01-01Z') }),
    ];
    setup.experience.findByProfileIds.mockResolvedValue(rows);
    const result = await setup.module
      .get(ExperienceService)
      .findByProfileIds(['p']);
    expect(result.map((row) => row.sortOrder)).toEqual([1, 2, 3, 4, 5]);
    expect(rows.map((row) => row.sortOrder)).toEqual([5, 4, 3, 2, 1]);
    expect(setup.experience.findByProfileIds).toHaveBeenCalledWith(['p']);
  });

  it('formats dates using UTC YYYY-MM and derives isCurrent strictly from null', async () => {
    setup.experience.findByProfileIds.mockResolvedValue([
      experienceRow('p', 0, { startDate: new Date('1999-12-31T23:59:59Z') }),
      experienceRow('p', 1, {
        startDate: new Date('2000-01-01T00:00:00Z'),
        endDate: new Date('2099-02-01T00:00:00Z'),
      }),
    ]);
    const result = await setup.module
      .get(ExperienceService)
      .findByProfileIds(['p']);
    expect(result).toMatchObject([
      { startDate: '1999-12', endDate: null, isCurrent: true },
      { startDate: '2000-01', endDate: '2099-02', isCurrent: false },
    ]);
  });

  it('orders links, skills, achievements and projects by sortOrder without mutating input', async () => {
    const links = [linkRow('p', 2), linkRow('p', 0)];
    const skills = [skillRow('p', 3), skillRow('p', 1)];
    const achievements = [achievementRow('e', 5), achievementRow('e', 2)];
    const projects = [projectRow('p', 4), projectRow('p', 1)];
    setup.profile.findLinksByProfileIds.mockResolvedValue(links);
    setup.skill.findByProfileIds.mockResolvedValue(skills);
    setup.experience.findAchievementsByExperienceIds.mockResolvedValue(
      achievements,
    );
    setup.project.findByProfileIds.mockResolvedValue(projects);
    expect(
      await setup.module.get(ProfileService).findLinksByProfileIds(['p']),
    ).toEqual([...links].reverse());
    expect(
      await setup.module.get(SkillService).findByProfileIds(['p']),
    ).toEqual([...skills].reverse());
    expect(
      await setup.module
        .get(ExperienceService)
        .findAchievementsByExperienceIds(['e']),
    ).toEqual([...achievements].reverse());
    expect(
      await setup.module.get(ProjectService).findByProfileIds(['p']),
    ).toEqual([...projects].reverse());
    expect([
      links[0]?.sortOrder,
      skills[0]?.sortOrder,
      achievements[0]?.sortOrder,
      projects[0]?.sortOrder,
    ]).toEqual([2, 3, 5, 4]);
  });

  it('filters all categories and null without mutating the input or accessing the repository', () => {
    const rows = [
      skillRow('p', 0),
      { ...skillRow('p', 1), category: 'INTEGRATIONS_OPERATIONS' as const },
      { ...skillRow('p', 2), category: 'QUALITY_AUTOMATION' as const },
    ];
    const service = setup.module.get(SkillService);
    const result = [
      service.filterByCategory(rows, 'DEVELOPMENT'),
      service.filterByCategory(rows, 'INTEGRATIONS_OPERATIONS'),
      service.filterByCategory(rows, 'QUALITY_AUTOMATION'),
      service.filterByCategory(rows),
      service.filterByCategory(rows, null),
    ];
    expect(result).toEqual([[rows[0]], [rows[1]], [rows[2]], rows, rows]);
    expect(result[3]).toBe(rows);
    expect(result[4]).toBe(rows);
    expect(rows.map(({ category }) => category)).toEqual([
      'DEVELOPMENT',
      'INTEGRATIONS_OPERATIONS',
      'QUALITY_AUTOMATION',
    ]);
    expect(service.filterByCategory([rows[0]!], 'QUALITY_AUTOMATION')).toEqual(
      [],
    );
    expect(service.filterByCategory([], 'DEVELOPMENT')).toEqual([]);
    expect(setup.skill.findByProfileIds).not.toHaveBeenCalled();
  });

  it('returns null for missing profiles and sorts the profile list by slug', async () => {
    setup.profile.findBySlug.mockResolvedValue(null);
    setup.profile.findAll.mockResolvedValue([profileRow('z'), profileRow('a')]);
    const service = setup.module.get(ProfileService);
    await expect(service.findBySlug('nope')).resolves.toBeNull();
    expect(setup.profile.findBySlug).toHaveBeenCalledWith('nope');
    expect((await service.findAll()).map((row) => row.slug)).toEqual([
      'a',
      'z',
    ]);
  });
});
