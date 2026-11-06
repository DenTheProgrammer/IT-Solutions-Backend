import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module';
import { ProjectModule } from '../project/project.module';
import { SkillModule } from '../skill/skill.module';
import { ProfileRepository } from './profile.repository';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [SkillModule, ExperienceModule, ProjectModule],
  providers: [ProfileRepository, ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
