/**
 * GRANT MATCH CACHE SERVICE
 * -------------------------
 * Manages caching of AI-generated match results to reduce API costs
 * and improve response times.
 */

import { prisma } from '@/lib/db'

export interface CachedMatchResult {
  grantId: string
  fitScore: number
  fitSummary: string
  fitExplanation: string
  eligibilityStatus: string
  nextSteps: string[]
  whatYouCanFund: string[]
  applicationTips: string[]
  urgency: string
}

export interface CacheEntry extends CachedMatchResult {
  profileVersion: number
  grantUpdatedAt: Date
  expiresAt: Date
}

const CACHE_TTL_DAYS = 7

/**
 * Get cached matches for a user and list of grants
 */
export async function getCachedMatches(
  userId: string,
  grantIds: string[],
  profileVersion: number
): Promise<Map<string, CachedMatchResult>> {
  if (grantIds.length === 0) {
    return new Map()
  }

  const cached = await prisma.grantMatchCache.findMany({
    where: {
      userId,
      grantId: { in: grantIds },
      profileVersion,
      expiresAt: { gt: new Date() },
    },
  })

  const cacheMap = new Map<string, CachedMatchResult>()

  for (const entry of cached) {
    cacheMap.set(entry.grantId, {
      grantId: entry.grantId,
      fitScore: entry.fitScore,
      fitSummary: entry.fitSummary,
      fitExplanation: entry.fitExplanation,
      eligibilityStatus: entry.eligibilityStatus,
      nextSteps: safeJsonParse<string[]>(entry.nextSteps, []),
      whatYouCanFund: safeJsonParse<string[]>(entry.whatYouCanFund, []),
      applicationTips: safeJsonParse<string[]>(entry.applicationTips, []),
      urgency: entry.urgency,
    })
  }

  return cacheMap
}

/**
 * Store match results in cache
 */
export async function setCachedMatches(
  userId: string,
  profileVersion: number,
  matches: Array<CachedMatchResult & { grantUpdatedAt: Date }>
): Promise<void> {
  if (matches.length === 0) return

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS)

  // Use upsert for each match to handle duplicates
  await Promise.all(
    matches.map((match) =>
      prisma.grantMatchCache.upsert({
        where: {
          userId_grantId: {
            userId,
            grantId: match.grantId,
          },
        },
        create: {
          userId,
          grantId: match.grantId,
          profileVersion,
          grantUpdatedAt: match.grantUpdatedAt,
          fitScore: match.fitScore,
          fitSummary: match.fitSummary,
          fitExplanation: match.fitExplanation,
          eligibilityStatus: match.eligibilityStatus,
          nextSteps: JSON.stringify(match.nextSteps),
          whatYouCanFund: JSON.stringify(match.whatYouCanFund),
          applicationTips: JSON.stringify(match.applicationTips),
          urgency: match.urgency,
          expiresAt,
        },
        update: {
          profileVersion,
          grantUpdatedAt: match.grantUpdatedAt,
          fitScore: match.fitScore,
          fitSummary: match.fitSummary,
          fitExplanation: match.fitExplanation,
          eligibilityStatus: match.eligibilityStatus,
          nextSteps: JSON.stringify(match.nextSteps),
          whatYouCanFund: JSON.stringify(match.whatYouCanFund),
          applicationTips: JSON.stringify(match.applicationTips),
          urgency: match.urgency,
          expiresAt,
        },
      })
    )
  )
}

/**
 * Invalidate all cached matches for a user
 * Called when profile changes significantly
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  const result = await prisma.grantMatchCache.deleteMany({
    where: { userId },
  })
  return result.count
}

/**
 * Clean up expired cache entries
 * Called by background job
 */
export async function cleanExpiredCache(): Promise<number> {
  const result = await prisma.grantMatchCache.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })
  return result.count
}

/**
 * Get cache statistics for a user
 */
export async function getCacheStats(userId: string): Promise<{
  totalEntries: number
  validEntries: number
  oldestEntry: Date | null
}> {
  const [total, valid, oldest] = await Promise.all([
    prisma.grantMatchCache.count({ where: { userId } }),
    prisma.grantMatchCache.count({
      where: { userId, expiresAt: { gt: new Date() } },
    }),
    prisma.grantMatchCache.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    }),
  ])

  return {
    totalEntries: total,
    validEntries: valid,
    oldestEntry: oldest?.createdAt || null,
  }
}

// Helper to safely parse JSON
function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
