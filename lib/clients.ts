import { db } from '@/lib/db';

/** Список клієнтів для таблиці CRM з найближчою зустріччю і лічильником завдань. */
export async function listClients() {
  const now = new Date();

  const clients = await db.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      profile: { select: { phone: true, diagnosis: true } },
      sessions: {
        where: { datetime: { gte: now }, status: 'SCHEDULED' },
        orderBy: { datetime: 'asc' },
        take: 1,
        select: { datetime: true },
      },
      _count: { select: { results: true } },
    },
  });

  return clients.map((c) => ({
    ...c,
    nextSession: c.sessions[0]?.datetime ?? null,
  }));
}

export async function getClient(id: string) {
  return db.user.findFirst({
    where: { id, role: 'CLIENT' },
    include: {
      profile: true,
      sessions: { orderBy: { datetime: 'desc' } },
      homework: { orderBy: { createdAt: 'desc' }, include: { attachments: true } },
      results: { orderBy: { completedAt: 'desc' } },
    },
  });
}
