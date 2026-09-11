'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google';

export type BookingState = {
  error?: string;
  ok?: string;
  values?: { userId: string; datetime: string; duration: string };
};

export async function bookSession(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const admin = await requireRole('ADMIN');

  const userId = String(formData.get('userId') ?? '');
  const datetimeRaw = String(formData.get('datetime') ?? '');
  const duration = Number(formData.get('duration') ?? 50);

  // Поля повертаємо у стан: React 19 очищає форму після дії, інакше після
  // помилки довелося б заново обирати клієнта й час.
  const values = { userId, datetime: datetimeRaw, duration: String(duration) };

  if (!userId || !datetimeRaw) return { error: 'Оберіть клієнта й час', values };

  const datetime = new Date(datetimeRaw);
  if (Number.isNaN(datetime.getTime())) return { error: 'Невірний час', values };
  if (datetime.getTime() < Date.now()) return { error: 'Цей час уже минув', values };

  const client = await db.user.findFirst({
    where: { id: userId, role: 'CLIENT' },
    select: { id: true, name: true, email: true },
  });
  if (!client) return { error: 'Клієнта не знайдено', values };

  // Спершу запис у базі: він головний. Подія в календарі — дзеркало,
  // і якщо Google недоступний, зустріч усе одно має бути записана.
  const session = await db.session.create({
    data: { userId: client.id, datetime, durationMinutes: duration },
  });

  let note = 'Зустріч записано';
  try {
    const eventId = await createCalendarEvent(admin.id, {
      summary: `Сесія — ${client.name ?? client.email}`,
      description: 'Створено з кабінету психолога',
      start: datetime,
      durationMinutes: duration,
      attendeeEmail: client.email,
    });
    if (eventId) {
      await db.session.update({ where: { id: session.id }, data: { googleEventId: eventId } });
      note = 'Зустріч записано і додано в Google Calendar';
    }
  } catch (error) {
    note =
      error instanceof Error && error.name === 'GoogleNotConnected'
        ? 'Зустріч записано. У Google Calendar не додано: увійдіть у CRM через Google'
        : 'Зустріч записано. Подію в Google Calendar створити не вдалося';
  }

  revalidatePath('/admin/calendar');
  revalidatePath('/admin');
  return { ok: note };
}

export async function cancelSession(formData: FormData) {
  const admin = await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');

  const session = await db.session.findUnique({ where: { id } });
  if (!session) return;

  await db.session.update({ where: { id }, data: { status: 'CANCELLED' } });

  if (session.googleEventId) {
    try {
      await deleteCalendarEvent(admin.id, session.googleEventId);
    } catch {
      // подію могли вже видалити вручну в календарі — це не помилка
    }
  }

  revalidatePath('/admin/calendar');
  revalidatePath('/admin');
}
