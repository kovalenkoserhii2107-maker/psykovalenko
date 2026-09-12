'use client';

import { useActionState, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';

import { createInvite, type InviteState } from './actions';

const initial: InviteState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition focus:border-plum/40 focus:bg-white';

export function InviteForm({
  tests,
  clients,
}: {
  tests: { slug: string; name: string }[];
  clients: { id: string; name: string; email: string }[];
}) {
  const [state, formAction, pending] = useActionState(createInvite, initial);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const link = state.created ? `${origin}/t/${state.created.token}` : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">Анкета</span>
          <select name="testSlug" required defaultValue={tests[0]?.slug} className={field}>
            {tests.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">
            Кому <span className="font-normal">— свій клієнт або сторонній</span>
          </span>
          <select name="userId" defaultValue="" className={field}>
            <option value="">Стороння людина</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">
            Підпис <span className="font-normal">— щоб упізнати в списку, людина його не бачить</span>
          </span>
          <input name="label" className={field} placeholder="Марина з інстаграму" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">
            Діє днів <span className="font-normal">— порожньо, якщо безстроково</span>
          </span>
          <input name="days" type="number" min={1} max={365} className={field} placeholder="14" />
        </label>

        {state.error ? (
          <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
            {state.error}
          </p>
        ) : null}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? 'Створюю…' : 'Створити посилання'}
          </Button>
        </div>
      </form>

      {state.created ? (
        <div className="rounded-2xl bg-mint/50 p-5">
          <p className="text-sm text-plum">
            Посилання на «{state.created.testName}» готове
            {state.created.label ? ` — ${state.created.label}` : ''}.
          </p>
          <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 font-mono text-xs break-all text-plum">
            {link}
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-3 rounded-full bg-plum px-5 py-2 text-sm text-white"
          >
            {copied ? 'Скопійовано' : 'Скопіювати посилання'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
