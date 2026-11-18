import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Metadata } from 'next';
import Link from 'next/link';

import { asset } from '@/lib/base-path';

import '../landing.css';
import './offer.css';

export const metadata: Metadata = {
  title: 'Публічний договір (оферта)',
  description:
    'Публічний договір про надання психологічних та інформаційних послуг ФОП Коваленко Тетяни Василівни.',
};

/**
 * Текст договору — content/oferta.html, згенерований з content/oferta.docx
 * скриптом scripts/oferta-html.py. Файл читається на збірці: сайт
 * статичний, тож у готову сторінку договір потрапляє вже вписаним.
 * Це наш власний документ, а не дані відвідувачів, тому вставляємо HTML
 * як є.
 */
const doc = readFileSync(join(process.cwd(), 'content', 'oferta.html'), 'utf8')
  .replace(/^<!--.*?-->\n/, '');

/** Зміст — з тих самих заголовків, тож не розходиться з текстом. */
const toc = [...doc.matchAll(/<h2 id="([^"]+)"[^>]*>(.*?)<\/h2>/g)].map(([, id, inner]) => ({
  id,
  num: /<span class="offer-num">(.*?)<\/span>/.exec(inner)?.[1] ?? '',
  title: inner.replace(/<span class="offer-num">.*?<\/span>\s*/, '').replace(/<[^>]+>/g, ''),
}));

const PDF = asset('/oferta.pdf');
const PDF_NAME = 'Договір-оферта-Коваленко-Т-В.pdf';

export default function OfferPage() {
  return (
    <main className="offer" id="top">
      <div className="container container--narrow">
        <div className="offer__top">
          <Link href="/" className="offer__back">← На головну</Link>
          <a href={PDF} download={PDF_NAME} className="btn btn--ghost offer__pdf">Завантажити PDF</a>
        </div>

        <header className="offer__head">
          <p className="rule-label rule-label--left"><b>Документ</b></p>
          <h1>Публічний договір <em>(оферта)</em></h1>
          <p className="offer__sub">про надання психологічних та інформаційних послуг</p>
        </header>

        <nav className="offer__toc" aria-label="Зміст договору">
          <p className="offer__toc-title">Зміст</p>
          <ol>
            {toc.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  {s.num ? <span>{s.num}</span> : null}
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="offer__doc" dangerouslySetInnerHTML={{ __html: doc }} />

        <div className="offer__bottom">
          <a href={PDF} download={PDF_NAME} className="btn">Завантажити PDF</a>
          <a href="#top" className="offer__back">↑ На початок</a>
        </div>
      </div>
    </main>
  );
}
