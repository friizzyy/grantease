import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  openaiMatching,
  simpleKeywordMatch,
  OrganizationProfile,
  GrantForMatching,
} from '@/lib/services/openai-matching'
import { searchAllSources, type GrantSearchParams } from '@/lib/services/grant-sources'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile, INDUSTRY_CATEGORIES } from '@/lib/types/onboarding'

/**
 * Map industry tags to Grants.gov funding categories
 */
function mapIndustryToCategories(industryTags: string[]): string[] {
  const categoryMap: Record<string, string[]> = {
    'agriculture': ['AG', 'NR', 'FN'],
    'arts_culture': ['AR', 'HU'],
    'business': ['BC', 'ED'],
    'climate': ['ENV', 'EN', 'NR'],
    'community': ['CD', 'HO', 'IS'],
    'education': ['ED'],
    'health': ['HE', 'HL'],
    'housing': ['HO', 'CD'],
    'infrastructure': ['TR', 'CD', 'EN'],
    'nonprofit': ['CD', 'IS'],
    'research': ['ST', 'RD'],
    'technology': ['ST', 'BC'],
    'workforce': ['ELT', 'ED'],
    'youth': ['IS', 'ED'],
  }

  const categories: string[] = []
  for (const tag of industryTags) {
    const mapped = categoryMap[tag.toLowerCase()]
    if (mapped) {
      categories.push(...mapped)
    }
  }
  return [...new Set(categories)]
}

/**
 * Map entity type to eligibility strings
 */
function mapEntityToEligibility(entityType: string): string[] {
  const mapping: Record<string, string[]> = {
    individual: ['Individual', 'Unrestricted'],
    nonprofit: ['Nonprofit', '501(c)(3)', 'Private nonprofit', 'Public nonprofit'],
    small_business: ['Small Business', 'For-Profit', 'Small business'],
    for_profit: ['For-Profit', 'Business', 'Private'],
    educational: ['Educational Institution', 'Public/Private', 'Higher Education', 'School'],
    government: ['Government', 'State', 'Local', 'County', 'Municipal'],
    tribal: ['Tribal', 'Native American', 'Indian Tribe'],
  }
  return mapping[entityType] || []
}

/**
 * Get keywords from industry tags
 */
function getKeywordsFromIndustry(industryTags: string[]): string {
  const keywordMap: Record<string, string[]> = {
    'agriculture': ['agriculture', 'farm', 'rural', 'crop', 'livestock', 'food', 'usda'],
    'arts_culture': ['arts', 'culture', 'museum', 'heritage', 'creative'],
    'business': ['business', 'entrepreneurship', 'commerce', 'economic development'],
    'climate': ['climate', 'environment', 'sustainability', 'clean energy', 'conservation'],
    'community': ['community', 'neighborhood', 'local', 'civic'],
    'education': ['education', 'school', 'learning', 'training', 'academic'],
    'health': ['health', 'medical', 'wellness', 'healthcare', 'clinical'],
    'housing': ['housing', 'affordable housing', 'shelter', 'homelessness'],
    'infrastructure': ['infrastructure', 'transportation', 'broadband', 'water'],
    'nonprofit': ['nonprofit', 'charitable', 'community service'],
    'research': ['research', 'science', 'innovation', 'study'],
    'technology': ['technology', 'innovation', 'digital', 'tech', 'software'],
    'workforce': ['workforce', 'job training', 'employment', 'career'],
    'youth': ['youth', 'children', 'family', 'early childhood'],
  }

  const keywords: string[] = []
  for (const tag of industryTags) {
    const mapped = keywordMap[tag.toLowerCase()]
    if (mapped) {
      keywords.push(...mapped)
    }
  }

  // Return as OR query
  return [...new Set(keywords)].slice(0, 5).join(' OR ')
}

