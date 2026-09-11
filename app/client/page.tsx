import { requireRole } from '@/lib/auth-guard';

export default async function ClientHome() {
  const user = await requireRole('CLIENT');

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full rounded-3xl border border-white/40 bg-white/70 p-8 backdrop-blur-lg dark:border-white/10 dark:bg-black/70">
        <h1 className="text-2xl font-semibold">Особистий кабінет</h1>
        <p className="mt-2 text-sm opacity-60">{user.email}</p>
        <p className="mt-4 text-sm opacity-60">Записи й завдання — крок 5 плану.</p>
      </div>
    </main>
  );
}
