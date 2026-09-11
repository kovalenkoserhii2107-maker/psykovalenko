'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { getTest, interpret } from '@/lib/tests';

export type SaveTestState = { error?: string; score?: number; verdict?: string };

export async function saveTestResult(
  _prev: SaveTestState,
  formData: FormData,
): Promise<SaveTestState> {
  const user = await requireRole('CLIENT');

  const slug = String(formData.get('slug') ?? '');
  const test = getTest(slug);
  if (!test) return { error: 'Тест не знайдено' };

  let answers: Record<string, number>;
  try {
    answers = JSON.parse(String(formData.get('answers') ?? '{}'));
  } catch {
    return { error: 'Не вдалося прочитати відповіді' };
  }

  const allowed = new Set(test.options.map((o) => o.value));
  const missing = test.questions.filter((q) => !allowed.has(answers[q.id]));
  if (missing.length > 0) {
    return { error: `Без відповіді лишилось запитань: ${missing.length}` };
  }

  const score = test.questions.reduce((sum, q) => sum + answers[q.id], 0);
  const note = String(formData.get('note') ?? '').trim();

  await db.testResult.create({
    data: {
      userId: user.id,
      testName: test.name,
      score,
      rawAnswers: { slug, answers, note },
    },
  });

  revalidatePath('/client/tests');
  return { score, verdict: interpret(test, score) };
}
