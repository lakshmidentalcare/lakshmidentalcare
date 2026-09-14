import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that do not require authentication
  if (
    path.startsWith('/login') ||
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow access if ldc_logged_in cookie or NextAuth session cookie exists
  const hasLdcCookie = request.cookies.has('ldc_logged_in');
  const hasNextAuthCookie = request.cookies.has('next-auth.session-token') || request.cookies.has('__Secure-next-auth.session-token');

  // If no auth cookie, redirect to login
  if (!hasLdcCookie && !hasNextAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
