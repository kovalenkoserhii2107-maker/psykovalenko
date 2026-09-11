import type { Metadata } from 'next';

import { Badge, Card, EmptyState, PageTitle } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import { busySlots, isGoogleConfigured, type BusySlot } from '@/lib/google';

import { BookingForm } from './booking-form';
import { cancelSession } from './actions';

export const metadata: Metadata = { title: 'Календар' };

export default async function CalendarPage() {
  const admin = await requireRole('ADMIN');

  const now = new Date();
  const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [clients, sessions] = await Promise.all([
    db.user.findMany({
      where: { role: 'CLIENT' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    db.session.findMany({
      where: { datetime: { gte: now, lte: horizon }, status: 'SCHEDULED' },
      orderBy: { datetime: 'asc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  let busy: BusySlot[] = [];
  let googleNote: string | null = null;

  if (!isGoogleConfigured()) {
    googleNote = 'Google не налаштовано: немає AUTH_GOOGLE_ID і AUTH_GOOGLE_SECRET';
  } else {
    try {
      busy = await busySlots(admin.id, now, horizon);
    } catch (error) {
      googleNote =
        error instanceof Error && error.name === 'GoogleNotConnected'
          ? 'Календар не підключено: увійдіть у CRM через Google'
          : 'Не вдалося отримати зайняті проміжки з Google Calendar';
    }
  }

  return (
    <>
      <PageTitle title="Календар" subtitle="Найближчі 30 днів" />

      {googleNote ? (
        <p className="mb-6 rounded-2xl bg-cream-warm px-5 py-4 text-sm text-muted">
          {googleNote}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="h-fit p-7">
          <h2 className="mb-4 font-display text-2xl text-plum">Записати зустріч</h2>
          {clients.length === 0 ? (
            <EmptyState>Спершу додайте клієнта.</EmptyState>
          ) : (
            <BookingForm
              clients={clients.map((c) => ({
                id: c.id,
                label: c.name ?? c.email,
              }))}
            />
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Заплановані зустрічі</h2>
            {sessions.length === 0 ? (
              <EmptyState>Поки нічого не заплановано.</EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)]">
                {sessions.map((session) => (
                  <li key={session.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm text-plum">
                        {session.user.name ?? session.user.email}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDateTime(session.datetime)} · {session.durationMinutes} хв
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.googleEventId ? <Badge tone="mint">у календарі</Badge> : null}
                      <form action={cancelSession}>
                        <input type="hidden" name="id" value={session.id} />
                        <button
                          type="submit"
                          className="text-xs text-muted underline underline-offset-4 hover:text-plum"
                        >
                          Скасувати
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-7">
            <h2 className="mb-4 font-display text-2xl text-plum">Зайнято в Google Calendar</h2>
            {busy.length === 0 ? (
              <EmptyState>
                {googleNote ? 'Дані з Google недоступні.' : 'Вільно на весь період.'}
              </EmptyState>
            ) : (
              <ul className="divide-y divide-[rgba(46,35,56,.08)] text-sm">
                {busy.slice(0, 20).map((slot) => (
                  <li key={slot.start} className="py-2 text-muted">
                    {formatDateTime(new Date(slot.start))} —{' '}
                    {formatDateTime(new Date(slot.end))}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
