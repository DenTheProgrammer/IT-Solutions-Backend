import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  findBySlug(slug: string) {
    return this.repository.findBySlug(slug);
  }

  async findAll() {
    const profiles = await this.repository.findAll();
    return profiles.toSorted((a, b) => a.slug.localeCompare(b.slug));
  }

  async findLinksByProfileIds(ids: readonly string[]) {
    const links = await this.repository.findLinksByProfileIds(ids);
    return links.toSorted((a, b) => a.sortOrder - b.sortOrder);
  }
}
