'use client';

import { useActionState } from 'react';

import { uploadAttachment, type UploadState } from '../actions';

const initial: UploadState = {};

export function UploadForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(uploadAttachment, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />

      <input
        type="file"
        name="file"
        required
        accept="image/*,application/pdf,audio/*,text/plain"
        className="w-full rounded-2xl border border-dashed border-[rgba(46,35,56,.25)] bg-white/50 px-4 py-3 text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-plum file:px-4 file:py-2 file:text-sm file:text-white"
      />

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
      {state.uploaded ? (
        <p className="rounded-2xl bg-mint/60 px-4 py-3 text-sm text-plum">
          Додано: {state.uploaded}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-[rgba(46,35,56,.2)] py-3 text-sm font-medium text-plum transition active:scale-[.99] disabled:opacity-50"
      >
        {pending ? 'Завантажуємо…' : 'Додати файл'}
      </button>
    </form>
  );
}
