/**
 * Ingestion Run Orchestrator
 * 
 * Main entry point for running grant ingestion.
 * Coordinates adapters, normalization, deduplication, and database operations.
 */

import { PrismaClient } from '@prisma/client'
import type { 
  IngestionAdapter, 
  IngestionResult, 
  IngestionError,
  IngestionLogger,
  NormalizedGrant,
} from './types'
import { getEnabledAdapters, getAdapterById } from './adapters'
import { generateFingerprint } from './utils/dedupe'
import { batchDeduplicate } from './utils/dedupe'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * Default console logger
 */
const defaultLogger: IngestionLogger = {
  info: (message, metadata) => console.log(`[INFO] ${message}`, metadata || ''),
  warn: (message, metadata) => console.warn(`[WARN] ${message}`, metadata || ''),
  error: (message, metadata) => console.error(`[ERROR] ${message}`, metadata || ''),
  success: (message, metadata) => console.log(`[SUCCESS] ${message}`, metadata || ''),
}

/**
 * Run ingestion for a single adapter
 */
export async function runAdapter(
  adapter: IngestionAdapter,
  logger: IngestionLogger = defaultLogger
): Promise<IngestionResult> {
  const startTime = Date.now()
  const errors: IngestionError[] = []
  
  let grantsProcessed = 0
  let grantsNew = 0
  let grantsUpdated = 0
  let grantsDuplicate = 0
  
  try {
    logger.info(`Starting ingestion for ${adapter.config.name}`)
    
    // Fetch raw grants from source
    logger.info(`Fetching grants from ${adapter.config.name}...`)
    const rawGrants = await adapter.fetch()
    logger.info(`Fetched ${rawGrants.length} grants from ${adapter.config.name}`)
    
    // Normalize grants
    const normalizedGrants: NormalizedGrant[] = []
    for (const raw of rawGrants) {
      try {
        const normalized = adapter.normalize(raw)
        normalizedGrants.push(normalized)
      } catch (error) {
        errors.push({
          sourceId: raw.sourceId,
          message: `Failed to normalize grant: ${(error as Error).message}`,
          recoverable: true,
        })
      }
    }
    
    // Load existing grants for deduplication
    const existingGrants = await loadExistingGrants()
    
    // Deduplicate
    const { newGrants, duplicates, updates } = batchDeduplicate(
      normalizedGrants,
      existingGrants
    )
    
    grantsProcessed = normalizedGrants.length
    grantsNew = newGrants.length
    grantsUpdated = updates.length
    grantsDuplicate = duplicates.length
    
    // Insert new grants
    for (const grant of newGrants) {
      try {
        await insertGrant(grant)
      } catch (error) {
        errors.push({
          sourceId: grant.sourceId,
          message: `Failed to insert grant: ${(error as Error).message}`,
          recoverable: true,
        })
      }
    }
    
    // Update existing grants
    for (const { grant, existingId } of updates) {
      try {
        await updateGrant(existingId, grant)
      } catch (error) {
        errors.push({
          sourceId: grant.sourceId,
          message: `Failed to update grant: ${(error as Error).message}`,
          recoverable: true,
        })
      }
    }
    
    // Mark duplicates
    for (const { grant, existingId } of duplicates) {
      logger.info(`Duplicate found: ${grant.title} -> ${existingId}`)
    }
    
    logger.success(`Completed ${adapter.config.name}`, {
      processed: grantsProcessed,
      new: grantsNew,
      updated: grantsUpdated,
      duplicates: grantsDuplicate,
      errors: errors.length,
    })
    
  } catch (error) {
    const err = error as Error
    logger.error(`Fatal error in ${adapter.config.name}: ${err.message}`)
    errors.push({
      sourceId: null,
      message: err.message,
      stack: err.stack,
      recoverable: false,
    })
  }
  
  const duration = Date.now() - startTime
  
  // Log the run to database
  await logIngestionRun(adapter.config.id, {
    success: errors.filter(e => !e.recoverable).length === 0,
    grantsProcessed,
    grantsNew,
    grantsUpdated,
    grantsDuplicate,
    errors,
    duration,
    timestamp: new Date(),
  })
  
  return {
    success: errors.filter(e => !e.recoverable).length === 0,
    grantsProcessed,
    grantsNew,
    grantsUpdated,
    grantsDuplicate,
    errors,
    duration,
    timestamp: new Date(),
  }
}

/**
 * Run ingestion for all enabled adapters
 */
export async function runAllAdapters(
  logger: IngestionLogger = defaultLogger
): Promise<Map<string, IngestionResult>> {
  const results = new Map<string, IngestionResult>()
  const adapters = getEnabledAdapters()
  
  logger.info(`Starting ingestion run for ${adapters.length} sources`)
  
  for (const adapter of adapters) {
    try {
      const result = await runAdapter(adapter, logger)
      results.set(adapter.config.id, result)
    } catch (error) {
      logger.error(`Failed to run adapter ${adapter.config.id}: ${(error as Error).message}`)
      results.set(adapter.config.id, {
        success: false,
        grantsProcessed: 0,
        grantsNew: 0,
        grantsUpdated: 0,
        grantsDuplicate: 0,
        errors: [{
          sourceId: null,
          message: (error as Error).message,
          recoverable: false,
        }],
        duration: 0,
        timestamp: new Date(),
      })
    }
  }
  
  // Summary
  const totalProcessed = Array.from(results.values()).reduce((sum, r) => sum + r.grantsProcessed, 0)
  const totalNew = Array.from(results.values()).reduce((sum, r) => sum + r.grantsNew, 0)
  const totalUpdated = Array.from(results.values()).reduce((sum, r) => sum + r.grantsUpdated, 0)
  const totalErrors = Array.from(results.values()).reduce((sum, r) => sum + r.errors.length, 0)
  
  logger.info('Ingestion run complete', {
    sources: adapters.length,
    totalProcessed,
    totalNew,
    totalUpdated,
    totalErrors,
  })
  
  return results
}

