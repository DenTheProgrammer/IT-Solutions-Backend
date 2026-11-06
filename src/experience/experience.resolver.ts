import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphqlContext } from '../graphql/dataloader.factory';
import { AchievementModel } from './models/achievement.model';
import { ExperienceModel } from './models/experience.model';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  @ResolveField(() => [AchievementModel])
  achievements(
    @Parent() experience: Pick<ExperienceModel, 'id'>,
    @Context() { loaders }: GraphqlContext,
  ) {
    return loaders.achievements.load(experience.id);
  }
}
