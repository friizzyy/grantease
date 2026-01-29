import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Admin API key check
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  return apiKey === process.env.ADMIN_API_KEY
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get ingestion sources and recent runs
    const [sources, recentRuns] = await Promise.all([
      prisma.ingestionSource.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.ingestionRun.findMany({
        take: 50,
        orderBy: { startedAt: 'desc' },
        include: {
          source: {
            select: { name: true },
          },
        },
      }),
    ])

    return NextResponse.json({ sources, recentRuns })
  } catch (error) {
    console.error('Get ingestion status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingestion status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sourceId, runAll } = body

    if (runAll) {
      // Run all enabled sources
      const enabledSources = await prisma.ingestionSource.findMany({
        where: { enabled: true },
      })

      const runs = []
      for (const source of enabledSources) {
        const run = await runIngestion(source.id)
        runs.push(run)
      }

      return NextResponse.json({ runs })
    }

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      )
    }

    const run = await runIngestion(sourceId)
    return NextResponse.json({ run })
  } catch (error) {
    console.error('Run ingestion error:', error)
    return NextResponse.json(
      { error: 'Failed to run ingestion' },
      { status: 500 }
    )
  }
}

async function runIngestion(sourceId: string) {
  const source = await prisma.ingestionSource.findUnique({
    where: { id: sourceId },
  })

  if (!source) {
    throw new Error('Source not found')
  }

  // Create ingestion run record
  const run = await prisma.ingestionRun.create({
    data: {
      sourceId,
      sourceName: source.name,
      status: 'running',
      logs: JSON.stringify([{ time: new Date().toISOString(), level: 'info', message: 'Ingestion started' }]),
    },
  })

  // In a real implementation, this would:
  // 1. Call the appropriate adapter based on source.type
  // 2. Fetch data from the source
  // 3. Normalize grants to canonical format
  // 4. Deduplicate against existing grants
  // 5. Insert/update grants in database
  // 6. Update run record with results

  // For now, simulate the process
  setTimeout(async () => {
    try {
      const grantsFound = Math.floor(Math.random() * 100) + 50
      const grantsDupes = Math.floor(Math.random() * 10)

      await prisma.ingestionRun.update({
        where: { id: run.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          grantsFound,
          grantsNew: grantsFound - grantsDupes,
          grantsUpdated: Math.floor(grantsDupes / 2),
          grantsDupes,
          logs: JSON.stringify([
            { time: new Date().toISOString(), level: 'info', message: 'Ingestion started' },
            { time: new Date().toISOString(), level: 'info', message: `Fetched ${grantsFound} grants` },
            { time: new Date().toISOString(), level: 'info', message: `Skipped ${grantsDupes} duplicates` },
            { time: new Date().toISOString(), level: 'success', message: 'Ingestion completed' },
          ]),
        },
      })

      // Update source last run
      await prisma.ingestionSource.update({
        where: { id: sourceId },
        data: {
          lastRunAt: new Date(),
          lastStatus: 'success',
        },
      })
    } catch (error) {
      await prisma.ingestionRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: String(error),
          logs: JSON.stringify([
            { time: new Date().toISOString(), level: 'info', message: 'Ingestion started' },
            { time: new Date().toISOString(), level: 'error', message: `Error: ${error}` },
          ]),
        },
      })

      await prisma.ingestionSource.update({
        where: { id: sourceId },
        data: {
          lastRunAt: new Date(),
          lastStatus: 'failed',
        },
      })
    }
  }, 5000)

  return run
}
