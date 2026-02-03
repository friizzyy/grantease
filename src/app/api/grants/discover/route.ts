import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimiters, rateLimitExceededResponse, getClientIdentifier } from '@/lib/rate-limit'
import { isGeminiConfigured } from '@/lib/services/gemini-client'

// Import the new pipeline
import {
  runDiscoveryPipeline,
  loadUserProfile,
  loadGrantsFromDatabase,
  GrantData,
  PipelineOptions,
} from '@/lib/discovery/pipeline'

// Import grant search for live discovery
import { searchGrants } from '@/lib/services/grant-sources'
import { safeJsonParse } from '@/lib/api-utils'

const DISCOVER_LIMIT = 20
const MAX_CANDIDATES = 100

/**
 * GET /api/grants/discover
 *
 * Returns personalized grants using:
 * 1. Deterministic eligibility filtering
 * 2. Deterministic relevance scoring
 * 3. AI-powered explanations and reranking (optional)
 * 4. Profile-versioned caching
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
    const sortBy = (searchParams.get('sortBy') || 'best_match') as PipelineOptions['sortBy']
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), DISCOVER_LIMIT)
    const useCache = searchParams.get('cache') !== 'false'
    const useAI = searchParams.get('ai') !== 'false'
    const debug = searchParams.get('debug') === 'true'

    // Load user profile
    const profile = await loadUserProfile(session.user.id)

    if (!profile) {
      return NextResponse.json({
        grants: [],
        total: 0,
        profileComplete: false,
        message: 'Please complete your profile to see personalized grants',
      })
    }

    // Fetch grants - first try Gemini discovery, then fallback to database
    let grants: GrantData[] = []

    // Try live discovery with Gemini
    if (isGeminiConfigured()) {
      try {
        const liveResult = await searchGrants(
          {
            categories: profile.industryTags || [],
            state: profile.state || undefined,
            status: 'open',
            limit: MAX_CANDIDATES,
          },
          {
            // Cast entityType - both EntityType definitions have same values
            entityType: profile.entityType as any,
            industryTags: profile.industryTags,
            state: profile.state || undefined,
          }
        )

        if (liveResult.grants.length > 0) {
          grants = liveResult.grants.map(g => ({
            id: g.id,
            sourceId: g.sourceId,
            sourceName: g.sourceName,
            title: g.title,
            sponsor: g.sponsor,
            summary: g.summary,
            description: g.description || null,
            categories: g.categories || [],
            eligibility: {
              tags: g.eligibility || [],
            },
            locations: (g.locations || []).map(loc => {
              if (typeof loc === 'string') {
                if (loc.toLowerCase() === 'national' || loc.toLowerCase() === 'nationwide') {
                  return { type: 'national' }
                }
                return { type: 'state', value: loc }
              }
              return { type: 'state', value: String(loc) }
            }),
            amountMin: g.amountMin,
            amountMax: g.amountMax,
            amountText: g.amountText,
            deadlineDate: g.deadlineDate,
            deadlineType: g.deadlineType || 'unknown',
            url: g.url,
            status: g.status || 'open',
            qualityScore: (g.confidence || 70) / 100,
            fundingType: null,
            purposeTags: [],
            updatedAt: new Date(),
          }))
        }
      } catch (error) {
        console.error('[Discover] Live search error:', error)
      }
    }

    // Fallback to database if live search returns nothing
    if (grants.length === 0) {
      grants = await loadGrantsFromDatabase({
        status: 'open',
        state: profile.state || undefined,
        limit: MAX_CANDIDATES,
      })
    }

    // Handle no grants found
    if (grants.length === 0) {
      return NextResponse.json({
        grants: [],
        total: 0,
        profileComplete: true,
        message: `No grants found matching your ${profile.industryTags?.join(', ') || ''} focus. Try updating your profile or browsing all grants.`,
        aiEnabled: isGeminiConfigured(),
      })
    }

    console.log(`[Discover] Found ${grants.length} raw grants for user ${session.user.id}`)

    // Run the discovery pipeline
    const pipelineResult = await runDiscoveryPipeline(grants, profile, {
      limit,
      minScore: 25,
      sortBy,
      useCache,
      useAI: useAI && isGeminiConfigured(),
      includeDebug: debug,
    })

    console.log(`[Discover] Pipeline returned ${pipelineResult.grants.length} grants (${pipelineResult.stats.fromCache} cached, ${pipelineResult.stats.fromAI} from AI)`)

    // Handle no eligible/matching grants
    if (pipelineResult.grants.length === 0) {
      return NextResponse.json({
        grants: [],
        total: 0,
        profileComplete: true,
        message: `No grants found that match your ${profile.industryTags?.join(', ') || ''} focus. Try updating your profile interests.`,
        aiEnabled: isGeminiConfigured(),
        stats: pipelineResult.stats,
      })
    }

    // Build response
    const response: Record<string, unknown> = {
      grants: pipelineResult.grants.map(g => ({
        // Core identifiers
        id: g.id,
        sourceId: g.sourceId,
        sourceName: g.sourceName,

        // Basic info
        title: g.title,
        sponsor: g.sponsor,
        summary: g.summary,
        categories: g.categories,
        eligibility: { tags: g.eligibility },

        // Funding
        amountMin: g.amountMin,
        amountMax: g.amountMax,
        fundingRange: g.fundingDisplay,

        // Deadline
        deadlineDate: g.deadlineDate,
        deadlineDisplay: g.deadlineDisplay,

        // URL
        url: g.url,
        hasUrl: g.hasUrl,

        // Scores
        fitScore: g.combinedScore,
        deterministicScore: g.deterministicScore,
        accessibilityScore: g.aiMatchScore,

        // Match info
        matchTier: g.matchTier,
        matchTierLabel: g.matchTierLabel,
        confidence: g.confidenceLevel,

        // AI explanations
        fitSummary: g.aiSummary,
        whyMatch: g.whyMatch,
        matchReasons: g.matchReasons,
        warnings: g.warnings,
        eligibilityStatus: g.eligibilityStatus,
        nextSteps: g.nextSteps,
        whatYouCanFund: g.whatYouCanFund,

        // Meta
        urgency: g.urgency,
        appliesToUser: g.appliesToUser,
        fromCache: g.fromCache,
      })),
      total: pipelineResult.total,
      profileComplete: true,
      aiEnabled: isGeminiConfigured(),
      aiProvider: 'gemini',
      stats: pipelineResult.stats,
    }

    // Include debug info if requested
    if (debug && pipelineResult.debug) {
      response.debug = pipelineResult.debug
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Discover] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to load personalized grants',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
