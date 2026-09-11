'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { fileError, saveFile } from '@/lib/storage';

export type HomeworkState = { error?: string; saved?: boolean };

/** Клієнт зберігає відповідь. «Завершити» додатково закриває завдання. */
export async function saveAnswer(
  _prev: HomeworkState,
  formData: FormData,
): Promise<HomeworkState> {
  const user = await requireRole('CLIENT');

  const id = String(formData.get('id') ?? '');
  const answer = String(formData.get('answer') ?? '').trim();
  const complete = formData.get('complete') === 'on';

  // where з userId, а не просто findUnique: інакше чужий ідентифікатор
  // у формі дозволив би писати у відповідь іншого клієнта
  const task = await db.homework.findFirst({ where: { id, userId: user.id } });
  if (!task) return { error: 'Завдання не знайдено' };

  if (!answer && complete) {
    return { error: 'Напишіть відповідь, перш ніж завершувати' };
  }

  await db.homework.update({
    where: { id: task.id },
    data: {
      clientAnswer: answer || null,
      answeredAt: answer ? new Date() : null,
      status: complete ? 'COMPLETED' : answer ? 'IN_PROGRESS' : 'PENDING',
    },
  });

  revalidatePath('/client');
  revalidatePath(`/client/homework/${task.id}`);
  return { saved: true };
}

export type UploadState = { error?: string; uploaded?: string };

export async function uploadAttachment(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const user = await requireRole('CLIENT');

  const id = String(formData.get('id') ?? '');
  const file = formData.get('file');

  if (!(file instanceof File)) return { error: 'Оберіть файл' };

  const problem = fileError(file);
  if (problem) return { error: problem };

  const task = await db.homework.findFirst({ where: { id, userId: user.id } });
  if (!task) return { error: 'Завдання не знайдено' };

  const storedName = await saveFile(file);

  await db.attachment.create({
    data: {
      homeworkId: task.id,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url: storedName,
    },
  });

  if (task.status === 'PENDING') {
    await db.homework.update({ where: { id: task.id }, data: { status: 'IN_PROGRESS' } });
  }

  revalidatePath(`/client/homework/${task.id}`);
  return { uploaded: file.name };
}
