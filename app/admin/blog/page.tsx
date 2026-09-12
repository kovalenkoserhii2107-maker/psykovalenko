import Link from 'next/link';
import type { Metadata } from 'next';

import { Badge, ButtonLink, Card, EmptyState, PageTitle } from '@/components/ui';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { coverUrl, readingMinutes } from '@/lib/posts';

import { setPostStatus } from './actions';

export const metadata: Metadata = { title: 'Блог' };
export const dynamic = 'force-dynamic';

export default async function AdminBlog() {
  const posts = await db.post.findMany({
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
  });

  const published = posts.filter((p) => p.status === 'PUBLISHED').length;

  return (
    <>
      <PageTitle
        title="Блог"
        subtitle={
          posts.length
            ? `${published} опубліковано, ${posts.length - published} у чернетках`
            : 'Ще жодного допису'
        }
        action={<ButtonLink href="/admin/blog/new">Новий допис</ButtonLink>}
      />

      {posts.length === 0 ? (
        <EmptyState>
          Тут будуть ваші дописи. Опубліковані з’являються на головній сторінці
          і на /blog.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => {
            const cover = coverUrl(post);
            return (
              <Card key={post.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-warm">
                  {cover ? (
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-[12rem] flex-1">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="font-display text-lg text-plum hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {post.status === 'PUBLISHED' && post.publishedAt
                      ? formatDate(post.publishedAt)
                      : `Змінено ${formatDate(post.updatedAt)}`}
                    {' · '}
                    {readingMinutes(post.body)} хв
                    {post.externalUrl ? ' · веде в соцмережу' : ''}
                  </p>
                </div>

                <Badge tone={post.status === 'PUBLISHED' ? 'mint' : 'neutral'}>
                  {post.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
                </Badge>

                <div className="flex items-center gap-2">
                  {post.status === 'PUBLISHED' ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-1.5 text-xs text-plum transition hover:bg-white/70"
                    >
                      Подивитись
                    </Link>
                  ) : null}
                  <form action={setPostStatus}>
                    <input type="hidden" name="id" value={post.id} />
                    <input
                      type="hidden"
                      name="publish"
                      value={post.status === 'PUBLISHED' ? '0' : '1'}
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-1.5 text-xs text-plum transition hover:bg-white/70"
                    >
                      {post.status === 'PUBLISHED' ? 'Зняти' : 'Опублікувати'}
                    </button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