/**
 * POST /api/grants/match
 *
 * AI-powered grant matching based on user profile.
 * Now searches LIVE grants from APIs based on profile categories.
 *
 * Request body:
 * - maxResults: number (default: 15)
 * - minScore: number (default: 40)
 * - useLiveSearch: boolean (default: true) - search live grants or use DB only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit AI matching - uses more resources
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    const body = await request.json()
    const {
      maxResults = 15,
      minScore = 40,
      useLiveSearch = true,
    } = body

    // Get user's profile from database
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dbProfile || !dbProfile.onboardingCompleted) {
      return NextResponse.json({
        error: 'Profile not complete',
        message: 'Please complete your profile to get personalized grant matches',
        matches: [],
        totalAnalyzed: 0,
        method: 'none',
        profileComplete: false,
      }, { status: 400 })
    }

    // Parse the user profile
    const userProfile: UserProfile = {
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

    // Build organization profile for matching
    const profile: OrganizationProfile = {
      name: session.user.name || 'Organization',
      type: userProfile.entityType || 'nonprofit',
      focusAreas: userProfile.industryTags || [],
      location: userProfile.state || undefined,
      size: userProfile.sizeBand || undefined,
      stage: userProfile.stage || undefined,
    }

    let grants: GrantForMatching[] = []

    if (useLiveSearch && userProfile.industryTags.length > 0) {
      // Search LIVE grants from APIs based on profile
      const keywords = getKeywordsFromIndustry(userProfile.industryTags)
      const categories = mapIndustryToCategories(userProfile.industryTags)

      console.log('AI Match - Searching with:', { keywords, categories, state: userProfile.state })

      const searchParams: GrantSearchParams = {
        keyword: keywords,
        categories: userProfile.industryTags, // Use raw industry tags
        state: userProfile.state || undefined,
        status: 'open',
        limit: 100, // Get more to allow for filtering
      }

      // Determine which sources to search based on profile
      const sourcesToSearch = ['grants-gov', 'usda-grants']

      // Add state-specific sources
      if (userProfile.state === 'CA') sourcesToSearch.push('california-grants')
      if (userProfile.state === 'NY') sourcesToSearch.push('ny-state-grants')
      if (userProfile.state === 'TX') sourcesToSearch.push('texas-grants')

      try {
        const { allGrants } = await searchAllSources(searchParams, sourcesToSearch)

        grants = allGrants.map(g => ({
          id: g.id,
          title: g.title,
          sponsor: g.sponsor,
          summary: g.summary || '',
          categories: g.categories || [],
          eligibility: g.eligibility || [],
          amountMin: g.amountMin,
          amountMax: g.amountMax,
          deadlineDate: g.deadlineDate,
          url: g.url,
          sourceName: g.sourceName,
        }))

        console.log(`AI Match - Found ${grants.length} live grants`)
      } catch (error) {
        console.error('Live search failed, falling back to DB:', error)
      }
    }

    // If no live grants or live search disabled, fall back to database
    if (grants.length === 0) {
      const dbGrants = await prisma.grant.findMany({
        where: {
          status: 'open',
          OR: [
            { deadlineDate: null },
            { deadlineDate: { gte: new Date() } },
          ],
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
      })

      grants = dbGrants.map(g => ({
        id: g.id,
        title: g.title,
        sponsor: g.sponsor,
        summary: g.summary || '',
        categories: parseJsonArray(g.categories),
        eligibility: parseJsonArray(g.eligibility),
        amountMin: g.amountMin,
        amountMax: g.amountMax,
        deadlineDate: g.deadlineDate,
      }))
    }

    if (grants.length === 0) {
      return NextResponse.json({
        matches: [],
        summary: 'No grants available for matching. Try broadening your profile interests.',
        totalAnalyzed: 0,
        method: 'none',
        profileComplete: true,
        profile: {
          entityType: userProfile.entityType,
          industryTags: userProfile.industryTags,
          state: userProfile.state,
        },
      })
    }

    // Perform matching
    let result
    let method: 'ai' | 'keyword'
    const startTime = Date.now()

    if (openaiMatching.isConfigured()) {
      try {
        result = await openaiMatching.matchGrants(profile, grants, {
          maxResults,
          minScore,
        })
        method = 'ai'

        // Log AI usage for successful AI matching
        const responseTime = Date.now() - startTime
        await prisma.aIUsageLog.create({
          data: {
            userId: session.user.id,
            type: 'match',
            model: 'gpt-4o-mini',
            responseTime,
            success: true,
            metadata: JSON.stringify({
              grantsAnalyzed: grants.length,
              matchesFound: result.matches.length,
              method: 'ai',
              profileCategories: userProfile.industryTags,
            }),
          },
        })
      } catch (error) {
        console.error('OpenAI matching failed, falling back to keyword:', error)
        const matches = simpleKeywordMatch(profile, grants)
          .filter(m => m.score >= minScore)
          .slice(0, maxResults)
        result = {
          matches,
          summary: 'Matched using keyword analysis',
          totalAnalyzed: grants.length,
        }
        method = 'keyword'

        // Log failed AI attempt
        await prisma.aIUsageLog.create({
          data: {
            userId: session.user.id,
            type: 'match',
            model: 'gpt-4o-mini',
            responseTime: Date.now() - startTime,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            metadata: JSON.stringify({ fallback: 'keyword' }),
          },
        })
      }
    } else {
      // Use enhanced keyword matching with profile data
      const matches = enhancedKeywordMatch(profile, grants, userProfile)
        .filter(m => m.score >= minScore)
        .slice(0, maxResults)
      result = {
        matches,
        summary: `Found ${matches.length} grants matching your ${userProfile.industryTags.join(', ')} focus areas`,
        totalAnalyzed: grants.length,
      }
      method = 'keyword'
    }

    // Enrich matches with grant details
    const enrichedMatches = result.matches.map(match => {
      const grant = grants.find(g => g.id === match.grantId)
      return {
        ...match,
        grant: grant || null,
      }
    })

    return NextResponse.json({
      matches: enrichedMatches,
      summary: result.summary,
      totalAnalyzed: result.totalAnalyzed,
      method,
      profileComplete: true,
      profile: {
        entityType: userProfile.entityType,
        industryTags: userProfile.industryTags,
        state: userProfile.state,
      },
    })
  } catch (error) {
    console.error('Grant matching error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Matching failed', message }, { status: 500 })
  }
}

/**
 * GET /api/grants/match
 *
 * Get quick matches based on user's saved profile.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const maxResults = parseInt(searchParams.get('limit') || '15')

    // Redirect to POST with empty body
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxResults }),
    })

    return POST(postRequest as unknown as NextRequest)
  } catch (error) {
    console.error('Grant matching error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Matching failed', message }, { status: 500 })
  }
}

/**
 * Enhanced keyword matching that uses profile data
 */
