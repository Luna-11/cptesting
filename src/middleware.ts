import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const pathname = request.nextUrl.pathname;

  // Allow login, register, and API routes
  if (pathname.startsWith('/api') || pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!loggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};