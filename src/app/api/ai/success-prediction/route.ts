import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import { predictSuccess, type GrantForPrediction } from '@/lib/services/gemini-success-predictor'
import { isGeminiConfigured, GEMINI_MODEL } from '@/lib/services/gemini-client'
import { z } from 'zod'

const successPredictionSchema = z.object({
  grantId: z.string().min(1, 'Grant ID is required').max(200),
  grantTitle: z.string().min(1, 'Grant title is required').max(500),
  grantSponsor: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  eligibility: z.string().max(10000).optional(),
  requirements: z.string().max(10000).optional(),
  amountMin: z.number().nonnegative().optional(),
  amountMax: z.number().nonnegative().optional(),
})

/**
 * POST /api/ai/success-prediction
 *
 * Predict the likelihood of a successful grant application based on
 * user profile, grant requirements, and competitive landscape research.
 *
 * Body:
 * - grantId: string
 * - grantTitle: string
 * - grantSponsor?: string
 * - description?: string
 * - eligibility?: string
 * - requirements?: string
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
        { error: 'AI success prediction not configured. Please add GEMINI_API_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = successPredictionSchema.safeParse(body)

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
      eligibility,
      requirements,
      amountMin,
      amountMax,
    } = validated.data

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dbProfile) {
      return NextResponse.json(
        { error: 'Please complete your profile first to get a success prediction.' },
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
      companyName: null,
      companyDescription: null,
      certifications: safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {}).certifications as string[] | undefined,
      fundingNeeds: safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {}).fundingNeeds as string[] | undefined,
      farmDetails: safeJsonParse<UserProfile['farmDetails']>(dbProfile.industryAttributes, undefined),
    }

    // Optionally get vault completeness for application preparedness scoring
    let vaultCompleteness: number | undefined
    try {
      const vault = await prisma.userVault.findUnique({
        where: { userId: session.user.id },
      })

      if (vault) {
        // Calculate vault completeness as percentage of filled fields
        const vaultFields = [
          vault.organizationName,
          vault.organizationLegalName,
          vault.ein,
          vault.ueiNumber,
          vault.websiteUrl,
          vault.primaryContactName,
          vault.primaryContactEmail,
          vault.streetAddress,
          vault.city,
          vault.state,
          vault.zipCode,
          vault.missionStatement,
          vault.annualOperatingBudget,
          vault.fiscalYearEnd,
        ]
        const filledFields = vaultFields.filter(f => f !== null && f !== undefined && f !== '').length
        vaultCompleteness = Math.round((filledFields / vaultFields.length) * 100)
      }
    } catch (vaultError) {
      console.warn('Failed to load vault for completeness check:', vaultError)
      // Non-critical: proceed without vault completeness
    }

    const grant: GrantForPrediction = {
      id: grantId,
      title: grantTitle,
      sponsor: grantSponsor || 'Unknown',
      description,
      eligibility,
      requirements,
      amountMin,
      amountMax,
    }

    const startTime = Date.now()
    const { result, usage } = await predictSuccess(grant, profile, vaultCompleteness)
    const analysisTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not complete success prediction analysis.' },
        { status: 500 }
      )
    }

    // Log usage with actual token counts
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'success_prediction',
          model: GEMINI_MODEL,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: analysisTime,
          grantId,
          success: true,
          metadata: JSON.stringify({
            overallScore: result.overallScore,
            competitivePosition: result.competitivePosition,
            estimatedSuccessRate: result.estimatedSuccessRate,
            vaultCompleteness,
            factorsCount: result.factors?.length ?? 0,
          }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      result,
      analysisTime,
      vaultCompleteness,
    })
  } catch (error) {
    console.error('Success prediction error:', error)
    return NextResponse.json(
      { error: 'Success prediction encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
