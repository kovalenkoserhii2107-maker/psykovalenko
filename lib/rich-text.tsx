import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Спрощена розмітка дописів.
 *
 * Навмисно не Markdown-бібліотека і не HTML: текст перетворюється одразу
 * на React-вузли, тож у сторінку не потрапляє ні рядка чужого HTML і
 * dangerouslySetInnerHTML не потрібен узагалі.
 *
 *   ## Підзаголовок
 *   - пункт списку
 *   1. пункт нумерованого списку
 *   > цитата
 *   **жирний**, *курсив*, [текст](https://адреса)
 *
 * Порожній рядок розділяє абзаци.
 */

const HEADING = /^##\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBER = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s*(.*)$/;

// Лише ці схеми: інакше [клік](javascript:…) у тілі допису став би робочим
// посиланням. Відносні адреси (/blog/…) теж дозволені.
function safeHref(href: string) {
  const value = href.trim();
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((chunk, i) => {
    const key = `${keyPrefix}-${i}`;

    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
      return <strong key={key}>{chunk.slice(2, -2)}</strong>;
    }
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      return <em key={key}>{chunk.slice(1, -1)}</em>;
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(chunk);
    if (link) {
      const href = safeHref(link[2]);
      // Недозволену схему показуємо як звичайний текст, а не ковтаємо:
      // авторка побачить, що посилання не спрацювало, і виправить.
      if (!href) return <span key={key}>{link[1]}</span>;
      const external = /^https?:/.test(href);
      return external ? (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      ) : (
        <Link key={key} href={href}>
          {link[1]}
        </Link>
      );
    }

    return <span key={key}>{chunk}</span>;
  });
}

type Block =
  | { kind: 'heading'; lines: string[] }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'bullets'; lines: string[] }
  | { kind: 'numbers'; lines: string[] }
  | { kind: 'paragraph'; lines: string[] };

export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;

  // Приймає блок аргументом, а не читає current із замикання: інакше
  // TypeScript не бачить присвоєнь усередині функції й звужує тип до null.
  const flush = (block: Block | null) => {
    if (block && block.lines.length) blocks.push(block);
  };

  // \r\n приходить із Windows-редакторів і зі вставки з Word
  for (const raw of body.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flush(current);
      current = null;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush(current);
      current = null;
      blocks.push({ kind: 'heading', lines: [heading[1]] });
      continue;
    }

    const matchers = [
      ['bullets', BULLET],
      ['numbers', NUMBER],
      ['quote', QUOTE],
    ] as const;

    const hit = matchers.find(([, re]) => re.test(line));
    if (hit) {
      const [kind, re] = hit;
      const text = re.exec(line)![1];
      if (current && current.kind === kind) current.lines.push(text);
      else {
        flush(current);
        current = { kind, lines: [text] };
      }
      continue;
    }

    // Перенос усередині абзацу лишаємо переносом рядка, а не новим абзацом
    if (current && current.kind === 'paragraph') current.lines.push(line);
    else {
      flush(current);
      current = { kind: 'paragraph', lines: [line] };
    }
  }
  flush(current);

  return blocks;
}

export function RichText({ body }: { body: string }) {
  return (
    <>
      {parseBlocks(body).map((block, i) => {
        const key = `b${i}`;

        if (block.kind === 'heading') {
          return <h2 key={key}>{inline(block.lines[0], key)}</h2>;
        }
        if (block.kind === 'quote') {
          return (
            <blockquote key={key}>
              <p>{inline(block.lines.join(' '), key)}</p>
            </blockquote>
          );
        }
        if (block.kind === 'bullets' || block.kind === 'numbers') {
          const items = block.lines.map((line, j) => (
            <li key={`${key}-${j}`}>{inline(line, `${key}-${j}`)}</li>
          ));
          return block.kind === 'bullets' ? (
            <ul key={key}>{items}</ul>
          ) : (
            <ol key={key}>{items}</ol>
          );
        }

        return (
          <p key={key}>
            {block.lines.map((line, j) => (
              <span key={`${key}-${j}`}>
                {j > 0 ? <br /> : null}
                {inline(line, `${key}-${j}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
