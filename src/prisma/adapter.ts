import { PrismaPg } from '@prisma/adapter-pg';

export function parsePoolMax(value: unknown = '5'): number {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > 20) {
    throw new Error('DATABASE_POOL_MAX must be an integer between 1 and 20');
  }
  return Number(value);
}

export function createDatabaseAdapter(
  connectionString: string,
  poolMax: unknown = process.env.DATABASE_POOL_MAX ?? '5',
): PrismaPg {
  const url = new URL(connectionString);
  const schema = url.searchParams.get('schema') ?? 'public';
  if (!schema) throw new Error('DATABASE_URL schema must not be empty');
  // pg does not implement Prisma's schema URL parameter.
  url.searchParams.delete('schema');
  return new PrismaPg(
    {
      connectionString: url.toString(),
      max: parsePoolMax(poolMax),
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30_000,
    },
    { schema },
  );
}
