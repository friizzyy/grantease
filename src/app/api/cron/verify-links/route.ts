import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/cron/verify-links
 *
 * Weekly cron job to verify grant URLs are still active.
 * Updates linkStatus (active/broken) and lastVerifiedAt.
 *
 * Vercel Cron: "0 3 * * 0" (Sundays at 3 AM)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[CRON:verify-links] CRON_SECRET not configured')
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
    checked: 0,
    active: 0,
    broken: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('[CRON:verify-links] Starting link verification...')

    // Get grants that haven't been verified in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const grants = await prisma.grant.findMany({
      where: {
        url: { not: '' },
        status: 'open',
        OR: [
          { lastVerifiedAt: null },
          { lastVerifiedAt: { lt: sevenDaysAgo } },
        ],
      },
      select: { id: true, url: true, title: true },
      take: 100, // Limit per run to avoid timeouts
    })

    console.log(`[CRON:verify-links] Checking ${grants.length} grants`)

    for (const grant of grants) {
      if (!grant.url) continue

      results.checked++

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(grant.url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'GrantEase-LinkChecker/1.0',
          },
        })

        clearTimeout(timeoutId)

        const isActive = response.ok || response.status === 405 // Some sites don't allow HEAD

        await prisma.grant.update({
          where: { id: grant.id },
          data: {
            linkStatus: isActive ? 'active' : 'broken',
            lastVerifiedAt: new Date(),
          },
        })

        if (isActive) {
          results.active++
        } else {
          results.broken++
          console.log(`[CRON:verify-links] Broken link: ${grant.title} (${response.status})`)
        }
      } catch (error) {
        // Network error or timeout - mark as broken
        await prisma.grant.update({
          where: { id: grant.id },
          data: {
            linkStatus: 'broken',
            lastVerifiedAt: new Date(),
          },
        })
        results.broken++

        const msg = error instanceof Error ? error.message : 'Unknown'
        results.errors.push(`${grant.id}: ${msg}`)
      }
    }

    results.duration = Date.now() - startTime

    console.log(
      `[CRON:verify-links] Completed: ${results.active} active, ${results.broken} broken`
    )

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON:verify-links] Failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}
