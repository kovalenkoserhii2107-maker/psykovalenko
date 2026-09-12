import type { MetadataRoute } from 'next';

/**
 * Кабінет відкривають з телефона й додають на головний екран.
 * start_url веде в кабінет клієнта: неавторизованого middleware
 * сам перекине на вхід.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Тетяна Коваленко — психологиня',
    short_name: 'Коваленко',
    description:
      'Особистий кабінет: записи на зустрічі, домашні завдання й тести.',
    start_url: '/client',
    display: 'standalone',
    background_color: '#F9F0E7',
    theme_color: '#F9F0E7',
    lang: 'uk',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
