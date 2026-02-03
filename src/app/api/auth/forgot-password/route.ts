import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password
 *
 * Request a password reset. Creates a reset token and logs it.
 * Email functionality will be added when an email service is configured.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      )
    }

    // Check if user exists (but don't reveal this to the client for security)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Generate a reset token regardless of whether user exists
    // This prevents email enumeration attacks
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    if (user) {
      // Store the reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      })

      // TODO: Send email when email service is configured
      // For now, log the reset URL (only in development)
      if (process.env.NODE_ENV === 'development') {
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
        console.log('[Password Reset] Token generated for:', email)
        console.log('[Password Reset] Reset URL:', resetUrl)
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
