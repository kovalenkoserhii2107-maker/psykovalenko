import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7: адреса бази більше не живе у schema.prisma.
// Міграції беруть її звідси, рантайм — через адаптер у lib/db.ts.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
