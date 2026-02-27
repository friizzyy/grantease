import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * GET /api/cron/cleanup-cache
 *
 * Daily cron job to clean up expired grant match cache entries.
 * Also removes orphaned entries for deleted grants/users.
 *
 * Vercel Cron: "0 5 * * *" (Daily at 5 AM)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[CRON:cleanup-cache] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }

  const isVercelCron = authHeader === `Bearer ${cronSecret}`
  const isManualCron = request.headers.get('x-cron-secret') === cronSecret

  if (!isVercelCron && !isManualCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    success: true,
    expiredDeleted: 0,
    orphanedDeleted: 0,
    totalCacheEntries: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {

    // Delete expired cache entries
    const expiredResult = await prisma.grantMatchCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })
    results.expiredDeleted = expiredResult.count

    // Delete orphaned entries (grants that no longer exist)
    // First get all grant IDs in cache
    const cachedGrantIds = await prisma.grantMatchCache.findMany({
      select: { grantId: true },
      distinct: ['grantId'],
    })

    if (cachedGrantIds.length > 0) {
      // Find which grants still exist
      const existingGrants = await prisma.grant.findMany({
        where: {
          id: { in: cachedGrantIds.map(c => c.grantId) },
        },
        select: { id: true },
      })

      const existingIds = new Set(existingGrants.map(g => g.id))
      const orphanedGrantIds = cachedGrantIds
        .map(c => c.grantId)
        .filter(id => !existingIds.has(id))

      if (orphanedGrantIds.length > 0) {
        const orphanedResult = await prisma.grantMatchCache.deleteMany({
          where: {
            grantId: { in: orphanedGrantIds },
          },
        })
        results.orphanedDeleted = orphanedResult.count
      }
    }

    // Get remaining cache count
    results.totalCacheEntries = await prisma.grantMatchCache.count()

    results.duration = Date.now() - startTime

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON:cleanup-cache] Failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}
