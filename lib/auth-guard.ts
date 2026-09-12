import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * Перевірка ролі в серверних компонентах. Middleware вже відсікає чужих,
 * але сторінки не мають покладатися лише на нього: правило матчера легко
 * зламати, а це коштувало б доступу до чужих медичних даних.
 *
 * Роль звіряємо з базою, а не лише з cookie. Сесія живе довше за запис у
 * таблиці: користувача могли видалити, змінити йому роль або базу могли
 * перестворити — а підписаний токен усе одно лишався б чинним. Крім
 * доступу це ламало й запис: id з такої сесії не проходив як зовнішній
 * ключ, і сторінка падала з «A server error occurred».
 */
export async function requireRole(role: 'ADMIN' | 'CLIENT') {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  // Запису немає — токен застарів; хай людина увійде заново
  if (!user) redirect('/login');

  if (user.role !== role) {
    redirect(user.role === 'ADMIN' ? '/admin' : '/client');
  }

  return user;
}

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
}
