'use client';

import { useState } from 'react';

/**
 * Готова коротка інструкція для клієнта — щоб психологиня не збирала
 * її вручну з трьох полів і не загубила пароль, поки копіює.
 */
export function CopyAccess({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  // адресу беремо з браузера: локально це localhost, на сервері — домен
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const text = [
    'Ваш особистий кабінет:',
    `${origin}/login`,
    '',
    `Пошта: ${email}`,
    `Пароль: ${password}`,
    '',
    'Заходьте з телефона — там записи на зустрічі, домашні завдання й тести.',
    'Пароль можна нікуди не записувати: браузер запропонує зберегти його сам.',
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // буває без https або якщо браузер заборонив доступ до буфера
      setFailed(true);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={copy}
        className="rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-white transition hover:bg-plum-soft active:scale-[.99]"
      >
        {copied ? 'Скопійовано ✓' : 'Скопіювати інструкцію для клієнта'}
      </button>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">
          Показати текст
        </summary>
        <pre className="mt-2 rounded-2xl bg-white/70 p-4 text-xs whitespace-pre-wrap text-plum select-all">
          {text}
        </pre>
      </details>

      {failed ? (
        <p role="alert" className="mt-2 text-xs text-[#8c1d18]">
          Браузер не дав доступ до буфера — розгорніть «Показати текст»
          і скопіюйте вручну.
        </p>
      ) : null}
    </div>
  );
}
