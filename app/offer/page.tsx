import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Публічна оферта' };

export default function OfferPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/client" className="text-sm text-muted underline underline-offset-4">
        ← Назад
      </Link>

      <h1 className="mt-6 font-display text-4xl text-plum">Публічна оферта</h1>

      {/* ЗАГЛУШКА. Замінити на текст договору, коли він буде готовий. */}
      <div className="mt-8 rounded-3xl border border-dashed border-[rgba(46,35,56,.25)] p-8">
        <p className="text-sm text-muted">
          Текст договору публічної оферти буде розміщено тут. Поки що це
          заготовка: умови надання послуг, порядок оплати та скасування
          зустрічей, конфіденційність і обробка персональних даних.
        </p>
        <p className="mt-4 text-sm text-muted">
          Якщо у вас є питання щодо умов — напишіть психологині.
        </p>
      </div>
    </main>
  );
}
