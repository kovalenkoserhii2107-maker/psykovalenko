'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { scoreSubmission, type TestSubmitState } from '@/lib/test-scoring';

export type { TestSubmitState };

export async function saveTestResult(
  _prev: TestSubmitState,
  formData: FormData,
): Promise<TestSubmitState> {
  const user = await requireRole('CLIENT');

  const slug = String(formData.get('slug') ?? '');
  const scored = scoreSubmission(slug, String(formData.get('answers') ?? ''));
  if ('error' in scored) return { error: scored.error };

  const { test, score, profile } = scored;
  const answers = (scored as unknown as { answers: Record<string, number> }).answers;
  const note = String(formData.get('note') ?? '').trim();

  await db.testResult.create({
    data: {
      userId: user.id,
      testName: test.name,
      score,
      rawAnswers: { slug, answers, note, profile },
    },
  });

  revalidatePath('/client/tests');
  revalidatePath('/client');
  revalidatePath(`/admin/clients/${user.id}`);

  const dominant = [...profile].sort((a, b) => b.value - a.value)[0];
  return { done: true, headline: dominant?.name };
}
