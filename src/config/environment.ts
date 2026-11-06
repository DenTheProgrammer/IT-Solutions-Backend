import { parsePoolMax } from '../prisma/adapter';

export interface Environment {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: 'development' | 'test' | 'production';
  PRISMA_LOG_QUERIES: boolean;
  DATABASE_POOL_MAX: number;
  TRUST_PROXY: 'false' | 'loopback' | 'private';
}

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const databaseUrl = input.DATABASE_URL;
  if (typeof databaseUrl !== 'string') {
    throw new Error('DATABASE_URL is required');
  }

  try {
    const url = new URL(databaseUrl);
    if (
      !['postgres:', 'postgresql:'].includes(url.protocol) ||
      !url.hostname ||
      url.pathname.length <= 1
    ) {
      throw new Error('Invalid PostgreSQL URL');
    }
  } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }

  const rawPort = input.PORT ?? '3000';
  if (typeof rawPort !== 'string' && typeof rawPort !== 'number') {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  const port = Number(rawPort);
  if (
    !/^\d+$/.test(String(rawPort)) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const nodeEnv = input.NODE_ENV ?? 'development';
  if (
    nodeEnv !== 'development' &&
    nodeEnv !== 'test' &&
    nodeEnv !== 'production'
  ) {
    throw new Error('NODE_ENV must be development, test or production');
  }

  const logQueries = input.PRISMA_LOG_QUERIES ?? 'false';
  if (logQueries !== 'true' && logQueries !== 'false') {
    throw new Error('PRISMA_LOG_QUERIES must be true or false');
  }

  const trustProxy = input.TRUST_PROXY ?? 'false';
  if (
    trustProxy !== 'false' &&
    trustProxy !== 'loopback' &&
    trustProxy !== 'private'
  ) {
    throw new Error('TRUST_PROXY must be false, loopback or private');
  }

  return {
    DATABASE_URL: databaseUrl,
    PORT: port,
    NODE_ENV: nodeEnv,
    PRISMA_LOG_QUERIES: logQueries === 'true',
    DATABASE_POOL_MAX: parsePoolMax(input.DATABASE_POOL_MAX ?? '5'),
    TRUST_PROXY: trustProxy,
  };
}
