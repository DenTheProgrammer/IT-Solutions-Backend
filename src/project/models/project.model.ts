import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Project')
export class ProjectModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => String, { nullable: true })
  repositoryUrl!: string | null;

  @Field(() => Boolean)
  isRepositoryPrivate!: boolean;

  @Field(() => [String])
  technologies!: string[];
}
