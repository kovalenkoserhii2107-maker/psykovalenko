import { maskPersonalData } from '../lib/ai';

const identity = {
  name: 'Тетяна Коваленко',
  email: 'tanya@example.com',
  phone: '+38 (066) 590-61-99',
};

const cases: [string, string[]][] = [
  ['Мене звати Тетяна Коваленко, пишіть на tanya@example.com', ['Тетяна', 'Коваленко', 'tanya@']],
  ['Коваленко приходила вчора', ['Коваленко']],
  ['подзвоніть на +380665906199', ['380665906199', '0665906199']],
  ['телефон 066 590 61 99, а ще 066-590-61-99', ['590']],
  ['написала тетяна вчора', ['тетяна']],
  ['інша пошта: hello@other.org', ['hello@other.org']],
  ['мій інший номер 0501234567', ['0501234567']],
];

// дата й бали не мають перетворюватися на [телефон]
const falsePositives = ['зустріч 12.09.2026, бал 15 із 21', 'працюємо з 2022 року'];

let failed = 0;
for (const [input, mustDisappear] of cases) {
  const out = maskPersonalData(input, identity);
  const leaks = mustDisappear.filter((frag) => out.includes(frag));
  const ok = leaks.length === 0;
  if (!ok) failed += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${input}\n     → ${out}${ok ? '' : `\n     ВИТІК: ${leaks.join(', ')}`}`);
}
for (const text of falsePositives) {
  const out = maskPersonalData(text, identity);
  const ok = out === text;
  if (!ok) failed += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} без хибних спрацювань: ${text}${ok ? '' : `\n     → ${out}`}`);
}

process.exit(failed ? 1 : 0);
