import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { discoverGrants } from '@/lib/services/gemini-grant-discovery'
import type { EntityType } from '@/lib/types/onboarding'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * GET /api/cron/sync-grants
 *
 * Cron endpoint for automated grant discovery using Gemini AI.
 * Discovers grants for all active users based on their profiles.
 *
 * Security: Validates CRON_SECRET header
 */
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron call
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured')
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
    source: 'gemini-discovery',
    usersProcessed: 0,
    grantsFound: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {

    // Get users with completed profiles
    const profiles = await prisma.userProfile.findMany({
      where: {
        onboardingCompleted: true,
      },
      select: {
        userId: true,
        entityType: true,
        industryTags: true,
        state: true,
      },
      take: 50, // Process up to 50 users per run
    })

    for (const profile of profiles) {
      try {
        // Parse industry tags (stored as JSON string)
        let industryTags: string[] = []
        try {
          const parsed: unknown = JSON.parse(profile.industryTags || '[]')
          industryTags = Array.isArray(parsed) ? (parsed as string[]) : []
        } catch {
          industryTags = []
        }

        // Skip if no valid profile data
        if (!profile.entityType) {
          continue
        }

        // Discover grants for this user
        const { grants } = await discoverGrants({
          entityType: profile.entityType as EntityType,
          industryTags,
          state: profile.state,
        } as Parameters<typeof discoverGrants>[0])

        results.grantsFound += grants.length
        results.usersProcessed++

      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown'
        results.errors.push(`User ${profile.userId}: ${msg}`)
      }
    }

    results.duration = Date.now() - startTime

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON] Discovery failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}
