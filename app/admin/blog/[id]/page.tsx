import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge, Card, PageTitle } from '@/components/ui';
import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import { coverUrl } from '@/lib/posts';

import { deletePost, removeCover } from '../actions';
import { PostEditor } from '../post-editor';

export const metadata: Metadata = { title: 'Допис' };
export const dynamic = 'force-dynamic';

export default async function EditPost({ params }: PageProps<'/admin/blog/[id]'>) {
  await requireRole('ADMIN');

  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <>
      <PageTitle
        title={post.title}
        subtitle={`Змінено ${formatDateTime(post.updatedAt)}`}
        action={
          <div className="flex items-center gap-3">
            <Badge tone={post.status === 'PUBLISHED' ? 'mint' : 'neutral'}>
              {post.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
            </Badge>
            <Link href="/admin/blog" className="text-sm text-muted hover:text-plum">
              До списку
            </Link>
          </div>
        }
      />

      <Card className="max-w-3xl p-6">
        <PostEditor
          post={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt ?? '',
            body: post.body,
            coverUrl: coverUrl(post),
            coverAlt: post.coverAlt ?? '',
            sourceLabel: post.sourceLabel ?? '',
            externalUrl: post.externalUrl ?? '',
            status: post.status,
          }}
        />
      </Card>

      <div className="mt-6 flex max-w-3xl flex-wrap items-center gap-3">
        {post.coverName ? (
          <form action={removeCover}>
            <input type="hidden" name="id" value={post.id} />
            <button
              type="submit"
              className="rounded-full border border-[rgba(46,35,56,.2)] px-5 py-2 text-sm text-plum transition hover:bg-white/70"
            >
              Прибрати обкладинку
            </button>
          </form>
        ) : null}

        <form action={deletePost} className="ml-auto">
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            className="rounded-full border border-[#b3261e]/30 px-5 py-2 text-sm text-[#8c1d18] transition hover:bg-[#b3261e]/10"
          >
            Видалити допис
          </button>
        </form>
      </div>
    </>
  );
}
