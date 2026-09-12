'use client';

import { useActionState } from 'react';

import { resetClientPassword, type ResetPasswordState } from '../actions';

const initial: ResetPasswordState = {};

export function ResetPassword({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetClientPassword, initial);

  if (state.password) {
    return (
      <div className="mt-5 rounded-2xl bg-cream-warm p-5">
        <p className="text-xs text-muted">Новий пароль — показується один раз</p>
        <p className="mt-2 font-mono text-lg text-plum select-all">{state.password}</p>
        <p className="mt-2 text-xs text-muted">
          Передайте клієнту. Попередній пароль більше не діє.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-5 border-t border-[rgba(46,35,56,.12)] pt-5">
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-2 text-xs text-plum transition hover:bg-white/70 disabled:opacity-40"
      >
        {pending ? 'Створюю пароль…' : 'Видати новий пароль'}
      </button>
      <p className="mt-2 text-xs text-muted">
        Знадобиться, якщо клієнт загубив свій: підглянути старий неможливо.
      </p>
      {state.error ? (
        <p role="alert" className="mt-2 text-xs text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
