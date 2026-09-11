import { redirect } from 'next/navigation';

import { auth } from '@/auth';

/**
 * Перевірка ролі в серверних компонентах. Middleware вже відсікає чужих,
 * але сторінки не мають покладатися лише на нього: правило матчера легко
 * зламати, а це коштувало б доступу до чужих медичних даних.
 */
export async function requireRole(role: 'ADMIN' | 'CLIENT') {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== role) {
    redirect(session.user.role === 'ADMIN' ? '/admin' : '/client');
  }
  return session.user;
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
