'use client';

import { useActionState, useEffect, useRef } from 'react';

import { addNote, addTask, type NoteState, type TaskState } from './card-actions';

const noteInitial: NoteState = {};
const taskInitial: TaskState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-plum/40 focus:bg-white';

/** Пункт плану на наступну зустріч. Поле очищається після запису. */
export function TaskForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(addTask, taskInitial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) ref.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={ref} action={formAction} className="mt-4 flex flex-col gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex gap-2">
        <input
          name="title"
          required
          className={field}
          placeholder="Спитати, як пройшов тиждень із межами"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-plum px-5 text-sm text-white disabled:opacity-50"
        >
          {pending ? '…' : 'Додати'}
        </button>
      </div>
      {state.error ? <p className="text-xs text-[#8c1d18]">{state.error}</p> : null}
    </form>
  );
}

const kinds = [
  { value: 'SESSION', label: 'Підсумок зустрічі' },
  { value: 'NOTE', label: 'Спостереження' },
  { value: 'INSIGHT', label: 'Гіпотеза' },
] as const;

export function NoteForm({
  userId,
  sessions,
}: {
  userId: string;
  sessions: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(addNote, noteInitial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) ref.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={ref} action={formAction} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="userId" value={userId} />

      <textarea
        name="body"
        required
        rows={4}
        className={`${field} resize-y`}
        placeholder="Що прозвучало, що помітно, до чого повернутись"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select name="kind" defaultValue="SESSION" className={`${field} w-auto`}>
          {kinds.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>

        {sessions.length ? (
          <select name="sessionId" defaultValue="" className={`${field} w-auto`}>
            <option value="">Без прив&apos;язки до зустрічі</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="ml-auto rounded-full bg-plum px-6 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {pending ? 'Записую…' : 'Записати'}
        </button>
      </div>

      {state.error ? <p className="text-xs text-[#8c1d18]">{state.error}</p> : null}
    </form>
  );
}
