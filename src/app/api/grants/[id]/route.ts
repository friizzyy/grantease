import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'

// Import eligibility and scoring engines
import {
  runEligibilityEngine,
  UserProfileForEligibility,
  GrantForEligibility,
} from '@/lib/eligibility/engine'
import {
  calculateScore,
  UserProfileForScoring,
  GrantForScoring,
} from '@/lib/scoring/engine'
import {
  formatFundingDisplay,
  EntityType,
  IndustryTag,
  BudgetRange,
} from '@/lib/constants/taxonomy'

// Import cache
import { getCachedMatch, cacheDataToMatchResult } from '@/lib/cache/match-cache'

// Import AI matching for single grant analysis
import { analyzeGrantFit, GrantForAIMatching } from '@/lib/services/gemini-grant-matching-v2'
import { createFallbackMatchResult, GrantMatchResult } from '@/lib/schemas/llm-responses'
import { isGeminiConfigured } from '@/lib/services/gemini-client'

/**
 * GET /api/grants/:id
 *
 * Returns full grant details with eligibility assessment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Load grant from database
    const grant = await prisma.grant.findUnique({
      where: { id },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const categories = safeJsonParse<string[]>(grant.categories, [])
    const eligibilityData = safeJsonParse<{ tags?: string[]; rawText?: string } | string[]>(grant.eligibility, [])
    const eligibilityTags = Array.isArray(eligibilityData)
      ? eligibilityData
      : eligibilityData?.tags || []
    const eligibilityRawText = !Array.isArray(eligibilityData) ? eligibilityData?.rawText : undefined

    const locations = safeJsonParse<Array<{ type: string; value?: string }>>(grant.locations, [])
    const contact = safeJsonParse<{ name?: string; email?: string; phone?: string } | null>(grant.contact, null)
    const requirements = safeJsonParse<string[]>(grant.requirements, [])
    const purposeTags = safeJsonParse<string[]>(grant.purposeTags, [])

    // Build base response
    const baseResponse = {
      id: grant.id,
      sourceId: grant.sourceId,
      sourceName: grant.sourceName,
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.summary,
      description: grant.description,
      aiSummary: grant.aiSummary,
      categories,
      eligibility: {
        tags: eligibilityTags,
        rawText: eligibilityRawText,
      },
      locations,
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
      amountText: grant.amountText,
      fundingDisplay: formatFundingDisplay(grant.amountMin, grant.amountMax, grant.amountText),
      fundingType: grant.fundingType,
      purposeTags,
      deadlineType: grant.deadlineType,
      deadlineDate: grant.deadlineDate,
      postedDate: grant.postedDate,
      rolling: grant.deadlineType === 'rolling',
      url: grant.url,
      contact,
      requirements,
      requirementsStructured: grant.requirementsStructured
        ? safeJsonParse<string[]>(grant.requirementsStructured, [])
        : requirements,
      status: grant.status,
      qualityScore: grant.qualityScore,
      linkStatus: grant.linkStatus,
      lastVerifiedAt: grant.lastVerifiedAt,
    }

    // Check if user is authenticated for personalized matching
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      // Return grant without personalized matching
      return NextResponse.json({
        ...baseResponse,
        appliesToUser: null,
        eligibilityAssessment: null,
        matchScore: null,
        aiAnalysis: null,
      })
    }

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dbProfile || !dbProfile.onboardingCompleted) {
      // Return grant without personalized matching
      return NextResponse.json({
        ...baseResponse,
        appliesToUser: null,
        eligibilityAssessment: null,
        matchScore: null,
        aiAnalysis: null,
        profileComplete: false,
      })
    }

    // Parse profile
    const industryTags = safeJsonParse<IndustryTag[]>(dbProfile.industryTags, [])
    const industryAttributes = safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {})
    const grantPreferences = safeJsonParse<{
      preferredSize?: string | null
      timeline?: 'immediate' | 'quarter' | 'year' | 'flexible' | null
      complexity?: 'simple' | 'moderate' | 'complex' | null
    }>(dbProfile.grantPreferences, {})

    // ========== ELIGIBILITY CHECK ==========
    const eligibilityProfile: UserProfileForEligibility = {
      entityType: dbProfile.entityType as EntityType,
      state: dbProfile.state,
      industryTags,
      certifications: [],
      sizeBand: dbProfile.sizeBand,
      annualBudget: dbProfile.annualBudget,
    }

    const grantForEligibility: GrantForEligibility = {
      id: grant.id,
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.summary,
      description: grant.description,
      aiSummary: grant.aiSummary,
      categories,
      eligibility: {
        tags: eligibilityTags,
        rawText: eligibilityRawText,
      },
      locations,
      url: grant.url,
      status: grant.status,
      qualityScore: grant.qualityScore,
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
    }

    const eligibilityResult = runEligibilityEngine(eligibilityProfile, grantForEligibility)

    // ========== SCORING ==========
    const scoringProfile: UserProfileForScoring = {
      entityType: dbProfile.entityType as EntityType,
      state: dbProfile.state,
      industryTags,
      sizeBand: dbProfile.sizeBand,
      annualBudget: dbProfile.annualBudget as BudgetRange | null,
      goals: industryAttributes.goals as string[] | undefined,
      grantPreferences,
    }

    const grantForScoring: GrantForScoring = {
      id: grant.id,
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.summary,
      description: grant.description,
      aiSummary: grant.aiSummary,
      categories,
      eligibility: {
        tags: eligibilityTags,
        rawText: eligibilityRawText,
      },
      locations,
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
      amountText: grant.amountText,
      fundingType: grant.fundingType,
      purposeTags: purposeTags as GrantForScoring['purposeTags'],
      deadlineDate: grant.deadlineDate,
      qualityScore: grant.qualityScore,
      status: grant.status,
    }

    const scoringResult = calculateScore(scoringProfile, grantForScoring)

    // ========== AI ANALYSIS (from cache or fresh) ==========
    let aiAnalysis: GrantMatchResult | null = null

    // Try cache first
    const cachedMatch = await getCachedMatch(
      session.user.id,
      grant.id,
      dbProfile.profileVersion,
      grant.updatedAt
    )

    if (cachedMatch) {
      aiAnalysis = cacheDataToMatchResult(grant.id, cachedMatch)
    } else if (isGeminiConfigured() && eligibilityResult.isEligible) {
      // Get fresh AI analysis only if eligible
      const grantForAI: GrantForAIMatching = {
        id: grant.id,
        title: grant.title,
        sponsor: grant.sponsor,
        summary: grant.summary,
        description: grant.description,
        categories,
        eligibility: eligibilityTags,
        amountMin: grant.amountMin,
        amountMax: grant.amountMax,
        amountText: grant.amountText,
        deadlineDate: grant.deadlineDate,
        url: grant.url,
      }

      try {
        aiAnalysis = await analyzeGrantFit(grantForAI, scoringProfile)
      } catch (error) {
        console.error('[Grant Detail] AI analysis error:', error)
        aiAnalysis = createFallbackMatchResult(grant.id)
      }
    }

    // ========== DETERMINE APPLIES TO USER ==========
    let appliesToUser: 'yes' | 'likely' | 'uncertain' | 'no'

    if (!eligibilityResult.isEligible) {
      appliesToUser = 'no'
    } else if (eligibilityResult.confidenceLevel === 'high' && scoringResult.totalScore >= 60) {
      appliesToUser = 'yes'
    } else if (eligibilityResult.confidenceLevel === 'medium' || scoringResult.totalScore >= 40) {
      appliesToUser = 'likely'
    } else {
      appliesToUser = 'uncertain'
    }

    // Build eligibility reasons
    const eligibilityReasons: string[] = []
    if (!eligibilityResult.isEligible && eligibilityResult.primaryReason) {
      eligibilityReasons.push(eligibilityResult.primaryReason)
    } else {
      eligibilityReasons.push(...eligibilityResult.passedFilters.map(filter => {
        switch (filter) {
          case 'ENTITY_TYPE': return 'Your organization type is eligible'
          case 'GEOGRAPHY': return 'Available in your location'
          case 'INDUSTRY_RELEVANCE': return 'Relevant to your focus areas'
          default: return `Passed ${filter}`
        }
      }))
    }

    // ========== RELATED GRANTS ==========
    // Find up to 4 open grants sharing at least one category (cheap shallow query,
    // excludes the current grant and limits to 12 candidates for ranking).
    let relatedGrants: Array<{
      id: string
      title: string
      sponsor: string
      amountMin: number | null
      amountMax: number | null
      amountText: string | null
      deadlineDate: Date | null
      categories: string[]
      fundingDisplay: string
    }> = []
    try {
      if (categories.length > 0) {
        const candidates = await prisma.grant.findMany({
          where: {
            id: { not: grant.id },
            status: 'open',
            OR: categories.slice(0, 3).map(cat => ({
              categories: { contains: cat },
            })),
          },
          select: {
            id: true,
            title: true,
            sponsor: true,
            amountMin: true,
            amountMax: true,
            amountText: true,
            deadlineDate: true,
            categories: true,
          },
          take: 12,
          orderBy: { deadlineDate: 'asc' },
        })
        // Rank by overlap of categories with current grant, then by deadline
        const currentCatSet = new Set(categories.map(c => c.toLowerCase()))
        relatedGrants = candidates
          .map(c => {
            const cats = safeJsonParse<string[]>(c.categories, [])
            const overlap = cats.filter(x => currentCatSet.has(x.toLowerCase())).length
            return { ...c, cats, overlap }
          })
          .sort((a, b) => b.overlap - a.overlap)
          .slice(0, 4)
          .map(c => ({
            id: c.id,
            title: c.title,
            sponsor: c.sponsor,
            amountMin: c.amountMin,
            amountMax: c.amountMax,
            amountText: c.amountText,
            deadlineDate: c.deadlineDate,
            categories: c.cats,
            fundingDisplay: formatFundingDisplay(c.amountMin, c.amountMax, c.amountText),
          }))
      }
    } catch (err) {
      // Related grants are a nice-to-have — never let this break the detail response
      console.warn('[Grant Detail] Related grants query failed:', err)
    }

    return NextResponse.json({
      ...baseResponse,
      relatedGrants,

      // Eligibility assessment
      appliesToUser,
      eligibilityAssessment: {
        isEligible: eligibilityResult.isEligible,
        confidence: eligibilityResult.confidenceLevel,
        reasons: eligibilityReasons.slice(0, 3),
        warnings: eligibilityResult.warnings.slice(0, 3),
        suggestions: eligibilityResult.suggestions.slice(0, 2),
        passedFilters: eligibilityResult.passedFilters,
        failedFilters: eligibilityResult.failedFilters,
      },

      // Match scoring
      matchScore: {
        total: scoringResult.totalScore,
        tier: scoringResult.tier,
        tierLabel: scoringResult.tierLabel,
        confidence: scoringResult.confidenceLevel,
        breakdown: scoringResult.breakdown,
        reasons: scoringResult.matchReasons.slice(0, 5),
        warnings: scoringResult.warnings.slice(0, 3),
      },

      // AI analysis
      aiAnalysis: aiAnalysis ? {
        fitSummary: aiAnalysis.fitSummary,
        whyMatch: aiAnalysis.whyMatch,
        eligibilityStatus: aiAnalysis.eligibilityStatus,
        matchScore: aiAnalysis.matchScore,
        confidence: aiAnalysis.confidence,
        nextSteps: aiAnalysis.nextSteps,
        whatYouCanFund: aiAnalysis.whatYouCanFund,
        concerns: aiAnalysis.concerns,
        urgency: aiAnalysis.urgency,
        difficultyLevel: aiAnalysis.difficultyLevel,
        estimatedTimeToApply: aiAnalysis.estimatedTimeToApply,
      } : null,

      // Meta
      profileComplete: true,
      aiEnabled: isGeminiConfigured(),
    })

  } catch (error) {
    console.error('[Grant Detail] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grant' },
      { status: 500 }
    )
  }
}
