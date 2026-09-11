import { signIn } from '@/auth';

export function GoogleButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/admin' });
      }}
    >
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-full border border-[rgba(46,35,56,.2)] bg-white/70 py-3 text-sm font-medium text-plum transition hover:bg-white"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
          <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z" />
          <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3z" />
          <path fill="#EA4335" d="M12 5.1c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7.1 9 5.1 12 5.1z" />
        </svg>
        Увійти через Google
      </button>
    </form>
  );
}
