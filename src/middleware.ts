import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userRole = request.cookies.get('role')?.value; // Changed from 'userRole' to 'role'
  const pathname = request.nextUrl.pathname;

  // Allow API routes, login, and register pages without authentication
  if (pathname.startsWith('/api') || pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!loggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access login/register, redirect to appropriate dashboard
  if ((pathname === '/login' || pathname === '/register') && loggedIn) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If user tries to access root, redirect to appropriate dashboard
  if (pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      // User dashboard is at the root, so no redirect needed for regular users
      return NextResponse.next();
    }
  }

  // Protect admin routes from non-admin users
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    // Redirect non-admin users to the user dashboard (root)
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};