import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { storedPath } from '@/lib/storage';

/**
 * Обкладинки дописів. На відміну від /api/files/[id], цей маршрут
 * публічний — інакше картинку не побачать ні читачі, ні прев'ю посилання
 * у месенджерах. Обкладинку чернетки віддаємо тільки психологині: поки
 * допис не опубліковано, його не має бути видно ззовні.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    select: { coverName: true, coverMime: true, status: true, updatedAt: true },
  });

  if (!post?.coverName) return new Response('Не знайдено', { status: 404 });

  if (post.status !== 'PUBLISHED') {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new Response('Не знайдено', { status: 404 });
  }

  const filePath = storedPath(post.coverName);
  try {
    const info = await stat(filePath);
    const stream = Readable.toWeb(
      createReadStream(filePath),
    ) as WebReadableStream<Uint8Array>;

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': post.coverMime ?? 'application/octet-stream',
        'Content-Length': String(info.size),
        // Ім'я файла на диску — uuid, воно не змінюється при заміні
        // обкладинки, тож кешуємо ненадовго і з перевіркою.
        'Cache-Control':
          post.status === 'PUBLISHED'
            ? 'public, max-age=300, stale-while-revalidate=86400'
            : 'private, no-store',
        ETag: `"${post.coverName}-${info.size}"`,
      },
    });
  } catch {
    return new Response('Файл недоступний', { status: 404 });
  }
}
