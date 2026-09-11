const dateTime = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const dateOnly = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatDateTime = (d: Date) => dateTime.format(d);
export const formatDate = (d: Date) => dateOnly.format(d);

export function initials(name?: string | null, email?: string) {
  const source = name?.trim() || email || '?';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
