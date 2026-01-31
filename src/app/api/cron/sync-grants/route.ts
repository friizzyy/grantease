import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { grantsGovApi, normalizeGrantsGovOpportunity } from '@/lib/services/grants-gov-api'

/**
 * GET /api/cron/sync-grants
 *
 * Cron endpoint for automated grant syncing.
 * Configure in vercel.json or call via external cron service.
 *
 * Vercel Cron config (add to vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-grants",
 *     "schedule": "0 6,18 * * *"
 *   }]
 * }
 *
 * Security: Validates CRON_SECRET header or Vercel's internal auth
 */
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron call
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // CRON_SECRET must be configured in all environments
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured - blocking request')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }

  // Check for Vercel cron or manual cron secret
  const isVercelCron = authHeader === `Bearer ${cronSecret}`
  const isManualCron = request.headers.get('x-cron-secret') === cronSecret

  if (!isVercelCron && !isManualCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    success: true,
    source: 'grants-gov',
    grantsFound: 0,
    grantsNew: 0,
    grantsUpdated: 0,
    grantsSkipped: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('[CRON] Starting grants sync...')

    // Get or create source
    let source = await prisma.ingestionSource.findUnique({
      where: { name: 'grants-gov' },
    })

    if (!source) {
      source = await prisma.ingestionSource.create({
        data: {
          name: 'grants-gov',
          displayName: 'Grants.gov',
          type: 'api',
          config: JSON.stringify({ apiUrl: 'https://www.grants.gov/grantsws/rest' }),
          enabled: true,
        },
      })
    }

    // Create run record
    const run = await prisma.ingestionRun.create({
      data: {
        sourceId: source.id,
        status: 'running',
        startedAt: new Date(),
      },
    })

    // Fetch from Grants.gov (limit to 5 pages = ~500 grants per sync)
    const opportunities = await grantsGovApi.fetchAllPostedOpportunities({
      maxPages: 5,
      onProgress: (fetched, total) => {
        console.log(`[CRON] Progress: ${fetched}/${total}`)
      },
    })

    results.grantsFound = opportunities.length

    // Process each opportunity
    for (const opp of opportunities) {
      try {
        const normalized = normalizeGrantsGovOpportunity(opp)

        const existing = await prisma.grant.findUnique({
          where: {
            sourceName_sourceId: {
              sourceName: normalized.sourceName,
              sourceId: normalized.sourceId,
            },
          },
        })

        if (existing) {
          if (existing.hashFingerprint !== normalized.hashFingerprint) {
            await prisma.grant.update({
              where: { id: existing.id },
              data: {
                title: normalized.title,
                sponsor: normalized.sponsor,
                summary: normalized.summary,
                description: normalized.description,
                categories: JSON.stringify(normalized.categories),
                eligibility: JSON.stringify(normalized.eligibility),
                locations: JSON.stringify(normalized.locations),
                amountMin: normalized.amountMin,
                amountMax: normalized.amountMax,
                amountText: normalized.amountText,
                deadlineDate: normalized.deadlineDate,
                deadlineType: normalized.deadlineType,
                url: normalized.url,
                contact: normalized.contact,
                requirements: JSON.stringify(normalized.requirements),
                status: normalized.status,
                hashFingerprint: normalized.hashFingerprint,
                updatedAt: new Date(),
              },
            })
            results.grantsUpdated++
          } else {
            results.grantsSkipped++
          }
        } else {
          await prisma.grant.create({
            data: {
              sourceId: normalized.sourceId,
              sourceName: normalized.sourceName,
              title: normalized.title,
              sponsor: normalized.sponsor,
              summary: normalized.summary,
              description: normalized.description,
              categories: JSON.stringify(normalized.categories),
              eligibility: JSON.stringify(normalized.eligibility),
              locations: JSON.stringify(normalized.locations),
              amountMin: normalized.amountMin,
              amountMax: normalized.amountMax,
              amountText: normalized.amountText,
              deadlineDate: normalized.deadlineDate,
              deadlineType: normalized.deadlineType,
              url: normalized.url,
              contact: normalized.contact,
              requirements: JSON.stringify(normalized.requirements),
              status: normalized.status,
              hashFingerprint: normalized.hashFingerprint,
            },
          })
          results.grantsNew++
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown'
        results.errors.push(`${opp.id}: ${msg}`)
      }
    }

    results.duration = Date.now() - startTime

    // Update run record
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: results.errors.length > 0 ? 'partial' : 'success',
        grantsFound: results.grantsFound,
        grantsNew: results.grantsNew,
        grantsUpdated: results.grantsUpdated,
        grantsDupes: results.grantsSkipped,
        completedAt: new Date(),
        logs: JSON.stringify(results.errors.slice(0, 50)),
      },
    })

    // Update source stats
    await prisma.ingestionSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: results.errors.length > 0 ? 'partial' : 'success',
        grantsCount: await prisma.grant.count({ where: { sourceName: 'grants-gov' } }),
      },
    })

    console.log(`[CRON] Completed: ${results.grantsNew} new, ${results.grantsUpdated} updated, ${results.grantsSkipped} skipped`)

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON] Sync failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}
