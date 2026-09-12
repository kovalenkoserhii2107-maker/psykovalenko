import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireRole } from '@/lib/auth-guard';
import { getTest } from '@/lib/tests';

import { saveTestResult } from '../actions';

import { TestWizard } from './wizard';

export default async function TestPage({ params }: PageProps<'/client/tests/[slug]'>) {
  await requireRole('CLIENT');
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/client/tests" className="px-1 text-sm text-muted underline underline-offset-4">
        ← До тестів
      </Link>
      <p className="px-1 text-sm text-muted">{test.intro}</p>
      <TestWizard
        test={test}
        action={saveTestResult}
        hidden={{ slug: test.slug }}
        doneHref="/client/tests"
        doneLabel="До списку анкет"
      />
    </div>
  );
}
