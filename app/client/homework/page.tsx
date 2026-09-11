import Link from 'next/link';
import type { Metadata } from 'next';

import { Badge, Card, EmptyState } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Завдання' };

const statusLabels = {
  PENDING: 'Не почато',
  IN_PROGRESS: 'В роботі',
  COMPLETED: 'Виконано',
} as const;

export default async function HomeworkList() {
  const user = await requireRole('CLIENT');

  const tasks = await db.homework.findMany({
    where: { userId: user.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { _count: { select: { attachments: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="px-1 font-display text-3xl text-plum">Завдання</h1>

      {tasks.length === 0 ? (
        <EmptyState>Психологиня ще не призначила завдань.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={`/client/homework/${task.id}`}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-plum">{task.title}</p>
                    <Badge tone={task.status === 'COMPLETED' ? 'mint' : 'warm'}>
                      {statusLabels[task.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{task.description}</p>
                  <p className="mt-3 text-xs text-muted">
                    {formatDate(task.createdAt)}
                    {task._count.attachments > 0
                      ? ` · файлів: ${task._count.attachments}`
                      : ''}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
