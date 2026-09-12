import type { Post } from '@/lib/generated/prisma/client';

/**
 * Транслітерація для адрес дописів. Таблиця — спрощена офіційна
 * (постанова КМУ №55), без варіантів у середині слова: адреса має бути
 * передбачуваною, а не філологічно точною.
 */
const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh',
  з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n',
  о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ю: 'iu', я: 'ia', ь: '', ъ: '', ы: 'y', э: 'e',
  ё: 'e', '’': '', "'": '', '`': '',
};

export function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .split('')
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

  // Заголовок може складатися з самих емодзі чи розділових знаків —
  // порожня адреса зламала б маршрут, тож лишаємо дату.
  return slug || `dopys-${new Date().toISOString().slice(0, 10)}`;
}

/** Текст без розмітки — для короткого опису й підрахунку часу читання. */
export function plainText(body: string) {
  return body
    .split('\n')
    .map((line) => line.replace(/^\s*(##\s+|[-*]\s+|>\s+)/, ''))
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Опис збираємо лише з абзаців: підзаголовки й пункти списку без розділових
 * знаків злипалися б у суцільний рядок («Коли варто насторожитись Втома
 * минає…»).
 */
function paragraphsOnly(body: string) {
  const lines = body
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => line.trim() && !/^\s*(##\s|[-*]\s|>\s|\d+[.)]\s)/.test(line));
  return lines.join(' ');
}

export function autoExcerpt(body: string, limit = 200) {
  const paragraphs = paragraphsOnly(body);
  const text = plainText(paragraphs || body);
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : limit).trimEnd()}…`;
}

/** Приблизний час читання, 150 слів за хвилину — темп читання з екрана. */
export function readingMinutes(body: string) {
  const words = plainText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 150));
}

export const coverUrl = (post: Pick<Post, 'id' | 'coverName'>) =>
  post.coverName ? `/api/blog/cover/${post.id}` : null;

/**
 * Картка завжди веде на сторінку допису, навіть коли той уже вийшов у
 * соцмережах: спершу людина читає текст у нас, а вже звідти може перейти
 * за посиланням. Раніше картка відкривала інстаграм одразу, і власна
 * сторінка допису лишалась недосяжною.
 */
export const postHref = (post: Pick<Post, 'slug'>) => `/blog/${post.slug}`;
