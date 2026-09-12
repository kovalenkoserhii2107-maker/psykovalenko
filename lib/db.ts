import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client';

// У dev Next.js перезавантажує модулі, тож клієнта тримаємо на globalThis,
// інакше кожен hot reload відкриває новий пул з'єднань.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Не задано DATABASE_URL — скопіюйте .env.example у .env');
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function client() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Клієнт створюється при першому зверненні, а не при імпорті модуля.
 *
 * Інакше збірка падає: next build обходить маршрути, щоб зібрати їхню
 * конфігурацію, виконує модуль — і на машині складання, де DATABASE_URL
 * немає й бути не повинно, одразу летить помилка.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const value = Reflect.get(client(), property, receiver);
    return typeof value === 'function' ? value.bind(client()) : value;
  },
});