function enhancedKeywordMatch(
  profile: OrganizationProfile,
  grants: GrantForMatching[],
  userProfile: UserProfile
): Array<{ grantId: string; score: number; reasons: string[] }> {
  const matches: Array<{ grantId: string; score: number; reasons: string[] }> = []

  // Build keyword sets from profile
  const focusAreas = profile.focusAreas || []
  const focusKeywords = new Set(
    focusAreas.flatMap(area => {
      const label = INDUSTRY_CATEGORIES.find(c => c.value === area)?.label || area
      return [area.toLowerCase(), label.toLowerCase(), ...label.toLowerCase().split(' ')]
    })
  )

  const eligibilityTerms = mapEntityToEligibility(profile.type)

  for (const grant of grants) {
    let score = 0
    const reasons: string[] = []

    const titleLower = grant.title.toLowerCase()
    const summaryLower = grant.summary.toLowerCase()
    const categoriesLower = grant.categories.map(c => c.toLowerCase())
    const eligibilityLower = grant.eligibility.map(e => e.toLowerCase())

    // Check focus area matches (up to 50 points)
    let focusMatches = 0
    for (const keyword of focusKeywords) {
      if (titleLower.includes(keyword) || summaryLower.includes(keyword)) {
        focusMatches++
      }
      if (categoriesLower.some(c => c.includes(keyword))) {
        focusMatches++
      }
    }
    if (focusMatches > 0) {
      const focusScore = Math.min(50, focusMatches * 15)
      score += focusScore
      reasons.push(`Matches your ${focusAreas.slice(0, 2).join(', ')} focus`)
    }

    // Check eligibility match (up to 30 points)
    let eligibilityMatch = false
    for (const term of eligibilityTerms) {
      if (eligibilityLower.some(e => e.includes(term.toLowerCase()))) {
        eligibilityMatch = true
        break
      }
    }
    // Also check if eligibility is empty (often means open to all)
    if (eligibilityMatch || grant.eligibility.length === 0) {
      score += 30
      reasons.push(`Open to ${profile.type.replace('_', ' ')} entities`)
    }

    // Check location match (up to 10 points)
    if (profile.location) {
      const locationLower = profile.location.toLowerCase()
      if (
        grant.eligibility.some(e => e.toLowerCase().includes(locationLower)) ||
        summaryLower.includes(locationLower) ||
        grant.categories.some(c => c.toLowerCase().includes(locationLower))
      ) {
        score += 10
        reasons.push(`Available in ${profile.location}`)
      }
    }

    // Check amount alignment with preferences (up to 10 points)
    if (userProfile.grantPreferences.preferredSize) {
      const { preferredSize } = userProfile.grantPreferences
      const minAmount = grant.amountMin || 0
      const maxAmount = grant.amountMax || Infinity

      const sizeMatch = (
        (preferredSize === 'micro' && maxAmount <= 10000) ||
        (preferredSize === 'small' && minAmount <= 50000 && maxAmount >= 10000) ||
        (preferredSize === 'medium' && minAmount <= 250000 && maxAmount >= 50000) ||
        (preferredSize === 'large' && minAmount >= 250000) ||
        preferredSize === 'any'
      )

      if (sizeMatch) {
        score += 10
        reasons.push('Grant size matches your preference')
      }
    }

    if (score > 0) {
      matches.push({ grantId: grant.id, score, reasons })
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score)
}

// Helper to parse JSON arrays safely
function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
