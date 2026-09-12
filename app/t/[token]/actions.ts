'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { scoreSubmission } from '@/lib/test-scoring';

export type PublicTestState = {
  error?: string;
  done?: boolean;
  /** Коротко: те саме, що бачить клієнт у кабінеті — без чисел і тлумачень */
  headline?: string;
};

/**
 * Збереження анкети, заповненої за посиланням. Входу не потребує, тож
 * усе, чим ми перевіряємо право писати в базу, — це токен: він має бути
 * чинним, не простроченим і ще не використаним.
 */
export async function submitInvite(
  _prev: PublicTestState,
  formData: FormData,
): Promise<PublicTestState> {
  const token = String(formData.get('token') ?? '');
  if (!token) return { error: 'Посилання недійсне' };

  const invite = await db.testInvite.findUnique({ where: { token } });
  if (!invite) return { error: 'Посилання недійсне' };
  if (invite.status === 'COMPLETED') return { error: 'Цю анкету вже заповнено' };
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { error: 'Термін дії посилання минув' };
  }

  const scored = scoreSubmission(invite.testSlug, String(formData.get('answers') ?? ''));
  if ('error' in scored) return { error: scored.error };

  const { test, score, profile } = scored;
  const answers = (scored as unknown as { answers: Record<string, number> }).answers;
  const note = String(formData.get('note') ?? '').trim();

  const name = String(formData.get('respondentName') ?? '').trim();
  const email = String(formData.get('respondentEmail') ?? '').trim();

  await db.$transaction(async (tx) => {
    const result = await tx.testResult.create({
      data: {
        // Якщо анкету надіслали своєму клієнту — результат чіпляється до нього
        userId: invite.userId,
        testName: test.name,
        score,
        rawAnswers: { slug: invite.testSlug, answers, note, profile },
      },
    });

    await tx.testInvite.update({
      where: { id: invite.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        resultId: result.id,
        respondentName: name || invite.respondentName,
        respondentEmail: email || invite.respondentEmail,
      },
    });
  });

  revalidatePath('/admin/tests');
  if (invite.userId) revalidatePath(`/admin/clients/${invite.userId}`);

  const dominant = [...profile].sort((a, b) => b.value - a.value)[0];
  return {
    done: true,
    headline: dominant ? dominant.name : (test.name ?? undefined),
  };
}

/** Позначає, що сторінку відкрили. Помилки тут нікого не цікавлять. */
export async function markOpened(token: string) {
  await db.testInvite
    .updateMany({
      where: { token, status: 'SENT' },
      data: { status: 'OPENED', openedAt: new Date() },
    })
    .catch(() => {});
}
