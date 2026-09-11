import Anthropic from '@anthropic-ai/sdk';

import { getTest, interpret, maxScore } from '@/lib/tests';

/**
 * Клінічне резюме за результатами тесту.
 *
 * Персональні дані до моделі не потрапляють: ім'я, пошта й телефон
 * замінюються на позначки ще до формування запиту.
 */

export type Identity = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Прибирає з тексту все, за чим можна впізнати конкретну людину. */
export function maskPersonalData(text: string, identity: Identity) {
  let masked = text;

  if (identity.email) {
    masked = masked.replaceAll(identity.email, '[пошта]');
  }
  // Телефон шукаємо за цифрами, а не за написанням: у тексті він може бути
  // з кодом країни і без, через пробіли, дужки чи дефіси.
  const phoneDigits = identity.phone?.replace(/\D/g, '') ?? '';
  const tails = new Set<string>();
  if (phoneDigits.length >= 7) {
    tails.add(phoneDigits);
    tails.add(phoneDigits.slice(-9));
    tails.add(phoneDigits.replace(/^380?/, ''));
  }

  masked = masked.replace(/\+?[\d][\d\s()\-]{5,}\d/g, (candidate) => {
    const digits = candidate.replace(/\D/g, '');
    if (digits.length < 7) return candidate;
    // або збігається зі збереженим номером, або сам має довжину телефону
    const known = [...tails].some((tail) => digits.endsWith(tail) || tail.endsWith(digits));
    return known || digits.length >= 10 ? '[телефон]' : candidate;
  });

  if (identity.name) {
    // окремо кожне слово імені: у тексті трапляється лише прізвище або лише ім'я
    const parts = identity.name.split(/\s+/).filter((p) => p.length >= 3);
    for (const part of [identity.name, ...parts]) {
      masked = masked.replace(new RegExp(escapeRegExp(part), 'gi'), '[клієнт]');
    }
  }

  // будь-яка інша пошта в тексті відповіді
  masked = masked.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[пошта]');

  return masked;
}

const SYSTEM = `Ти асистент практикуючої психологині. Пишеш українською.

За результатами скринінгового опитувальника склади коротке робоче резюме
для фахівчині — щоб вона швидко зорієнтувалась перед зустріччю.

Правила:
- не став діагнозів і не називай розладів; опитувальник для цього не призначений
- спирайся лише на наведені відповіді, нічого не додумуй
- 3–5 речень, спокійним професійним тоном, без списків
- в кінці одним реченням запропонуй, про що варто розпитати на сесії
- клієнта називай «клієнт», персональних даних у тебе немає`;

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function summarizeTestResult(input: {
  slug: string;
  score: number;
  answers: Record<string, number>;
  note?: string;
  identity: Identity;
}) {
  if (!isAiConfigured()) {
    throw new Error('Не задано ANTHROPIC_API_KEY');
  }

  const test = getTest(input.slug);
  if (!test) throw new Error('Тест не знайдено');

  const lines = test.questions.map((q) => {
    const value = input.answers[q.id];
    const option = test.options.find((o) => o.value === value);
    return `- ${q.text}: ${option?.label ?? '—'}`;
  });

  const note = input.note
    ? `\n\nВільна відповідь клієнта: «${maskPersonalData(input.note, input.identity)}»`
    : '';

  const prompt = `Опитувальник: ${test.name}
Бал: ${input.score} із ${maxScore(test)} (${interpret(test, input.score)})

Відповіді:
${lines.join('\n')}${note}`;

  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Модель відмовилася відповідати на цей запит');
  }

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}
