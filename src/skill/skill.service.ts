import { Injectable } from '@nestjs/common';
import type { Skill, SkillCategory } from '../generated/prisma/client';
import { SkillRepository } from './skill.repository';

@Injectable()
export class SkillService {
  constructor(private readonly repository: SkillRepository) {}

  async findByProfileIds(ids: readonly string[]) {
    const skills = await this.repository.findByProfileIds(ids);
    return skills.toSorted((a, b) => a.sortOrder - b.sortOrder);
  }

  filterByCategory(skills: Skill[], category?: SkillCategory | null) {
    return category == null
      ? skills
      : skills.filter((skill) => skill.category === category);
  }
}
