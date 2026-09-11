import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge, Card } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

import { AnswerForm } from './answer-form';
import { UploadForm } from './upload-form';

export const metadata: Metadata = { title: 'Завдання' };

const statusLabels = {
  PENDING: 'Не почато',
  IN_PROGRESS: 'В роботі',
  COMPLETED: 'Виконано',
} as const;

const kb = (size: number) => `${Math.max(1, Math.round(size / 1024))} КБ`;

export default async function HomeworkPage({
  params,
}: PageProps<'/client/homework/[id]'>) {
  const user = await requireRole('CLIENT');
  const { id } = await params;

  const task = await db.homework.findFirst({
    where: { id, userId: user.id },
    include: { attachments: { orderBy: { createdAt: 'desc' } } },
  });
  if (!task) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/client/homework"
        className="px-1 text-sm text-muted underline underline-offset-4"
      >
        ← До завдань
      </Link>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl text-plum">{task.title}</h1>
          <Badge tone={task.status === 'COMPLETED' ? 'mint' : 'warm'}>
            {statusLabels[task.status]}
          </Badge>
        </div>
        <p className="mt-3 text-sm whitespace-pre-line text-muted">{task.description}</p>
        {task.dueDate ? (
          <p className="mt-3 text-xs text-muted">До {formatDate(task.dueDate)}</p>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-xl text-plum">Ваша відповідь</h2>
        <AnswerForm
          id={task.id}
          answer={task.clientAnswer}
          completed={task.status === 'COMPLETED'}
        />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-xl text-plum">Файли</h2>

        {task.attachments.length > 0 ? (
          <ul className="mb-4 flex flex-col gap-2">
            {task.attachments.map((file) => (
              <li key={file.id}>
                <a
                  href={`/api/files/${file.id}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-between gap-3 rounded-2xl bg-cream-warm px-4 py-3 text-sm"
                >
                  <span className="truncate text-plum">{file.fileName}</span>
                  <span className="shrink-0 text-xs text-muted">{kb(file.size)}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <UploadForm id={task.id} />
        <p className="mt-3 text-xs text-muted">
          До 10 МБ: фото, PDF, аудіо або текст.
        </p>
      </Card>
    </div>
  );
}
