import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * Локальне сховище вкладень. На Fly.io тека має лежати на volume, інакше
 * файли зникнуть при першому ж перезапуску машини. Ключі до S3/Drive
 * підставляються пізніше — інтерфейс лишиться той самий.
 */
// Тека навмисно поза каталогом проєкту: шлях від process.cwd() змушує Next
// трасувати весь проєкт у standalone-збірку й роздуває образ.
// На Fly.io сюди монтується volume — див. UPLOAD_DIR у fly.toml.
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(os.tmpdir(), 'psykovalenko-uploads');

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
  'audio/mpeg',
  'audio/mp4',
  'audio/webm',
  'text/plain',
]);

export function fileError(file: File) {
  if (file.size === 0) return 'Файл порожній';
  if (file.size > MAX_FILE_SIZE) return 'Файл більший за 10 МБ';
  if (!ALLOWED_TYPES.has(file.type)) return 'Такий тип файлу не підтримується';
  return null;
}

/** Повертає ім'я файла на диску. Оригінальне ім'я в шлях не потрапляє. */
export async function saveFile(file: File) {
  const storedName = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, storedName), buffer);
  } catch (error) {
    // Найчастіша причина — права на томі: він монтується від root, а
    // застосунок працює під nextjs. Теку готує docker-entrypoint.sh.
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EACCES' || code === 'EPERM') {
      throw new Error(`Немає прав на запис у теку вкладень (${UPLOAD_DIR})`);
    }
    if (code === 'ENOSPC') throw new Error('На диску скінчилося місце');
    throw error;
  }

  return storedName;
}

export function storedPath(storedName: string) {
  // ім'я генеруємо самі (uuid), але шлях усе одно звіряємо: так каталог
  // не вийде залишити через ../ навіть якщо значення колись прийде ззовні
  const full = path.join(UPLOAD_DIR, path.basename(storedName));
  if (!full.startsWith(UPLOAD_DIR)) throw new Error('Невірний шлях до файла');
  return full;
}
