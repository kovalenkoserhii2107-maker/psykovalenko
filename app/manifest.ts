import type { MetadataRoute } from 'next';

/** Сайт додають на головний екран телефона, тож відкривається з головної. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Тетяна Коваленко — психологиня',
    short_name: 'Коваленко',
    description:
      'Психологиня Тетяна Коваленко: тривога, вигорання, стосунки, самооцінка. Онлайн та очно.',
    start_url: '/',
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
