import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { findPublished, listPublished } from '@/lib/blog-queries';
import { formatDate } from '@/lib/format';
import { autoExcerpt, coverUrl, postHref, readingMinutes } from '@/lib/posts';
import { RichText } from '@/lib/rich-text';

import '../../landing.css';
import '../blog.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublished(slug);
  if (!post) return { title: 'Допис не знайдено' };

  const description = post.excerpt ?? autoExcerpt(post.body);
  const cover = coverUrl(post);

  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      ...(cover ? { images: [{ url: cover, alt: post.coverAlt ?? post.title }] } : {}),
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const post = await findPublished(slug);
  if (!post) notFound();

  const cover = coverUrl(post);
  const others = (await listPublished(4)).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="landing blog-page">
      <article className="container blog-article">
        <p className="blog-back">
          <Link href="/blog">← Усі дописи</Link>
        </p>

        <p className="post__date blog-article__meta">
          {post.sourceLabel ??
            `${formatDate(post.publishedAt!)} · ${readingMinutes(post.body)} хв читання`}
        </p>
        <h1>{post.title}</h1>

        {cover ? (
          <div className="blog-article__cover">
            <img src={cover} alt={post.coverAlt ?? ''} />
          </div>
        ) : null}

        <div className="prose-post">
          <RichText body={post.body} />
        </div>

        {post.externalUrl ? (
          <p className="blog-article__source">
            <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">
              Цей допис у соцмережах →
            </a>
          </p>
        ) : null}

        <div className="blog-article__cta">
          <p className="lead">Відгукнулося? Можемо поговорити про це на сесії.</p>
          <Link href="/#contact" className="btn">
            Записатись
          </Link>
        </div>
      </article>

      {others.length ? (
        <div className="container">
          <div className="section-head section-head--center">
            <h2>Ще почитати</h2>
          </div>
          <div className="posts__grid blog-list">
            {others.map((other) => {
              const otherCover = coverUrl(other);
              return (
                <Link key={other.id} href={postHref(other)} className="post">
                  <div className="post__media">
                    {otherCover ? <img src={otherCover} alt={other.coverAlt ?? ''} /> : null}
                  </div>
                  <p className="post__date">
                    {other.sourceLabel ?? formatDate(other.publishedAt!)}
                  </p>
                  <h3>{other.title}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
