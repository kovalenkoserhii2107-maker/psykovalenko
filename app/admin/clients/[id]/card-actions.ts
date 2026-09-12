'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';

/** Сторінка картки — єдине місце, яке ці дії змінюють. */
const refresh = (userId: string) => {
  revalidatePath(`/admin/clients/${userId}`);
  revalidatePath('/admin/clients');
};

async function clientOr404(userId: string) {
  const client = await db.user.findFirst({ where: { id: userId, role: 'CLIENT' } });
  return client;
}

// ------------------------------------------------------------------- профіль

const profileSchema = z.object({
  diagnosis: z.string().trim().max(500).optional(),
  goals: z.string().trim().max(2000).optional(),
  context: z.string().trim().max(2000).optional(),
  risks: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(5000).optional(),
  phone: z.string().trim().max(40).optional(),
  format: z.string().trim().max(60).optional(),
  referral: z.string().trim().max(120).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'FINISHED']),
  tags: z.string().trim().max(300).optional(),
  birthDate: z.string().trim().optional(),
});

export type ProfileState = { error?: string; ok?: string };

export async function saveProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  await requireRole('ADMIN');

  const userId = String(formData.get('userId') ?? '');
  if (!(await clientOr404(userId))) return { error: 'Клієнта не знайдено' };

  const parsed = profileSchema.safeParse({
    diagnosis: String(formData.get('diagnosis') ?? ''),
    goals: String(formData.get('goals') ?? ''),
    context: String(formData.get('context') ?? ''),
    risks: String(formData.get('risks') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    format: String(formData.get('format') ?? ''),
    referral: String(formData.get('referral') ?? ''),
    status: String(formData.get('status') ?? 'ACTIVE'),
    tags: String(formData.get('tags') ?? ''),
    birthDate: String(formData.get('birthDate') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Перевірте поля' };
  }

  const d = parsed.data;
  const birthDate = d.birthDate ? new Date(d.birthDate) : null;
  if (birthDate && Number.isNaN(birthDate.getTime())) {
    return { error: 'Невірна дата народження' };
  }

  const tags = (d.tags ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  const data = {
    diagnosis: d.diagnosis || null,
    goals: d.goals || null,
    context: d.context || null,
    risks: d.risks || null,
    notes: d.notes || null,
    phone: d.phone || null,
    format: d.format || null,
    referral: d.referral || null,
    status: d.status,
    tags,
    birthDate,
  };

  await db.clientProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  refresh(userId);
  return { ok: 'Збережено' };
}

// ------------------------------------------------------------------- нотатки

const noteSchema = z.object({
  body: z.string().trim().min(1, 'Порожня нотатка'),
  kind: z.enum(['NOTE', 'SESSION', 'INSIGHT']),
  sessionId: z.string().trim().optional(),
});

export type NoteState = { error?: string; ok?: string };

export async function addNote(_prev: NoteState, formData: FormData): Promise<NoteState> {
  await requireRole('ADMIN');

  const userId = String(formData.get('userId') ?? '');
  if (!(await clientOr404(userId))) return { error: 'Клієнта не знайдено' };

  const parsed = noteSchema.safeParse({
    body: String(formData.get('body') ?? ''),
    kind: String(formData.get('kind') ?? 'NOTE'),
    sessionId: String(formData.get('sessionId') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Перевірте поля' };
  }

  await db.clientNote.create({
    data: {
      userId,
      body: parsed.data.body,
      kind: parsed.data.kind,
      sessionId: parsed.data.sessionId || null,
    },
  });

  refresh(userId);
  return { ok: 'Записано' };
}

export async function togglePin(formData: FormData) {
  await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const note = await db.clientNote.findUnique({ where: { id } });
  if (!note) return;
  await db.clientNote.update({ where: { id }, data: { pinned: !note.pinned } });
  refresh(note.userId);
}

export async function deleteNote(formData: FormData) {
  await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const note = await db.clientNote.findUnique({ where: { id } });
  if (!note) return;
  await db.clientNote.delete({ where: { id } });
  refresh(note.userId);
}

// ------------------------------------------- план на наступну зустріч

export type TaskState = { error?: string };

export async function addTask(_prev: TaskState, formData: FormData): Promise<TaskState> {
  await requireRole('ADMIN');

  const userId = String(formData.get('userId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'Порожній пункт' };
  if (title.length > 200) return { error: 'Задовгий пункт' };
  if (!(await clientOr404(userId))) return { error: 'Клієнта не знайдено' };

  await db.clientTask.create({ data: { userId, title } });
  refresh(userId);
  return {};
}

export async function toggleTask(formData: FormData) {
  await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const task = await db.clientTask.findUnique({ where: { id } });
  if (!task) return;
  await db.clientTask.update({
    where: { id },
    data: { done: !task.done, doneAt: task.done ? null : new Date() },
  });
  refresh(task.userId);
}

export async function deleteTask(formData: FormData) {
  await requireRole('ADMIN');
  const id = String(formData.get('id') ?? '');
  const task = await db.clientTask.findUnique({ where: { id } });
  if (!task) return;
  await db.clientTask.delete({ where: { id } });
  refresh(task.userId);
}

// ------------------------------------------------- підсумок зустрічі

export async function saveSessionNote(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('sessionId') ?? '');
  const notes = String(formData.get('notes') ?? '').trim();

  const session = await db.session.findUnique({ where: { id } });
  if (!session) return;

  await db.session.update({ where: { id }, data: { notes: notes || null } });
  refresh(session.userId);
}

export async function setSessionStatus(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('sessionId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) return;

  const session = await db.session.findUnique({ where: { id } });
  if (!session) return;

  await db.session.update({
    where: { id },
    data: { status: status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' },
  });
  refresh(session.userId);
  revalidatePath('/admin/calendar');
}
