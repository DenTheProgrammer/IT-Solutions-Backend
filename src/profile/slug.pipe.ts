import { Injectable, type PipeTransform } from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Injectable()
export class SlugPipe implements PipeTransform<string, string> {
  transform(slug: string): string {
    if (slug.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new GraphQLError(
        'slug must contain 1–100 lowercase letters, digits or single hyphens between segments.',
        { extensions: { code: 'BAD_USER_INPUT' } },
      );
    }
    return slug;
  }
}
