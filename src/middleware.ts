import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get('loggedIn')?.value;
  const userRole = request.cookies.get('role')?.value; // 'admin' | 'pro' | 'user'
  const pathname = request.nextUrl.pathname;

  // Allow API routes, login, register, and aboutUs without authentication
  if (
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/aboutUs'  // Add this line
  ) {
    return NextResponse.next();
  }

  // If user is not logged in, allow access to root page (/)
  if (!loggedIn && pathname === '/') {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to root page (/) for other protected routes
  if (!loggedIn && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is logged in and tries to access login/register/aboutUs, redirect based on role
  if ((pathname === '/login' || pathname === '/register' || pathname === '/aboutUs') && loggedIn) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    } else if (userRole === 'pro') {
      return NextResponse.redirect(new URL('/proDashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Admin routes - ONLY allow admin
  if (pathname.startsWith('/Admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect Dashboard routes - only allow regular users
  if (pathname.startsWith('/dashboard') && userRole !== 'user') {
    // block pro & admin
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    } else if (userRole === 'pro') {
      return NextResponse.redirect(new URL('/proDashboard', request.url));
    }
  }

  // Protect ProDashboard routes - only allow pro users
  if (pathname.startsWith('/proDashboard') && userRole !== 'pro') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    } else if (userRole === 'user') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If user is logged in and tries to access root page, redirect based on role
  if (pathname === '/' && loggedIn) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    } else if (userRole === 'pro') {
      return NextResponse.redirect(new URL('/proDashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg$|png$|jpg$|jpeg$|gif$|webp$|ico$)).*)'
  ],
};