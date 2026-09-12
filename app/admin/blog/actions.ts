'use server';

import { unlink } from 'node:fs/promises';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireRole } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { autoExcerpt, slugify } from '@/lib/posts';
import { fileError, saveFile, storedPath } from '@/lib/storage';

const COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

const schema = z.object({
  title: z.string().trim().min(3, 'Заголовок закороткий'),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  body: z.string().trim().min(1, 'Допис порожній'),
  coverAlt: z.string().trim().optional(),
  sourceLabel: z.string().trim().optional(),
  externalUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^https?:\/\//.test(v),
      'Посилання має починатися з http:// або https://',
    ),
});

export type PostState = {
  error?: string;
  ok?: string;
  values?: Record<string, string>;
};

function readForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    excerpt: String(formData.get('excerpt') ?? ''),
    body: String(formData.get('body') ?? ''),
    coverAlt: String(formData.get('coverAlt') ?? ''),
    sourceLabel: String(formData.get('sourceLabel') ?? ''),
    externalUrl: String(formData.get('externalUrl') ?? ''),
  };
}

/**
 * Адреса має бути унікальною. Якщо така вже зайнята — додаємо -2, -3…
 * Перейменовувати чужий допис не можна, тож рахуємо, скільки вже є.
 */
async function uniqueSlug(desired: string, exceptId?: string) {
  let candidate = desired;
  for (let n = 2; n < 100; n += 1) {
    const clash = await db.post.findUnique({ where: { slug: candidate } });
    if (!clash || clash.id === exceptId) return candidate;
    candidate = `${desired}-${n}`;
  }
  return `${desired}-${Date.now()}`;
}

async function readCover(formData: FormData) {
  const file = formData.get('cover');
  if (!(file instanceof File) || file.size === 0) return null;

  if (!COVER_TYPES.has(file.type)) return { error: 'Обкладинка має бути JPEG, PNG, WebP або HEIC' };
  const problem = fileError(file);
  if (problem) return { error: problem };

  return { name: await saveFile(file), mime: file.type };
}

/** Стару обкладинку прибираємо з диска, інакше том поступово заповнюється. */
async function dropCoverFile(name?: string | null) {
  if (!name) return;
  try {
    await unlink(storedPath(name));
  } catch {
    // файла вже немає — нічого страшного
  }
}

export async function savePost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const admin = await requireRole('ADMIN');

  const id = String(formData.get('id') ?? '');
  const intent = String(formData.get('intent') ?? 'draft');
  const raw = readForm(formData);

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Перевірте поля', values: raw };
  }
  const data = parsed.data;

  const cover = await readCover(formData);
  if (cover && 'error' in cover) return { error: cover.error, values: raw };

  const existing = id ? await db.post.findUnique({ where: { id } }) : null;
  if (id && !existing) return { error: 'Допис не знайдено', values: raw };

  const slug = await uniqueSlug(slugify(data.slug || data.title), existing?.id);
  const publish = intent === 'publish';

  const common = {
    title: data.title,
    slug,
    excerpt: data.excerpt || autoExcerpt(data.body),
    body: data.body,
    coverAlt: data.coverAlt || null,
    sourceLabel: data.sourceLabel || null,
    externalUrl: data.externalUrl || null,
    ...(cover ? { coverName: cover.name, coverMime: cover.mime } : {}),
  };

  // Автор — не обов'язкове поле, а зовнішній ключ. Ідентифікатор приходить
  // із cookie-сесії, і якщо того користувача в базі вже немає (сесія
  // пережила зміну бази), вставка падала б порушенням ключа — а на екрані
  // з'являлась біла сторінка «A server error occurred».
  const authorExists = await db.user.findUnique({
    where: { id: admin.id },
    select: { id: true },
  });

  let postId: string;

  try {
  if (existing) {
    if (cover) await dropCoverFile(existing.coverName);
    const post = await db.post.update({
      where: { id: existing.id },
      data: {
        ...common,
        status: publish ? 'PUBLISHED' : existing.status,
        // Дату ставимо лише при першій публікації: правки не мають
        // підіймати старий допис угору стрічки.
        publishedAt: publish && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
    postId = post.id;
  } else {
    const post = await db.post.create({
      data: {
        ...common,
        authorId: authorExists ? admin.id : null,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish ? new Date() : null,
      },
    });
    postId = post.id;
  }
  } catch (error) {
    // Хай краще буде зрозумілий рядок у формі, ніж порожня сторінка:
    // Тетяна принаймні побачить, що саме не збереглося.
    const message = error instanceof Error ? error.message : 'невідома помилка';
    console.error('savePost:', error);
    return { error: `Не вдалося зберегти допис: ${message}`, values: raw };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/');

  if (!existing) redirect(`/admin/blog/${postId}?saved=1`);
  return { ok: publish ? 'Опубліковано' : 'Збережено як чернетку' };
}

export async function setPostStatus(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('id') ?? '');
  const publish = String(formData.get('publish') ?? '') === '1';

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return;

  await db.post.update({
    where: { id },
    data: {
      status: publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publish ? (post.publishedAt ?? new Date()) : post.publishedAt,
    },
  });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');
}

export async function deletePost(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('id') ?? '');
  const post = await db.post.findUnique({ where: { id } });
  if (!post) redirect('/admin/blog');

  await dropCoverFile(post.coverName);
  await db.post.delete({ where: { id } });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath('/');
  redirect('/admin/blog');
}

export async function removeCover(formData: FormData) {
  await requireRole('ADMIN');

  const id = String(formData.get('id') ?? '');
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return;

  await dropCoverFile(post.coverName);
  await db.post.update({
    where: { id },
    data: { coverName: null, coverMime: null, coverAlt: null },
  });

  revalidatePath('/admin/blog');
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath('/blog');
  revalidatePath('/');
}
