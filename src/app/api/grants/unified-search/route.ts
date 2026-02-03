import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { searchGrants, type GrantSearchParams, type NormalizedGrant } from '@/lib/services/grant-sources'
import { calculateRelevance, type GrantForRelevance } from '@/lib/relevance/engine'
import { UserProfile, EntityType } from '@/lib/types/onboarding'
import { safeJsonParse } from '@/lib/api-utils'
import { rateLimiters, rateLimitExceededResponse, getClientIdentifier } from '@/lib/rate-limit'

/**
 * STRICT CATEGORY KEYWORDS - grants must contain these to match a category search
 * This prevents irrelevant grants from appearing when user searches by category
 */
const STRICT_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'agriculture': [
    'agriculture', 'agricultural', 'farm', 'farmer', 'farming', 'ranch', 'rancher',
    'rural', 'crop', 'livestock', 'cattle', 'poultry', 'usda', 'food production',
    'agribusiness', 'soil', 'irrigation', 'harvest', 'seed', 'grain', 'dairy',
    'organic farm', 'conservation land', 'pasture', 'grazing', 'horticulture',
    'farmland', 'beginning farmer', 'young farmer', 'agricu', 'vineyard', 'orchard',
    'nursery', 'aquaculture', 'fishery', 'forestry', 'timber', 'woodland',
    'agroforestry', 'pollinator', 'cooperative extension', 'rural development',
    'rural business', 'rural community',
  ],
  'small business': [
    'small business', 'sbir', 'sttr', 'entrepreneur', 'startup', 'sba',
    'business development', 'commercialization', 'enterprise', 'venture',
    'minority business', 'women-owned', 'veteran-owned',
  ],
  'technology': [
    'technology', 'tech', 'digital', 'software', 'cyber', 'artificial intelligence',
    'data', 'computing', 'information technology', 'internet', 'broadband',
    'telecommunications', 'innovation', 'sbir', 'sttr',
  ],
  'climate': [
    'climate', 'environment', 'environmental', 'energy', 'conservation', 'sustainability',
    'epa', 'renewable', 'clean energy', 'carbon', 'emissions', 'green', 'solar',
    'wind energy', 'geothermal', 'recycling', 'waste reduction', 'pollution',
  ],
  'education': [
    'education', 'school', 'learning', 'training', 'academic', 'student',
    'teacher', 'curriculum', 'educational', 'k-12', 'higher education', 'university',
    'college', 'classroom', 'literacy', 'stem education',
  ],
  'health': [
    'health', 'medical', 'wellness', 'nih', 'clinical', 'disease', 'mental health',
    'healthcare', 'hospital', 'patient', 'treatment', 'therapy', 'nursing',
    'public health', 'medicine', 'biomedical', 'pharmaceutical',
  ],
  'research': [
    'research', 'science', 'nsf', 'study', 'r&d', 'scientific',
    'laboratory', 'experiment', 'investigation', 'academic research',
  ],
}

/**
 * Filter grants strictly by keyword/category
 * Only returns grants that clearly match the search term
 */
function filterByKeywordStrict(grants: NormalizedGrant[], keyword: string): NormalizedGrant[] {
  const keywordLower = keyword.toLowerCase().trim()

  // Check if this is a known category with strict keywords
  const strictKeywords = STRICT_CATEGORY_KEYWORDS[keywordLower]

  if (strictKeywords) {
    // Use strict category filtering
    return grants.filter(grant => {
      const titleLower = grant.title?.toLowerCase() || ''
      const sponsorLower = grant.sponsor?.toLowerCase() || ''
      const summaryLower = grant.summary?.toLowerCase() || ''
      const categoriesLower = (grant.categories || []).map(c => c.toLowerCase()).join(' ')
      const combinedText = `${titleLower} ${sponsorLower} ${summaryLower} ${categoriesLower}`

      // Grant must contain at least one of the strict keywords
      return strictKeywords.some(kw => combinedText.includes(kw))
    })
  }

  // For non-category searches, just do basic keyword matching
  // but be more strict - the keyword must appear in title, sponsor, or categories
  return grants.filter(grant => {
    const titleLower = grant.title?.toLowerCase() || ''
    const sponsorLower = grant.sponsor?.toLowerCase() || ''
    const categoriesLower = (grant.categories || []).map(c => c.toLowerCase()).join(' ')
    const searchText = `${titleLower} ${sponsorLower} ${categoriesLower}`

    return searchText.includes(keywordLower)
  })
}

