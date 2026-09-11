import { google } from 'googleapis';

import { db } from '@/lib/db';

/**
 * Робота з Google Calendar і Drive від імені психологині.
 *
 * Токени лежать у таблиці Account — їх записує NextAuth під час входу
 * через Google. Клієнти сюди не потрапляють: працює лише обліковий
 * запис із роллю ADMIN.
 */

export const GOOGLE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  // drive.file — доступ лише до того, що створив сам застосунок.
  // Ширший скоуп drive вимагав би перевірки безпеки з боку Google.
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

export function isGoogleConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export class GoogleNotConnected extends Error {
  constructor() {
    super('Google не підключено: увійдіть у CRM через Google');
    this.name = 'GoogleNotConnected';
  }
}

/**
 * Клієнт Google з дійсним токеном. Якщо термін збіг — оновлює його
 * через refresh_token і зберігає новий у базі.
 */
export async function googleClient(adminUserId: string) {
  if (!isGoogleConfigured()) throw new GoogleNotConnected();

  const account = await db.account.findFirst({
    where: { userId: adminUserId, provider: 'google' },
  });
  if (!account?.refresh_token) throw new GoogleNotConnected();

  const auth = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  );
  auth.setCredentials({
    access_token: account.access_token ?? undefined,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Бібліотека сама оновлює токен, коли той протух; нам лишається
  // зберегти новий, інакше оновлення повторюватиметься щоразу.
  auth.on('tokens', (tokens) => {
    void db.account
      .update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token ?? account.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : account.expires_at,
          ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
        },
      })
      .catch(() => {
        // не валимо основну операцію через невдалий запис токена
      });
  });

  return auth;
}

/** Знаходить психологиню — власника інтеграції. */
export async function adminUserId() {
  const admin = await db.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return admin?.id ?? null;
}

// ------------------------------------------------------------------- Drive

const ROOT_FOLDER_NAME = 'Кабінет психолога — клієнти';

async function findOrCreateFolder(
  auth: Awaited<ReturnType<typeof googleClient>>,
  name: string,
  parentId?: string,
) {
  const drive = google.drive({ version: 'v3', auth });

  const escaped = name.replace(/'/g, "\\'");
  const parentClause = parentId ? ` and '${parentId}' in parents` : '';
  const existing = await drive.files.list({
    q: `name = '${escaped}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false${parentClause}`,
    fields: 'files(id)',
    pageSize: 1,
  });

  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: 'id',
  });
  if (!created.data.id) throw new Error('Google Drive не повернув ідентифікатор теки');
  return created.data.id;
}

/** Створює теку клієнта всередині спільної теки кабінету. */
export async function createClientFolder(ownerId: string, clientName: string) {
  const auth = await googleClient(ownerId);
  const rootId = await findOrCreateFolder(auth, ROOT_FOLDER_NAME);
  return findOrCreateFolder(auth, clientName, rootId);
}

// ---------------------------------------------------------------- Calendar

export type BusySlot = { start: string; end: string };

/** Зайняті проміжки в календарі психологині. */
export async function busySlots(ownerId: string, from: Date, to: Date) {
  const auth = await googleClient(ownerId);
  const calendar = google.calendar({ version: 'v3', auth });

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      items: [{ id: 'primary' }],
      timeZone: 'Europe/Kyiv',
    },
  });

  const busy = response.data.calendars?.primary?.busy ?? [];
  return busy
    .filter((slot): slot is { start: string; end: string } =>
      Boolean(slot.start && slot.end),
    )
    .map((slot) => ({ start: slot.start, end: slot.end }) satisfies BusySlot);
}

/** Створює подію зустрічі. Повертає ідентифікатор події. */
export async function createCalendarEvent(
  ownerId: string,
  input: {
    summary: string;
    description?: string;
    start: Date;
    durationMinutes: number;
    attendeeEmail?: string;
  },
) {
  const auth = await googleClient(ownerId);
  const calendar = google.calendar({ version: 'v3', auth });

  const end = new Date(input.start.getTime() + input.durationMinutes * 60_000);

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start.toISOString(), timeZone: 'Europe/Kyiv' },
      end: { dateTime: end.toISOString(), timeZone: 'Europe/Kyiv' },
      ...(input.attendeeEmail ? { attendees: [{ email: input.attendeeEmail }] } : {}),
    },
  });

  return event.data.id ?? null;
}

export async function deleteCalendarEvent(ownerId: string, eventId: string) {
  const auth = await googleClient(ownerId);
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: 'primary', eventId });
}
