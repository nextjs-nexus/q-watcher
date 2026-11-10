import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSafeRedirectPath } from './lib/redirect';

// Pages anyone can open. Saving to personal lists is checked separately on the server.
const publicPaths = [
  '/',
  '/list',
  '/signin',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/sitemap.xml',
  '/robots.txt',
];

const publicPathPatterns = [
  /^\/movie\/\d+$/,
  /^\/tv\/\d+$/,
];

export function isPublicPath(pathname: string): boolean {
  return publicPaths.includes(pathname)
    || publicPathPatterns.some((pattern) => pattern.test(pathname))
    || pathname === '/api/auth'
    || pathname.startsWith('/api/auth/');
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('__Secure-better-auth.session_token')
    || request.cookies.get('better-auth.session_token');
  const pathname = request.nextUrl.pathname;

  // If user is not logged in and trying to access protected route
  if (!session && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If user is logged in and trying to access the sign-in page, continue where they were heading
  if (session && pathname === '/signin') {
    const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get('next'));
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
