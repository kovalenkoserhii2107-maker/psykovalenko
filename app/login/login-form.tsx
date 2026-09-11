'use client';

import { useActionState } from 'react';

import { login, type LoginState } from './actions';

const initialState: LoginState = {};

const fieldClass =
  'rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition ' +
  'focus:border-plum/40 focus:bg-white';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Пошта</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          // React 19 скидає неконтрольовані поля після дії форми,
          // тож повертаємо пошту зі стану, щоб не набирати її знову
          defaultValue={state.email ?? ''}
          key={state.email ?? ''}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-between gap-3 rounded-full bg-plum py-2 pr-2 pl-7 text-base font-medium text-white transition hover:bg-plum-soft active:scale-[.99] disabled:opacity-50"
      >
        {pending ? 'Заходимо…' : 'Увійти'}
        <span className="flex size-9 items-center justify-center rounded-full bg-mint text-plum">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 5 16 12 9 19" />
          </svg>
        </span>
      </button>
    </form>
  );
}