/**
 * Run ingestion for a specific adapter by ID
 */
export async function runAdapterById(
  adapterId: string,
  logger: IngestionLogger = defaultLogger
): Promise<IngestionResult | null> {
  const adapter = getAdapterById(adapterId)
  if (!adapter) {
    logger.error(`Adapter not found: ${adapterId}`)
    return null
  }
  
  return runAdapter(adapter, logger)
}

// Database helper functions

async function loadExistingGrants() {
  const grants = await prisma.grant.findMany({
    where: { status: { not: 'closed' } },
    select: {
      id: true,
      sourceId: true,
      sourceName: true,
      hashFingerprint: true,
      title: true,
      sponsor: true,
      summary: true,
      deadlineDate: true,
      amountMin: true,
      amountMax: true,
      categories: true,
      eligibility: true,
      locations: true,
    },
  })
  
  const map = new Map<string, { id: string; fingerprint: string; grant: NormalizedGrant }>()
  
  for (const grant of grants) {
    const key = `${grant.sourceName}:${grant.sourceId}`
    map.set(key, {
      id: grant.id,
      fingerprint: grant.hashFingerprint || '',
      grant: {
        sourceId: grant.sourceId,
        sourceName: grant.sourceName,
        title: grant.title,
        sponsor: grant.sponsor,
        summary: grant.summary,
        description: null,
        categories: JSON.parse(grant.categories || '[]') as string[],
        eligibility: JSON.parse(grant.eligibility || '[]') as string[],
        locations: JSON.parse(grant.locations || '[]') as string[],
        amountMin: grant.amountMin,
        amountMax: grant.amountMax,
        deadlineDate: grant.deadlineDate,
        openDate: null,
        url: '',
        contactEmail: null,
        contactPhone: null,
        contactName: null,
        requirements: [],
        status: 'open',
      },
    })
  }
  
  return map
}

async function insertGrant(grant: NormalizedGrant) {
  const fingerprint = generateFingerprint(grant)

  await prisma.grant.create({
    data: {
      sourceId: grant.sourceId,
      sourceName: grant.sourceName,
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.summary,
      description: grant.description,
      categories: JSON.stringify(grant.categories),
      eligibility: JSON.stringify(grant.eligibility),
      locations: JSON.stringify(grant.locations),
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
      deadlineDate: grant.deadlineDate,
      postedDate: grant.openDate,
      url: grant.url,
      contact: grant.contactEmail ? JSON.stringify({ email: grant.contactEmail, phone: grant.contactPhone, name: grant.contactName }) : null,
      requirements: JSON.stringify(grant.requirements),
      status: grant.status,
      hashFingerprint: fingerprint,
    },
  })
}

async function updateGrant(id: string, grant: NormalizedGrant) {
  const fingerprint = generateFingerprint(grant)
  
  await prisma.grant.update({
    where: { id },
    data: {
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.summary,
      description: grant.description,
      categories: JSON.stringify(grant.categories),
      eligibility: JSON.stringify(grant.eligibility),
      locations: JSON.stringify(grant.locations),
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
      deadlineDate: grant.deadlineDate,
      postedDate: grant.openDate,
      url: grant.url,
      contact: grant.contactEmail ? JSON.stringify({ email: grant.contactEmail, phone: grant.contactPhone, name: grant.contactName }) : null,
      requirements: JSON.stringify(grant.requirements),
      status: grant.status,
      hashFingerprint: fingerprint,
    },
  })
}

async function logIngestionRun(sourceId: string, result: IngestionResult) {
  try {
    // Find or create the ingestion source
    let source = await prisma.ingestionSource.findFirst({
      where: { name: sourceId },
    })

    if (!source) {
      const adapter = getAdapterById(sourceId)
      if (adapter) {
        source = await prisma.ingestionSource.create({
          data: {
            name: adapter.config.id,
            displayName: adapter.config.name,
            type: adapter.config.type,
            config: JSON.stringify(adapter.config),
            enabled: adapter.config.enabled,
          },
        })
      }
    }

    if (source) {
      await prisma.ingestionRun.create({
        data: {
          sourceId: source.id,
          sourceName: source.name,
          status: result.success ? 'success' : 'failed',
          grantsFound: result.grantsProcessed,
          grantsNew: result.grantsNew,
          grantsUpdated: result.grantsUpdated,
          grantsDupes: result.grantsDuplicate,
          errorMessage: result.errors.length > 0 ? result.errors.map(e => e.message).join('; ') : null,
          logs: JSON.stringify(result.errors),
        },
      })
    }
  } catch (error) {
    console.error('Failed to log ingestion run:', error)
  }
}
