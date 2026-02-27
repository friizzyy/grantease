import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Allow NextAuth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Protected routes - require auth
  if (pathname.startsWith('/app') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin routes require admin role
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  // Auth pages - redirect if already logged in
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/onboarding/:path*', '/login', '/register'],
}
