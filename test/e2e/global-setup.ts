import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { databaseClient, dropTestDatabase } from './database';

export default async function globalSetup(): Promise<void> {
  const source = new URL(
    process.env.TEST_DATABASE_URL ??
      process.env.DATABASE_URL ??
      `postgresql://candidate:candidate_dev@localhost:${process.env.DB_HOST_PORT ?? '5432'}/candidate`,
  );
  const name = `candidate_e2e_${randomBytes(8).toString('hex')}`;
  source.pathname = '/postgres';
  source.searchParams.delete('schema');
  process.env.E2E_ADMIN_URL = source.toString();
  process.env.E2E_DATABASE_NAME = name;
  const admin = databaseClient(source.toString());
  try {
    await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
  } finally {
    await admin.$disconnect();
  }
  source.pathname = `/${name}`;
  source.searchParams.set('schema', 'card');
  process.env.DATABASE_URL = source.toString();
  // Exercise the exact production Sandbox configuration in all HTTP tests.
  process.env.NODE_ENV = 'production';
  process.env.PRISMA_LOG_QUERIES = 'false';
  process.env.TRUST_PROXY = 'false';
  try {
    execFileSync(
      process.execPath,
      [
        join(process.cwd(), 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
      ],
      { stdio: 'inherit', env: process.env },
    );
    execFileSync(
      process.execPath,
      [join(process.cwd(), 'dist-seed/prisma/seed/seed.js')],
      { stdio: 'inherit', env: process.env },
    );
    console.log(`E2E database prepared: ${name}`);
  } catch (error) {
    await dropTestDatabase();
    throw error;
  }
}
