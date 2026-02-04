/**
 * GRANT DISCOVERY PIPELINE
 * ------------------------
 * Complete pipeline for grant discovery, from data fetch to final results.
 *
 * PIPELINE STAGES:
 * 1. Fetch/Search → Raw grants from sources
 * 2. Normalize → Consistent data structure
 * 3. Hard Filter → Deterministic eligibility checks
 * 4. Score → Deterministic relevance scoring
 * 5. Cache Check → Return cached AI results if available
 * 6. AI Enrich → Generate summaries/explanations for uncached
 * 7. Cache Store → Store new AI results
 * 8. Final Sort → Rerank and return top N
 *
 * PRINCIPLES:
 * - Deterministic first, AI second
 * - Graceful degradation at every stage
 * - Full observability
 */

import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'

// Import engines
import {
  runEligibilityEngine,
  filterEligibleGrants,
  GrantForEligibility,
  UserProfileForEligibility,
  FullEligibilityResult,
} from '@/lib/eligibility/engine'

import {
  calculateScore,
  scoreAndSortGrants,
  getTopGrants,
  ScoringResult,
  UserProfileForScoring,
  GrantForScoring,
} from '@/lib/scoring/engine'

// Import cache
import {
  getCachedMatches,
  setCachedMatches,
  matchResultToCacheData,
  cacheDataToMatchResult,
  CachedMatchData,
} from '@/lib/cache/match-cache'

// Import AI matching
import {
  matchGrantsWithAI,
  preFilterForAccessibility,
  GrantForAIMatching,
} from '@/lib/services/gemini-grant-matching-v2'

import { GrantMatchResult, createFallbackMatchResult } from '@/lib/schemas/llm-responses'

import {
  EntityType,
  IndustryTag,
  formatFundingDisplay,
  ConfidenceLevel,
} from '@/lib/constants/taxonomy'

import {
  createPipelineLogger,
  logEligibilityResults,
  logScoringResults,
  logCacheResults,
  logAIResults,
  logTopCandidates,
  logLLMRerankDetails,
  logFinalResults,
  logCanonicalizedProfile,
  PipelineLogger,
} from '@/lib/logging/pipeline-logger'

// ============= TYPES =============

export interface UserProfile {
  id: string
  userId: string
  entityType: EntityType | null
  state: string | null
  industryTags: IndustryTag[]
  sizeBand?: string | null
  annualBudget?: string | null
  goals?: string[]
  grantPreferences?: {
    preferredSize?: string | null
    timeline?: 'immediate' | 'quarter' | 'year' | 'flexible' | null
    complexity?: 'simple' | 'moderate' | 'complex' | null
  }
  profileVersion: number
  confidenceScore: number
}

export interface GrantData {
  id: string
  sourceId: string
  sourceName: string
  title: string
  sponsor: string
  summary: string | null
  description: string | null
  categories: string[]
  eligibility: {
    tags: string[]
    rawText?: string
  }
  locations: Array<{
    type: string
    value?: string
  }>
  amountMin: number | null
  amountMax: number | null
  amountText: string | null
  deadlineDate: Date | null
  deadlineType: string | null
  url: string
  status: string
  qualityScore: number
  fundingType?: string | null
  purposeTags?: string[]
  updatedAt: Date
}

export interface DiscoveryResult {
  id: string
  sourceId: string
  sourceName: string
  title: string
  sponsor: string
  summary: string | null

  // Funding display
  fundingDisplay: string
  amountMin: number | null
  amountMax: number | null

  // Deadline
  deadlineDate: Date | null
  deadlineDisplay: string

  // Categories
  categories: string[]
  eligibility: string[]

  // URL
  url: string
  hasUrl: boolean

  // Scores
  deterministicScore: number
  aiMatchScore: number
  combinedScore: number

  // Match info
  matchTier: 'excellent' | 'good' | 'fair' | 'low'
  matchTierLabel: string
  confidenceLevel: ConfidenceLevel

