import { createDatabaseAdapter } from '../../src/prisma/adapter';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// Jest's global hooks run outside its moduleNameMapper; use the built client.
const runtimeRequire = createRequire(join(process.cwd(), 'package.json'));
const { PrismaClient } = runtimeRequire(
  './dist/generated/prisma/client.js',
) as typeof import('../../src/generated/prisma/client');

export function databaseClient(url: string) {
  return new PrismaClient({
    adapter: createDatabaseAdapter(url),
  });
}

export async function dropTestDatabase(): Promise<void> {
  const name = process.env.E2E_DATABASE_NAME;
  const adminUrl = process.env.E2E_ADMIN_URL;
  if (!name || !adminUrl || !/^candidate_e2e_[a-f0-9]+$/.test(name)) {
    throw new Error('Refusing to drop a database without a generated e2e name');
  }
  const admin = databaseClient(adminUrl);
  try {
    await admin.$executeRawUnsafe(
      `DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`,
    );
  } finally {
    await admin.$disconnect();
  }
}
