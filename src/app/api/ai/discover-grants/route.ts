import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import {
  discoverGrants,
  searchGrantsByKeyword,
  findGrantsForNeed,
} from '@/lib/services/gemini-grant-discovery'
import { isGeminiConfigured } from '@/lib/services/gemini-client'
import { z } from 'zod'

const discoverGrantsSchema = z.object({
  mode: z.enum(['discover', 'search', 'need']).default('discover'),
  keyword: z.string().max(500).optional(),
  need: z.string().max(2000).optional(),
  searchFocus: z.enum(['new_grants', 'local_grants', 'foundation_grants', 'all']).optional(),
})

/**
 * POST /api/ai/discover-grants
 *
 * Use Gemini AI to search the web and discover grants in real-time
 *
 * Body:
 * - mode: 'discover' | 'search' | 'need'
 * - keyword?: string (for search mode)
 * - need?: string (for need mode)
 * - searchFocus?: 'new_grants' | 'local_grants' | 'foundation_grants' | 'all'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting (use AI rate limiter - this is an expensive operation)
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI grant discovery not configured. Please add GEMINI_API_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = discoverGrantsSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { mode, keyword, need, searchFocus } = validated.data

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Build profile object
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
    let grants: Awaited<ReturnType<typeof discoverGrants>>['grants'] = []
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

    switch (mode) {
      case 'search':
        if (!keyword) {
          return NextResponse.json(
            { error: 'Keyword required for search mode' },
            { status: 400 }
          )
        }
        {
          const result = await searchGrantsByKeyword(keyword, profile)
          grants = result.grants
          usage = result.usage
        }
        break

      case 'need':
        if (!need) {
          return NextResponse.json(
            { error: 'Need description required for need mode' },
            { status: 400 }
          )
        }
        {
          const result = await findGrantsForNeed(need, profile)
          grants = result.grants
          usage = result.usage
        }
        break

      case 'discover':
      default:
        {
          const result = await discoverGrants(profile, { searchFocus })
          grants = result.grants
          usage = result.usage
        }
        break
    }

    const searchTime = Date.now() - startTime

    // Log the discovery with actual token counts from the API response
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'grant_discovery',
          model: 'gemini-1.5-pro',
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: searchTime,
          success: grants.length > 0,
          metadata: JSON.stringify({ mode, keyword, need, searchFocus, resultsCount: grants.length }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      grants,
      total: grants.length,
      searchTime,
      mode,
      message: grants.length > 0
        ? `Found ${grants.length} potential grants matching your profile`
        : 'No matching grants found. Try different search terms or broaden your criteria.',
    })
  } catch (error) {
    console.error('Grant discovery error:', error)
    return NextResponse.json(
      { error: 'Failed to discover grants' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/discover-grants
 *
 * Check if AI discovery is available and get search options
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      available: isGeminiConfigured(),
      searchModes: [
        {
          id: 'discover',
          label: 'Smart Discovery',
          description: 'AI searches the web for grants matching your profile',
        },
        {
          id: 'search',
          label: 'Keyword Search',
          description: 'Search for grants by specific keywords',
        },
        {
          id: 'need',
          label: 'Find by Need',
          description: 'Find grants for a specific funding need',
        },
      ],
      searchFocusOptions: [
        { id: 'all', label: 'All Sources' },
        { id: 'new_grants', label: 'Recently Announced' },
        { id: 'local_grants', label: 'State & Local' },
        { id: 'foundation_grants', label: 'Foundations' },
      ],
    })
  } catch (error) {
    console.error('Discovery status error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
