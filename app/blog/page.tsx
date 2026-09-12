import Link from 'next/link';
import type { Metadata } from 'next';

import { listCategories, listPublished } from '@/lib/blog-queries';
import { formatDate } from '@/lib/format';
import { coverUrl, postHref, readingMinutes } from '@/lib/posts';

import '../landing.css';
import './blog.css';

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Розбори, вправи та короткі нотатки про психіку — Тетяна Коваленко.',
};

export const dynamic = 'force-dynamic';

export default async function BlogIndex({ searchParams }: PageProps<'/blog'>) {
  const { category } = await searchParams;
  const active = typeof category === 'string' ? category : undefined;

  const [posts, categories] = await Promise.all([
    listPublished(undefined, active),
    listCategories(),
  ]);

  return (
    <div className="landing blog-page">
      <div className="container">
        <p className="blog-back">
          <Link href="/">← На головну</Link>
        </p>

        <div className="section-head section-head--center">
          <h2>
            Дописи <em>та</em> нотатки
          </h2>
          <p className="caption">Той самий текст виходить і в соцмережах</p>
        </div>

        {categories.length > 0 ? (
          <nav className="blog-rubrics" aria-label="Рубрики">
            <Link
              href="/blog"
              className={active ? '' : 'is-active'}
              aria-current={active ? undefined : 'page'}
            >
              Усі
            </Link>
            {categories.map((c) => (
              <Link
                key={c.name}
                href={`/blog?category=${encodeURIComponent(c.name)}`}
                className={active === c.name ? 'is-active' : ''}
                aria-current={active === c.name ? 'page' : undefined}
              >
                {c.name}
                <b>{c.count}</b>
              </Link>
            ))}
          </nav>
        ) : null}

        {posts.length === 0 ? (
          <p className="blog-empty">
            {active
              ? `У рубриці «${active}» поки порожньо.`
              : 'Дописів поки немає. Незабаром з’являться.'}
          </p>
        ) : (
          <div className="posts__grid blog-list">
            {posts.map((post) => {
              const cover = coverUrl(post);
              const meta =
                post.sourceLabel ??
                `${formatDate(post.publishedAt!)} · ${readingMinutes(post.body)} хв`;

              return (
                <Link key={post.id} href={postHref(post)} className="post">
                  <div className="post__media">
                    {cover ? <img src={cover} alt={post.coverAlt ?? ''} /> : null}
                  </div>
                  <p className="post__date">
                    {post.category ? `${post.category} · ` : ''}
                    {meta}
                  </p>
                  <h3>{post.title}</h3>
                  {post.excerpt ? <p className="blog-card__excerpt">{post.excerpt}</p> : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
