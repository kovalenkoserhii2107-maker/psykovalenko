/**
 * Створює обліковий запис психологині.
 * Запуск: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed
 */
import bcrypt from 'bcryptjs';

import { db } from '../lib/db';

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Тетяна Коваленко';

  if (!email || !password) {
    throw new Error(
      'Потрібні ADMIN_EMAIL і ADMIN_PASSWORD. Приклад:\n' +
        '  ADMIN_EMAIL=psy@example.com ADMIN_PASSWORD="довгий-пароль" npm run db:seed',
    );
  }
  if (password.length < 10) {
    throw new Error('Пароль закороткий: мінімум 10 символів');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN', name },
    create: { email, passwordHash, role: 'ADMIN', name },
  });

  console.log(`Психологиню створено: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
