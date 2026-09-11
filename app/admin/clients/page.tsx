import Link from 'next/link';
import type { Metadata } from 'next';

import { Badge, ButtonLink, Card, EmptyState, PageTitle } from '@/components/ui';
import { listClients } from '@/lib/clients';
import { formatDate, formatDateTime, initials } from '@/lib/format';

export const metadata: Metadata = { title: 'Клієнти' };

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <>
      <PageTitle
        title="Клієнти"
        subtitle={`${clients.length} у базі`}
        action={<ButtonLink href="/admin/clients/new">Додати клієнта</ButtonLink>}
      />

      {clients.length === 0 ? (
        <EmptyState>
          Поки нікого немає. Натисніть «Додати клієнта» — доступ до кабінету
          створиться разом із картками.
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(46,35,56,.1)] text-xs tracking-wide text-muted uppercase">
                <th className="px-6 py-4 font-medium">Клієнт</th>
                <th className="px-6 py-4 font-medium">Запит</th>
                <th className="px-6 py-4 font-medium">Наступна зустріч</th>
                <th className="px-6 py-4 font-medium">Завдання</th>
                <th className="px-6 py-4 font-medium">У базі з</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-[rgba(46,35,56,.07)] transition last:border-0 hover:bg-white/60"
                >
                  <td className="px-6 py-4">
                    <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-mint font-display text-plum">
                        {initials(client.name, client.email)}
                      </span>
                      <span>
                        <span className="block font-medium text-plum">
                          {client.name ?? 'Без імені'}
                        </span>
                        <span className="block text-xs text-muted">{client.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {client.profile?.diagnosis ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {client.nextSession ? formatDateTime(client.nextSession) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {client._count.homework > 0 ? (
                      <Badge tone="warm">{client._count.homework} активних</Badge>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted">{formatDate(client.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