  // AI explanations
  aiSummary: string
  whyMatch: string
  matchReasons: string[]
  warnings: string[]
  nextSteps: string[]
  whatYouCanFund: string[]

  // Eligibility
  eligibilityStatus: string
  appliesToUser: 'yes' | 'likely' | 'uncertain' | 'no'

  // Metadata
  fromCache: boolean
  urgency: 'high' | 'medium' | 'low'
}

export interface PipelineOptions {
  limit?: number
  minScore?: number
  sortBy?: 'best_match' | 'deadline_soon' | 'highest_funding'
  useCache?: boolean
  useAI?: boolean
  includeDebug?: boolean
}

export interface PipelineResult {
  grants: DiscoveryResult[]
  total: number
  stats: {
    fetched: number
    afterEligibility: number
    afterScoring: number
    fromCache: number
    fromAI: number
  }
  timings?: Array<{ stage: string; durationMs: number }>
  debug?: {
    eligibilityStats: Record<string, number>
    scoringDistribution: Record<string, number>
    cacheHitRate: number
    processingTimeMs: number
  }
}

// ============= MAIN PIPELINE =============

/**
 * Run the full discovery pipeline
 */
export async function runDiscoveryPipeline(
  grants: GrantData[],
  profile: UserProfile,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now()

  const {
    limit = 20,
    minScore = 30,
    sortBy = 'best_match',
    useCache = true,
    useAI = true,
    includeDebug = false,
  } = options

  // Initialize logger
  const logger = createPipelineLogger(
    profile.userId,
    profile.profileVersion,
    process.env.NODE_ENV !== 'test'
  )
  logger.info('Pipeline started', {
    grantsCount: grants.length,
    options: { limit, minScore, sortBy, useCache, useAI },
  })

  // Log canonicalized profile (no sensitive values)
  logCanonicalizedProfile(logger, {
    entityType: profile.entityType,
    state: profile.state,
    industryTags: profile.industryTags,
    sizeBand: profile.sizeBand,
    annualBudget: profile.annualBudget,
    profileVersion: profile.profileVersion,
  })

  const stats = {
    fetched: grants.length,
    afterEligibility: 0,
    afterScoring: 0,
    fromCache: 0,
    fromAI: 0,
  }

  // ========== STAGE 1: ELIGIBILITY FILTER ==========
  logger.startTiming('eligibility')
  const eligibilityProfile: UserProfileForEligibility = {
    entityType: profile.entityType,
    state: profile.state,
    industryTags: profile.industryTags,
    certifications: [],
    sizeBand: profile.sizeBand,
    annualBudget: profile.annualBudget,
  }

  const grantsForEligibility: GrantForEligibility[] = grants.map(g => ({
    id: g.id,
    title: g.title,
    sponsor: g.sponsor,
    summary: g.summary,
    description: g.description,
    categories: g.categories,
    eligibility: g.eligibility,
    locations: g.locations,
    url: g.url,
    status: g.status,
    qualityScore: g.qualityScore,
    amountMin: g.amountMin,
    amountMax: g.amountMax,
  }))

  const eligibilityResult = filterEligibleGrants(eligibilityProfile, grantsForEligibility)
  stats.afterEligibility = eligibilityResult.eligible.length
  logger.endTiming('eligibility')

  logEligibilityResults(logger, {
    total: grants.length,
    eligible: eligibilityResult.eligible.length,
    filtered: eligibilityResult.ineligible.length,
    byReason: eligibilityResult.stats.byFilter,
  })

  if (eligibilityResult.eligible.length === 0) {
    logger.warn('No eligible grants found', { filters: eligibilityResult.stats.byFilter })
    return {
      grants: [],
      total: 0,
      stats,
      debug: includeDebug ? {
        eligibilityStats: eligibilityResult.stats.byFilter,
        scoringDistribution: {},
        cacheHitRate: 0,
        processingTimeMs: Date.now() - startTime,
      } : undefined,
    }
  }

  // ========== STAGE 2: DETERMINISTIC SCORING ==========
  logger.startTiming('scoring')
  const scoringProfile: UserProfileForScoring = {
    entityType: profile.entityType,
    state: profile.state,
    industryTags: profile.industryTags,
    sizeBand: profile.sizeBand,
    annualBudget: profile.annualBudget as UserProfileForScoring['annualBudget'],
    goals: profile.goals,
    grantPreferences: profile.grantPreferences,
  }

  // Map eligible grants back to full data and score
  const eligibleIds = new Set(eligibilityResult.eligible.map(g => g.id))
  const eligibleGrantData = grants.filter(g => eligibleIds.has(g.id))

  const grantsForScoring: GrantForScoring[] = eligibleGrantData.map(g => ({
    id: g.id,
    title: g.title,
    sponsor: g.sponsor,
    summary: g.summary,
    description: g.description,
    categories: g.categories,
    eligibility: g.eligibility,
    locations: g.locations,
    amountMin: g.amountMin,
    amountMax: g.amountMax,
    amountText: g.amountText,
    fundingType: g.fundingType,
    purposeTags: g.purposeTags as GrantForScoring['purposeTags'],
    deadlineDate: g.deadlineDate,
    qualityScore: g.qualityScore,
    status: g.status,
  }))

  const scoredGrants = scoreAndSortGrants(scoringProfile, grantsForScoring)
    .filter(g => g.scoring.totalScore >= minScore)

  stats.afterScoring = scoredGrants.length
  logger.endTiming('scoring')

  const allScores = scoreAndSortGrants(scoringProfile, grantsForScoring).map(g => g.scoring.totalScore)
  logScoringResults(logger, {
    total: grantsForScoring.length,
    passedMinScore: scoredGrants.length,
    distribution: buildScoreDistribution(allScores),
    avgScore: allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1),
  })

  if (scoredGrants.length === 0) {
    logger.warn('No grants passed minimum score threshold', { minScore })
    return {
      grants: [],
      total: 0,
      stats,
      debug: includeDebug ? {
        eligibilityStats: eligibilityResult.stats.byFilter,
        scoringDistribution: {},
        cacheHitRate: 0,
        processingTimeMs: Date.now() - startTime,
      } : undefined,
    }
  }

  // Take top candidates for AI enrichment
  const topCandidates = scoredGrants.slice(0, Math.min(50, scoredGrants.length))

  // Log top 50 candidates with IDs and scores
  logTopCandidates(
    logger,
    topCandidates.map(g => ({
      id: g.id,
      title: g.title,
      deterministicScore: g.scoring.totalScore,
      tier: g.scoring.tier,
    })),
    50
  )

  // ========== STAGE 3: CACHE CHECK ==========
  logger.startTiming('cache')
  let aiResults = new Map<string, GrantMatchResult>()
  const uncachedGrants: string[] = []

  if (useCache) {
    const cachedData = await getCachedMatches(
      profile.userId,
      topCandidates.map(g => g.id),
      profile.profileVersion
    )

    for (const [grantId, cached] of cachedData) {
      aiResults.set(grantId, cacheDataToMatchResult(grantId, cached))
      stats.fromCache++
    }

    // Find grants not in cache
    for (const grant of topCandidates) {
      if (!cachedData.has(grant.id)) {
        uncachedGrants.push(grant.id)
      }
    }
  } else {
    uncachedGrants.push(...topCandidates.map(g => g.id))
  }
  logger.endTiming('cache')

  logCacheResults(logger, {
    checked: topCandidates.length,
    hits: stats.fromCache,
    misses: uncachedGrants.length,
  })

  // ========== STAGE 4: AI ENRICHMENT ==========
  let aiRequested = 0
  let aiSuccessful = 0
  let aiFailed = 0

  if (useAI && uncachedGrants.length > 0) {
    logger.startTiming('ai')
    const grantsForAI: GrantForAIMatching[] = topCandidates
      .filter(g => uncachedGrants.includes(g.id))
      .map(g => {
        const original = grants.find(og => og.id === g.id)!
        return {
          id: g.id,
          title: g.title,
          sponsor: g.sponsor,
          summary: g.summary,
          description: original.description,
          categories: g.categories,
          eligibility: g.eligibility.tags,
          amountMin: g.amountMin,
          amountMax: g.amountMax,
          amountText: original.amountText,
          deadlineDate: g.deadlineDate,
          url: original.url,
        }
      })

    // Pre-filter for accessibility
    const accessibleGrants = preFilterForAccessibility(grantsForAI)
    aiRequested = accessibleGrants.length
    logger.debug('Pre-filtered for accessibility', {
      before: grantsForAI.length,
      after: accessibleGrants.length,
    })

    if (accessibleGrants.length > 0) {
      try {
        const newAIResults = await matchGrantsWithAI(accessibleGrants, scoringProfile)

        for (const result of newAIResults) {
          aiResults.set(result.grantId, result)
          stats.fromAI++
          aiSuccessful++
        }

        // Cache new results
        if (useCache && newAIResults.length > 0) {
          const cacheEntries = newAIResults.map(result => {
            const original = grants.find(g => g.id === result.grantId)!
            return {
              grantId: result.grantId,
              grantUpdatedAt: original.updatedAt,
              data: matchResultToCacheData(result),
            }
          })

          await setCachedMatches(profile.userId, profile.profileVersion, cacheEntries)
          logger.debug('Cached AI results', { count: cacheEntries.length })
        }
      } catch (error) {
        aiFailed = accessibleGrants.length
        logger.error('AI enrichment failed', error, { grantCount: accessibleGrants.length })
      }
    }
    logger.endTiming('ai')
  }

  logAIResults(logger, {
    requested: aiRequested,
    successful: aiSuccessful,
    failed: aiFailed,
    fallback: uncachedGrants.length - aiSuccessful,
  })

  // Log LLM rerank details if AI was used
  if (useAI && aiRequested > 0) {
    // Calculate rerank changes by comparing deterministic vs AI order
    const inputOrder = topCandidates.map(g => g.id)
    const outputOrder = Array.from(aiResults.keys())
    let rerankChanges = 0
    for (let i = 0; i < Math.min(inputOrder.length, outputOrder.length); i++) {
      if (inputOrder[i] !== outputOrder[i]) rerankChanges++
    }

    logLLMRerankDetails(logger, {
      inputSize: aiRequested,
      inputOrder: topCandidates.slice(0, aiRequested).map(g => g.id),
      outputOrder,
      validationStatus: aiFailed === 0 ? 'success' : aiFailed < aiRequested ? 'partial' : 'failed',
      rerankChanges,
    })
  }

  // ========== STAGE 5: BUILD FINAL RESULTS ==========
  logger.startTiming('build_results')
  const finalResults: DiscoveryResult[] = topCandidates.map(scoredGrant => {
    const original = grants.find(g => g.id === scoredGrant.id)!
    const aiResult = aiResults.get(scoredGrant.id) || createFallbackMatchResult(scoredGrant.id)

    // Combined score: 60% deterministic, 40% AI
    const aiScore = aiResult.confidence !== 'low' ? aiResult.matchScore : scoredGrant.scoring.totalScore
    const combinedScore = Math.round(
      (scoredGrant.scoring.totalScore * 0.6) + (aiScore * 0.4)
    )

    // Determine applies_to_user
    let appliesToUser: DiscoveryResult['appliesToUser']
    if (aiResult.eligibilityStatus === 'eligible') appliesToUser = 'yes'
    else if (aiResult.eligibilityStatus === 'likely_eligible') appliesToUser = 'likely'
    else if (aiResult.eligibilityStatus === 'uncertain') appliesToUser = 'uncertain'
    else appliesToUser = 'no'

    return {
      id: original.id,
      sourceId: original.sourceId,
      sourceName: original.sourceName,
      title: original.title,
      sponsor: original.sponsor,
      summary: original.summary,

      // Funding
      fundingDisplay: formatFundingDisplay(original.amountMin, original.amountMax, original.amountText),
      amountMin: original.amountMin,
      amountMax: original.amountMax,

      // Deadline
      deadlineDate: original.deadlineDate,
      deadlineDisplay: original.deadlineDate
        ? new Date(original.deadlineDate).toLocaleDateString()
        : original.deadlineType === 'rolling' ? 'Rolling' : 'Not specified',

      // Categories
      categories: original.categories,
      eligibility: original.eligibility.tags,

      // URL
      url: original.url,
      hasUrl: !!original.url,

      // Scores
      deterministicScore: scoredGrant.scoring.totalScore,
      aiMatchScore: aiResult.matchScore,
      combinedScore,

      // Match info
      matchTier: scoredGrant.scoring.tier,
      matchTierLabel: scoredGrant.scoring.tierLabel,
      confidenceLevel: aiResult.confidence as ConfidenceLevel,

      // AI explanations
      aiSummary: aiResult.fitSummary,
      whyMatch: aiResult.whyMatch,
      matchReasons: [...scoredGrant.scoring.matchReasons, ...aiResult.reasons].slice(0, 5),
      warnings: [...scoredGrant.scoring.warnings, ...aiResult.concerns].slice(0, 3),
      nextSteps: aiResult.nextSteps,
      whatYouCanFund: aiResult.whatYouCanFund,

      // Eligibility
      eligibilityStatus: aiResult.eligibilityStatus,
      appliesToUser: appliesToUser,

      // Metadata
      fromCache: stats.fromCache > 0 && aiResults.has(original.id),
      urgency: aiResult.urgency as DiscoveryResult['urgency'],
    }
  })

  logger.endTiming('build_results')

  // ========== STAGE 6: FINAL SORT ==========
  logger.startTiming('final_sort')
  finalResults.sort((a, b) => {
    if (sortBy === 'deadline_soon') {
      const deadlineA = a.deadlineDate?.getTime() ?? Infinity
      const deadlineB = b.deadlineDate?.getTime() ?? Infinity
      return deadlineA - deadlineB
    }
    if (sortBy === 'highest_funding') {
      return (b.amountMax ?? 0) - (a.amountMax ?? 0)
    }
    // Default: best_match
    return b.combinedScore - a.combinedScore
  })

  const limitedResults = finalResults.slice(0, limit)
  logger.endTiming('final_sort')

  // Log final returned results
  logFinalResults(
    logger,
    limitedResults.map(r => ({
      id: r.id,
      title: r.title,
      combinedScore: r.combinedScore,
      deterministicScore: r.deterministicScore,
      aiMatchScore: r.aiMatchScore,
      appliesToUser: r.appliesToUser,
    })),
    limit
  )

  // Log summary
  logger.logSummary(stats)

  return {
    grants: limitedResults,
    total: finalResults.length,
    stats,
    timings: logger.getTimings(),
    debug: includeDebug ? {
      eligibilityStats: eligibilityResult.stats.byFilter,
      scoringDistribution: buildScoreDistribution(scoredGrants.map(g => g.scoring.totalScore)),
      cacheHitRate: stats.fromCache / (stats.fromCache + stats.fromAI || 1),
      processingTimeMs: Date.now() - startTime,
    } : undefined,
  }
}

