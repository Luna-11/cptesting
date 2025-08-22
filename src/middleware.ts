import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const pathname = request.nextUrl.pathname;


  if (pathname.startsWith('/api') || pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }


  if (!loggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user tries to access root, redirect to appropriate dashboard
  if (pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/app/admin', request.url));
    } else {
      // User dashboard is at the root, so no redirect needed for regular users
      return NextResponse.next();
    }
  }

  // Protect admin routes from non-admin users
  if (pathname.startsWith('/app/admin') && userRole !== 'admin') {
    // Redirect non-admin users to the user dashboard (root)
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};