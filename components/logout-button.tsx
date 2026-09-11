import { logout } from '@/app/actions-auth';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-muted underline underline-offset-4 transition hover:text-plum"
      >
        Вийти
      </button>
    </form>
  );
}