/**
 * Build score distribution for debugging
 */
function buildScoreDistribution(scores: number[]): Record<string, number> {
  const distribution: Record<string, number> = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  }

  for (const score of scores) {
    if (score <= 20) distribution['0-20']++
    else if (score <= 40) distribution['21-40']++
    else if (score <= 60) distribution['41-60']++
    else if (score <= 80) distribution['61-80']++
    else distribution['81-100']++
  }

  return distribution
}

// ============= HELPER: LOAD PROFILE =============

/**
 * Load and parse user profile from database
 */
export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const dbProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!dbProfile || !dbProfile.onboardingCompleted) {
    return null
  }

  return {
    id: dbProfile.id,
    userId: dbProfile.userId,
    entityType: dbProfile.entityType as EntityType,
    state: dbProfile.state,
    industryTags: safeJsonParse<IndustryTag[]>(dbProfile.industryTags, []),
    sizeBand: dbProfile.sizeBand,
    annualBudget: dbProfile.annualBudget,
    goals: safeJsonParse<string[]>(
      (safeJsonParse<Record<string, unknown>>(dbProfile.industryAttributes, {})).goals as string || '[]',
      []
    ),
    grantPreferences: safeJsonParse(dbProfile.grantPreferences, {
      preferredSize: null,
      timeline: null,
      complexity: null,
    }),
    profileVersion: dbProfile.profileVersion,
    confidenceScore: dbProfile.confidenceScore,
  }
}

