import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { runAdapterById, runAllAdapters, getAdapterById, type IngestionLogger } from '@/lib/ingestion'

// Admin API key check - require ADMIN_API_KEY to be set
function isAuthorized(request: NextRequest): boolean {
  const expectedKey = process.env.ADMIN_API_KEY
  if (!expectedKey) {
    console.error('ADMIN_API_KEY not configured - blocking admin requests')
    return false
  }
  const apiKey = request.headers.get('x-api-key')
  return apiKey === expectedKey
}

// Create a logger that collects logs for the response
function createLogger(): { logger: IngestionLogger; logs: Array<{ time: string; level: string; message: string; metadata?: unknown }> } {
  const logs: Array<{ time: string; level: string; message: string; metadata?: unknown }> = []
  const logger: IngestionLogger = {
    info: (message, metadata) => {
      logs.push({ time: new Date().toISOString(), level: 'info', message, metadata })
      console.log(`[INFO] ${message}`, metadata || '')
    },
    warn: (message, metadata) => {
      logs.push({ time: new Date().toISOString(), level: 'warn', message, metadata })
      console.warn(`[WARN] ${message}`, metadata || '')
    },
    error: (message, metadata) => {
      logs.push({ time: new Date().toISOString(), level: 'error', message, metadata })
      console.error(`[ERROR] ${message}`, metadata || '')
    },
    success: (message, metadata) => {
      logs.push({ time: new Date().toISOString(), level: 'success', message, metadata })
      console.log(`[SUCCESS] ${message}`, metadata || '')
    },
  }
  return { logger, logs }
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
    const { sourceId, adapterId, runAll } = body

    // Use adapterId or sourceId (sourceId for backward compatibility)
    const targetAdapter = adapterId || sourceId

    const { logger, logs } = createLogger()

    if (runAll) {
      // Run all enabled adapters using the real ingestion system
      logger.info('Starting full ingestion run for all enabled adapters')
      const results = await runAllAdapters(logger)

      // Convert Map to object for JSON serialization
      const resultsObject: Record<string, unknown> = {}
      let totalNew = 0
      let totalUpdated = 0
      let totalProcessed = 0

      results.forEach((value, key) => {
        resultsObject[key] = value
        totalNew += value.grantsNew
        totalUpdated += value.grantsUpdated
        totalProcessed += value.grantsProcessed
      })

      return NextResponse.json({
        success: true,
        summary: {
          adaptersRun: results.size,
          totalProcessed,
          totalNew,
          totalUpdated,
        },
        results: resultsObject,
        logs,
      })
    }

    if (!targetAdapter) {
      return NextResponse.json(
        { error: 'adapterId or sourceId is required' },
        { status: 400 }
      )
    }

    // Check if adapter exists
    const adapter = getAdapterById(targetAdapter)
    if (!adapter) {
      // Try to find by database source ID
      const dbSource = await prisma.ingestionSource.findUnique({
        where: { id: targetAdapter },
      })

      if (!dbSource) {
        return NextResponse.json(
          { error: `Adapter or source not found: ${targetAdapter}` },
          { status: 404 }
        )
      }

      // Use the source name as adapter ID
      const adapterByName = getAdapterById(dbSource.name)
      if (!adapterByName) {
        return NextResponse.json(
          { error: `No adapter registered for source: ${dbSource.name}` },
          { status: 404 }
        )
      }

      // Run the adapter
      const result = await runAdapterById(dbSource.name, logger)

      return NextResponse.json({
        success: result?.success ?? false,
        adapterId: dbSource.name,
        result,
        logs,
      })
    }

    // Run the specific adapter using the real ingestion system
    logger.info(`Starting ingestion for adapter: ${targetAdapter}`)
    const result = await runAdapterById(targetAdapter, logger)

    if (!result) {
      return NextResponse.json(
        { error: `Failed to run adapter: ${targetAdapter}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: result.success,
      adapterId: targetAdapter,
      result,
      logs,
    })
  } catch (error) {
    console.error('Run ingestion error:', error)
    return NextResponse.json(
      { error: 'Failed to run ingestion', message: (error as Error).message },
      { status: 500 }
    )
  }
}
