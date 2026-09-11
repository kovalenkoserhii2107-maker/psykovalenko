import Link from 'next/link';
import type { Metadata } from 'next';

import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Вхід' };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-xl text-plum"
        >
          Тетяна Коваленко
        </Link>

        <div className="rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_24px_60px_-34px_rgba(46,35,56,.34)] backdrop-blur-xl">
          <h1 className="font-display text-3xl tracking-tight text-plum">Вхід</h1>
          <p className="mt-1 mb-7 text-sm text-muted">
            Особистий кабінет і кабінет психологині
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
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