// ============= HELPER: LOAD GRANTS =============

/**
 * Load grants from database with filtering
 */
export async function loadGrantsFromDatabase(
  options: {
    status?: string
    state?: string
    limit?: number
  } = {}
): Promise<GrantData[]> {
  const { status = 'open', state, limit = 200 } = options

  const where: Record<string, unknown> = {
    status,
    url: { not: '' },
  }

  if (state) {
    where.OR = [
      { locations: { contains: '"national"' } },
      { locations: { contains: state } },
      { locations: { equals: '[]' } },
    ]
  }

  const dbGrants = await prisma.grant.findMany({
    where,
    orderBy: [
      { qualityScore: 'desc' },
      { deadlineDate: 'asc' },
    ],
    take: limit,
  })

  return dbGrants.map(g => {
    // Parse eligibility correctly - it's stored as {"tags": [...], "industries": [...]}
    const eligibilityData = safeJsonParse<{ tags?: string[]; industries?: string[]; rawText?: string }>(g.eligibility, {})

    // Parse locations and transform to expected format
    // DB stores: [{"state": "national", "country": "US"}] or [{"state": "CA", "country": "US"}]
    // Engine expects: [{type: "national"}] or [{type: "state", value: "CA"}]
    const rawLocations = safeJsonParse<Array<{ state?: string; country?: string; type?: string; value?: string }>>(g.locations, [])
    const locations = rawLocations.map(loc => {
      // If already in correct format, use as-is
      if (loc.type) {
        return { type: loc.type, value: loc.value }
      }
      // Transform from {state: "national"} to {type: "national"}
      if (loc.state?.toLowerCase() === 'national' || loc.state?.toLowerCase() === 'nationwide') {
        return { type: 'national' as const }
      }
      // Transform from {state: "CA"} to {type: "state", value: "CA"}
      if (loc.state) {
        return { type: 'state' as const, value: loc.state }
      }
      return { type: 'unknown' as const }
    })

    return {
      id: g.id,
      sourceId: g.sourceId,
      sourceName: g.sourceName,
      title: g.title,
      sponsor: g.sponsor,
      summary: g.summary,
      description: g.description,
      categories: safeJsonParse<string[]>(g.categories, []),
      eligibility: {
        tags: eligibilityData.tags || [],
        rawText: eligibilityData.rawText,
      },
      locations,
      amountMin: g.amountMin,
      amountMax: g.amountMax,
      amountText: g.amountText,
      deadlineDate: g.deadlineDate,
      deadlineType: g.deadlineType,
      url: g.url,
      status: g.status,
      qualityScore: g.qualityScore,
      fundingType: g.fundingType,
      purposeTags: safeJsonParse<string[]>(g.purposeTags, []),
      updatedAt: g.updatedAt,
    }
  })
}
