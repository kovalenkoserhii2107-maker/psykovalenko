import { getTest, interpret, scaleScores, type TestDefinition } from '@/lib/tests';

/**
 * Те, що бачить той, хто заповнює анкету, і що лягає в базу.
 * Описи шкал і підказки фахівчині сюди навмисно не входять: цей об'єкт
 * їде в браузер відповідача.
 */
export type ProfileEntry = {
  id: string;
  short: string;
  name: string;
  value: number;
  max: number;
};

export type ScoredAnswers = {
  test: TestDefinition;
  score: number | null;
  profile: ProfileEntry[];
  verdict: string | null;
};

/** Розбирає й перевіряє відповіді. Помилку повертаємо рядком, а не кидаємо. */
export function scoreSubmission(
  slug: string,
  rawAnswers: string,
): { error: string } | ScoredAnswers {
  const test = getTest(slug);
  if (!test) return { error: 'Анкету не знайдено' };

  let answers: Record<string, number>;
  try {
    answers = JSON.parse(rawAnswers || '{}');
  } catch {
    return { error: 'Не вдалося прочитати відповіді' };
  }

  const allowed = new Set(test.options.map((o) => o.value));
  const missing = test.questions.filter((q) => !allowed.has(answers[q.id]));
  if (missing.length > 0) {
    return { error: `Без відповіді лишилось запитань: ${missing.length}` };
  }

  const profile: ProfileEntry[] = scaleScores(test, answers).map((entry) => ({
    id: entry.id,
    short: entry.short,
    name: entry.name,
    value: entry.value,
    max: entry.max,
  }));

  // Профільна анкета не зводиться до одного балу: зберігаємо розклад за
  // шкалами, а score лишаємо порожнім, щоб не вдавати загальну оцінку.
  const score = test.scales
    ? null
    : test.questions.reduce((sum, q) => sum + answers[q.id], 0);

  return {
    test,
    score,
    profile,
    verdict: score === null ? null : interpret(test, score),
    answers,
  } as ScoredAnswers & { answers: Record<string, number> };
}

/**
 * Стан форми, однаковий для кабінету клієнта і для публічного посилання,
 * щоб майстер анкети працював з обома. Числа й тлумачення у відповідь не
 * входять: розбір — на сесії.
 */
export type TestSubmitState = {
  error?: string;
  done?: boolean;
  /** Назва найпомітнішої шкали — єдине, що показуємо одразу */
  headline?: string;
};
