import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge, Card, EmptyState, PageTitle } from '@/components/ui';
import { TestProfile } from '@/components/test-profile';
import { isAiConfigured } from '@/lib/ai';
import { getClient } from '@/lib/clients';
import { HOMEWORK_ENABLED } from '@/lib/features';
import { formatDate, formatDateTime, initials } from '@/lib/format';
import type { ProfileEntry } from '@/lib/test-scoring';
import { getTest, interpret } from '@/lib/tests';

import { deleteHomework } from '../actions';

import {
  deleteNote,
  deleteTask,
  saveSessionNote,
  setSessionStatus,
  toggleTask,
  togglePin,
} from './card-actions';
import { NoteForm, TaskForm } from './card-forms';
import { HomeworkForm } from './homework-form';
import { ProfileForm } from './profile-form';
import { ResetPassword } from './reset-password';
import { SummaryButton } from './summary-button';

export const metadata: Metadata = { title: 'Картка клієнта' };
export const dynamic = 'force-dynamic';

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

const statusLabels = {
  ACTIVE: 'У роботі',
  PAUSED: 'Пауза',
  FINISHED: 'Завершено',
} as const;

const noteKinds = {
  SESSION: 'Підсумок зустрічі',
  NOTE: 'Спостереження',
  INSIGHT: 'Гіпотеза',
} as const;

/** Скільки повних років — щоб не рахувати в голові перед зустріччю. */
function age(birth: Date) {
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years -= 1;
  return years;
}

