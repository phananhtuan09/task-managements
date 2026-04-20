import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/task_management?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
  migrations: {
    seed: 'ts-node --transpile-only prisma/seed.ts',
  },
});
