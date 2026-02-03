import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse, getClientIdentifier } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import { searchAllSources, type GrantSearchParams, type NormalizedGrant } from '@/lib/services/grant-sources'
import { matchGrantsWithGemini, preFilterForAccessibility, type GrantForMatching } from '@/lib/services/gemini-grant-matching'
import { isGeminiConfigured } from '@/lib/services/gemini-client'

const DISCOVER_LIMIT = 20

/**
 * Map industry tags to keywords for API search
 */
function getKeywordsFromIndustry(industryTags: string[]): string {
  const keywordMap: Record<string, string[]> = {
    'agriculture': ['agriculture', 'farm', 'rural', 'usda', 'crop', 'livestock', 'agricultural'],
    'arts_culture': ['arts', 'culture', 'museum', 'humanities', 'nea', 'neh'],
    'business': ['small business', 'sbir', 'sttr', 'entrepreneur'],
    'climate': ['climate', 'environmental', 'clean energy', 'conservation', 'epa'],
    'community': ['community development', 'cdbg', 'neighborhood'],
    'education': ['education', 'school', 'k-12', 'higher education'],
    'health': ['health', 'medical', 'nih', 'healthcare', 'clinical'],
    'housing': ['housing', 'hud', 'affordable housing'],
    'infrastructure': ['infrastructure', 'transportation', 'broadband'],
    'nonprofit': ['nonprofit', 'charitable', '501c'],
    'research': ['research', 'nsf', 'scientific'],
    'technology': ['technology', 'innovation', 'digital', 'cyber'],
    'workforce': ['workforce', 'job training', 'employment'],
    'youth': ['youth', 'children', 'family'],
  }

  const keywords: string[] = []
  for (const tag of industryTags) {
    const mapped = keywordMap[tag.toLowerCase()]
    if (mapped) {
      keywords.push(...mapped)
    }
  }

  return [...new Set(keywords)].slice(0, 4).join(' OR ')
}

/**
 * GET /api/grants/discover
 *
 * Returns personalized grants using Gemini AI for intelligent matching.
 * Gemini understands context and filters out irrelevant grants.
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

    // Fetch grants from LIVE API sources
    let grants = await fetchGrantsFromAPIs(profile)

    if (grants.length === 0) {
      // Fallback to database
      const dbGrants = await fetchGrantsFromDatabase(profile)
      if (dbGrants.length === 0) {
        return NextResponse.json({
          grants: [],
          total: 0,
          profileComplete: true,
          message: 'No grants found matching your criteria. Try broadening your profile interests.',
          aiEnabled: isGeminiConfigured(),
        })
      }
      grants = dbGrants
    }

    console.log(`Discover - Found ${grants.length} raw grants`)

    // Convert to matching format
    let grantsForMatching: GrantForMatching[] = grants.slice(0, 100).map(g => ({
      id: g.id,
      title: g.title,
      sponsor: g.sponsor,
      summary: g.summary,
      description: g.description,
      categories: safeJsonParse<string[]>(g.categories, []),
      eligibility: safeJsonParse<{ tags?: string[] }>(g.eligibility, {}).tags || [],
      amountMin: g.amountMin || undefined,
      amountMax: g.amountMax || undefined,
      deadlineDate: g.deadlineDate,
      url: g.url,
    }))

    // PRE-FILTER: Remove grants that are clearly not accessible to regular people
    // (Research grants, huge contracts, institutional requirements, etc.)
    grantsForMatching = preFilterForAccessibility(grantsForMatching)
    console.log(`Discover - After accessibility pre-filter: ${grantsForMatching.length} grants`)

    // Send to Gemini for intelligent matching (limit to 50 to manage API costs)
    const geminiResults = await matchGrantsWithGemini(grantsForMatching.slice(0, 50), profile)

    console.log(`Discover - Gemini returned ${geminiResults.length} relevant grants`)

    if (geminiResults.length === 0) {
      // Gemini found nothing relevant - return empty with message
      return NextResponse.json({
        grants: [],
        total: 0,
        profileComplete: true,
        message: `No grants found that match your ${profile.industryTags?.join(', ') || ''} focus. Try updating your profile or browsing all grants.`,
        aiEnabled: isGeminiConfigured(),
      })
    }

    // Build final response with Gemini's enriched data
    const finalGrants = geminiResults
      .sort((a, b) => {
        if (sortBy === 'deadline_soon') {
          const grantA = grants.find(g => g.id === a.grantId)
          const grantB = grants.find(g => g.id === b.grantId)
          const deadlineA = grantA?.deadlineDate?.getTime() ?? Infinity
          const deadlineB = grantB?.deadlineDate?.getTime() ?? Infinity
          return deadlineA - deadlineB
        }
        if (sortBy === 'highest_funding') {
          const grantA = grants.find(g => g.id === a.grantId)
          const grantB = grants.find(g => g.id === b.grantId)
          return (grantB?.amountMax ?? 0) - (grantA?.amountMax ?? 0)
        }
        return b.matchScore - a.matchScore
      })
      .slice(0, limit)
      .map(result => {
        const grant = grants.find(g => g.id === result.grantId)
        if (!grant) return null

        return {
          ...formatGrantForResponse(grant),
          // Match scores
          fitScore: result.matchScore,
          accessibilityScore: result.accessibilityScore,
          // AI explanations
          fitSummary: result.fitSummary,
          eligibilityStatus: result.eligibilityStatus,
          nextSteps: result.nextSteps,
          whatYouCanFund: result.whatYouCanFund,
          matchReasons: result.reasons,
          warnings: result.concerns,
          urgency: result.urgency,
          // NEW: Application difficulty info
          difficultyLevel: result.difficultyLevel,
          estimatedTimeToApply: result.estimatedTimeToApply,
        }
      })
      .filter(Boolean)

    return NextResponse.json({
      grants: finalGrants,
      total: finalGrants.length,
      profileComplete: true,
      aiEnabled: isGeminiConfigured(),
      aiProvider: 'gemini',
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
    const keywords = profile.industryTags?.length ? getKeywordsFromIndustry(profile.industryTags) : ''

    const searchParams: GrantSearchParams = {
      keyword: keywords,
      categories: profile.industryTags || [],
      state: profile.state || undefined,
      status: 'open',
      limit: 100,
    }

    console.log('Discover - Searching APIs with:', { keywords, state: profile.state })

    // Determine which sources to search
    const sourcesToSearch = ['grants-gov', 'usda-grants']
    if (profile.state === 'CA') sourcesToSearch.push('california-grants')
    if (profile.state === 'NY') sourcesToSearch.push('ny-state-grants')
    if (profile.state === 'TX') sourcesToSearch.push('texas-grants')

    const { allGrants, errors } = await searchAllSources(searchParams, sourcesToSearch)

    if (errors.length > 0) {
      console.warn('API errors:', errors)
    }

    console.log(`Discover - Found ${allGrants.length} grants from APIs`)

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
      qualityScore: 0.7,
      aiSummary: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  } catch (error) {
    console.error('Failed to fetch from APIs:', error)
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

  if (profile.state) {
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
    take: 200,
  })
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

function formatFundingRange(min: number | null, max: number | null, text?: string | null): string {
  if (text) return text
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  if (max) return `Up to $${max.toLocaleString()}`
  if (min) return `From $${min.toLocaleString()}`
  return 'Varies'
}
