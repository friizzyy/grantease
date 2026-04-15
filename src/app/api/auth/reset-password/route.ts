import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { rateLimiters, getClientIdentifier, rateLimitExceededResponse } from '@/lib/rate-limit'

/**
 * Password policy — must match /api/auth/register for a consistent user experience.
 */
const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Invalid reset token').max(200),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

/**
 * POST /api/auth/reset-password
 *
 * Reset password using a valid reset token.
 * Rate limited per-IP to prevent token brute-forcing.
 */
export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request)
    const rateLimit = rateLimiters.auth(clientId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    const body = await request.json()
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message, details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      )
    }

    // Hash the new password (cost 12 matches register)
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password, clear reset token, and invalidate sessions by bumping passwordHash
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('[Password Reset] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
