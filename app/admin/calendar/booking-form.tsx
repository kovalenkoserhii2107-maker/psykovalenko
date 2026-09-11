'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui';

import { bookSession, type BookingState } from './actions';

const initial: BookingState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition focus:border-plum/40 focus:bg-white';

export function BookingForm({
  clients,
}: {
  clients: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(bookSession, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Клієнт</span>
        <select
          name="userId"
          required
          className={field}
          defaultValue={state.values?.userId ?? ''}
          key={state.values?.userId ?? 'empty'}
        >
          <option value="" disabled>
            Оберіть зі списку
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">Дата й час</span>
          <input
            type="datetime-local"
            name="datetime"
            required
            className={field}
            defaultValue={state.values?.datetime ?? ''}
            key={state.values?.datetime ?? 'empty'}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted">Тривалість</span>
          <select name="duration" defaultValue={state.values?.duration ?? '50'} className={field}>
            <option value="50">50 хвилин</option>
            <option value="80">80 хвилин — пара</option>
            <option value="30">30 хвилин</option>
          </select>
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-2xl bg-mint/60 px-4 py-3 text-sm text-plum">{state.ok}</p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Записуємо…' : 'Записати зустріч'}
        </Button>
      </div>
    </form>
  );
}
