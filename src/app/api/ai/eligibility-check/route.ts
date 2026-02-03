import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import {
  checkEligibility,
  quickEligibilityCheck,
  type GrantForEligibility,
} from '@/lib/services/gemini-eligibility-checker'
import { isGeminiConfigured } from '@/lib/services/gemini-client'

/**
 * POST /api/ai/eligibility-check
 *
 * Check if user is eligible for a specific grant
 *
 * Body:
 * - grantId: string
 * - grantTitle: string
 * - grantSponsor: string
 * - eligibilityText?: string
 * - requirements?: string
 * - description?: string
 * - url: string
 * - mode?: 'full' | 'quick'
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
        { error: 'AI eligibility check not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      grantId,
      grantTitle,
      grantSponsor,
      eligibilityText,
      requirements,
      description,
      url,
      mode = 'full',
    } = body

    if (!grantId || !grantTitle || !url) {
      return NextResponse.json(
        { error: 'Grant ID, title, and URL are required' },
        { status: 400 }
      )
    }

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dbProfile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      )
    }

    const profile: UserProfile = {
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
      certifications: safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {}).certifications as string[] | undefined,
      farmDetails: safeJsonParse<UserProfile['farmDetails']>(dbProfile.industryAttributes, undefined),
    }

    const grant: GrantForEligibility = {
      id: grantId,
      title: grantTitle,
      sponsor: grantSponsor,
      eligibilityText,
      requirements,
      description,
      url,
    }

    const startTime = Date.now()

    if (mode === 'quick') {
      const result = await quickEligibilityCheck(grant, profile)
      const analysisTime = Date.now() - startTime

      return NextResponse.json({
        mode: 'quick',
        result,
        analysisTime,
      })
    }

    // Full analysis
    const result = await checkEligibility(grant, profile)
    const analysisTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not complete eligibility analysis' },
        { status: 500 }
      )
    }

    // Log usage
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'eligibility_check',
          model: 'gemini-1.5-pro',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          responseTime: analysisTime,
          grantId,
          success: true,
          metadata: JSON.stringify({ mode, verdict: result.verdict }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      mode: 'full',
      result,
      analysisTime,
    })
  } catch (error) {
    console.error('Eligibility check error:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}
