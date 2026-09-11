import type { Metadata } from 'next';

import { Card, PageTitle } from '@/components/ui';

import { NewClientForm } from './new-client-form';

export const metadata: Metadata = { title: 'Новий клієнт' };

export default function NewClientPage() {
  return (
    <>
      <PageTitle
        title="Новий клієнт"
        subtitle="Разом із карткою створюється доступ до особистого кабінету"
      />
      <Card className="max-w-xl p-8">
        <NewClientForm />
      </Card>
    </>
  );
}
