import type { NextConfig } from "next";

/**
 * Сайт живе на GitHub Pages: адреса виду
 * kovalenkoserhii2107-maker.github.io/psykovalenko, тобто ім'я
 * репозиторію стоїть префіксом у кожному шляху. Тому basePath —
 * і саме звідси його бере lib/base-path.ts для знімків.
 *
 * Змінна порожня локально (npm run dev відкривається на /) і задається
 * у workflow збірки. З'явиться власний домен — досить прибрати її звідти
 * й покласти файл CNAME: код чіпати не доведеться.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Pages роздає готові файли, сервера Node тут немає
  output: "export",
  basePath,
  // кожна сторінка лягає власною текою з index.html — так Pages віддає
  // її і з косою рискою в кінці, і без неї
  trailingSlash: true,
};

export default nextConfig;
