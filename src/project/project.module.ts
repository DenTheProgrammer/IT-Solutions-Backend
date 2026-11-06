import { Module } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';

@Module({
  providers: [ProjectRepository, ProjectService, ProjectResolver],
  exports: [ProjectService],
})
export class ProjectModule {}
