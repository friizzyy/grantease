import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { runHardFilters } from '@/lib/relevance/hard-filters'
import { calculateSoftScore } from '@/lib/relevance/soft-scoring'
import { GrantForRelevance } from '@/lib/relevance/types'
import { rerankWithLLM, isOpenAIConfigured } from '@/lib/services/openai-reranking'
import { rateLimiters, rateLimitExceededResponse, getClientIdentifier } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import { searchAllSources, type GrantSearchParams, type NormalizedGrant } from '@/lib/services/grant-sources'

const DISCOVER_LIMIT = 20
const SOFT_SCORE_THRESHOLD = 30
const CANDIDATES_FOR_RERANKING = 50

/**
 * Map industry tags to keywords for API search
 * These are SPECIFIC keywords that will be sent to the grant APIs
 * More focused = better results
 */
function getKeywordsFromIndustry(industryTags: string[]): string {
  const keywordMap: Record<string, string[]> = {
    // Agriculture - focus on actual farming/land keywords, not generic "food"
    'agriculture': ['agriculture', 'agricultural', 'farm', 'farming', 'rural development', 'usda', 'crop', 'livestock'],
    'arts_culture': ['arts', 'culture', 'museum', 'heritage', 'humanities', 'nea', 'neh'],
    'business': ['small business', 'sbir', 'sttr', 'entrepreneur', 'commercialization'],
    'climate': ['climate', 'environmental', 'clean energy', 'conservation', 'sustainability', 'epa'],
    'community': ['community development', 'cdbg', 'neighborhood', 'civic'],
    'education': ['education', 'school', 'k-12', 'higher education', 'stem'],
    'health': ['health', 'medical', 'nih', 'healthcare', 'clinical', 'biomedical'],
    'housing': ['housing', 'hud', 'affordable housing', 'homelessness'],
    'infrastructure': ['infrastructure', 'transportation', 'broadband', 'water system'],
    'nonprofit': ['nonprofit', 'charitable', '501c'],
    'research': ['research', 'nsf', 'scientific', 'r&d'],
    'technology': ['technology', 'innovation', 'digital', 'cyber', 'sbir'],
    'workforce': ['workforce', 'job training', 'employment', 'apprenticeship'],
    'youth': ['youth', 'children', 'family', 'juvenile'],
  }

  const keywords: string[] = []
  for (const tag of industryTags) {
    const mapped = keywordMap[tag.toLowerCase()]
    if (mapped) {
      keywords.push(...mapped)
    }
  }

  // Return as OR query - limit to 4 most specific keywords
  return [...new Set(keywords)].slice(0, 4).join(' OR ')
}

/**
 * GET /api/grants/discover
 *
 * Returns top 15-20 personalized grants for the authenticated user.
 * Uses 3-layer matching: hard filters → soft scoring → LLM reranking.
 */
