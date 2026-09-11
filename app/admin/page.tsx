import { requireRole } from '@/lib/auth-guard';

export default async function AdminHome() {
  const user = await requireRole('ADMIN');

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="rounded-3xl border border-white/40 bg-white/70 p-10 backdrop-blur-lg dark:border-white/10 dark:bg-black/70">
        <h1 className="text-2xl font-semibold">Кабінет психологині</h1>
        <p className="mt-2 text-sm opacity-60">{user.email}</p>
        <p className="mt-4 text-sm opacity-60">База клієнтів — крок 4 плану.</p>
      </div>
    </main>
  );
}
