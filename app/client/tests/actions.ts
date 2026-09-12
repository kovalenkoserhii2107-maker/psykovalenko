'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { getTest, interpret, scaleScores } from '@/lib/tests';

/**
 * Те, що бачить клієнт і що лягає в базу. Описи шкал і підказки
 * фахівчині сюди навмисно не входять: цей об'єкт їде в браузер клієнта.
 */
export type ProfileEntry = {
  id: string;
  short: string;
  name: string;
  value: number;
  max: number;
};

export type SaveTestState = {
  error?: string;
  score?: number;
  verdict?: string;
  profile?: ProfileEntry[];
};

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

  const note = String(formData.get('note') ?? '').trim();
  const profile: ProfileEntry[] = scaleScores(test, answers).map((entry) => ({
    id: entry.id,
    short: entry.short,
    name: entry.name,
    value: entry.value,
    max: entry.max,
  }));

  // Профільний тест не зводиться до одного балу: зберігаємо розклад
  // за шкалами, а score лишаємо порожнім, щоб не вдавати загальну оцінку.
  const score = test.scales ? null : test.questions.reduce((sum, q) => sum + answers[q.id], 0);

  await db.testResult.create({
    data: {
      userId: user.id,
      testName: test.name,
      score,
      rawAnswers: { slug, answers, note, profile },
    },
  });

  revalidatePath('/client/tests');

  if (test.scales) return { profile };
  return { score: score ?? 0, verdict: interpret(test, score ?? 0) };
}
