import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import {
  analyzeCompetition,
  type GrantForAnalysis,
} from '@/lib/services/gemini-competitive-analysis'
import { isGeminiConfigured, GEMINI_MODEL } from '@/lib/services/gemini-client'
import { z } from 'zod'

const competitiveAnalysisSchema = z.object({
  grantId: z.string().min(1, 'Grant ID is required').max(200),
  grantTitle: z.string().min(1, 'Grant title is required').max(500),
  grantSponsor: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  url: z.string().max(2000).optional(),
  amountMin: z.number().min(0).optional(),
  amountMax: z.number().min(0).optional(),
})

/**
 * POST /api/ai/competitive-analysis
 *
 * Analyze competitive landscape for a specific grant using web research.
 *
 * Body:
 * - grantId: string
 * - grantTitle: string
 * - grantSponsor?: string
 * - description?: string
 * - url?: string
 * - amountMin?: number
 * - amountMax?: number
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
        { error: 'AI competitive analysis not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = competitiveAnalysisSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const {
      grantId,
      grantTitle,
      grantSponsor,
      description,
      url,
      amountMin,
      amountMax,
    } = validated.data

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

    const grant: GrantForAnalysis = {
      id: grantId,
      title: grantTitle,
      sponsor: grantSponsor || 'Unknown',
      description,
      url,
      amountMin,
      amountMax,
    }

    const startTime = Date.now()
    const { result, usage } = await analyzeCompetition(grant, profile)
    const analysisTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not complete competitive analysis' },
        { status: 500 }
      )
    }

    // Log usage with actual token counts from the API response
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'competitive_analysis',
          model: GEMINI_MODEL,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: analysisTime,
          grantId,
          success: true,
          metadata: JSON.stringify({
            grantTitle,
            strategiesCount: result.winningStrategies.length,
            mistakesCount: result.commonMistakes.length,
            resourcesCount: result.resources.length,
          }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      result,
      analysisTime,
    })
  } catch (error) {
    console.error('Competitive analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to complete competitive analysis' },
      { status: 500 }
    )
  }
}
