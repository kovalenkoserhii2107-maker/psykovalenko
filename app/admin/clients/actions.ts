'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireRole } from '@/lib/auth-guard';
import { summarizeTestResult } from '@/lib/ai';
import { db } from '@/lib/db';
import { createClientFolder } from '@/lib/google';
import { generatePassword } from '@/lib/password';

const schema = z.object({
  name: z.string().trim().min(2, 'Вкажіть ім’я'),
  email: z.string().trim().toLowerCase().email('Невірна адреса пошти'),
  phone: z.string().trim().optional(),
  diagnosis: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CreateClientState = {
  error?: string;
  created?: { name: string; email: string; password: string; driveNote?: string };
  values?: { name: string; email: string; phone: string; diagnosis: string; notes: string };
};

export async function createClient(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const admin = await requireRole('ADMIN');

  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    diagnosis: String(formData.get('diagnosis') ?? ''),
    notes: String(formData.get('notes') ?? ''),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Перевірте поля', values: raw };
  }

  const { name, email, phone, diagnosis, notes } = parsed.data;

  if (await db.user.findUnique({ where: { email } })) {
    return { error: 'Клієнт із такою поштою вже є', values: raw };
  }

  // Пароль показуємо психологині один раз: у базі лишається тільки хеш,
  // підглянути його потім неможливо — лише видати новий.
  const password = generatePassword();

  const created = await db.user.create({
    data: {
      name,
      email,
      role: 'CLIENT',
      passwordHash: await bcrypt.hash(password, 12),
      profile: {
        create: {
          phone: phone || null,
          diagnosis: diagnosis || null,
          notes: notes || null,
        },
      },
    },
    select: { id: true },
  });

  // Тека на Google Drive — приємне доповнення, а не умова створення
  // клієнта: якщо Google не підключено, доступ усе одно має з'явитися.
  let driveNote: string | undefined;
  try {
    const folderId = await createClientFolder(admin.id, name);
    await db.clientProfile.update({
      where: { userId: created.id },
      data: { driveFolderId: folderId },
    });
  } catch (error) {
    driveNote =
      error instanceof Error && error.name === 'GoogleNotConnected'
        ? 'Теку на Google Drive не створено: увійдіть у CRM через Google'
        : 'Теку на Google Drive не створено — спробуйте пізніше';
  }

  revalidatePath('/admin/clients');
  return { created: { name, email, password, driveNote } };
}

// ---------------------------------------------------------------- AI-резюме

export type SummaryState = { error?: string; summary?: string };

export async function buildSummary(
  _prev: SummaryState,
  formData: FormData,
): Promise<SummaryState> {
  await requireRole('ADMIN');

  const resultId = String(formData.get('resultId') ?? '');
  const result = await db.testResult.findUnique({
    where: { id: resultId },
    include: { user: { select: { name: true, email: true, profile: true } } },
  });
  if (!result) return { error: 'Результат не знайдено' };

  const raw = result.rawAnswers as {
    slug?: string;
    answers?: Record<string, number>;
    note?: string;
  };
  if (!raw?.slug || !raw.answers) {
    return { error: 'У результаті немає відповідей — резюме не скласти' };
  }

  try {
    const summary = await summarizeTestResult({
      slug: raw.slug,
      score: result.score ?? 0,
      answers: raw.answers,
      note: raw.note,
      identity: {
        name: result.user.name,
        email: result.user.email,
        phone: result.user.profile?.phone,
      },
    });

    await db.testResult.update({ where: { id: result.id }, data: { aiSummary: summary } });
    revalidatePath('/admin/clients');
    return { summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Невідома помилка';
    return { error: `Не вдалося скласти резюме: ${message}` };
  }
}

// ---------------------------------------------------- новий пароль клієнту

export type ResetPasswordState = { error?: string; password?: string };

/**
 * Видає клієнту новий пароль. Старий перестає діяти одразу: у базі
 * зберігається лише хеш, тож «підглянути» втрачений пароль неможливо —
 * єдиний шлях видати новий.
 */
export async function resetClientPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireRole('ADMIN');

  const userId = String(formData.get('userId') ?? '');
  const client = await db.user.findFirst({
    where: { id: userId, role: 'CLIENT' },
    select: { id: true },
  });
  if (!client) return { error: 'Клієнта не знайдено' };

  const password = generatePassword();
  await db.user.update({
    where: { id: client.id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  revalidatePath(`/admin/clients/${client.id}`);
  return { password };
}

// ------------------------------------------------------- домашні завдання

const homeworkSchema = z.object({
  userId: z.string().min(1),
  title: z.string().trim().min(3, 'Назва закоротка'),
  description: z.string().trim().min(10, 'Опишіть завдання докладніше'),
  dueDate: z.string().trim().optional(),
});

export type HomeworkState = { error?: string; ok?: string };

export async function assignHomework(
  _prev: HomeworkState,
  formData: FormData,
): Promise<HomeworkState> {
  await requireRole('ADMIN');

  const parsed = homeworkSchema.safeParse({
    userId: String(formData.get('userId') ?? ''),
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    dueDate: String(formData.get('dueDate') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Перевірте поля' };
  }

  const { userId, title, description, dueDate } = parsed.data;

  const client = await db.user.findFirst({
    where: { id: userId, role: 'CLIENT' },
    select: { id: true },
  });
  if (!client) return { error: 'Клієнта не знайдено' };

  let due: Date | null = null;
  if (dueDate) {
    const parsedDate = new Date(dueDate);
    if (Number.isNaN(parsedDate.getTime())) return { error: 'Невірна дата' };
    due = parsedDate;
  }

  await db.homework.create({
    data: { userId: client.id, title, description, dueDate: due },
  });

  revalidatePath(`/admin/clients/${client.id}`);
  revalidatePath('/admin');
  return { ok: 'Завдання призначено — клієнт побачить його в кабінеті' };
}

/** Прибирає завдання. Відповідь клієнта — вагома причина спитати ще раз. */
export async function deleteHomework(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('id') ?? '');
  const task = await db.homework.findUnique({ where: { id } });
  if (!task) return;

  await db.homework.delete({ where: { id } });
  revalidatePath(`/admin/clients/${task.userId}`);
  revalidatePath('/admin');
}
