import { registerEnumType } from '@nestjs/graphql';

export const SkillCategory = {
  DEVELOPMENT: 'DEVELOPMENT',
  INTEGRATIONS_OPERATIONS: 'INTEGRATIONS_OPERATIONS',
  QUALITY_AUTOMATION: 'QUALITY_AUTOMATION',
} as const;

export type SkillCategory = (typeof SkillCategory)[keyof typeof SkillCategory];
registerEnumType(SkillCategory, { name: 'SkillCategory' });
