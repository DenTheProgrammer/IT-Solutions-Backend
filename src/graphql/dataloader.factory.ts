import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import type { Request, Response } from 'express';
import { ExperienceService } from '../experience/experience.service';
import { ProfileService } from '../profile/profile.service';
import { ProjectService } from '../project/project.service';
import { SkillService } from '../skill/skill.service';

function listLoader<T>(
  find: (ids: readonly string[]) => Promise<T[]>,
  parentId: (row: T) => string,
): DataLoader<string, T[]> {
  return new DataLoader(async (ids) => {
    const rows = await find(ids);
    const groups = new Map<string, T[]>();
    for (const row of rows) {
      const id = parentId(row);
      const group = groups.get(id);
      if (group) group.push(row);
      else groups.set(id, [row]);
    }
    return ids.map((id) => groups.get(id) ?? []);
  });
}

@Injectable()
export class DataLoaderFactory {
  constructor(
    private readonly profiles: ProfileService,
    private readonly skills: SkillService,
    private readonly experiences: ExperienceService,
    private readonly projects: ProjectService,
  ) {}

  create() {
    return {
      links: listLoader(
        (ids) => this.profiles.findLinksByProfileIds(ids),
        (row) => row.profileId,
      ),
      skills: listLoader(
        (ids) => this.skills.findByProfileIds(ids),
        (row) => row.profileId,
      ),
      experiences: listLoader(
        (ids) => this.experiences.findByProfileIds(ids),
        (row) => row.profileId,
      ),
      achievements: listLoader(
        (ids) => this.experiences.findAchievementsByExperienceIds(ids),
        (row) => row.experienceId,
      ),
      projects: listLoader(
        (ids) => this.projects.findByProfileIds(ids),
        (row) => row.profileId,
      ),
    };
  }
}

export type RequestLoaders = ReturnType<DataLoaderFactory['create']>;
export interface GraphqlContext {
  loaders: RequestLoaders;
  req?: Request;
  res?: Response;
}
