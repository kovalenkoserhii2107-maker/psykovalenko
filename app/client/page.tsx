import Link from 'next/link';
import type { Metadata } from 'next';

import { Badge, Card, EmptyState } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { HOMEWORK_ENABLED } from '@/lib/features';
import { db } from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/format';
import { TESTS } from '@/lib/tests';

export const metadata: Metadata = { title: 'Кабінет' };

const statusLabels = {
  PENDING: 'Не почато',
  IN_PROGRESS: 'В роботі',
  COMPLETED: 'Виконано',
} as const;

export default async function ClientDashboard() {
  const user = await requireRole('CLIENT');

  const [nextSession, tasks, lastResult, taken] = await Promise.all([
    db.session.findFirst({
      where: { userId: user.id, status: 'SCHEDULED', datetime: { gte: new Date() } },
      orderBy: { datetime: 'asc' },
    }),
    HOMEWORK_ENABLED
      ? db.homework.findMany({
          where: { userId: user.id, status: { not: 'COMPLETED' } },
          orderBy: { createdAt: 'desc' },
          take: 3,
        })
      : [],
    db.testResult.findFirst({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    }),
    db.testResult.findMany({
      where: { userId: user.id },
      select: { testName: true },
    }),
  ]);

  // Показуємо лише те, чого клієнт ще не заповнював: список із чотирьох
  // анкет на головній виглядав би як домашка, якої ми щойно позбулись.
  const done = new Set(taken.map((r) => r.testName));
  const pendingTests = TESTS.filter((t) => !done.has(t.name)).slice(0, 2);

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-6">
        <p className="text-xs tracking-wide text-muted uppercase">Наступна зустріч</p>
        {nextSession ? (
          <>
            <p className="mt-2 font-display text-2xl text-plum">
              {formatDateTime(nextSession.datetime)}
            </p>
            <p className="mt-1 text-sm text-muted">
              {nextSession.durationMinutes} хвилин
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Поки не запланована. Напишіть психологині, щоб домовитись про час.
          </p>
        )}
      </Card>

      {HOMEWORK_ENABLED ? (
      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-2xl text-plum">Завдання</h2>
          <Link
            href="/client/homework"
            className="text-sm text-muted underline underline-offset-4"
          >
            Усі
          </Link>
        </div>

        {tasks.length === 0 ? (
          <EmptyState>Активних завдань немає. Відпочивайте.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link href={`/client/homework/${task.id}`}>
                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-plum">{task.title}</p>
                      <Badge tone={task.status === 'IN_PROGRESS' ? 'mint' : 'warm'}>
                        {statusLabels[task.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {task.description}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="font-display text-2xl text-plum">Анкети</h2>
          <Link href="/client/tests" className="text-sm text-muted underline underline-offset-4">
            Усі
          </Link>
        </div>

        {pendingTests.length === 0 ? (
          <EmptyState>
            {lastResult
              ? `Останню анкету ви заповнили ${formatDate(lastResult.completedAt)}.`
              : 'Психологиня попросить заповнити анкету, коли це буде доречно.'}
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {pendingTests.map((test) => (
              <li key={test.slug}>
                <Link href={`/client/tests/${test.slug}`}>
                  <Card className="p-5">
                    <p className="font-medium text-plum">{test.name}</p>
                    <p className="mt-1 text-sm text-muted">{test.subtitle}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
