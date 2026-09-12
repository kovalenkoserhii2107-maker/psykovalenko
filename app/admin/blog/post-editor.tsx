'use client';

import { useActionState, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import { RichText } from '@/lib/rich-text';
import { readingMinutes, slugify } from '@/lib/posts';

import { savePost, type PostState } from './actions';

const initial: PostState = {};

const field =
  'w-full rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-4 py-3 text-base text-ink outline-none transition focus:border-plum/40 focus:bg-white';

export type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  coverAlt: string;
  sourceLabel: string;
  externalUrl: string;
  status: 'DRAFT' | 'PUBLISHED';
};

/** Кнопки над полем тексту: вставляють розмітку, щоб її не треба було вчити. */
const TOOLS = [
  { label: 'Підзаголовок', line: '## ' },
  { label: 'Список', line: '- ' },
  { label: 'Нумерація', line: '1. ' },
  { label: 'Цитата', line: '> ' },
  { label: 'Жирний', wrap: '**' },
  { label: 'Курсив', wrap: '*' },
  { label: 'Посилання', link: true },
] as const;

export function PostEditor({ post }: { post?: EditorPost }) {
  const [state, formAction, pending] = useActionState(savePost, initial);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [body, setBody] = useState(post?.body ?? '');
  const [preview, setPreview] = useState(false);

  const shownSlug = slugTouched ? slug : slugify(title || 'новий-допис');

  function applyTool(tool: (typeof TOOLS)[number]) {
    const el = bodyRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end);
    let next: string;
    let caret: number;

    if ('wrap' in tool) {
      next = `${value.slice(0, start)}${tool.wrap}${selected || 'текст'}${tool.wrap}${value.slice(end)}`;
      caret = start + tool.wrap.length + (selected || 'текст').length + tool.wrap.length;
    } else if ('link' in tool) {
      const inserted = `[${selected || 'текст посилання'}](https://)`;
      next = value.slice(0, start) + inserted + value.slice(end);
      caret = start + inserted.length - 1;
    } else {
      // Префікс рядка ставимо на початок рядка, де стоїть курсор
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      next = `${value.slice(0, lineStart)}${tool.line}${value.slice(lineStart)}`;
      caret = start + tool.line.length;
    }

    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">Заголовок</span>
        <input
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${field} font-display text-xl`}
          placeholder="Про що допис"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          Адреса <span className="font-normal">— підставляється із заголовка</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm text-muted">/blog/</span>
          <input
            name="slug"
            value={shownSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={field}
          />
        </div>
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-muted">Текст</span>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{readingMinutes(body)} хв читання</span>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="rounded-full border border-[rgba(46,35,56,.2)] px-3 py-1 text-plum transition hover:bg-white/70"
            >
              {preview ? 'Редагувати' : 'Переглянути'}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="prose-post min-h-[18rem] rounded-2xl border border-[rgba(46,35,56,.16)] bg-white/70 px-5 py-4">
            {body.trim() ? (
              <RichText body={body} />
            ) : (
              <p className="text-muted">Порожньо — напишіть щось у вкладці «Редагувати».</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  onClick={() => applyTool(tool)}
                  className="rounded-full border border-[rgba(46,35,56,.2)] px-3.5 py-1.5 text-xs text-plum transition hover:bg-white/70"
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <textarea
              ref={bodyRef}
              name="body"
              required
              rows={18}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${field} resize-y font-mono text-sm leading-relaxed`}
              placeholder={'## Підзаголовок\n\nАбзац тексту.\n\n- пункт списку\n\n> цитата'}
            />
            <p className="text-xs text-muted">
              Порожній рядок розділяє абзаци. <b>**жирний**</b>, <i>*курсив*</i>,
              [текст](адреса).
            </p>
          </>
        )}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          Короткий опис <span className="font-normal">— не обов’язково, збереться з тексту</span>
        </span>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ''}
          className={`${field} resize-y`}
        />
      </label>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-[rgba(46,35,56,.14)] p-4">
        <legend className="px-2 text-sm font-medium text-muted">Обкладинка</legend>

        {post?.coverUrl ? (
          <img
            src={post.coverUrl}
            alt=""
            className="max-h-56 w-full rounded-xl object-cover"
          />
        ) : null}

        <input
          type="file"
          name="cover"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-plum file:px-4 file:py-2 file:text-sm file:text-white"
        />
        <input
          name="coverAlt"
          defaultValue={post?.coverAlt ?? ''}
          className={field}
          placeholder="Що на картинці — для тих, хто не бачить зображень"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-[rgba(46,35,56,.14)] p-4">
        <legend className="px-2 text-sm font-medium text-muted">
          Якщо допис уже вийшов у соцмережах
        </legend>
        <input
          name="externalUrl"
          type="url"
          defaultValue={post?.externalUrl ?? ''}
          className={field}
          placeholder="https://www.instagram.com/reel/…"
        />
        <input
          name="sourceLabel"
          defaultValue={post?.sourceLabel ?? ''}
          className={field}
          placeholder="Підпис замість дати — «Instagram · Reels»"
        />
        <p className="text-xs text-muted">
          З посиланням картка на сайті веде одразу в соцмережу.
        </p>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-[#b3261e]/10 px-4 py-3 text-sm text-[#8c1d18]">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-2xl bg-mint/60 px-4 py-3 text-sm text-plum">{state.ok}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="rounded-full border border-[rgba(46,35,56,.2)] px-6 py-2.5 text-sm text-plum transition hover:bg-white/70 disabled:opacity-50"
        >
          {pending ? 'Зберігаю…' : 'Зберегти чернетку'}
        </button>
        <Button type="submit" name="intent" value="publish" disabled={pending}>
          {post?.status === 'PUBLISHED' ? 'Зберегти й оновити' : 'Опублікувати'}
        </Button>
      </div>
    </form>
  );
}
