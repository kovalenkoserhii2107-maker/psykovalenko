import Link from 'next/link';

import { LogoutButton } from '@/components/logout-button';
import { requireRole } from '@/lib/auth-guard';
import { HOMEWORK_ENABLED } from '@/lib/features';

const tabs = [
  { href: '/client', label: 'Головна' },
  ...(HOMEWORK_ENABLED ? [{ href: '/client/homework', label: 'Завдання' }] : []),
  { href: '/client/tests', label: 'Тести' },
];

export default async function ClientLayout({
  children,
}: LayoutProps<'/client'>) {
  const user = await requireRole('CLIENT');

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-plum">
            {user.name ?? 'Вітаю'}
          </p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 px-5 py-4">{children}</main>

      <p className="px-5 pb-4 text-center text-xs text-muted">
        <Link href="/offer" className="underline underline-offset-4">
          Публічна оферта
        </Link>
      </p>

      {/* нижня панель — великий палець дістає, як у застосунку */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/60 bg-white/70 px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 rounded-2xl py-3 text-center text-sm font-medium text-plum transition active:bg-cream-warm"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