export async function GET(request: NextRequest) {
  try {
    // Auth required
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimit = rateLimiters.general(clientId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'best_match'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), DISCOVER_LIMIT)

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dbProfile || !dbProfile.onboardingCompleted) {
      return NextResponse.json({
        grants: [],
        total: 0,
        profileComplete: false,
        message: 'Please complete your profile to see personalized grants',
      })
    }

    // Parse profile JSON fields
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
    }

    const profileVersion = dbProfile.profileVersion || 1

    // Fetch grants from LIVE API sources (not just database)
    let grants = await fetchGrantsFromAPIs(profile)

    if (grants.length === 0) {
      // Fallback to database if live APIs return nothing
      const dbGrants = await fetchGrantsFromDatabase(profile)
      if (dbGrants.length === 0) {
        return NextResponse.json({
          grants: [],
          total: 0,
          profileComplete: true,
          message: 'No grants found matching your criteria. Try broadening your profile interests.',
          aiEnabled: isOpenAIConfigured(),
        })
      }
      // Use database grants as fallback
      grants = dbGrants
    }

    // Apply hard filters
    const eligibleGrants = grants.filter((grant) => {
      const grantForRelevance = toGrantForRelevance(grant)
      const filterResult = runHardFilters(profile, grantForRelevance, { requireUrl: true })
      return filterResult.passes
    })

    if (eligibleGrants.length === 0) {
      // Fallback: relax filters slightly
      const relaxedGrants = grants.filter((grant) => {
        const grantForRelevance = toGrantForRelevance(grant)
        const filterResult = runHardFilters(profile, grantForRelevance, { requireUrl: false })
        return filterResult.passes
      }).slice(0, 10)

      if (relaxedGrants.length > 0) {
        return NextResponse.json({
          grants: relaxedGrants.map(formatGrantForResponse),
          total: relaxedGrants.length,
          profileComplete: true,
          relaxedFilters: true,
          message: 'Showing broader results',
        })
      }

      return NextResponse.json({
        grants: [],
        total: 0,
        profileComplete: true,
        message: 'No grants currently match your criteria. Try updating your profile.',
      })
    }

    // Apply soft scoring
    const scoredGrants = eligibleGrants.map((grant) => {
      const grantForRelevance = toGrantForRelevance(grant)
      const scoring = calculateSoftScore(profile, grantForRelevance)
      return {
        grant,
        score: scoring.totalScore,
        breakdown: scoring.breakdown,
        matchReasons: scoring.matchReasons,
        warnings: scoring.warnings,
      }
    })

    // Filter by minimum score and get top candidates
    const topCandidates = scoredGrants
      .filter((g) => g.score >= SOFT_SCORE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, CANDIDATES_FOR_RERANKING)

    if (topCandidates.length === 0) {
      // Show top grants even if below threshold
      const fallbackGrants = scoredGrants
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      return NextResponse.json({
        grants: fallbackGrants.map((g) => ({
          ...formatGrantForResponse(g.grant),
          fitScore: g.score,
          matchReasons: g.matchReasons,
          warnings: g.warnings,
        })),
        total: fallbackGrants.length,
        profileComplete: true,
        belowThreshold: true,
      })
    }

    // Prepare grants for reranking
    const grantsForReranking = topCandidates.map((g) => ({
      id: g.grant.id,
      title: g.grant.title,
      sponsor: g.grant.sponsor,
      summary: g.grant.summary,
      categories: safeJsonParse<string[]>(g.grant.categories, []),
      eligibility: safeJsonParse<{ tags?: string[] }>(g.grant.eligibility, {}).tags || [],
      amountMin: g.grant.amountMin || undefined,
      amountMax: g.grant.amountMax || undefined,
      deadlineDate: g.grant.deadlineDate || undefined,
      url: g.grant.url,
      updatedAt: g.grant.updatedAt,
    }))

    // LLM reranking with caching
    let rerankedResults = await rerankWithLLM(
      session.user.id,
      profile,
      grantsForReranking,
      profileVersion,
      limit
    )

    // Sort by requested order
    if (sortBy !== 'best_match') {
      rerankedResults = sortResults(rerankedResults, topCandidates, sortBy)
    }

    // Count cache statistics
    const cacheHits = rerankedResults.filter((r) => r.cached).length
    const cacheMisses = rerankedResults.filter((r) => !r.cached).length

    // Build final response
    const finalGrants = rerankedResults.map((result) => {
      const grantData = topCandidates.find((g) => g.grant.id === result.grantId)
      if (!grantData) return null

      return {
        ...formatGrantForResponse(grantData.grant),
        fitScore: result.fitScore,
        fitSummary: result.fitSummary,
        fitExplanation: result.fitExplanation,
        eligibilityStatus: result.eligibilityStatus,
        nextSteps: result.nextSteps,
        whatYouCanFund: result.whatYouCanFund,
        applicationTips: result.applicationTips,
        urgency: result.urgency,
        scoreBreakdown: grantData.breakdown,
        matchReasons: grantData.matchReasons,
        warnings: grantData.warnings,
      }
    }).filter(Boolean)

    return NextResponse.json({
      grants: finalGrants,
      total: finalGrants.length,
      profileComplete: true,
      cacheStats: {
        hits: cacheHits,
        misses: cacheMisses,
      },
      aiEnabled: isOpenAIConfigured(),
    })
  } catch (error) {
    console.error('Discover grants error:', error)
    return NextResponse.json(
      { error: 'Failed to load personalized grants' },
      { status: 500 }
    )
  }
}

