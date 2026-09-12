import Link from 'next/link';
import type { Metadata } from 'next';

import { Card, EmptyState, PageTitle } from '@/components/ui';
import { db } from '@/lib/db';
import { HOMEWORK_ENABLED } from '@/lib/features';
import { formatDateTime, initials } from '@/lib/format';

export const metadata: Metadata = { title: 'Огляд' };

export default async function AdminOverview() {
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [clients, upcoming, openHomework] = await Promise.all([
    db.user.count({ where: { role: 'CLIENT' } }),
    db.session.findMany({
      where: { datetime: { gte: now, lte: weekAhead }, status: 'SCHEDULED' },
      orderBy: { datetime: 'asc' },
      include: { user: { select: { id: true, name: true, email: true } } },
      take: 8,
    }),
    HOMEWORK_ENABLED ? db.homework.count({ where: { status: { not: 'COMPLETED' } } }) : 0,
  ]);

  const stats = [
    { label: 'Клієнтів у базі', value: clients },
    { label: 'Зустрічей на тиждень', value: upcoming.length },
    ...(HOMEWORK_ENABLED ? [{ label: 'Завдань в роботі', value: openHomework }] : []),
  ];

  return (
    <>
      <PageTitle title="Огляд" subtitle="Найближчий тиждень" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-7">
            <p className="font-display text-4xl text-plum">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-7">
        <h2 className="mb-4 font-display text-2xl text-plum">Найближчі зустрічі</h2>
        {upcoming.length === 0 ? (
          <EmptyState>На цей тиждень зустрічей не заплановано.</EmptyState>
        ) : (
          <ul className="divide-y divide-[rgba(46,35,56,.08)]">
            {upcoming.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/admin/clients/${session.user.id}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-mint text-sm text-plum">
                      {initials(session.user.name, session.user.email)}
                    </span>
                    <span className="text-sm text-plum">
                      {session.user.name ?? session.user.email}
                    </span>
                  </span>
                  <span className="text-sm text-muted">
                    {formatDateTime(session.datetime)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
