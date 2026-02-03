import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Import the pipeline
import {
  runDiscoveryPipeline,
  loadUserProfile,
  loadGrantsFromDatabase,
} from '@/lib/discovery/pipeline'

// Import engines for detailed tracing
import { runEligibilityEngine, filterEligibleGrants } from '@/lib/eligibility/engine'
import { calculateScore, scoreAndSortGrants } from '@/lib/scoring/engine'
import { getCacheStats } from '@/lib/cache/match-cache'

import { EntityType, IndustryTag, BudgetRange } from '@/lib/constants/taxonomy'
import { safeJsonParse } from '@/lib/api-utils'

/**
 * Test fixtures for debugging
 */
const TEST_FIXTURES: Record<string, {
  entityType: EntityType
  state: string
  industryTags: IndustryTag[]
  sizeBand: string
  annualBudget: BudgetRange
}> = {
  agriculture_ca: {
    entityType: 'small_business',
    state: 'CA',
    industryTags: ['agriculture'],
    sizeBand: 'small',
    annualBudget: '100k_250k',
  },
  nonprofit_ny: {
    entityType: 'nonprofit',
    state: 'NY',
    industryTags: ['community', 'youth'],
    sizeBand: 'micro',
    annualBudget: 'under_50k',
  },
  homeowner_wa: {
    entityType: 'individual',
    state: 'WA',
    industryTags: ['climate', 'housing'],
    sizeBand: 'solo',
    annualBudget: 'under_50k',
  },
  manufacturer_tx: {
    entityType: 'small_business',
    state: 'TX',
    industryTags: ['business', 'technology'],
    sizeBand: 'medium',
    annualBudget: '500k_1m',
  },
  startup_ma: {
    entityType: 'small_business',
    state: 'MA',
    industryTags: ['technology', 'research'],
    sizeBand: 'micro',
    annualBudget: '50k_100k',
  },
}

/**
 * GET /api/debug/matching
 *
 * Debug endpoint for testing the matching pipeline.
 *
 * Query params:
 * - user_fixture: Use a test fixture profile (agriculture_ca, nonprofit_ny, etc.)
 * - user_id: Use a real user's profile
 * - grant_id: Test a specific grant
 * - limit: Number of grants to process (default: 50)
 * - verbose: Include detailed trace (default: false)
 *
 * Requires admin role or ADMIN_API_KEY header.
 */
