import { db } from '@/lib/db';

/** Лише опубліковані й лише ті, у кого дата вже настала. */
export const publishedWhere = {
  status: 'PUBLISHED' as const,
  publishedAt: { not: null },
};

export const publishedOrder = [{ publishedAt: 'desc' as const }];

export function listPublished(take?: number, category?: string) {
  return db.post.findMany({
    where: category ? { ...publishedWhere, category } : publishedWhere,
    orderBy: publishedOrder,
    ...(take ? { take } : {}),
  });
}

/**
 * Рубрики, що реально трапляються серед опублікованих, із лічильниками.
 * Збираємо із самих дописів, а не з переліку: порожніх рубрик у стрічці
 * бути не має.
 */
export async function listCategories() {
  const rows = await db.post.groupBy({
    by: ['category'],
    where: { ...publishedWhere, category: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { category: 'desc' } },
  });

  return rows
    .filter((r): r is typeof r & { category: string } => Boolean(r.category))
    .map((r) => ({ name: r.category, count: r._count._all }));
}

export function findPublished(slug: string) {
  return db.post.findFirst({ where: { ...publishedWhere, slug } });
}
