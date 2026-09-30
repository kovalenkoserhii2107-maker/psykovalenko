/**
 * Префікс шляху, під яким лежить сайт (див. next.config.ts).
 *
 * Next сам підставляє basePath лише для next/link, next/image та
 * роутера. Звичайний <img src="/assets/…"> і посилання в метаданих він
 * не чіпає — їх префіксуємо тут, інакше на Pages вони дають 404.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Шлях до файла з public/ з урахуванням basePath. */
export const asset = (path: string) => `${BASE_PATH}${path}`;
