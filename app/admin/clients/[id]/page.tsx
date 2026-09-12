import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge, Card, EmptyState, PageTitle } from '@/components/ui';
import { TestProfile } from '@/components/test-profile';
import { isAiConfigured } from '@/lib/ai';
import { getTest, interpret } from '@/lib/tests';
import { getClient } from '@/lib/clients';
import { HOMEWORK_ENABLED } from '@/lib/features';
import { formatDate, formatDateTime, initials } from '@/lib/format';

import { deleteHomework } from '../actions';

import { HomeworkForm } from './homework-form';
import { ResetPassword } from './reset-password';
import { SummaryButton } from './summary-button';

export const metadata: Metadata = { title: 'Картка клієнта' };

const sessionLabels = {
  SCHEDULED: 'Заплановано',
  COMPLETED: 'Відбулася',
  CANCELLED: 'Скасовано',
  NO_SHOW: 'Не прийшов',
} as const;

const homeworkLabels = {
  PENDING: 'Не почато',
  IN_PROGRESS: 'В роботі',
  COMPLETED: 'Виконано',
} as const;

export default async function ClientPage({ params }: PageProps<'/admin/clients/[id]'>) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const aiReady = isAiConfigured();

  return (
    <>
      <Link
        href="/admin/clients"
        className="mb-6 inline-block text-sm text-muted underline underline-offset-4 hover:text-plum"
      >
        ← До списку
      </Link>

      <PageTitle
        title={client.name ?? 'Без імені'}
        subtitle={`${client.email} · у базі з ${formatDate(client.createdAt)}`}
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* ---------- профіль ---------- */}
        <Card className="h-fit p-7">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-mint font-display text-xl text-plum">
              {initials(client.name, client.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-plum">{client.name}</p>
              <p className="truncate text-xs text-muted">{client.email}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Телефон</dt>
              <dd className="text-plum">{client.profile?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Запит</dt>
              <dd className="text-plum">{client.profile?.diagnosis ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Тека в Google Drive</dt>
              <dd className="text-plum">
                {client.profile?.driveFolderId ? 'створена' : 'ще немає'}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-[rgba(46,35,56,.12)] pt-5">
            <p className="text-xs text-muted">Нотатки — клієнт їх не бачить</p>
            <p className="mt-2 text-sm whitespace-pre-line text-plum">
              {client.profile?.notes || '—'}
            </p>
          </div>

          <ResetPassword userId={client.id} email={client.email} />
        </Card>

        <div className="flex flex-col gap-6">
          {/* ---------- зустрічі ---------- */}
          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Зустрічі</h2>
            {client.sessions.length === 0 ? (
              <EmptyState>Зустрічей ще не було.</EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)]">
                {client.sessions.map((session) => (
                  <li key={session.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm text-plum">{formatDateTime(session.datetime)}</p>
                      {session.notes ? (
                        <p className="mt-1 text-xs text-muted">{session.notes}</p>
                      ) : null}
                    </div>
                    <Badge tone={session.status === 'SCHEDULED' ? 'mint' : 'neutral'}>
                      {sessionLabels[session.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {HOMEWORK_ENABLED ? (
            <>
          {/* ---------- домашні завдання ---------- */}
          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Призначити завдання</h2>
            <HomeworkForm userId={client.id} />
          </Card>

          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Домашні завдання</h2>
            {client.homework.length === 0 ? (
              <EmptyState>Завдань ще не призначено.</EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)]">
                {client.homework.map((task) => (
                  <li key={task.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-plum">{task.title}</p>
                        <p className="mt-1 text-sm text-muted">{task.description}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-3">
                        <Badge tone={task.status === 'COMPLETED' ? 'mint' : 'warm'}>
                          {homeworkLabels[task.status]}
                        </Badge>
                        <form action={deleteHomework}>
                          <input type="hidden" name="id" value={task.id} />
                          <button
                            type="submit"
                            className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                          >
                            Прибрати
                          </button>
                        </form>
                      </span>
                    </div>
                    {task.clientAnswer ? (
                      <p className="mt-3 rounded-2xl bg-cream-warm p-4 text-sm whitespace-pre-line text-plum">
                        {task.clientAnswer}
                      </p>
                    ) : null}
                    {task.attachments.length > 0 ? (
                      <p className="mt-2 text-xs text-muted">
                        Вкладень: {task.attachments.length}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
            </>
          ) : null}

          {/* ---------- тести ---------- */}
          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Результати тестів</h2>
            {client.results.length === 0 ? (
              <EmptyState>Тести ще не проходили.</EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)]">
                {client.results.map((result) => {
                  const raw = result.rawAnswers as {
                    slug?: string;
                    note?: string;
                    profile?: {
                      id: string;
                      short: string;
                      name: string;
                      value: number;
                      max: number;
                    }[];
                  } | null;
                  const test = raw?.slug ? getTest(raw.slug) : undefined;

                  return (
                  <li key={result.id} className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-plum">{result.testName}</p>
                      <span className="text-sm text-muted">
                        {result.score !== null && test
                          ? `${result.score} — ${interpret(test, result.score)} · `
                          : ''}
                        {formatDate(result.completedAt)}
                      </span>
                    </div>

                    {raw?.profile && raw.slug ? (
                      <div className="mt-4">
                        <TestProfile profile={raw.profile} slug={raw.slug} />
                      </div>
                    ) : null}

                    {raw?.note ? (
                      <p className="mt-3 rounded-2xl bg-cream-warm p-4 text-sm whitespace-pre-line text-plum">
                        «{raw.note}»
                      </p>
                    ) : null}
                    {result.aiSummary ? (
                      <p className="mt-2 text-sm text-muted">{result.aiSummary}</p>
                    ) : (
                      <SummaryButton resultId={result.id} disabled={!aiReady} />
                    )}
                  </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
