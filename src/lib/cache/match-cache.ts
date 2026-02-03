/**
 * PROFILE-VERSIONED MATCH CACHE
 * -----------------------------
 * Caches grant matching results with profile version invalidation.
 *
 * PRINCIPLES:
 * 1. Cache invalidates when profile changes (via profileVersion)
 * 2. Cache invalidates when grant updates (via grantUpdatedAt)
 * 3. TTL-based expiration (7 days default)
 * 4. Graceful degradation when cache unavailable
 */

import { prisma } from '@/lib/db'
import { GrantMatchResult } from '@/lib/schemas/llm-responses'
import { ScoringResult } from '@/lib/scoring/engine'

// ============= TYPES =============

export interface CachedMatchData {
  // AI match data
  fitScore: number
  fitSummary: string
  fitExplanation: string
  eligibilityStatus: string
  nextSteps: string[]
  whatYouCanFund: string[]
  applicationTips: string[]
  urgency: string

  // Deterministic scoring data
  deterministicScore?: number
  scoringBreakdown?: ScoringResult['breakdown']

  // Metadata
  confidence: string
  cachedAt: Date
}

export interface CacheKey {
  userId: string
  grantId: string
  profileVersion: number
  grantUpdatedAt: Date
}

export interface CacheOptions {
  ttlDays?: number
  forceRefresh?: boolean
}

const DEFAULT_TTL_DAYS = 7

// ============= CACHE OPERATIONS =============

/**
 * Get cached match data for a user-grant pair
 */
export async function getCachedMatch(
  userId: string,
  grantId: string,
  profileVersion: number,
  grantUpdatedAt?: Date
): Promise<CachedMatchData | null> {
  try {
    const cached = await prisma.grantMatchCache.findUnique({
      where: {
        userId_grantId: {
          userId,
          grantId,
        },
      },
    })

    if (!cached) {
      return null
    }

    // Check if cache is stale
    const now = new Date()

    // Expired by TTL
    if (cached.expiresAt < now) {
      // Delete stale cache
      await prisma.grantMatchCache.delete({
        where: { id: cached.id },
      }).catch(() => {}) // Ignore errors on cleanup

      return null
    }

    // Profile version mismatch - cache is for old profile
    if (cached.profileVersion !== profileVersion) {
      return null
    }

    // Grant updated since cache - data may be stale
    if (grantUpdatedAt && cached.grantUpdatedAt < grantUpdatedAt) {
      return null
    }

    // Parse JSON fields
    return {
      fitScore: cached.fitScore,
      fitSummary: cached.fitSummary,
      fitExplanation: cached.fitExplanation,
      eligibilityStatus: cached.eligibilityStatus,
      nextSteps: safeParseJSON<string[]>(cached.nextSteps, []),
      whatYouCanFund: safeParseJSON<string[]>(cached.whatYouCanFund, []),
      applicationTips: safeParseJSON<string[]>(cached.applicationTips, []),
      urgency: cached.urgency,
      confidence: 'high', // Cached data is considered high confidence
      cachedAt: cached.createdAt,
    }
  } catch (error) {
    console.error('[Cache] Error reading cache:', error)
    return null
  }
}

/**
 * Get cached matches for multiple grants
 */
export async function getCachedMatches(
  userId: string,
  grantIds: string[],
  profileVersion: number
): Promise<Map<string, CachedMatchData>> {
  const results = new Map<string, CachedMatchData>()

  if (grantIds.length === 0) {
    return results
  }

  try {
    const cached = await prisma.grantMatchCache.findMany({
      where: {
        userId,
        grantId: { in: grantIds },
        profileVersion,
        expiresAt: { gt: new Date() },
      },
    })

    for (const item of cached) {
      results.set(item.grantId, {
        fitScore: item.fitScore,
        fitSummary: item.fitSummary,
        fitExplanation: item.fitExplanation,
        eligibilityStatus: item.eligibilityStatus,
        nextSteps: safeParseJSON<string[]>(item.nextSteps, []),
        whatYouCanFund: safeParseJSON<string[]>(item.whatYouCanFund, []),
        applicationTips: safeParseJSON<string[]>(item.applicationTips, []),
        urgency: item.urgency,
        confidence: 'high',
        cachedAt: item.createdAt,
      })
    }
  } catch (error) {
    console.error('[Cache] Error reading batch cache:', error)
  }

  return results
}

/**
 * Store match data in cache
 */
export async function setCachedMatch(
  userId: string,
  grantId: string,
  profileVersion: number,
  grantUpdatedAt: Date,
  data: Omit<CachedMatchData, 'cachedAt' | 'confidence'>,
  options: CacheOptions = {}
): Promise<void> {
  const { ttlDays = DEFAULT_TTL_DAYS } = options

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + ttlDays)

  try {
    await prisma.grantMatchCache.upsert({
      where: {
        userId_grantId: {
          userId,
          grantId,
        },
      },
      create: {
        userId,
        grantId,
        profileVersion,
        grantUpdatedAt,
        fitScore: data.fitScore,
        fitSummary: data.fitSummary,
        fitExplanation: data.fitExplanation,
        eligibilityStatus: data.eligibilityStatus,
        nextSteps: JSON.stringify(data.nextSteps),
        whatYouCanFund: JSON.stringify(data.whatYouCanFund),
        applicationTips: JSON.stringify(data.applicationTips),
        urgency: data.urgency,
        expiresAt,
      },
      update: {
        profileVersion,
        grantUpdatedAt,
        fitScore: data.fitScore,
        fitSummary: data.fitSummary,
        fitExplanation: data.fitExplanation,
        eligibilityStatus: data.eligibilityStatus,
        nextSteps: JSON.stringify(data.nextSteps),
        whatYouCanFund: JSON.stringify(data.whatYouCanFund),
        applicationTips: JSON.stringify(data.applicationTips),
        urgency: data.urgency,
        expiresAt,
      },
    })
  } catch (error) {
    console.error('[Cache] Error writing cache:', error)
    // Don't throw - cache failures shouldn't break the app
  }
}

