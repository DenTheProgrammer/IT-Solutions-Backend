import { Injectable } from '@nestjs/common';
import type { Experience } from '../generated/prisma/client';
import { ExperienceRepository } from './experience.repository';

export type ExperienceView = Omit<Experience, 'startDate' | 'endDate'> & {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
};

@Injectable()
export class ExperienceService {
  constructor(private readonly repository: ExperienceRepository) {}

  async findByProfileIds(ids: readonly string[]): Promise<ExperienceView[]> {
    const experiences = await this.repository.findByProfileIds(ids);
    return experiences
      .toSorted(
        (a, b) =>
          Number(b.endDate === null) - Number(a.endDate === null) ||
          b.startDate.getTime() - a.startDate.getTime() ||
          a.sortOrder - b.sortOrder,
      )
      .map((experience) => ({
        ...experience,
        startDate: experience.startDate.toISOString().slice(0, 7),
        endDate: experience.endDate?.toISOString().slice(0, 7) ?? null,
        isCurrent: experience.endDate === null,
      }));
  }

  async findAchievementsByExperienceIds(ids: readonly string[]) {
    const achievements =
      await this.repository.findAchievementsByExperienceIds(ids);
    return achievements.toSorted((a, b) => a.sortOrder - b.sortOrder);
  }
}
