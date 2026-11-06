import { Test } from '@nestjs/testing';
import { ExperienceRepository } from '../src/experience/experience.repository';
import { ExperienceService } from '../src/experience/experience.service';
import { ExperienceResolver } from '../src/experience/experience.resolver';
import { DataLoaderFactory } from '../src/graphql/dataloader.factory';
import { ProfileRepository } from '../src/profile/profile.repository';
import { ProfileService } from '../src/profile/profile.service';
import { ProfileResolver } from '../src/profile/profile.resolver';
import { ProjectRepository } from '../src/project/project.repository';
import { ProjectService } from '../src/project/project.service';
import { ProjectResolver } from '../src/project/project.resolver';
import { SkillRepository } from '../src/skill/skill.repository';
import { SkillService } from '../src/skill/skill.service';
import { SkillResolver } from '../src/skill/skill.resolver';

function mockMethod<T extends (...args: never[]) => unknown>() {
  return jest.fn<ReturnType<T>, Parameters<T>>();
}

export async function domainTestModule() {
  const profile = {
    findBySlug: mockMethod<ProfileRepository['findBySlug']>(),
    findAll: mockMethod<ProfileRepository['findAll']>(),
    findLinksByProfileIds:
      mockMethod<ProfileRepository['findLinksByProfileIds']>(),
  };
  const skill = {
    findByProfileIds: mockMethod<SkillRepository['findByProfileIds']>(),
  };
  const experience = {
    findByProfileIds: mockMethod<ExperienceRepository['findByProfileIds']>(),
    findAchievementsByExperienceIds:
      mockMethod<ExperienceRepository['findAchievementsByExperienceIds']>(),
  };
  const project = {
    findByProfileIds: mockMethod<ProjectRepository['findByProfileIds']>(),
  };
  const module = await Test.createTestingModule({
    providers: [
      ProfileService,
      SkillService,
      ExperienceService,
      ProjectService,
      DataLoaderFactory,
      ProfileResolver,
      SkillResolver,
      ExperienceResolver,
      ProjectResolver,
      { provide: ProfileRepository, useValue: profile },
      { provide: SkillRepository, useValue: skill },
      { provide: ExperienceRepository, useValue: experience },
      { provide: ProjectRepository, useValue: project },
    ],
  }).compile();
  return { module, profile, skill, experience, project };
}
