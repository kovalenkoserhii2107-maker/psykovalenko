import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { SummaryButton } from '@/app/admin/clients/[id]/summary-button';
import { TestProfile } from '@/components/test-profile';
import { Badge, Card, PageTitle } from '@/components/ui';
import { isAiConfigured } from '@/lib/ai';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import type { ProfileEntry } from '@/lib/test-scoring';
import { getTest, interpret } from '@/lib/tests';

export const metadata: Metadata = { title: 'Результат анкети' };
export const dynamic = 'force-dynamic';

export default async function InviteResult({ params }: PageProps<'/admin/tests/[id]'>) {
  await requireRole('ADMIN');

  const { id } = await params;
  const invite = await db.testInvite.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      result: true,
    },
  });
  if (!invite?.result) notFound();

  const raw = invite.result.rawAnswers as {
    slug?: string;
    note?: string;
    profile?: ProfileEntry[];
  } | null;
  const test = raw?.slug ? getTest(raw.slug) : undefined;
  const aiReady = isAiConfigured();

  const who =
    invite.user?.name ||
    invite.user?.email ||
    invite.respondentName ||
    'Без імені';

  return (
    <>
      <Link
        href="/admin/tests"
        className="mb-6 inline-block text-sm text-muted underline underline-offset-4 hover:text-plum"
      >
        ← До анкет
      </Link>

      <PageTitle
        title={test?.name ?? invite.testSlug}
        subtitle={`${who} · заповнено ${formatDateTime(invite.result.completedAt)}`}
        action={
          invite.user ? (
            <Link
              href={`/admin/clients/${invite.user.id}`}
              className="text-sm text-muted underline underline-offset-4 hover:text-plum"
            >
              До картки клієнта
            </Link>
          ) : (
            <Badge tone="warm">Стороння людина</Badge>
          )
        }
      />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card className="p-7">
          {invite.result.score !== null && test ? (
            <p className="mb-5 text-sm text-plum">
              Загальний бал: <b>{invite.result.score}</b> — {interpret(test, invite.result.score)}
            </p>
          ) : null}

          {raw?.profile && raw.slug ? (
            <TestProfile profile={raw.profile} slug={raw.slug} />
          ) : null}
        </Card>

        {raw?.note ? (
          <Card className="p-7">
            <h2 className="mb-3 font-display text-xl text-plum">Своїми словами</h2>
            <p className="rounded-2xl bg-cream-warm p-4 text-sm whitespace-pre-line text-plum">
              «{raw.note}»
            </p>
          </Card>
        ) : null}

        <Card className="p-7">
          <h2 className="mb-3 font-display text-xl text-plum">Клінічне резюме</h2>
          {invite.result.aiSummary ? (
            <p className="text-sm whitespace-pre-line text-muted">{invite.result.aiSummary}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted">
                Складається моделлю. Імена, пошта й телефон маскуються перед
                надсиланням.
              </p>
              <SummaryButton resultId={invite.result.id} disabled={!aiReady} />
            </>
          )}
        </Card>

        {invite.respondentEmail ? (
          <p className="text-sm text-muted">
            Пошта для відповіді: <b className="text-plum">{invite.respondentEmail}</b>
          </p>
        ) : null}
      </div>
    </>
  );
}
