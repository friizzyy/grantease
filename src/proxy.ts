import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Security headers applied to every response.
 * Mitigates clickjacking, MIME-sniffing, and referer leakage.
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  // Only enforce HSTS in production behind HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  return res
}

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Allow NextAuth API routes
  if (pathname.startsWith('/api/auth')) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Protected routes - require auth
  if (pathname.startsWith('/app') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return applySecurityHeaders(NextResponse.redirect(loginUrl))
    }

    // Admin routes require admin role
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/app', request.url)))
    }
  }

  // Auth pages - redirect if already logged in
  if ((pathname === '/login' || pathname === '/register') && token) {
    return applySecurityHeaders(NextResponse.redirect(new URL('/app', request.url)))
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    // Apply to all routes except Next.js internals + static assets so headers land everywhere
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
