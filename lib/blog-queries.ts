import { db } from '@/lib/db';

/** Лише опубліковані й лише ті, у кого дата вже настала. */
export const publishedWhere = {
  status: 'PUBLISHED' as const,
  publishedAt: { not: null },
};

export const publishedOrder = [{ publishedAt: 'desc' as const }];

export function listPublished(take?: number) {
  return db.post.findMany({
    where: publishedWhere,
    orderBy: publishedOrder,
    ...(take ? { take } : {}),
  });
}

export function findPublished(slug: string) {
  return db.post.findFirst({ where: { ...publishedWhere, slug } });
}
