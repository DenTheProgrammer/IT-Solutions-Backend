import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AchievementModel } from './achievement.model';

@ObjectType('Experience')
export class ExperienceModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  company!: string;

  @Field(() => String)
  position!: string;

  @Field(() => String, {
    description: 'Месяц начала работы в формате YYYY-MM.',
  })
  startDate!: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Месяц окончания работы в формате YYYY-MM; null — по настоящее время.',
  })
  endDate!: string | null;

  @Field(() => Boolean)
  isCurrent!: boolean;

  @Field(() => [AchievementModel])
  achievements!: AchievementModel[];
}
