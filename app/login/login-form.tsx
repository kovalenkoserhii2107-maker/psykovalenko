'use client';

import { useActionState } from 'react';

import { login, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium opacity-70">Пошта</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          // React 19 скидає неконтрольовані поля після дії форми,
          // тож повертаємо пошту зі стану, щоб не набирати її знову
          defaultValue={state.email ?? ''}
          key={state.email ?? ''}
          className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-base outline-none transition focus:border-black/30 focus:bg-white dark:border-white/15 dark:bg-white/5 dark:focus:border-white/40"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium opacity-70">Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-base outline-none transition focus:border-black/30 focus:bg-white dark:border-white/15 dark:bg-white/5 dark:focus:border-white/40"
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-2xl bg-black px-4 py-3.5 text-base font-medium text-white transition active:scale-[.98] disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? 'Заходимо…' : 'Увійти'}
      </button>
    </form>
  );
}
