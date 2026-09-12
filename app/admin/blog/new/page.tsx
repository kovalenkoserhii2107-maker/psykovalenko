import type { Metadata } from 'next';

import { Card, PageTitle } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { CATEGORY_SUGGESTIONS } from '@/lib/post-categories';

import { PostEditor } from '../post-editor';

export const metadata: Metadata = { title: 'Новий допис' };

export const dynamic = 'force-dynamic';

export default async function NewPost() {
  await requireRole('ADMIN');

  const used = await db.post.findMany({
    where: { category: { not: null } },
    distinct: ['category'],
    select: { category: true },
  });
  const categories = [
    ...new Set([...used.map((u) => u.category!), ...CATEGORY_SUGGESTIONS]),
  ];

  return (
    <>
      <PageTitle title="Новий допис" subtitle="Чернетку видно лише вам" />
      <Card className="max-w-3xl p-6">
        <PostEditor categories={categories} />
      </Card>
    </>
  );
}
