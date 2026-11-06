import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(ids: readonly string[]) {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...ids] } },
    });
  }

  findAchievementsByExperienceIds(ids: readonly string[]) {
    return this.prisma.achievement.findMany({
      where: { experienceId: { in: [...ids] } },
    });
  }
}