/**
 * Convert NormalizedGrant to GrantForRelevance format
 */
function toGrantForRelevance(grant: NormalizedGrant): GrantForRelevance {
  return {
    id: grant.id,
    title: grant.title,
    sponsor: grant.sponsor,
    categories: grant.categories || [],
    eligibility: {
      tags: grant.eligibility || [],
      rawText: undefined,
    },
    locations: (grant.locations || []).map(loc => {
      // Parse location strings into structured format
      const locLower = loc.toLowerCase()
      if (locLower === 'national' || locLower === 'nationwide' || locLower === 'all states') {
        return { type: 'national' as const }
      }
      // Check for US state codes (2 uppercase letters)
      if (/^[A-Z]{2}$/.test(loc)) {
        return { type: 'state' as const, value: loc }
      }
      // Assume state name
      return { type: 'state' as const, value: loc }
    }),
    amountMin: grant.amountMin || undefined,
    amountMax: grant.amountMax || undefined,
    deadlineDate: grant.deadlineDate || undefined,
  }
}

/**
 * Map entity type to eligibility string for API filtering
 */
function mapEntityToEligibility(entityType: string): string {
  const mapping: Record<string, string> = {
    individual: 'Individual',
    nonprofit: 'Nonprofit',
    small_business: 'Small Business',
    for_profit: 'For-Profit',
    educational: 'Educational Institution',
    government: 'Government',
    tribal: 'Tribal',
  }
  return mapping[entityType] || entityType
}

