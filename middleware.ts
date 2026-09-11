import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/auth.config';
import { homeForRole } from '@/lib/routes';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const path = nextUrl.pathname;

  const isAdminArea = path.startsWith('/admin');
  const isClientArea = path.startsWith('/client');
  const isLogin = path === '/login';

  // уже увійшов — на сторінці входу робити нічого
  if (isLogin && user) {
    return NextResponse.redirect(new URL(homeForRole(user.role), nextUrl));
  }

  if (!isAdminArea && !isClientArea) return NextResponse.next();

  if (!user) {
    const url = new URL('/login', nextUrl);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // клієнт не має доступу до CRM
  if (isAdminArea && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/client', nextUrl));
  }

  // психологиня заходить у свою CRM, а не в кабінет клієнта
  if (isClientArea && user.role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/client/:path*', '/login'],
};
