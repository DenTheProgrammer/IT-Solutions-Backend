import { Field, ID, ObjectType } from '@nestjs/graphql';
import { LinkKind } from './link-kind.enum';

@ObjectType('ProfileLink')
export class ProfileLinkModel {
  @Field(() => ID)
  id!: string;

  @Field(() => LinkKind)
  kind!: LinkKind;

  @Field(() => String)
  label!: string;

  @Field(() => String)
  url!: string;
}
