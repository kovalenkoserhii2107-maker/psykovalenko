'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireRole } from '@/lib/auth-guard';
import { summarizeTestResult } from '@/lib/ai';
import { db } from '@/lib/db';
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
  created?: { name: string; email: string; password: string };
  values?: { name: string; email: string; phone: string; diagnosis: string; notes: string };
};

export async function createClient(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  await requireRole('ADMIN');

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

  await db.user.create({
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
  });

  revalidatePath('/admin/clients');
  return { created: { name, email, password } };
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