/**
 * Store multiple match results in cache
 */
export async function setCachedMatches(
  userId: string,
  profileVersion: number,
  results: Array<{
    grantId: string
    grantUpdatedAt: Date
    data: Omit<CachedMatchData, 'cachedAt' | 'confidence'>
  }>,
  options: CacheOptions = {}
): Promise<void> {
  const { ttlDays = DEFAULT_TTL_DAYS } = options

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + ttlDays)

  try {
    // Use transaction for batch upsert
    await prisma.$transaction(
      results.map(({ grantId, grantUpdatedAt, data }) =>
        prisma.grantMatchCache.upsert({
          where: {
            userId_grantId: {
              userId,
              grantId,
            },
          },
          create: {
            userId,
            grantId,
            profileVersion,
            grantUpdatedAt,
            fitScore: data.fitScore,
            fitSummary: data.fitSummary,
            fitExplanation: data.fitExplanation,
            eligibilityStatus: data.eligibilityStatus,
            nextSteps: JSON.stringify(data.nextSteps),
            whatYouCanFund: JSON.stringify(data.whatYouCanFund),
            applicationTips: JSON.stringify(data.applicationTips),
            urgency: data.urgency,
            expiresAt,
          },
          update: {
            profileVersion,
            grantUpdatedAt,
            fitScore: data.fitScore,
            fitSummary: data.fitSummary,
            fitExplanation: data.fitExplanation,
            eligibilityStatus: data.eligibilityStatus,
            nextSteps: JSON.stringify(data.nextSteps),
            whatYouCanFund: JSON.stringify(data.whatYouCanFund),
            applicationTips: JSON.stringify(data.applicationTips),
            urgency: data.urgency,
            expiresAt,
          },
        })
      )
    )
  } catch (error) {
    console.error('[Cache] Error writing batch cache:', error)
  }
}

/**
 * Invalidate cache for a user (e.g., when profile changes)
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  try {
    const result = await prisma.grantMatchCache.deleteMany({
      where: { userId },
    })
    return result.count
  } catch (error) {
    console.error('[Cache] Error invalidating user cache:', error)
    return 0
  }
}

/**
 * Invalidate cache for a grant (e.g., when grant data updates)
 */
export async function invalidateGrantCache(grantId: string): Promise<number> {
  try {
    const result = await prisma.grantMatchCache.deleteMany({
      where: { grantId },
    })
    return result.count
  } catch (error) {
    console.error('[Cache] Error invalidating grant cache:', error)
    return 0
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const result = await prisma.grantMatchCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })
    return result.count
  } catch (error) {
    console.error('[Cache] Error cleaning up cache:', error)
    return 0
  }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  totalEntries: number
  byUser: number
  expiringSoon: number
  averageAge: number
}> {
  try {
    const [total, expiring, entries] = await Promise.all([
      prisma.grantMatchCache.count(),
      prisma.grantMatchCache.count({
        where: {
          expiresAt: {
            lt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
            gt: new Date(),
          },
        },
      }),
      prisma.grantMatchCache.findMany({
        select: { createdAt: true, userId: true },
      }),
    ])

    const uniqueUsers = new Set(entries.map(e => e.userId)).size
    const ages = entries.map(e => Date.now() - e.createdAt.getTime())
    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0

    return {
      totalEntries: total,
      byUser: uniqueUsers,
      expiringSoon: expiring,
      averageAge: Math.round(averageAge / (1000 * 60 * 60)), // Hours
    }
  } catch (error) {
    console.error('[Cache] Error getting stats:', error)
    return {
      totalEntries: 0,
      byUser: 0,
      expiringSoon: 0,
      averageAge: 0,
    }
  }
}

// ============= HELPER FUNCTIONS =============

function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// ============= CONVERT AI RESULT TO CACHE DATA =============

/**
 * Convert GrantMatchResult to cache-friendly format
 */
export function matchResultToCacheData(
  result: GrantMatchResult
): Omit<CachedMatchData, 'cachedAt' | 'confidence'> {
  return {
    fitScore: result.matchScore,
    fitSummary: result.fitSummary,
    fitExplanation: result.whyMatch,
    eligibilityStatus: result.eligibilityStatus,
    nextSteps: result.nextSteps,
    whatYouCanFund: result.whatYouCanFund,
    applicationTips: [], // Not in GrantMatchResult, populate separately if needed
    urgency: result.urgency,
  }
}

/**
 * Convert cache data back to GrantMatchResult format
 */
export function cacheDataToMatchResult(
  grantId: string,
  data: CachedMatchData
): GrantMatchResult {
  return {
    grantId,
    isRelevant: true,
    isAccessible: true,
    matchScore: data.fitScore,
    accessibilityScore: 80, // Default for cached
    eligibilityStatus: data.eligibilityStatus as GrantMatchResult['eligibilityStatus'],
    fitSummary: data.fitSummary,
    whyMatch: data.fitExplanation,
    reasons: [data.fitSummary], // Use summary as primary reason
    concerns: [],
    whatYouCanFund: data.whatYouCanFund,
    nextSteps: data.nextSteps,
    urgency: data.urgency as GrantMatchResult['urgency'],
    difficultyLevel: 'moderate', // Default
    estimatedTimeToApply: 'Varies',
    confidence: data.confidence as GrantMatchResult['confidence'],
  }
}
