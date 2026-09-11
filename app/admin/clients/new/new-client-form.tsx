'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Button } from '@/components/ui';
import { createClient, type CreateClientState } from '../actions';

const initialState: CreateClientState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition focus:border-plum/40 focus:bg-white';

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClient, initialState);

  if (state.created) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="font-display text-2xl text-plum">Доступ створено</h2>
          <p className="mt-1 text-sm text-muted">
            Передайте ці дані клієнту. Пароль показується один раз — у базі
            зберігається лише його хеш.
          </p>
        </div>

        <dl className="rounded-2xl bg-cream-warm p-5 text-sm">
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted">Клієнт</dt>
            <dd className="text-plum">{state.created.name}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted">Пошта</dt>
            <dd className="text-plum">{state.created.email}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-muted">Пароль</dt>
            <dd className="font-mono text-plum select-all">{state.created.password}</dd>
          </div>
        </dl>

        {state.created.driveNote ? (
          <p className="rounded-2xl bg-cream-warm px-4 py-3 text-sm text-muted">
            {state.created.driveNote}
          </p>
        ) : null}

        <div className="flex gap-4">
          <Link
            href="/admin/clients"
            className="rounded-full bg-plum px-6 py-3 text-sm font-medium text-white transition hover:bg-plum-soft"
          >
            До списку клієнтів
          </Link>
          <Link
            href="/admin/clients/new"
            className="rounded-full px-6 py-3 text-sm text-muted underline underline-offset-4 transition hover:text-plum"
          >
            Додати ще одного
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Ім’я та прізвище</span>
        <input name="name" required defaultValue={state.values?.name} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Пошта</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={state.values?.email}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Телефон</span>
        <input name="phone" defaultValue={state.values?.phone} className={field} />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Запит</span>
        <input
          name="diagnosis"
          placeholder="Тривога, вигорання…"
          defaultValue={state.values?.diagnosis}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          Нотатки <span className="font-normal">— клієнт їх не бачить</span>
        </span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={state.values?.notes}
          className={`${field} resize-y`}
        />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}

      <div className="mt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Створюємо…' : 'Створити доступ'}
        </Button>
      </div>
    </form>
  );
}
