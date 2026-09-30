import type { MetadataRoute } from 'next';

import { asset } from '@/lib/base-path';

/**
 * Сайт додають на головний екран телефона.
 * Шляхи проганяємо через asset(): на Pages усе лежить під префіксом
 * з іменем репозиторію, а манифест Next сам не префіксує.
 */
/**
 * Манифест читає змінну оточення, тож Next при output: 'export' вимагає
 * сказати прямо, що результат сталий і рахується один раз на збірці.
 */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Тетяна Коваленко — психологиня',
    short_name: 'Коваленко',
    description:
      'Психологиня Тетяна Коваленко: тривога, вигорання, стосунки, самооцінка. Онлайн та очно.',
    start_url: asset('/'),
    display: 'standalone',
    background_color: '#F9F0E7',
    theme_color: '#F9F0E7',
    lang: 'uk',
    icons: [
      { src: asset('/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: asset('/icon-512.png'), sizes: '512x512', type: 'image/png' },
      { src: asset('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
