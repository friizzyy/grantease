import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { z } from 'zod'
import { rateLimiters, getClientIdentifier, rateLimitExceededResponse } from '@/lib/rate-limit'
import { sendEmail, renderPasswordResetEmail, isEmailConfigured } from '@/lib/services/email-service'

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email address required'),
})

/**
 * POST /api/auth/forgot-password
 *
 * Request a password reset. Creates a reset token and logs it.
 * Always returns the same response to prevent email enumeration.
 * Rate limited per-IP.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP to prevent enumeration flooding + DoS
    const clientId = getClientIdentifier(request)
    const rateLimit = rateLimiters.auth(clientId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase().trim()

    // Check if user exists (but don't reveal this to the client for security)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      // Generate a reset token only when we actually have a user
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      })

      // Send reset email (non-blocking — even if it fails, we still return success
      // to preserve the anti-enumeration behavior below).
      if (isEmailConfigured()) {
        const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`
        const rendered = renderPasswordResetEmail(user.name || 'there', resetUrl)

        sendEmail({
          to: user.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        }).catch((err) => {
          console.error('[forgot-password] reset email failed (non-fatal):', err)
        })
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.',
    })
  } catch (error) {
    console.error('[Password Reset] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
