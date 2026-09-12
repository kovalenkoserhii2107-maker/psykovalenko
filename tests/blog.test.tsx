import { renderToStaticMarkup } from 'react-dom/server';

import { autoExcerpt, plainText, readingMinutes, slugify } from '../lib/posts';
import { RichText, parseBlocks } from '../lib/rich-text';

let failed = 0;
const check = (ok: boolean, label: string, detail = '') => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}${ok || !detail ? '' : `\n     ${detail}`}`);
};
const eq = (actual: unknown, expected: unknown, label: string) =>
  check(actual === expected, label, `очікувалось: ${expected}\n     отримано:   ${actual}`);

// ---------------------------------------------------------------- адреси

eq(slugify('Чому щоденник допомагає впоратися з тривогою'),
   'chomu-shchodennyk-dopomahaie-vporatysia-z-tryvohoiu', 'адреса з українського заголовка');
eq(slugify("П'ять способів говорити з партнером"),
   'piat-sposobiv-hovoryty-z-partnerom', 'апостроф не лишає дефіса');
eq(slugify('Втома  чи   вигорання: як відрізнити?'),
   'vtoma-chy-vyhorannia-iak-vidriznyty', 'пробіли й розділові стискаються');
check(slugify('!!! ???').startsWith('dopys-'), 'заголовок без літер не дає порожньої адреси');
check(!slugify('a'.repeat(200)).endsWith('-'), 'обрізана адреса не закінчується дефісом');

// ---------------------------------------------------------------- розбір

const body = [
  '## Підзаголовок',
  '',
  'Звичайний абзац із **жирним** і *курсивом*.',
  'Другий рядок того самого абзацу.',
  '',
  '- перший пункт',
  '- другий пункт',
  '',
  '1. крок один',
  '2. крок два',
  '',
  '> Коротка цитата.',
].join('\n');

const kinds = parseBlocks(body).map((b) => b.kind);
eq(kinds.join(','), 'heading,paragraph,bullets,numbers,quote', 'типи блоків по порядку');
eq(parseBlocks(body)[2].lines.length, 2, 'сусідні пункти збираються в один список');
eq(parseBlocks(body)[1].lines.length, 2, 'перенос рядка не розриває абзац');
eq(parseBlocks('').length, 0, 'порожнє тіло дає нуль блоків');
eq(parseBlocks('рядок\r\nдругий').length, 1, 'переноси з Windows не ламають розбір');

// ---------------------------------------------------------------- вивід

const html = renderToStaticMarkup(<RichText body={body} />);
check(html.includes('<strong>жирним</strong>'), 'жирний текст');
check(html.includes('<em>курсивом</em>'), 'курсив');
check(html.includes('<ul>') && html.includes('<ol>'), 'обидва типи списків');
check(html.includes('<blockquote>'), 'цитата');

// ---------------------------------------------------- безпека посилань

const good = renderToStaticMarkup(<RichText body={'[сайт](https://example.com)'} />);
check(good.includes('href="https://example.com"'), 'звичайне посилання лишається');
check(good.includes('rel="noopener noreferrer"'), 'зовнішнє посилання з rel');

for (const bad of [
  '[клік](javascript:alert(1))',
  '[клік](data:text/html,<script>alert(1)</script>)',
  '[клік](vbscript:msgbox)',
]) {
  const out = renderToStaticMarkup(<RichText body={bad} />);
  check(!out.includes('href'), `небезпечна схема не стає посиланням: ${bad.slice(0, 28)}…`);
  check(out.includes('клік'), '   текст такого посилання лишається видимим');
}

const injection = renderToStaticMarkup(
  <RichText body={'<script>alert(1)</script> та <img src=x onerror=alert(1)>'} />,
);
// React екранує текст, тож «onerror=» лишається у виводі звичайними
// літерами — важливо, що жодна кутова дужка з тіла допису не стала тегом.
check(!injection.includes('<script'), 'сирий <script> не стає тегом');
check(!injection.includes('<img'), 'сирий <img> не стає тегом');
check(injection.includes('&lt;img src=x onerror=alert(1)&gt;'), 'розмітка видно як текст');

// ---------------------------------------------------------------- опис

eq(plainText('## Заголовок\n- пункт\n**жирний**'), 'Заголовок пункт жирний', 'текст без розмітки');
check(autoExcerpt('слово '.repeat(80)).endsWith('…'), 'довгий опис обрізається трикрапкою');
eq(autoExcerpt('Короткий текст.'), 'Короткий текст.', 'короткий текст лишається цілим');
eq(autoExcerpt('## Заголовок\n\nПерший абзац.\n\n- пункт'), 'Перший абзац.',
   'опис береться з абзаців, а не з заголовків і списків');
eq(autoExcerpt('## Лише заголовок'), 'Лише заголовок',
   'якщо абзаців немає — беремо що є, а не порожній рядок');
check(autoExcerpt('слово '.repeat(80)).length <= 201, 'опис не довший за межу');
eq(readingMinutes('слово '.repeat(300)), 2, 'час читання рахується');
eq(readingMinutes('одне слово'), 1, 'мінімум одна хвилина');

process.exit(failed ? 1 : 0);
