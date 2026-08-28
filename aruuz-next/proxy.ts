import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isProtectedRoute = pathname.startsWith('/my-poetry') || pathname.startsWith('/api/my-poetry');

  if (isAdminRoute || isProtectedRoute) {
    const sessionToken =
      req.cookies.get('authjs.session-token')?.value ||
      req.cookies.get('__Secure-authjs.session-token')?.value;
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/my-poetry/:path*', '/api/my-poetry/:path*'],
};
