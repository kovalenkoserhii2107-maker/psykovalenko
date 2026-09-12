import Link from 'next/link';
import type { Metadata } from 'next';

import { listPublished } from '@/lib/blog-queries';
import { formatDate } from '@/lib/format';
import { coverUrl, postHref, readingMinutes } from '@/lib/posts';

import '../landing.css';
import './blog.css';

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Розбори, вправи та короткі нотатки про психіку — Тетяна Коваленко.',
};

export const dynamic = 'force-dynamic';

export default async function BlogIndex() {
  const posts = await listPublished();

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

        {posts.length === 0 ? (
          <p className="blog-empty">Дописів поки немає. Незабаром з’являться.</p>
        ) : (
          <div className="posts__grid blog-list">
            {posts.map((post) => {
              const cover = coverUrl(post);
              const href = postHref(post);
              const meta =
                post.sourceLabel ??
                `${formatDate(post.publishedAt!)} · ${readingMinutes(post.body)} хв`;

              const inner = (
                <>
                  <div className="post__media">
                    {cover ? <img src={cover} alt={post.coverAlt ?? ''} /> : null}
                  </div>
                  <p className="post__date">{meta}</p>
                  <h3>{post.title}</h3>
                  {post.excerpt ? <p className="blog-card__excerpt">{post.excerpt}</p> : null}
                </>
              );

              return (
                <Link key={post.id} href={href} className="post">
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
