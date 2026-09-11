'use client';

import { useActionState } from 'react';

import { buildSummary, type SummaryState } from '../actions';

const initial: SummaryState = {};

export function SummaryButton({
  resultId,
  disabled,
}: {
  resultId: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(buildSummary, initial);

  if (state.summary) {
    return <p className="mt-2 text-sm text-muted">{state.summary}</p>;
  }

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="resultId" value={resultId} />
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-1.5 text-xs text-plum transition hover:bg-white/70 disabled:opacity-40"
        title={disabled ? 'Не задано ANTHROPIC_API_KEY' : undefined}
      >
        {pending ? 'Складаю резюме…' : 'Скласти резюме'}
      </button>
      {state.error ? (
        <p role="alert" className="mt-2 text-xs text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
