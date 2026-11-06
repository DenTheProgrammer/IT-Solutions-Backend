import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ExperienceModel } from '../../experience/models/experience.model';
import { ProjectModel } from '../../project/models/project.model';
import { SkillModel } from '../../skill/models/skill.model';
import { ProfileLinkModel } from './profile-link.model';

@ObjectType('Profile')
export class ProfileModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  fullName!: string;

  @Field(() => String)
  headline!: string;

  @Field(() => String)
  summary!: string;

  @Field(() => String, { nullable: true })
  location!: string | null;

  @Field(() => String, { nullable: true })
  workFormat!: string | null;

  @Field(() => [ProfileLinkModel])
  links!: ProfileLinkModel[];

  @Field(() => [SkillModel])
  skills!: SkillModel[];

  @Field(() => [ExperienceModel])
  experiences!: ExperienceModel[];

  @Field(() => [ProjectModel])
  projects!: ProjectModel[];
}
