import type { NextAuthConfig } from 'next-auth';

/**
 * Частина конфігурації без Prisma і bcrypt: middleware виконується в edge-рантаймі,
 * де ці пакети недоступні. Провайдери додаються поверх у auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    // credentials-провайдер працює лише з JWT-сесіями
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    jwt({ token, user }) {
      // роль кладемо в токен один раз — при вході
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'CLIENT';
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
