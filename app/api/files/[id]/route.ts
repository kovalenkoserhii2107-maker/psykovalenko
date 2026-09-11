import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { storedPath } from '@/lib/storage';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return new Response('Потрібен вхід', { status: 401 });

  const { id } = await params;
  const attachment = await db.attachment.findUnique({
    where: { id },
    include: { homework: { select: { userId: true } } },
  });

  // Психологиня бачить усі вкладення, клієнт — лише свої. Не 403, а 404:
  // інакше чужий ідентифікатор підтверджує, що такий файл існує.
  const allowed =
    attachment &&
    (session.user.role === 'ADMIN' || attachment.homework.userId === session.user.id);
  if (!allowed) return new Response('Не знайдено', { status: 404 });

  const filePath = storedPath(attachment.url);
  try {
    const info = await stat(filePath);
    const stream = Readable.toWeb(
      createReadStream(filePath),
    ) as WebReadableStream<Uint8Array>;

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Length': String(info.size),
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return new Response('Файл недоступний', { status: 404 });
  }
}
