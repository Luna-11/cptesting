// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   console.log('Middleware triggered on:', request.nextUrl.pathname);

//   const loggedIn = request.cookies.get('loggedIn')?.value;
//   const role = request.cookies.get('role')?.value;

//   console.log('LoggedIn cookie value:', loggedIn, '| Role cookie value:', role);

//   const { pathname } = request.nextUrl;

//   // Not logged in — block access to any protected routes
//   if ((pathname === '/' || pathname.startsWith('/dashboard')) && loggedIn !== 'true') {
//     console.log('Redirecting unauthenticated user to /logIn');
//     return NextResponse.redirect(new URL('/logIn', request.url));
//   }

//   // Restrict /dashboard/admin only for admin users
//   if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
//     console.log('Redirecting non-admin user to /unauthorized');
//     return NextResponse.redirect(new URL('/unauthorized', request.url));
//   }

//   // Restrict /dashboard/user only for regular users
//   if (pathname.startsWith('/dashboard/user') && role !== 'user') {
//     console.log('Redirecting non-user to /unauthorized');
//     return NextResponse.redirect(new URL('/unauthorized', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/', '/dashboard/:path*'],
// };
