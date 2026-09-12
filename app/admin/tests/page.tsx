import Link from 'next/link';
import type { Metadata } from 'next';

import { Badge, Card, EmptyState, PageTitle } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/format';
import { TESTS, getTest } from '@/lib/tests';

import { deleteInvite } from './actions';
import { InviteForm } from './invite-form';

export const metadata: Metadata = { title: 'Анкети' };
export const dynamic = 'force-dynamic';

const statusLabels = {
  SENT: 'Надіслано',
  OPENED: 'Відкрито',
  COMPLETED: 'Заповнено',
} as const;

export default async function AdminTests() {
  await requireRole('ADMIN');

  const [invites, clients, resultCount] = await Promise.all([
    db.testInvite.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        result: { select: { id: true, completedAt: true } },
      },
      take: 100,
    }),
    db.user.findMany({
      where: { role: 'CLIENT' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    db.testResult.count(),
  ]);

  const completed = invites.filter((i) => i.status === 'COMPLETED').length;
  const waiting = invites.length - completed;

  return (
    <>
      <PageTitle
        title="Анкети"
        subtitle={
          invites.length
            ? `${completed} заповнено, ${waiting} чекають · усього результатів: ${resultCount}`
            : `Результатів у базі: ${resultCount}`
        }
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="h-fit p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Надіслати анкету</h2>
            <InviteForm
              tests={TESTS.map((t) => ({ slug: t.slug, name: t.name }))}
              clients={clients.map((c) => ({
                id: c.id,
                name: c.name ?? '',
                email: c.email,
              }))}
            />
          </Card>

          <Card className="h-fit p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Що є в наборі</h2>
            <ul className="flex flex-col gap-4">
              {TESTS.map((test) => (
                <li key={test.slug}>
                  <p className="font-medium text-plum">{test.name}</p>
                  <p className="mt-1 text-sm text-muted">{test.subtitle}</p>
                  <p className="mt-1 text-xs text-muted">
                    {test.questions.length} запитань
                    {test.scales ? ` · ${test.scales.length} шкал` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-7">
          <h2 className="mb-4 font-display text-2xl text-plum">Надіслані посилання</h2>

          {invites.length === 0 ? (
            <EmptyState>
              Ще жодного посилання. Створіть перше — воно працює без входу,
              тож підходить і своїм клієнтам, і стороннім.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-[rgba(46,35,56,.08)]">
              {invites.map((invite) => {
                const test = getTest(invite.testSlug);
                const who =
                  invite.user?.name ||
                  invite.user?.email ||
                  invite.respondentName ||
                  invite.label ||
                  'Стороння людина';
                const expired =
                  invite.expiresAt && invite.expiresAt < new Date() &&
                  invite.status !== 'COMPLETED';

                return (
                  <li key={invite.id} className="flex flex-wrap items-center gap-4 py-4">
                    <div className="min-w-[14rem] flex-1">
                      <p className="font-medium text-plum">{test?.name ?? invite.testSlug}</p>
                      <p className="mt-1 text-sm text-muted">
                        {who}
                        {invite.label && invite.label !== who ? ` · ${invite.label}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Створено {formatDate(invite.createdAt)}
                        {invite.completedAt
                          ? ` · заповнено ${formatDateTime(invite.completedAt)}`
                          : invite.expiresAt
                            ? ` · діє до ${formatDate(invite.expiresAt)}`
                            : ''}
                      </p>
                    </div>

                    <Badge
                      tone={
                        invite.status === 'COMPLETED'
                          ? 'mint'
                          : expired
                            ? 'neutral'
                            : 'warm'
                      }
                    >
                      {expired ? 'Протерміновано' : statusLabels[invite.status]}
                    </Badge>

                    <div className="flex items-center gap-3">
                      {invite.result ? (
                        <Link
                          href={`/admin/tests/${invite.id}`}
                          className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-1.5 text-xs text-plum transition hover:bg-white/70"
                        >
                          Результат
                        </Link>
                      ) : null}
                      <form action={deleteInvite}>
                        <input type="hidden" name="id" value={invite.id} />
                        <button
                          type="submit"
                          className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                        >
                          Прибрати
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
