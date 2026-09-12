'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui';
import { HOMEWORK_TEMPLATES } from '@/lib/homework-templates';

import { assignHomework, type HomeworkState } from '../actions';

const initial: HomeworkState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition focus:border-plum/40 focus:bg-white';

export function HomeworkForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(assignHomework, initial);
  const [draft, setDraft] = useState({ title: '', description: '' });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <p className="mb-2 text-xs text-muted">Заготовки — текст далі можна виправити</p>
        <div className="flex flex-wrap gap-2">
          {HOMEWORK_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() =>
                setDraft({ title: template.title, description: template.description })
              }
              className="rounded-full border border-[rgba(46,35,56,.2)] px-4 py-1.5 text-xs text-plum transition hover:bg-white/70"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Назва</span>
        <input
          name="title"
          required
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Що робити</span>
        <textarea
          name="description"
          required
          rows={5}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className={`${field} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          Термін <span className="font-normal">— не обов’язково</span>
        </span>
        <input type="date" name="dueDate" className={field} />
      </label>

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
          {pending ? 'Призначаю…' : 'Призначити завдання'}
        </Button>
      </div>
    </form>
  );
}
