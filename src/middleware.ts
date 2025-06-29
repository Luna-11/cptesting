import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user has the 'loggedIn' cookie
  const loggedIn = request.cookies.get('loggedIn')?.value === 'true';

  // If trying to access '/' without being logged in, redirect to /login
  if (pathname === '/' && !loggedIn) {
    return NextResponse.redirect(new URL('/logIn', request.url));
  }

  return NextResponse.next();
}

// Limit middleware to / only
export const config = {
  matcher: '/',
};
