/** Куди відправляти користувача після входу залежно від ролі. */
export function homeForRole(role?: string | null) {
  return role === 'ADMIN' ? '/admin' : '/client';
}
