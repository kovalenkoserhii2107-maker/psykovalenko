import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { db } from '@/lib/db';
import type { ProfileEntry } from '@/lib/test-scoring';
import { getTest } from '@/lib/tests';

import { TestWizard } from '../../client/tests/[slug]/wizard';

import { markOpened, submitInvite } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Анкета',
  // Посилання персональне — у пошуку йому робити нічого
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: PageProps<'/t/[token]'>) {
  const { token } = await params;

  const invite = await db.testInvite.findUnique({
    where: { token },
    include: {
      user: { select: { name: true } },
      result: { select: { rawAnswers: true } },
    },
  });
  if (!invite) notFound();

  const test = getTest(invite.testSlug);
  if (!test) notFound();

  const expired = invite.expiresAt ? invite.expiresAt < new Date() : false;
  const done = invite.status === 'COMPLETED';

  if (!done && !expired) await markOpened(token);

  // Те саме, що показує майстер одразу після надсилання: назва найпомітнішої
  // шкали. Чисел і тлумачень тут немає — розбір на сесії.
  const profile = (invite.result?.rawAnswers as { profile?: ProfileEntry[] } | null)?.profile;
  const headline = profile?.length
    ? [...profile].sort((a, b) => b.value - a.value)[0]?.name
    : undefined;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-5 py-10">
      <header>
        <p className="font-display text-2xl text-plum">Тетяна Коваленко</p>
        <p className="text-xs text-muted">психологиня</p>
      </header>

      {done ? (
        // Після надсилання серверна дія оновлює цю ж сторінку, і вона
        // бачить уже COMPLETED. Тож подяку показує саме сторінка — інакше
        // людина замість «дякую» отримувала б сухе «вже заповнено».
        <div className="rounded-3xl border border-white/70 bg-white/60 p-7 text-center backdrop-blur-xl">
          <p className="font-display text-3xl text-plum">Дякую</p>
          <p className="mt-3 text-sm text-muted">
            Відповіді збережено — психологиня подивиться їх перед зустріччю.
          </p>
          {headline ? (
            <p className="mt-4 text-sm text-plum">
              Найпомітніший стан у ваших відповідях — <b>{headline}</b>.
            </p>
          ) : null}
          <p className="mt-4 text-xs text-muted">
            Розбір — на сесії: без контексту окремі цифри мало що означають.
          </p>
        </div>
      ) : expired ? (
        <Notice
          title="Термін дії посилання минув"
          text="Напишіть Тетяні, і вона надішле нове."
        />
      ) : (
        <>
          <div>
            <h1 className="font-display text-3xl text-plum">{test.name}</h1>
            <p className="mt-1 text-sm text-muted">{test.subtitle}</p>
            <p className="mt-4 text-sm text-muted">{test.intro}</p>
          </div>

          {invite.userId ? null : (
            <p className="rounded-2xl bg-cream-warm px-4 py-3 text-xs text-muted">
              Як до вас звертатись — можна вписати нижче. Не обов’язково:
              без імені анкета теж збережеться.
            </p>
          )}

          <TestWizard
            test={test}
            action={submitInvite}
            hidden={{ token }}
            askRespondent={!invite.userId}
          />
        </>
      )}

      <p className="mt-auto pt-6 text-center text-xs text-muted">
        Відповіді бачить лише психологиня.
      </p>
    </div>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-7 text-center backdrop-blur-xl">
      <p className="font-display text-2xl text-plum">{title}</p>
      <p className="mt-3 text-sm text-muted">{text}</p>
    </div>
  );
}
