import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userRole = request.cookies.get('role')?.value; // already 'admin' | 'pro' | 'user'
  const pathname = request.nextUrl.pathname;

  // Allow API routes, login, and register without authentication
  if (
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!loggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access login/register, redirect based on role
  if ((pathname === '/login' || pathname === '/register') && loggedIn) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/Admin', request.url)); // ✅ fixed case
    } else if (userRole === 'pro') {
      return NextResponse.redirect(new URL('/pro', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect Admin routes - ONLY allow admin
  if (pathname.startsWith('/Admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect Pro routes - ONLY allow pro
  if (pathname.startsWith('/pro') && userRole !== 'pro') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user tries to access root, redirect to appropriate dashboard
  if (pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/Admin', request.url)); // ✅ fixed case
    } else if (userRole === 'pro') {
      return NextResponse.redirect(new URL('/pro', request.url));
    } else {
      return NextResponse.next(); // normal user stays at "/"
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
