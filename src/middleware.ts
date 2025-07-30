import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

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

    // Check for authentication
    const session = cookies().get('session')?.value;
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get user role from session (you'll need to implement this based on your token structure)
    const userRole = getUserRoleFromSession(session);

    // Check role-based access
    if (path.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

function getUserRoleFromSession(session: string): string {
    try {
        // Decode the session token and extract role
        // This is a placeholder - implement based on your token structure
        return 'agent';
    } catch (error) {
        return 'agent';
    }
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