import path from 'node:path';

/**
 * Prisma 7: адреса бази більше не живе у schema.prisma.
 * Міграції беруть її звідси, рантайм — через адаптер у lib/db.ts.
 *
 * Навмисно без `import { defineConfig } from 'prisma/config'`: цей файл
 * читає Prisma CLI, а в образі він лежить окремим деревом у /migrator,
 * тоді як конфіг — у /app, де пакета prisma немає. defineConfig усе одно
 * лише повертає свій аргумент, тож експортуємо звичайний об'єкт.
 */
export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    // Міграції ходять повз пулер: Prisma бере advisory-блокування, а через
    // pgbouncer у transaction-режимі воно не працює — деплой падає з P1002.
    // У продакшені DIRECT_DATABASE_URL вказує на direct.<кластер>.flympg.net,
    // локально його немає й береться звичайна адреса.
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '',
  },
};
