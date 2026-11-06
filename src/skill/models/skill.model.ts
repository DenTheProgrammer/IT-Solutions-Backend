import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SkillCategory } from './skill-category.enum';

@ObjectType('Skill')
export class SkillModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;

  @Field(() => String, { nullable: true })
  details!: string | null;
}
