import { Args, Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphqlContext } from '../graphql/dataloader.factory';
import { ProfileModel } from '../profile/models/profile.model';
import { SkillCategory } from './models/skill-category.enum';
import { SkillModel } from './models/skill.model';
import { SkillService } from './skill.service';

@Resolver(() => ProfileModel)
export class SkillResolver {
  constructor(private readonly service: SkillService) {}

  @ResolveField(() => [SkillModel])
  async skills(
    @Parent() profile: Pick<ProfileModel, 'id'>,
    @Context() { loaders }: GraphqlContext,
    @Args('category', { type: () => SkillCategory, nullable: true })
    category?: SkillCategory | null,
  ) {
    // Load all categories once so aliases share the same request batch.
    const skills = await loaders.skills.load(profile.id);
    return this.service.filterByCategory(skills, category);
  }
}
