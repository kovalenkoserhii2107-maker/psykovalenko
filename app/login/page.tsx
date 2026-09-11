import Link from 'next/link';
import type { Metadata } from 'next';

import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Вхід' };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-black/70">
        <h1 className="text-2xl font-semibold tracking-tight">Вхід</h1>
        <p className="mt-1 mb-7 text-sm opacity-60">
          Особистий кабінет і кабінет психологині
        </p>

        <LoginForm />

        <p className="mt-7 text-center text-xs opacity-50">
          Доступ створює психологиня. Якщо не пам’ятаєте пароль —{' '}
          <Link href="/#contact" className="underline underline-offset-2">
            напишіть їй
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