/**
 * GET /api/grants/unified-search
 *
 * Search grants using Gemini AI discovery.
 * When user is logged in, applies relevance filtering based on their profile.
 *
 * Query params:
 * - q: Search keyword
 * - state: Filter by state code (e.g., CA, NY)
 * - agency: Filter by agency
 * - status: 'open', 'forecasted', 'closed', 'all' (default: open)
 * - category: Filter by category
 * - limit: Max results (default: 25, max: 100)
 * - offset: Pagination offset
 * - useProfile: 'true' to apply profile-based filtering (default: true for logged-in users)
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = rateLimiters.search(clientId)
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetAt)
  }

  try {
    const searchParams = request.nextUrl.searchParams

    const keyword = searchParams.get('q') || undefined
    const state = searchParams.get('state') || undefined
    const status = (searchParams.get('status') || 'open') as GrantSearchParams['status']
    const category = searchParams.get('category') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)
    const useProfileParam = searchParams.get('useProfile')

    // Get user profile if logged in
    let userProfile: UserProfile | null = null
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (dbProfile && dbProfile.onboardingCompleted) {
        userProfile = {
          id: dbProfile.id,
          userId: dbProfile.userId,
          entityType: dbProfile.entityType as UserProfile['entityType'],
          country: dbProfile.country,
          state: dbProfile.state,
          industryTags: safeJsonParse<string[]>(dbProfile.industryTags, []),
          sizeBand: dbProfile.sizeBand as UserProfile['sizeBand'],
          stage: dbProfile.stage as UserProfile['stage'],
          annualBudget: dbProfile.annualBudget as UserProfile['annualBudget'],
          industryAttributes: safeJsonParse<Record<string, string | string[] | boolean>>(dbProfile.industryAttributes, {}),
          grantPreferences: safeJsonParse<UserProfile['grantPreferences']>(dbProfile.grantPreferences, { preferredSize: null, timeline: null, complexity: null }),
          onboardingCompleted: dbProfile.onboardingCompleted,
          onboardingCompletedAt: dbProfile.onboardingCompletedAt,
          onboardingStep: dbProfile.onboardingStep,
          confidenceScore: dbProfile.confidenceScore,
        }
      }
    }

    // Determine if we should use profile filtering
    const shouldUseProfile = useProfileParam !== 'false' && userProfile !== null

    // Build search params - use profile data to enhance search if available
    const params: GrantSearchParams = {
      keyword,
      state: state || (shouldUseProfile && userProfile?.state ? userProfile.state : undefined),
      status,
      categories: category ? [category] : (shouldUseProfile && userProfile?.industryTags?.length ? userProfile.industryTags : undefined),
      limit: shouldUseProfile ? limit * 3 : limit,
    }

    // Build profile for search
    const searchProfile = shouldUseProfile && userProfile ? {
      entityType: userProfile.entityType as EntityType,
      industryTags: userProfile.industryTags,
      state: userProfile.state || undefined,
    } : undefined

    // Search using Gemini AI
    const result = await searchGrants(params, searchProfile)
    let processedGrants = result.grants as Array<NormalizedGrant & { relevance?: { score: number; isEligible: boolean; matchReasons: string[]; warnings: string[] } }>

    // STRICT CATEGORY FILTERING: When user searches by category/keyword, apply strict filtering
    if (keyword) {
      processedGrants = filterByKeywordStrict(processedGrants, keyword) as typeof processedGrants
    }

    // Minimum score threshold - only show grants that are actually relevant
    const minRelevanceScore = 30

    if (shouldUseProfile && userProfile) {
      // Calculate relevance for each grant
      const grantsWithRelevance = processedGrants.map(grant => {
        const grantForRelevance = toGrantForRelevance(grant)
        const relevance = calculateRelevance(grantForRelevance, userProfile)
        return {
          ...grant,
          relevance: {
            score: relevance.relevanceScore,
            isEligible: relevance.isEligible,
            matchReasons: relevance.matchReasons,
            warnings: relevance.warnings,
            breakdown: relevance.breakdown,
          },
        }
      })

      // Filter out ineligible grants AND low-relevance grants, then sort by relevance score
      processedGrants = grantsWithRelevance
        .filter(g => g.relevance.isEligible && g.relevance.score >= minRelevanceScore)
        .sort((a, b) => {
          // Primary sort: relevance score (descending)
          const scoreDiff = b.relevance.score - a.relevance.score
          if (Math.abs(scoreDiff) > 5) return scoreDiff

          // Secondary sort: deadline (ascending - closer deadlines first)
          const dateA = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Infinity
          const dateB = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Infinity
          return dateA - dateB
        })
    }

    // Apply global limit to combined results
    const paginatedGrants = processedGrants.slice(0, limit)

    return NextResponse.json({
      grants: paginatedGrants,
      totalCount: processedGrants.length,
      sources: [{
        name: 'gemini-ai',
        label: 'Gemini AI Discovery',
        count: paginatedGrants.length,
        total: result.total,
        cached: false,
        error: result.error,
      }],
      profileApplied: shouldUseProfile,
      query: {
        keyword,
        state,
        status,
        category,
        limit,
      },
    })
  } catch (error) {
    console.error('Unified search error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Search failed', message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/grants/unified-search
 *
 * Search with advanced filters in request body.
 * Supports profile-based relevance filtering.
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientId = getClientIdentifier(request)
  const rateLimit = rateLimiters.search(clientId)
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetAt)
  }

  try {
    const body = await request.json()

    const {
      keyword,
      state,
      status = 'open',
      categories,
      limit = 25,
      useProfile = true,
    } = body

    // Get user profile if logged in
    let userProfile: UserProfile | null = null
    const session = await getServerSession(authOptions)

    if (session?.user?.id && useProfile) {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (dbProfile && dbProfile.onboardingCompleted) {
        userProfile = {
          id: dbProfile.id,
          userId: dbProfile.userId,
          entityType: dbProfile.entityType as UserProfile['entityType'],
          country: dbProfile.country,
          state: dbProfile.state,
          industryTags: safeJsonParse<string[]>(dbProfile.industryTags, []),
          sizeBand: dbProfile.sizeBand as UserProfile['sizeBand'],
          stage: dbProfile.stage as UserProfile['stage'],
          annualBudget: dbProfile.annualBudget as UserProfile['annualBudget'],
          industryAttributes: safeJsonParse<Record<string, string | string[] | boolean>>(dbProfile.industryAttributes, {}),
          grantPreferences: safeJsonParse<UserProfile['grantPreferences']>(dbProfile.grantPreferences, { preferredSize: null, timeline: null, complexity: null }),
          onboardingCompleted: dbProfile.onboardingCompleted,
          onboardingCompletedAt: dbProfile.onboardingCompletedAt,
          onboardingStep: dbProfile.onboardingStep,
          confidenceScore: dbProfile.confidenceScore,
        }
      }
    }

    const shouldUseProfile = useProfile && userProfile !== null

    // Build search params with profile enhancement
    const params: GrantSearchParams = {
      keyword,
      state: state || (shouldUseProfile && userProfile?.state ? userProfile.state : undefined),
      status,
      categories: categories || (shouldUseProfile && userProfile?.industryTags?.length ? userProfile.industryTags : undefined),
      limit: shouldUseProfile ? Math.min(limit * 3, 300) : Math.min(limit, 100),
    }

    // Build profile for search
    const searchProfile = shouldUseProfile && userProfile ? {
      entityType: userProfile.entityType as EntityType,
      industryTags: userProfile.industryTags,
      state: userProfile.state || undefined,
    } : undefined

    const result = await searchGrants(params, searchProfile)
    let processedGrants = result.grants as Array<NormalizedGrant & { relevance?: { score: number; isEligible: boolean; matchReasons: string[]; warnings: string[] } }>

    // STRICT CATEGORY FILTERING: When user searches by category/keyword, apply strict filtering
    if (keyword) {
      processedGrants = filterByKeywordStrict(processedGrants, keyword) as typeof processedGrants
    }

    // Minimum score threshold for profile-based filtering
    const minRelevanceScore = 30

    if (shouldUseProfile && userProfile) {
      const grantsWithRelevance = processedGrants.map(grant => {
        const grantForRelevance = toGrantForRelevance(grant)
        const relevance = calculateRelevance(grantForRelevance, userProfile)
        return {
          ...grant,
          relevance: {
            score: relevance.relevanceScore,
            isEligible: relevance.isEligible,
            matchReasons: relevance.matchReasons,
            warnings: relevance.warnings,
            breakdown: relevance.breakdown,
          },
        }
      })

      // Filter out ineligible AND low-relevance grants
      processedGrants = grantsWithRelevance
        .filter(g => g.relevance.isEligible && g.relevance.score >= minRelevanceScore)
        .sort((a, b) => {
          const scoreDiff = b.relevance.score - a.relevance.score
          if (Math.abs(scoreDiff) > 5) return scoreDiff
          const dateA = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Infinity
          const dateB = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Infinity
          return dateA - dateB
        })
    }

    const paginatedGrants = processedGrants.slice(0, limit)

    return NextResponse.json({
      grants: paginatedGrants,
      totalCount: processedGrants.length,
      sources: [{
        name: 'gemini-ai',
        label: 'Gemini AI Discovery',
        count: paginatedGrants.length,
        total: result.total,
        cached: false,
        error: result.error,
      }],
      profileApplied: shouldUseProfile,
    })
  } catch (error) {
    console.error('Unified search error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Search failed', message },
      { status: 500 }
    )
  }
}
