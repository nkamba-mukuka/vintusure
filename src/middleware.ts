import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = path === '/login' || path === '/signup';

    // Get the token from the cookies
    const token = request.cookies.get('token')?.value || '';

    // Redirect logic
    if (isPublicPath && token) {
        // If user is authenticated and tries to access public path,
        // redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isPublicPath && !token) {
        // If user is not authenticated and tries to access protected path,
        // redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Configure the paths that middleware will run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 