export default async function ClientPage({ params }: PageProps<'/admin/clients/[id]'>) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const aiReady = isAiConfigured();
  const p = client.profile;

  const now = new Date();
  const past = client.sessions.filter((s) => s.datetime < now);
  const held = client.sessions.filter((s) => s.status === 'COMPLETED').length;
  const next = [...client.sessions]
    .reverse()
    .find((s) => s.datetime >= now && s.status === 'SCHEDULED');
  const openTasks = client.tasks.filter((t) => !t.done);

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
        action={
          <Badge tone={p?.status === 'ACTIVE' ? 'mint' : 'neutral'}>
            {statusLabels[p?.status ?? 'ACTIVE']}
          </Badge>
        }
      />

      {/* Ризики — над усім іншим: це те, що має впасти в очі одразу */}
      {p?.risks ? (
        <div className="mb-6 rounded-3xl border border-[#b3261e]/25 bg-[#b3261e]/[.06] p-5">
          <p className="text-xs tracking-wide text-[#8c1d18] uppercase">Важливо памʼятати</p>
          <p className="mt-2 text-sm whitespace-pre-line text-plum">{p.risks}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* ---------- профіль ---------- */}
        <div className="flex flex-col gap-6">
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

            {p?.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            ) : null}

            <dl className="mt-6 space-y-3 text-sm">
              <Field label="Телефон" value={p?.phone} />
              <Field
                label="Вік"
                value={p?.birthDate ? `${age(p.birthDate)} · ${formatDate(p.birthDate)}` : null}
              />
              <Field label="Формат" value={p?.format} />
              <Field label="Звідки прийшов" value={p?.referral} />
              <Field label="Запит" value={p?.diagnosis} />
              <Field label="Цілі роботи" value={p?.goals} />
              <Field label="Контекст" value={p?.context} />
            </dl>

            <div className="mt-6 border-t border-[rgba(46,35,56,.12)] pt-5">
              <p className="text-xs text-muted">Загальні нотатки — клієнт їх не бачить</p>
              <p className="mt-2 text-sm whitespace-pre-line text-plum">{p?.notes || '—'}</p>
            </div>

            <ProfileForm
              values={{
                userId: client.id,
                phone: p?.phone ?? '',
                birthDate: p?.birthDate ? p.birthDate.toISOString().slice(0, 10) : '',
                diagnosis: p?.diagnosis ?? '',
                goals: p?.goals ?? '',
                context: p?.context ?? '',
                risks: p?.risks ?? '',
                notes: p?.notes ?? '',
                format: p?.format ?? '',
                referral: p?.referral ?? '',
                status: p?.status ?? 'ACTIVE',
                tags: (p?.tags ?? []).join(', '),
              }}
            />

            <ResetPassword userId={client.id} email={client.email} />
          </Card>

          <Card className="h-fit p-7">
            <h2 className="mb-4 font-display text-xl text-plum">Коротко</h2>
            <dl className="space-y-3 text-sm">
              <Field label="Зустрічей відбулося" value={String(held)} />
              <Field
                label="Наступна зустріч"
                value={next ? formatDateTime(next.datetime) : null}
              />
              <Field
                label="Остання зустріч"
                value={past[0] ? formatDateTime(past[0].datetime) : null}
              />
              <Field label="Заповнених анкет" value={String(client.results.length)} />
              <Field
                label="Тека в Google Drive"
                value={p?.driveFolderId ? 'створена' : null}
              />
            </dl>

            {client.invites.length ? (
              <div className="mt-5 border-t border-[rgba(46,35,56,.12)] pt-4">
                <p className="text-xs text-muted">Надіслані анкети, ще не заповнені</p>
                <ul className="mt-2 space-y-1 text-sm text-plum">
                  {client.invites.map((invite) => (
                    <li key={invite.id}>
                      {getTest(invite.testSlug)?.name ?? invite.testSlug}
                      <span className="text-muted"> · {formatDate(invite.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* ---------- план на наступну зустріч ---------- */}
          <Card className="p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl text-plum">План на наступну зустріч</h2>
              {openTasks.length ? (
                <span className="text-sm text-muted">{openTasks.length} пунктів</span>
              ) : null}
            </div>

            {client.tasks.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Порожньо. Сюди зручно кинути думку одразу після сесії, поки не забулась.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-1">
                {client.tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 py-1.5">
                    <form action={toggleTask} className="flex">
                      <input type="hidden" name="id" value={task.id} />
                      <button
                        type="submit"
                        aria-label={task.done ? 'Повернути в роботу' : 'Позначити зробленим'}
                        className={`flex size-5 items-center justify-center rounded-md border transition ${
                          task.done
                            ? 'border-transparent bg-mint text-plum'
                            : 'border-[rgba(46,35,56,.3)] hover:border-plum'
                        }`}
                      >
                        {task.done ? (
                          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="5 13 10 18 19 6" />
                          </svg>
                        ) : null}
                      </button>
                    </form>

                    <span className={`flex-1 text-sm ${task.done ? 'text-muted line-through' : 'text-plum'}`}>
                      {task.title}
                    </span>

                    <form action={deleteTask}>
                      <input type="hidden" name="id" value={task.id} />
                      <button
                        type="submit"
                        className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                      >
                        Прибрати
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <TaskForm userId={client.id} />
          </Card>

          {/* ---------- нотатки ---------- */}
          <Card className="p-7">
            <h2 className="font-display text-2xl text-plum">Нотатки</h2>
            <NoteForm
              userId={client.id}
              sessions={client.sessions.slice(0, 12).map((s) => ({
                id: s.id,
                label: formatDateTime(s.datetime),
              }))}
            />

            {client.notes.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Записів ще немає.</p>
            ) : (
              <ul className="mt-6 divide-y divide-[rgba(46,35,56,.08)]">
                {client.notes.map((note) => (
                  <li key={note.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone={note.kind === 'INSIGHT' ? 'warm' : 'neutral'}>
                        {noteKinds[note.kind]}
                      </Badge>
                      <span className="text-xs text-muted">
                        {formatDateTime(note.createdAt)}
                        {note.session ? ` · зустріч ${formatDate(note.session.datetime)}` : ''}
                      </span>
                      {note.pinned ? <Badge tone="mint">Закріплено</Badge> : null}

                      <span className="ml-auto flex items-center gap-3">
                        <form action={togglePin}>
                          <input type="hidden" name="id" value={note.id} />
                          <button
                            type="submit"
                            className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                          >
                            {note.pinned ? 'Відкріпити' : 'Закріпити'}
                          </button>
                        </form>
                        <form action={deleteNote}>
                          <input type="hidden" name="id" value={note.id} />
                          <button
                            type="submit"
                            className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                          >
                            Видалити
                          </button>
                        </form>
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-line text-plum">{note.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ---------- зустрічі ---------- */}
          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Зустрічі</h2>
            {client.sessions.length === 0 ? (
              <EmptyState>Зустрічей ще не було.</EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)]">
                {client.sessions.map((session) => (
                  <li key={session.id} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-plum">{formatDateTime(session.datetime)}</p>
                      <form action={setSessionStatus} className="flex items-center gap-2">
                        <input type="hidden" name="sessionId" value={session.id} />
                        <select
                          name="status"
                          defaultValue={session.status}
                          className="rounded-full border border-[rgba(46,35,56,.2)] bg-white/70 px-3 py-1 text-xs text-plum"
                        >
                          {Object.entries(sessionLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                        >
                          Змінити
                        </button>
                      </form>
                    </div>

                    <form action={saveSessionNote} className="mt-3 flex flex-col gap-2">
                      <input type="hidden" name="sessionId" value={session.id} />
                      <textarea
                        name="notes"
                        rows={2}
                        defaultValue={session.notes ?? ''}
                        placeholder="Що було на зустрічі"
                        className="w-full resize-y rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-2.5 text-sm text-ink outline-none focus:border-plum/40 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="self-start text-xs text-muted underline underline-offset-4 hover:text-plum"
                      >
                        Зберегти підсумок
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {HOMEWORK_ENABLED ? (
            <>
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
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          ) : null}

          {/* ---------- анкети ---------- */}
          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Результати анкет</h2>
            {client.results.length === 0 ? (
              <EmptyState>Анкет ще не заповнювали.</EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)]">
                {client.results.map((result) => {
                  const raw = result.rawAnswers as {
                    slug?: string;
                    note?: string;
                    profile?: ProfileEntry[];
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

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="whitespace-pre-line text-plum">{value || '—'}</dd>
    </div>
  );
}
