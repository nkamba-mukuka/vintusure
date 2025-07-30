import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = ['/login', '/signup', '/forgot-password'];

// Define paths that require specific roles
const roleRestrictedPaths = {
    admin: ['/admin', '/settings'],
    agent: ['/dashboard', '/customers', '/policies', '/claims']
};

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Allow public paths
    if (publicPaths.includes(path)) {
        return NextResponse.next();
    }

    // Allow access to dashboard routes for now (authentication will be handled by client-side AuthContext)
    if (path.startsWith('/dashboard')) {
        return NextResponse.next();
    }

    // For other protected routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
}

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