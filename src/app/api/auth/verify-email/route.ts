import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyEmailVerifyToken } from '@/lib/email-tokens'
import { rateLimiters, getClientIdentifier, rateLimitExceededResponse } from '@/lib/rate-limit'

/**
 * GET /api/auth/verify-email?token=...
 *
 * Verifies a stateless, HMAC-signed email-verification token.
 * On success, sets `User.emailVerified` to now and redirects to /login?verified=1.
 * On failure, redirects to /login?verified=0&reason=...
 *
 * The token encodes {userId, email, exp} and is signed with NEXTAUTH_SECRET, so
 * no DB-level verification token is needed.
 */
export async function GET(request: NextRequest) {
  // Rate-limit per IP to prevent token brute-forcing
  const clientId = getClientIdentifier(request)
  const rateLimit = rateLimiters.auth(clientId)
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetAt)
  }

  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?verified=0&reason=missing`)
  }

  const payload = verifyEmailVerifyToken(token)
  if (!payload) {
    return NextResponse.redirect(`${appUrl}/login?verified=0&reason=invalid`)
  }

  try {
    // Look up by id AND email — guards against email changes after the token was issued
    const user = await prisma.user.findFirst({
      where: { id: payload.userId, email: payload.email },
      select: { id: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?verified=0&reason=not_found`)
    }

    // Idempotent: if already verified, still redirect as success
    if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    }

    return NextResponse.redirect(`${appUrl}/login?verified=1`)
  } catch (error) {
    console.error('[verify-email] error:', error)
    return NextResponse.redirect(`${appUrl}/login?verified=0&reason=server`)
  }
}
