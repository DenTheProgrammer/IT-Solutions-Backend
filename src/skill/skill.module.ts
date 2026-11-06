import { Module } from '@nestjs/common';
import { SkillRepository } from './skill.repository';
import { SkillService } from './skill.service';
import { SkillResolver } from './skill.resolver';

@Module({
  providers: [SkillRepository, SkillService, SkillResolver],
  exports: [SkillService],
})
export class SkillModule {}
