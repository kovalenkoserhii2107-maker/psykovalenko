import type { Metadata } from 'next';
import Link from 'next/link';

import '../landing.css';
import './offer.css';

/**
 * Заготовка договору публічної оферти.
 *
 * Розділи нижче — каркас: заголовки стоять, текст договору вставляється
 * на місце позначок «Текст буде додано». Поки договору немає, сторінку
 * не індексують пошуковики (robots нижче) — коли текст з'явиться, цей
 * рядок прибрати.
 */
export const metadata: Metadata = {
  title: 'Договір публічної оферти',
  robots: { index: false, follow: false },
};

const SECTIONS = [
  'Загальні положення',
  'Предмет договору',
  'Порядок надання послуг',
  'Вартість і порядок оплати',
  'Перенесення та скасування зустрічей',
  'Конфіденційність',
  'Відповідальність сторін',
  'Контакти',
];

export default function OfferPage() {
  return (
    <main className="offer">
      <div className="container container--narrow">
        <Link href="/" className="offer__back">← На головну</Link>

        <h1>Договір публічної <em>оферти</em></h1>
        <p className="offer__note">
          Документ готується. Якщо у вас є питання щодо умов — напишіть мені
          в <a href="https://t.me/Tetiana_psy_od" target="_blank" rel="noopener">Telegram</a> або
          на <a href="mailto:kovalenkotanya2205@gmail.com">пошту</a>.
        </p>

        <ol className="offer__sections">
          {SECTIONS.map((title) => (
            <li key={title}>
              <h2>{title}</h2>
              <p className="offer__placeholder">Текст буде додано.</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
