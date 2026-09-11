'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { db } from '@/lib/db';
import { homeForRole } from '@/lib/routes';

export type LoginState = { error?: string; email?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Заповніть пошту та пароль', email };
  }

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Не уточнюємо, що саме не збіглося: інакше форма перетворюється
      // на спосіб перевіряти, які адреси зареєстровані.
      return { error: 'Невірна пошта або пароль', email };
    }
    throw error;
  }

  // Роль беремо з бази, а не з auth(): кука сесії щойно виставлена в цій же
  // відповіді, і всередині цього ж запиту сесія ще порожня — психологиню
  // через це кидало в кабінет клієнта.
  const user = await db.user.findUnique({
    where: { email },
    select: { role: true },
  });

  redirect(homeForRole(user?.role));
}
