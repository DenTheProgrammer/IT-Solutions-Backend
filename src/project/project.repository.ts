import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(ids: readonly string[]) {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...ids] } },
    });
  }
}
