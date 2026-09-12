'use server';

import { randomBytes } from 'node:crypto';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { getTest } from '@/lib/tests';

const schema = z.object({
  testSlug: z.string().trim().min(1, 'Оберіть анкету'),
  label: z.string().trim().max(120, 'Підпис задовгий').optional(),
  userId: z.string().trim().optional(),
  days: z.coerce.number().int().min(0).max(365).optional(),
});

export type InviteState = {
  error?: string;
  created?: { token: string; testName: string; label?: string };
};

/**
 * Токен у посиланні — єдине, що відділяє анкету від сторонніх очей,
 * тож він має бути непередбачуваним: 32 шістнадцяткові символи з
 * криптографічного джерела, а не Math.random і не cuid.
 */
const newToken = () => randomBytes(16).toString('hex');

export async function createInvite(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requireRole('ADMIN');

  const parsed = schema.safeParse({
    testSlug: String(formData.get('testSlug') ?? ''),
    label: String(formData.get('label') ?? ''),
    userId: String(formData.get('userId') ?? ''),
    days: String(formData.get('days') ?? '') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Перевірте поля' };
  }

  const { testSlug, label, userId, days } = parsed.data;
  const test = getTest(testSlug);
  if (!test) return { error: 'Такої анкети немає' };

  if (userId) {
    const client = await db.user.findFirst({ where: { id: userId, role: 'CLIENT' } });
    if (!client) return { error: 'Клієнта не знайдено' };
  }

  const invite = await db.testInvite.create({
    data: {
      token: newToken(),
      testSlug,
      label: label || null,
      userId: userId || null,
      expiresAt: days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null,
    },
  });

  revalidatePath('/admin/tests');
  return { created: { token: invite.token, testName: test.name, label: label || undefined } };
}

export async function deleteInvite(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('id') ?? '');
  const invite = await db.testInvite.findUnique({ where: { id } });
  if (!invite) return;

  // Результат лишається: посилання — це лише спосіб доставки анкети,
  // прибирати разом з ним уже зібрані відповіді було б несподівано.
  await db.testInvite.delete({ where: { id } });
  revalidatePath('/admin/tests');
}
