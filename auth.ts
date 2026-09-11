import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { db } from '@/lib/db';
import { GOOGLE_SCOPES, isGoogleConfigured } from '@/lib/google';
import { authConfig } from '@/auth.config';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  // Прив'язуємо вхід через Google до вже наявного облікового запису
  // з тією ж поштою. Загалом це небезпечно, але тут: пошту Google
  // підтверджує сам, а callback signIn нижче пускає лише психологиню,
  // обліковий запис якої вже створено паролем.
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: {
      scope: GOOGLE_SCOPES,
      // без цих двох Google віддає refresh_token лише першого разу,
      // а нам він потрібен для фонової роботи з календарем і диском
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') return true;

      // Google — це підключення календаря й диска психологині,
      // а не спосіб зареєструватися. Стороннім входу немає.
      const email = profile?.email?.toLowerCase();
      if (!email) return false;

      const user = await db.user.findUnique({
        where: { email },
        select: { role: true },
      });
      return user?.role === 'ADMIN';
    },
  },
  providers: [
    ...(isGoogleConfigured() ? [googleProvider] : []),
    Credentials({
      credentials: {
        email: { label: 'Пошта', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Порівнюємо хеш навіть тоді, коли користувача немає: інакше час відповіді
        // видає, які адреси зареєстровані.
        const hash = user?.passwordHash ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
        const ok = await bcrypt.compare(password, hash);
        if (!user || !user.passwordHash || !ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
