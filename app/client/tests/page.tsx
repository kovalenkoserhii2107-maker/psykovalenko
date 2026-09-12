import Link from 'next/link';
import type { Metadata } from 'next';

import { Card, EmptyState } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { TESTS } from '@/lib/tests';

export const metadata: Metadata = { title: 'Тести' };

export default async function TestsPage() {
  const user = await requireRole('CLIENT');

  const results = await db.testResult.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="px-1 font-display text-3xl text-plum">Тести</h1>

      <ul className="flex flex-col gap-3">
        {TESTS.map((test) => (
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

      <section>
        <h2 className="mb-3 px-1 font-display text-2xl text-plum">Ваші результати</h2>
        {results.length === 0 ? (
          <EmptyState>Ви ще не проходили тестів.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3 text-sm"
              >
                <span className="text-plum">{result.testName}</span>
                <span className="text-muted">{formatDate(result.completedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="px-1 text-xs text-muted">
        Тести не ставлять діагноз. Розбір результатів — на зустрічі
        з психологинею.
      </p>
    </div>
  );
}
