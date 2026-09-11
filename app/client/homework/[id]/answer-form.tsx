'use client';

import { useActionState } from 'react';

import { saveAnswer, type HomeworkState } from '../actions';

const initial: HomeworkState = {};

export function AnswerForm({
  id,
  answer,
  completed,
}: {
  id: string;
  answer: string | null;
  completed: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAnswer, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />

      <textarea
        name="answer"
        rows={7}
        defaultValue={answer ?? ''}
        placeholder="Напишіть, як пройшло, що помітили, що було складно…"
        className="w-full resize-y rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition focus:border-plum/40 focus:bg-white"
      />

      {!completed ? (
        <label className="flex items-center gap-3 px-1 text-sm text-muted">
          <input
            type="checkbox"
            name="complete"
            className="size-5 accent-[#2E2338]"
          />
          Позначити завдання виконаним
        </label>
      ) : null}

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}

      {state.saved ? (
        <p className="rounded-2xl bg-mint/60 px-4 py-3 text-sm text-plum">
          Збережено. Психологиня побачить відповідь.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-plum py-3.5 text-base font-medium text-white transition active:scale-[.99] disabled:opacity-50"
      >
        {pending ? 'Зберігаємо…' : 'Зберегти'}
      </button>
    </form>
  );
}
