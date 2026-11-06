import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphqlContext } from '../graphql/dataloader.factory';
import { ProfileModel } from '../profile/models/profile.model';
import { ProjectModel } from './models/project.model';

@Resolver(() => ProfileModel)
export class ProjectResolver {
  @ResolveField(() => [ProjectModel])
  projects(
    @Parent() profile: Pick<ProfileModel, 'id'>,
    @Context() { loaders }: GraphqlContext,
  ) {
    return loaders.projects.load(profile.id);
  }
}
