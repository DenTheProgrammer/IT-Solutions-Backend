import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(ids: readonly string[]) {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...ids] } },
    });
  }
}
