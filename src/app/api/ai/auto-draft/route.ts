import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import { generateAutoDraft, type VaultData } from '@/lib/services/gemini-auto-draft'
import { isGeminiConfigured, GEMINI_MODEL } from '@/lib/services/gemini-client'
import { z } from 'zod'

const grantSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  sponsor: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  requirements: z.string().max(10000).optional(),
  eligibility: z.string().max(10000).optional(),
  deadline: z.string().max(200).optional(),
  url: z.string().max(2000).optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
})

const autoDraftSchema = z.object({
  grant: grantSchema,
})

/**
 * POST /api/ai/auto-draft
 *
 * Generate a complete application draft by combining vault data
 * with grant requirements and user profile.
 *
 * Body:
 * - grant: { id, title, sponsor?, description?, requirements?, eligibility?, deadline?, url?, amountMin?, amountMax? }
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
        { error: 'AI auto-draft not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = autoDraftSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { grant } = validated.data

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
      companyName: null,
      companyDescription: null,
    }

    // Load vault data for contact info and org details
    const dbVault = await prisma.userVault.findUnique({
      where: { userId: session.user.id },
    })

    let vaultData: VaultData | null = null
    if (dbVault) {
      vaultData = {
        orgName: dbVault.organizationName || undefined,
        legalName: dbVault.organizationLegalName || undefined,
        ein: dbVault.ein || undefined,
        duns: dbVault.dunsNumber || undefined,
        uei: dbVault.ueiNumber || undefined,
        website: dbVault.websiteUrl || undefined,
        mission: dbVault.missionStatement || undefined,
        orgHistory: dbVault.organizationHistory || undefined,
        serviceArea: dbVault.serviceArea || undefined,
        annualBudget: dbVault.annualOperatingBudget || undefined,
        primaryContactName: dbVault.primaryContactName || undefined,
        primaryContactTitle: dbVault.primaryContactTitle || undefined,
        primaryContactEmail: dbVault.primaryContactEmail || undefined,
        primaryContactPhone: dbVault.primaryContactPhone || undefined,
        addressStreet: dbVault.streetAddress || undefined,
        addressCity: dbVault.city || undefined,
        addressState: dbVault.state || undefined,
        addressZip: dbVault.zipCode || undefined,
      }
    }

    const startTime = Date.now()

    const grantForDraft = {
      ...grant,
      sponsor: grant.sponsor || 'Unknown',
    }

    const { result, usage } = await generateAutoDraft(grantForDraft, profile, vaultData)

    const processingTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not generate application draft. Please try again.' },
        { status: 500 }
      )
    }

    // Log usage
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'auto_draft',
          model: GEMINI_MODEL,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: processingTime,
          grantId: grant.id,
          success: true,
          metadata: JSON.stringify({
            grantTitle: grant.title,
            hasVaultData: vaultData !== null,
          }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      result,
      processingTime,
    })
  } catch (error) {
    console.error('Auto-draft error:', error)
    return NextResponse.json(
      { error: 'Failed to generate application draft' },
      { status: 500 }
    )
  }
}
