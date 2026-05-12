import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route yang membutuhkan auth
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/projects', '/match'];
// Route yang hanya untuk guest (tidak login)
const AUTH_ROUTES = ['/login', '/register'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('wecollab_token')?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && token) {
    // Jika sudah ada token, redirect ke dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/projects/:path*',
    '/match/:path*',
    '/login',
    '/register',
  ],
};
