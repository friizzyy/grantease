import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { grantsGovApi, normalizeGrantsGovOpportunity } from '@/lib/services/grants-gov-api'

// Protect this endpoint with admin API key - require ADMIN_API_KEY to be set
function isAuthorized(request: NextRequest): boolean {
  const expectedKey = process.env.ADMIN_API_KEY
  if (!expectedKey) {
    console.error('ADMIN_API_KEY not configured - blocking admin requests')
    return false
  }
  const apiKey = request.headers.get('x-api-key')
  return apiKey === expectedKey
}

/**
 * POST /api/grants/sync
 *
 * Sync grants from Grants.gov to our database.
 * Protected by admin API key.
 *
 * Query params:
 * - maxPages: Maximum pages to fetch (default: 5)
 * - keyword: Optional keyword filter
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const maxPages = parseInt(searchParams.get('maxPages') || '5')
  const keyword = searchParams.get('keyword') || undefined

  const startTime = Date.now()
  const results = {
    success: true,
    grantsFound: 0,
    grantsNew: 0,
    grantsUpdated: 0,
    grantsSkipped: 0,
    errors: [] as string[],
    duration: 0,
  }

  try {
    // Create ingestion run record
    const source = await prisma.ingestionSource.findUnique({
      where: { name: 'grants-gov' },
    })

    if (!source) {
      return NextResponse.json(
        { error: 'Grants.gov source not configured' },
        { status: 400 }
      )
    }

    const run = await prisma.ingestionRun.create({
      data: {
        sourceId: source.id,
        status: 'running',
        startedAt: new Date(),
      },
    })

    // Fetch opportunities from Grants.gov
    console.log(`Starting Grants.gov sync (maxPages: ${maxPages})...`)

    let opportunities
    if (keyword) {
      const response = await grantsGovApi.searchOpportunities({
        keyword,
        oppStatuses: 'posted',
        rows: 100,
      })
      opportunities = response.data?.oppHits || response.hitOppHitList || []
    } else {
      opportunities = await grantsGovApi.fetchAllPostedOpportunities({
        maxPages,
        onProgress: (fetched, total) => {
          console.log(`Fetched ${fetched}/${total} opportunities`)
        },
      })
    }

    results.grantsFound = opportunities.length
    console.log(`Found ${opportunities.length} opportunities`)

    // Process each opportunity
    for (const opp of opportunities) {
      try {
        const normalized = normalizeGrantsGovOpportunity(opp)

        // Check if grant already exists
        const existing = await prisma.grant.findUnique({
          where: {
            sourceName_sourceId: {
              sourceName: normalized.sourceName,
              sourceId: normalized.sourceId,
            },
          },
        })

        if (existing) {
          // Update if hash changed (indicates update)
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
          // Create new grant
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
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Failed to process ${opp.id}: ${errorMsg}`)
        console.error(`Error processing opportunity ${opp.id}:`, error)
      }
    }

    results.duration = Date.now() - startTime

    // Update ingestion run record
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: results.errors.length > 0 ? 'partial' : 'success',
        grantsFound: results.grantsFound,
        grantsNew: results.grantsNew,
        grantsUpdated: results.grantsUpdated,
        grantsDupes: results.grantsSkipped,
        completedAt: new Date(),
        logs: JSON.stringify(results.errors.slice(0, 100)), // Store first 100 errors
      },
    })

    // Update source last run info
    await prisma.ingestionSource.update({
      where: { id: source.id },
      data: {
        lastRunAt: new Date(),
        lastStatus: results.errors.length > 0 ? 'partial' : 'success',
        grantsCount: await prisma.grant.count({
          where: { sourceName: 'grants-gov' },
        }),
      },
    })

    console.log(`Sync completed in ${results.duration}ms`)
    console.log(`New: ${results.grantsNew}, Updated: ${results.grantsUpdated}, Skipped: ${results.grantsSkipped}`)

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    results.errors.push(errorMsg)

    console.error('Sync failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}

/**
 * GET /api/grants/sync
 *
 * Get sync status and history
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const source = await prisma.ingestionSource.findUnique({
      where: { name: 'grants-gov' },
    })

    const recentRuns = await prisma.ingestionRun.findMany({
      where: { source: { name: 'grants-gov' } },
      orderBy: { startedAt: 'desc' },
      take: 10,
    })

    const totalGrants = await prisma.grant.count({
      where: { sourceName: 'grants-gov' },
    })

    return NextResponse.json({
      source,
      recentRuns,
      totalGrants,
    })
  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    )
  }
}
