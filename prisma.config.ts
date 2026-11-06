import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node dist-seed/prisma/seed/seed.js',
  },
  // Client generation does not need a live database or deployment credentials.
  datasource: { url: process.env.DATABASE_URL },
});
