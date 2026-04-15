import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { rateLimiters, getClientIdentifier, rateLimitExceededResponse } from '@/lib/rate-limit'
import { sendEmail, renderWelcomeEmail, isEmailConfigured } from '@/lib/services/email-service'
import { createEmailVerifyToken } from '@/lib/email-tokens'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  organization: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = rateLimiters.auth(clientId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, password, organization } = validationResult.data
    // Normalize email: emails are case-insensitive by spec (RFC 5321), but DB
    // comparisons are case-sensitive — normalize on write so lookups are consistent.
    const email = validationResult.data.email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password (cost 12 — takes ~250ms, good balance vs throughput)
    const passwordHash = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash,
        organization: organization?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        organization: true,
        createdAt: true,
      },
    })

    // Fire-and-forget: send welcome + verification email.
    // Failure here must NOT block signup — user can request a new verify link later.
    if (isEmailConfigured()) {
      const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verifyToken = createEmailVerifyToken(user.id, user.email)
      const verificationUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`
      const rendered = renderWelcomeEmail(user.name || 'there', verificationUrl)

      sendEmail({
        to: user.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }).catch((err) => {
        console.error('[register] welcome email failed (non-fatal):', err)
      })
    }

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Check for common Prisma errors
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }

    if (errorMessage.includes('prepared statement') || errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database schema issue. Please contact support.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
