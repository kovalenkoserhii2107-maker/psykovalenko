import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/60 shadow-[0_18px_50px_-38px_rgba(46,35,56,.5)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-plum">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const buttonBase =
  'inline-flex items-center gap-3 rounded-full text-sm font-medium transition active:scale-[.99] disabled:opacity-50';

export function Button({
  className = '',
  children,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className={`${buttonBase} bg-plum py-2 pr-2 pl-6 text-white hover:bg-plum-soft ${className}`}
    >
      {children}
      <Arrow />
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} bg-plum py-2 pr-2 pl-6 text-white hover:bg-plum-soft ${className}`}
    >
      {children}
      <Arrow />
    </Link>
  );
}

function Arrow() {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-mint text-plum">
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 5 16 12 9 19" />
      </svg>
    </span>
  );
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'mint' | 'warm';
  children: ReactNode;
}) {
  const tones = {
    neutral: 'bg-[rgba(46,35,56,.07)] text-plum',
    mint: 'bg-mint text-plum',
    warm: 'bg-cream-warm text-plum',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-[rgba(46,35,56,.2)] px-5 py-8 text-center text-sm text-muted">
      {children}
    </p>
  );
}
