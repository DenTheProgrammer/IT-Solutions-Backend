import { dropTestDatabase } from './database';

export default async function globalTeardown(): Promise<void> {
  await dropTestDatabase();
  console.log('E2E database removed');
}
