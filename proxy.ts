import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('better-auth.session_token');
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/signin',
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ];
  const pathname = request.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(pathname)
    || pathname === '/api/auth'
    || pathname.startsWith('/api/auth/');

  // If user is not logged in and trying to access protected route
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If user is logged in and trying to access login page
  if (session && request.nextUrl.pathname === '/signin') {
    return NextResponse.redirect(new URL('/list', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
