import Link from 'next/link';

import { LogoutButton } from '@/components/logout-button';
import { requireRole } from '@/lib/auth-guard';

const nav = [
  { href: '/admin', label: 'Огляд' },
  { href: '/admin/clients', label: 'Клієнти' },
  { href: '/admin/calendar', label: 'Календар' },
];

export default async function AdminLayout({
  children,
}: LayoutProps<'/admin'>) {
  const user = await requireRole('ADMIN');

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-[rgba(46,35,56,.1)] px-6 py-6 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <Link href="/" className="font-display text-xl text-plum">
          Тетяна Коваленко
        </Link>
        <p className="mt-1 text-xs text-muted">Кабінет психологині</p>

        <nav className="mt-8 flex gap-2 lg:flex-col">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-2.5 text-sm text-muted transition hover:bg-white/70 hover:text-plum"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 border-t border-[rgba(46,35,56,.1)] pt-5 lg:absolute lg:bottom-6 lg:w-52">
          <p className="truncate text-sm text-plum">{user.name ?? user.email}</p>
          <div className="mt-1">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
