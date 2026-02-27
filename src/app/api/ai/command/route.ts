import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import { routeCommand } from '@/lib/services/gemini-command-router'
import { isGeminiConfigured, GEMINI_MODEL } from '@/lib/services/gemini-client'
import { z } from 'zod'

const commandSchema = z.object({
  command: z.string().min(1, 'Command is required').max(2000),
})

/**
 * POST /api/ai/command
 *
 * Route a natural language command to the appropriate AI action.
 * Parses user intent and returns a structured response with
 * suggested actions and optionally discovered grants.
 *
 * Body:
 * - command: string (1-2000 chars)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI command routing not configured. Please add GEMINI_API_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = commandSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { command } = validated.data

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Build profile object (gracefully handle missing profile)
    const profile: UserProfile = dbProfile ? {
      id: dbProfile.id,
      userId: dbProfile.userId,
      entityType: dbProfile.entityType as UserProfile['entityType'],
      country: dbProfile.country,
      state: dbProfile.state,
      industryTags: safeJsonParse<string[]>(dbProfile.industryTags, []),
      sizeBand: (dbProfile.sizeBand || null) as UserProfile['sizeBand'],
      stage: (dbProfile.stage || null) as UserProfile['stage'],
      annualBudget: (dbProfile.annualBudget || null) as UserProfile['annualBudget'],
      industryAttributes: safeJsonParse<Record<string, string | string[] | boolean>>(dbProfile.industryAttributes, {}),
      grantPreferences: safeJsonParse<UserProfile['grantPreferences']>(dbProfile.grantPreferences, { preferredSize: null, timeline: null, complexity: null }),
      onboardingCompleted: dbProfile.onboardingCompleted,
      onboardingCompletedAt: dbProfile.onboardingCompletedAt,
      onboardingStep: dbProfile.onboardingStep,
      confidenceScore: dbProfile.confidenceScore,
      companyName: null,
      companyDescription: null,
      certifications: safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {}).certifications as string[] | undefined,
      fundingNeeds: safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {}).fundingNeeds as string[] | undefined,
    } : {
      id: '',
      userId: session.user.id,
      entityType: 'small_business',
      country: 'US',
      state: null,
      industryTags: [],
      sizeBand: null,
      stage: null,
      annualBudget: null,
      industryAttributes: {},
      grantPreferences: { preferredSize: null, timeline: null, complexity: null },
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      onboardingStep: 1,
      confidenceScore: 0,
    }

    const startTime = Date.now()
    const { result, usage } = await routeCommand(command, profile)
    const responseTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not process command. Please try rephrasing your request.' },
        { status: 500 }
      )
    }

    // Log usage with actual token counts
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'command',
          model: GEMINI_MODEL,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime,
          success: true,
          metadata: JSON.stringify({
            intent: result.intent,
            hasGrants: (result.grants?.length ?? 0) > 0,
            grantsCount: result.grants?.length ?? 0,
          }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      result,
      responseTime,
    })
  } catch (error) {
    console.error('Command routing error:', error)
    return NextResponse.json(
      { error: 'Command processing encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
