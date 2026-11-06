import { Logger } from '@nestjs/common';
import { unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';

const logger = new Logger('GraphQL');

export function formatGraphqlError(production: boolean) {
  return (
    formatted: GraphQLFormattedError,
    error: unknown,
  ): GraphQLFormattedError => {
    if (formatted.extensions?.code !== 'INTERNAL_SERVER_ERROR')
      return formatted;
    const original = unwrapResolverError(error);
    logger.error(
      original instanceof Error
        ? (original.stack ?? original.message)
        : original,
    );
    if (!production) return formatted;
    return {
      message: 'Internal server error',
      locations: formatted.locations,
      path: formatted.path,
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  };
}