/**
 * Fetch grants from LIVE API sources based on profile
 */
async function fetchGrantsFromAPIs(profile: UserProfile): Promise<Array<{
  id: string
  sourceId: string
  sourceName: string
  title: string
  sponsor: string
  summary: string
  description?: string | null
  categories: string
  eligibility: string
  locations: string
  amountMin: number | null
  amountMax: number | null
  amountText?: string | null
  deadlineType: string
  deadlineDate: Date | null
  url: string
  contact?: string | null
  requirements?: string | null
  status: string
  fundingType?: string | null
  purposeTags?: string
  qualityScore?: number
  aiSummary?: string | null
  createdAt: Date
  updatedAt: Date
}>> {
  try {
    // Build search params from profile
    const keywords = profile.industryTags?.length ? getKeywordsFromIndustry(profile.industryTags) : ''

    const searchParams: GrantSearchParams = {
      keyword: keywords,
      categories: profile.industryTags || [],
      state: profile.state || undefined,
      status: 'open',
      limit: 200, // Get more to allow for filtering
    }

    console.log('Discover - Searching LIVE APIs with:', { keywords, state: profile.state, industries: profile.industryTags })

    // Determine which sources to search based on profile
    const sourcesToSearch = ['grants-gov', 'usda-grants']

    // Add state-specific sources
    if (profile.state === 'CA') sourcesToSearch.push('california-grants')
    if (profile.state === 'NY') sourcesToSearch.push('ny-state-grants')
    if (profile.state === 'TX') sourcesToSearch.push('texas-grants')

    const { allGrants, errors } = await searchAllSources(searchParams, sourcesToSearch)

    if (errors.length > 0) {
      console.warn('Some API sources had errors:', errors)
    }

    console.log(`Discover - Found ${allGrants.length} grants from live APIs`)

    // Convert normalized grants to the format expected by the rest of the code
    return allGrants.map((g: NormalizedGrant) => ({
      id: g.id,
      sourceId: g.sourceId,
      sourceName: g.sourceName,
      title: g.title,
      sponsor: g.sponsor,
      summary: g.summary || '',
      description: g.description,
      categories: JSON.stringify(g.categories),
      eligibility: JSON.stringify({ tags: g.eligibility }),
      locations: JSON.stringify(g.locations.map(loc => ({ type: 'state', value: loc }))),
      amountMin: g.amountMin,
      amountMax: g.amountMax,
      amountText: g.amountText,
      deadlineType: g.deadlineType || 'hard',
      deadlineDate: g.deadlineDate,
      url: g.url,
      contact: g.contact,
      requirements: null,
      status: g.status,
      fundingType: g.type === 'contract' ? 'contract' : 'grant',
      purposeTags: JSON.stringify([]),
      qualityScore: 0.7, // Default quality score for live API results
      aiSummary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  } catch (error) {
    console.error('Failed to fetch from live APIs:', error)
    return []
  }
}

/**
 * Fetch grants from database (fallback)
 */
async function fetchGrantsFromDatabase(profile: UserProfile) {
  const where: Record<string, unknown> = {
    status: 'open',
    url: { not: '' },
  }

  // Filter by state if available
  if (profile.state) {
    // Include national grants and state-specific grants
    where.OR = [
      { locations: { contains: '"national"' } },
      { locations: { contains: profile.state } },
      { locations: { equals: '[]' } },
    ]
  }

  return prisma.grant.findMany({
    where,
    orderBy: [
      { qualityScore: 'desc' },
      { deadlineDate: 'asc' },
    ],
    take: 500, // Fetch more than needed for filtering
  })
}

/**
 * Convert database grant to GrantForRelevance
 */
function toGrantForRelevance(grant: {
  id: string
  title: string
  categories: string
  eligibility: string
  locations: string
  amountMin: number | null
  amountMax: number | null
  deadlineDate: Date | null
  sponsor: string
  url: string
  fundingType?: string | null
  purposeTags?: string
  qualityScore?: number
  aiSummary?: string | null
}): GrantForRelevance {
  return {
    id: grant.id,
    title: grant.title,
    categories: safeJsonParse<string[]>(grant.categories, []),
    eligibility: safeJsonParse<{ tags: string[]; rawText?: string }>(grant.eligibility, { tags: [] }),
    locations: safeJsonParse<Array<{ type: 'national' | 'state' | 'local'; value?: string }>>(
      grant.locations,
      []
    ),
    amountMin: grant.amountMin || undefined,
    amountMax: grant.amountMax || undefined,
    deadlineDate: grant.deadlineDate || undefined,
    sponsor: grant.sponsor,
    url: grant.url,
    fundingType: grant.fundingType || undefined,
    purposeTags: safeJsonParse<string[]>(grant.purposeTags || '[]', []),
    qualityScore: grant.qualityScore || 0.5,
    aiSummary: grant.aiSummary || undefined,
  }
}

/**
 * Format grant for API response
 */
function formatGrantForResponse(grant: {
  id: string
  sourceId: string
  sourceName: string
  title: string
  sponsor: string
  summary: string
  description?: string | null
  categories: string
  eligibility: string
  locations: string
  amountMin: number | null
  amountMax: number | null
  amountText?: string | null
  deadlineType: string
  deadlineDate: Date | null
  url: string
  contact?: string | null
  requirements?: string | null
  status: string
  fundingType?: string | null
  purposeTags?: string
  qualityScore?: number
  aiSummary?: string | null
}) {
  return {
    id: grant.id,
    sourceId: grant.sourceId,
    sourceName: grant.sourceName,
    title: grant.title,
    sponsor: grant.sponsor,
    summary: grant.summary,
    categories: safeJsonParse<string[]>(grant.categories, []),
    eligibility: safeJsonParse<{ tags: string[]; rawText?: string }>(grant.eligibility, { tags: [] }),
    locations: safeJsonParse<Array<{ type: string; value?: string }>>(grant.locations, []),
    amountMin: grant.amountMin,
    amountMax: grant.amountMax,
    amountText: grant.amountText,
    fundingRange: formatFundingRange(grant.amountMin, grant.amountMax, grant.amountText),
    deadlineType: grant.deadlineType,
    deadlineDate: grant.deadlineDate,
    url: grant.url,
    status: grant.status,
    fundingType: grant.fundingType || 'grant',
    purposeTags: safeJsonParse<string[]>(grant.purposeTags || '[]', []),
    qualityScore: grant.qualityScore || 0.5,
    aiSummary: grant.aiSummary,
  }
}

/**
 * Format funding range for display
 */
function formatFundingRange(min: number | null, max: number | null, text?: string | null): string {
  if (text) return text
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (max) return `Up to $${max.toLocaleString()}`
  if (min) return `From $${min.toLocaleString()}`
  return 'Varies'
}

/**
 * Sort results by different criteria
 */
function sortResults<T extends { grantId: string; fitScore: number }>(
  results: T[],
  candidates: Array<{ grant: { id: string; deadlineDate: Date | null; amountMax: number | null; createdAt: Date }; score: number }>,
  sortBy: string
): T[] {
  const candidateMap = new Map(candidates.map((c) => [c.grant.id, c]))

  return [...results].sort((a, b) => {
    const grantA = candidateMap.get(a.grantId)?.grant
    const grantB = candidateMap.get(b.grantId)?.grant

    if (!grantA || !grantB) return 0

    switch (sortBy) {
      case 'deadline_soon':
        const deadlineA = grantA.deadlineDate?.getTime() ?? Infinity
        const deadlineB = grantB.deadlineDate?.getTime() ?? Infinity
        return deadlineA - deadlineB

      case 'highest_funding':
        const amountA = grantA.amountMax ?? 0
        const amountB = grantB.amountMax ?? 0
        return amountB - amountA

      case 'newest':
        return grantB.createdAt.getTime() - grantA.createdAt.getTime()

      default:
        return b.fitScore - a.fitScore
    }
  })
}

// Note: safeJsonParse is imported from @/lib/api-utils
