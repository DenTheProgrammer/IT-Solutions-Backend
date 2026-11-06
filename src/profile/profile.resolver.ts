import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExperienceModel } from '../experience/models/experience.model';
import type { GraphqlContext } from '../graphql/dataloader.factory';
import { ProfileLinkModel } from './models/profile-link.model';
import { ProfileModel } from './models/profile.model';
import { ProfileService } from './profile.service';
import { SlugPipe } from './slug.pipe';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profilesService: ProfileService) {}

  @Query(() => ProfileModel, { nullable: true })
  profile(@Args('slug', { type: () => String }, SlugPipe) slug: string) {
    return this.profilesService.findBySlug(slug);
  }

  @Query(() => [ProfileModel])
  profiles() {
    return this.profilesService.findAll();
  }

  @ResolveField(() => [ProfileLinkModel])
  links(
    @Parent() profile: Pick<ProfileModel, 'id'>,
    @Context() { loaders }: GraphqlContext,
  ) {
    return loaders.links.load(profile.id);
  }

  @ResolveField(() => [ExperienceModel])
  experiences(
    @Parent() profile: Pick<ProfileModel, 'id'>,
    @Context() { loaders }: GraphqlContext,
  ) {
    return loaders.experiences.load(profile.id);
  }
}
