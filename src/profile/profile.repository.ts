import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  findAll() {
    return this.prisma.profile.findMany();
  }

  findLinksByProfileIds(ids: readonly string[]) {
    return this.prisma.profileLink.findMany({
      where: { profileId: { in: [...ids] } },
    });
  }
}
