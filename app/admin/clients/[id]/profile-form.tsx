'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui';

import { saveProfile, type ProfileState } from './card-actions';

const initial: ProfileState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-plum/40 focus:bg-white';

export type ProfileValues = {
  userId: string;
  phone: string;
  birthDate: string;
  diagnosis: string;
  goals: string;
  context: string;
  risks: string;
  notes: string;
  format: string;
  referral: string;
  status: 'ACTIVE' | 'PAUSED' | 'FINISHED';
  tags: string;
};

const statuses = [
  { value: 'ACTIVE', label: 'У роботі' },
  { value: 'PAUSED', label: 'Пауза' },
  { value: 'FINISHED', label: 'Завершено' },
] as const;

export function ProfileForm({ values }: { values: ProfileValues }) {
  const [state, formAction, pending] = useActionState(saveProfile, initial);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 w-full rounded-full border border-[rgba(46,35,56,.2)] px-5 py-2 text-sm text-plum transition hover:bg-white/70"
      >
        Редагувати картку
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-3 border-t border-[rgba(46,35,56,.12)] pt-5">
      <input type="hidden" name="userId" value={values.userId} />

      <Row label="Статус">
        <select name="status" defaultValue={values.status} className={field}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Телефон">
        <input name="phone" defaultValue={values.phone} className={field} />
      </Row>

      <Row label="Дата народження">
        <input type="date" name="birthDate" defaultValue={values.birthDate} className={field} />
      </Row>

      <Row label="Формат">
        <input
          name="format"
          defaultValue={values.format}
          className={field}
          placeholder="онлайн / очно"
        />
      </Row>

      <Row label="Звідки прийшов">
        <input
          name="referral"
          defaultValue={values.referral}
          className={field}
          placeholder="рекомендація, інстаграм…"
        />
      </Row>

      <Row label="Мітки" hint="через кому">
        <input
          name="tags"
          defaultValue={values.tags}
          className={field}
          placeholder="пара, тривога, онлайн"
        />
      </Row>

      <Row label="Запит">
        <textarea name="diagnosis" rows={2} defaultValue={values.diagnosis} className={`${field} resize-y`} />
      </Row>

      <Row label="Цілі роботи">
        <textarea name="goals" rows={3} defaultValue={values.goals} className={`${field} resize-y`} />
      </Row>

      <Row label="Контекст" hint="робота, сім'я, здоров'я">
        <textarea name="context" rows={3} defaultValue={values.context} className={`${field} resize-y`} />
      </Row>

      <Row label="Важливо памʼятати" hint="ліки, ризики, протипоказання">
        <textarea name="risks" rows={2} defaultValue={values.risks} className={`${field} resize-y`} />
      </Row>

      <Row label="Загальні нотатки">
        <textarea name="notes" rows={3} defaultValue={values.notes} className={`${field} resize-y`} />
      </Row>

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-2.5 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-2xl bg-mint/60 px-4 py-2.5 text-sm text-plum">{state.ok}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Зберігаю…' : 'Зберегти'}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-muted underline underline-offset-4 hover:text-plum"
        >
          Згорнути
        </button>
      </div>
    </form>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">
        {label}
        {hint ? <span className="opacity-70"> — {hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
