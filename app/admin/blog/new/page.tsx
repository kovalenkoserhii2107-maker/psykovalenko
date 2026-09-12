import type { Metadata } from 'next';

import { Card, PageTitle } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';

import { PostEditor } from '../post-editor';

export const metadata: Metadata = { title: 'Новий допис' };

export default async function NewPost() {
  await requireRole('ADMIN');

  return (
    <>
      <PageTitle title="Новий допис" subtitle="Чернетку видно лише вам" />
      <Card className="max-w-3xl p-6">
        <PostEditor />
      </Card>
    </>
  );
}