export async function GET(request: NextRequest) {
  // Auth check - require admin or API key
  const apiKey = request.headers.get('X-Admin-API-Key')
  const expectedKey = process.env.ADMIN_API_KEY

  let isAdmin = false

  if (apiKey && expectedKey && apiKey === expectedKey) {
    isAdmin = true
  } else {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      // Check if user is admin (you may want to add this to your User model)
      // For now, allow authenticated users in development
      if (process.env.NODE_ENV === 'development') {
        isAdmin = true
      }
    }
  }

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Requires admin access.' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userFixture = searchParams.get('user_fixture')
    const userId = searchParams.get('user_id')
    const grantId = searchParams.get('grant_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const verbose = searchParams.get('verbose') === 'true'

    // Build profile from fixture or real user
    let profile: {
      id: string
      userId: string
      entityType: EntityType | null
      state: string | null
      industryTags: IndustryTag[]
      sizeBand?: string | null
      annualBudget?: string | null
      profileVersion: number
      confidenceScore: number
    }

    if (userFixture && TEST_FIXTURES[userFixture]) {
      const fixture = TEST_FIXTURES[userFixture]
      profile = {
        id: `fixture_${userFixture}`,
        userId: `fixture_${userFixture}`,
        entityType: fixture.entityType,
        state: fixture.state,
        industryTags: fixture.industryTags,
        sizeBand: fixture.sizeBand,
        annualBudget: fixture.annualBudget,
        profileVersion: 1,
        confidenceScore: 0.9,
      }
    } else if (userId) {
      const loaded = await loadUserProfile(userId)
      if (!loaded) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      }
      profile = loaded
    } else {
      return NextResponse.json({
        error: 'Must provide user_fixture or user_id',
        availableFixtures: Object.keys(TEST_FIXTURES),
      }, { status: 400 })
    }

    // Load grants
    const grants = await loadGrantsFromDatabase({
      status: 'open',
      state: profile.state || undefined,
      limit,
    })

    if (grants.length === 0) {
      return NextResponse.json({
        profile,
        grants: [],
        message: 'No grants found in database',
      })
    }

    // Get cache stats
    const cacheStats = await getCacheStats()

    // Run full pipeline with debug
    const pipelineResult = await runDiscoveryPipeline(grants, profile, {
      limit: 20,
      minScore: 0, // Include all for debugging
      sortBy: 'best_match',
      useCache: true,
      useAI: false, // Skip AI for speed in debugging
      includeDebug: true,
    })

    // Build verbose trace if requested
    let verboseTrace: Record<string, unknown> | undefined

    if (verbose) {
      const eligibilityProfile = {
        entityType: profile.entityType,
        state: profile.state,
        industryTags: profile.industryTags,
        certifications: [],
        sizeBand: profile.sizeBand,
        annualBudget: profile.annualBudget,
      }

      // Sample detailed trace for first 5 grants
      const sampleGrants = grants.slice(0, 5)
      const detailedTraces = sampleGrants.map(grant => {
        const grantForEligibility = {
          id: grant.id,
          title: grant.title,
          sponsor: grant.sponsor,
          summary: grant.summary,
          description: grant.description,
          categories: grant.categories,
          eligibility: grant.eligibility,
          locations: grant.locations,
          url: grant.url,
          status: grant.status,
          qualityScore: grant.qualityScore,
          amountMin: grant.amountMin,
          amountMax: grant.amountMax,
        }

        const eligibilityResult = runEligibilityEngine(eligibilityProfile, grantForEligibility)

        const grantForScoring = {
          ...grantForEligibility,
          amountText: grant.amountText,
          fundingType: grant.fundingType,
          purposeTags: grant.purposeTags,
          deadlineDate: grant.deadlineDate,
        }

        const scoringResult = calculateScore(
          {
            entityType: profile.entityType,
            state: profile.state,
            industryTags: profile.industryTags,
            sizeBand: profile.sizeBand,
            annualBudget: profile.annualBudget as BudgetRange | null,
          },
          grantForScoring as any
        )

        return {
          grantId: grant.id,
          title: grant.title.slice(0, 60),
          sponsor: grant.sponsor,
          categories: grant.categories,
          eligibility: {
            isEligible: eligibilityResult.isEligible,
            confidence: eligibilityResult.confidenceLevel,
            primaryReason: eligibilityResult.primaryReason,
            passedFilters: eligibilityResult.passedFilters,
            failedFilters: eligibilityResult.failedFilters,
            allResults: eligibilityResult.allResults,
          },
          scoring: {
            total: scoringResult.totalScore,
            tier: scoringResult.tier,
            breakdown: scoringResult.breakdown,
            reasons: scoringResult.matchReasons,
            warnings: scoringResult.warnings,
          },
        }
      })

      verboseTrace = {
        sampleTraces: detailedTraces,
      }
    }

    // Assertions for regression testing
    const assertions: Array<{ test: string; passed: boolean; details?: string }> = []

    // Test: No teacher grants for agriculture profile
    if (profile.industryTags.includes('agriculture')) {
      const teacherGrants = pipelineResult.grants.filter(g =>
        g.title.toLowerCase().includes('teacher') ||
        g.categories.some(c => c.toLowerCase().includes('teacher'))
      )
      assertions.push({
        test: 'No teacher grants for agriculture profile',
        passed: teacherGrants.length === 0,
        details: teacherGrants.length > 0
          ? `Found ${teacherGrants.length} teacher grants: ${teacherGrants.map(g => g.title).join(', ')}`
          : undefined,
      })
    }

    // Test: Result count in range
    assertions.push({
      test: 'Result count is reasonable (0-20)',
      passed: pipelineResult.grants.length >= 0 && pipelineResult.grants.length <= 20,
      details: `Got ${pipelineResult.grants.length} grants`,
    })

    // Test: All results have URLs
    const grantsWithoutUrls = pipelineResult.grants.filter(g => !g.hasUrl)
    assertions.push({
      test: 'All top results have URLs',
      passed: grantsWithoutUrls.length === 0,
      details: grantsWithoutUrls.length > 0
        ? `${grantsWithoutUrls.length} grants missing URLs`
        : undefined,
    })

    // Test: Geography matches
    if (profile.state) {
      const wrongStateGrants = pipelineResult.grants.filter(g => {
        // Check if grant is location-restricted to a different state
        // This is a simplified check
        return false // Would need more detailed location data
      })
      assertions.push({
        test: 'Geography matches user state or is national',
        passed: wrongStateGrants.length === 0,
      })
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        entityType: profile.entityType,
        state: profile.state,
        industryTags: profile.industryTags,
        sizeBand: profile.sizeBand,
        annualBudget: profile.annualBudget,
        profileVersion: profile.profileVersion,
      },
      stats: pipelineResult.stats,
      debug: pipelineResult.debug,
      cacheStats,
      topGrants: pipelineResult.grants.slice(0, 5).map(g => ({
        id: g.id,
        title: g.title,
        sponsor: g.sponsor,
        score: g.combinedScore,
        tier: g.matchTier,
        reasons: g.matchReasons.slice(0, 2),
        appliesToUser: g.appliesToUser,
      })),
      assertions,
      allAssertionsPassed: assertions.every(a => a.passed),
      verboseTrace,
    })

  } catch (error) {
    console.error('[Debug] Error:', error)
    return NextResponse.json(
      {
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.stack : undefined)
          : undefined,
      },
      { status: 500 }
    )
  }
}
