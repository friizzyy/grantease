import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/cron/update-quality
 *
 * Daily cron job to recalculate grant quality scores.
 * Quality score (0-1) based on data completeness.
 *
 * Vercel Cron: "0 4 * * *" (Daily at 4 AM)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[CRON:update-quality] CRON_SECRET not configured')
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
    processed: 0,
    updated: 0,
    closedDueToDeadline: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('[CRON:update-quality] Starting quality score update...')

    // Process grants in batches
    const batchSize = 200
    let skip = 0
    let hasMore = true

    while (hasMore) {
      const grants = await prisma.grant.findMany({
        skip,
        take: batchSize,
        select: {
          id: true,
          title: true,
          summary: true,
          description: true,
          eligibility: true,
          amountMin: true,
          amountMax: true,
          amountText: true,
          deadlineDate: true,
          deadlineType: true,
          requirements: true,
          url: true,
          linkStatus: true,
          purposeTags: true,
          qualityScore: true,
          status: true,
        },
      })

      if (grants.length < batchSize) {
        hasMore = false
      }

      for (const grant of grants) {
        results.processed++

        try {
          const newScore = calculateQualityScore(grant)
          const updates: Record<string, unknown> = {}

          // Update quality score if changed significantly
          if (Math.abs((grant.qualityScore || 0) - newScore) > 0.01) {
            updates.qualityScore = newScore
          }

          // Auto-close expired grants
          if (
            grant.status === 'open' &&
            grant.deadlineDate &&
            grant.deadlineType === 'fixed' &&
            new Date(grant.deadlineDate) < new Date()
          ) {
            updates.status = 'closed'
            results.closedDueToDeadline++
          }

          if (Object.keys(updates).length > 0) {
            await prisma.grant.update({
              where: { id: grant.id },
              data: updates,
            })
            results.updated++
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown'
          results.errors.push(`${grant.id}: ${msg}`)
        }
      }

      skip += batchSize
    }

    results.duration = Date.now() - startTime

    console.log(
      `[CRON:update-quality] Completed: ${results.updated} updated, ${results.closedDueToDeadline} closed`
    )

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON:update-quality] Failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}

/**
 * Calculate quality score (0-1) based on data completeness.
 * Each field contributes 0.1 to the score.
 */
function calculateQualityScore(grant: {
  title: string | null
  summary: string | null
  description: string | null
  eligibility: string | null
  amountMin: number | null
  amountMax: number | null
  amountText: string | null
  deadlineDate: Date | null
  deadlineType: string | null
  requirements: string | null
  url: string | null
  linkStatus: string | null
  purposeTags: string | null
}): number {
  let score = 0

  // Title (0.1)
  if (grant.title && grant.title.length > 5) score += 0.1

  // Summary (0.1)
  if (grant.summary && grant.summary.length > 20) score += 0.1

  // Description (0.1)
  if (grant.description && grant.description.length > 50) score += 0.1

  // Eligibility (0.1)
  if (grant.eligibility) {
    try {
      const parsed = JSON.parse(grant.eligibility)
      if (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0) {
        score += 0.1
      }
    } catch {
      if (grant.eligibility.length > 10) score += 0.1
    }
  }

  // Amount (0.1)
  if (grant.amountMin || grant.amountMax || grant.amountText) score += 0.1

  // Deadline (0.1)
  if (grant.deadlineDate || grant.deadlineType === 'rolling') score += 0.1

  // Requirements (0.1)
  if (grant.requirements) {
    try {
      const parsed = JSON.parse(grant.requirements)
      if (Array.isArray(parsed) && parsed.length > 0) score += 0.1
    } catch {
      if (grant.requirements.length > 10) score += 0.1
    }
  }

  // URL (0.1)
  if (grant.url && grant.url.length > 10) score += 0.1

  // URL verified active (0.1)
  if (grant.linkStatus === 'active') score += 0.1

  // Purpose tags (0.1)
  if (grant.purposeTags) {
    try {
      const tags = JSON.parse(grant.purposeTags)
      if (Array.isArray(tags) && tags.length > 0) score += 0.1
    } catch {
      // Not valid JSON, skip
    }
  }

  return Math.min(1, Math.max(0, score))
}
