import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // збірка для Docker: next/standalone тягне лише потрібні модулі
  output: "standalone",

  experimental: {
    serverActions: {
      // Обкладинка допису їде тим самим запитом, що й форма, а типова межа
      // тіла серверної дії — 1 МБ. Будь-яке фото з телефона більше, і Next
      // відкидав запит із 413 ще до нашого коду: на екрані була порожня
      // сторінка, у логах «Body exceeded 1 MB limit».
      // Тримаємо із запасом над MAX_FILE_SIZE (10 МБ) у lib/storage.ts —
      // multipart додає до тіла свої заголовки й межі.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
