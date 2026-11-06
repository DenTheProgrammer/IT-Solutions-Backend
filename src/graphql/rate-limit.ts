import type { ThrottlerStorage } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';

export const GRAPHQL_RATE_LIMIT = 120;
export const GRAPHQL_RATE_TTL = 60_000;

// Called from the Apollo context once per HTTP request, including introspection
// and invalid operations; resolver guards would miss those or count root aliases twice.
export async function enforceGraphqlRateLimit(
  storage: ThrottlerStorage,
  req: Request,
  res: Response,
): Promise<void> {
  const tracker = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const record = await storage.increment(
    `graphql:${tracker}`,
    GRAPHQL_RATE_TTL,
    GRAPHQL_RATE_LIMIT,
    0,
    'graphql',
  );
  if (record.isBlocked) {
    res.setHeader('Retry-After', record.timeToBlockExpire);
    throw new GraphQLError(
      'Too many requests. Limit: 120 requests per minute per IP.',
      {
        extensions: { code: 'TOO_MANY_REQUESTS', http: { status: 429 } },
      },
    );
  }
}
