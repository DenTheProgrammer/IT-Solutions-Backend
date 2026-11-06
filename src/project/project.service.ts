import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async findByProfileIds(ids: readonly string[]) {
    const projects = await this.repository.findByProfileIds(ids);
    return projects.toSorted((a, b) => a.sortOrder - b.sortOrder);
  }
}
