/**
 * Grant Ingestion Pipeline
 *
 * Orchestrates the full ingestion flow:
 * 1. Scrape sources
 * 2. Extract with LLM
 * 3. Validate and deduplicate
 * 4. Persist to database
 * 5. Verify links and expire old grants
 */

import { prisma } from '@/lib/db';
import {
  IngestionSourceConfig,
  RawGrantPage,
  ExtractedGrant,
  NormalizedGrant,
  IngestionRunStats,
  IngestionError,
  PipelineProgress,
  IngestionHealthStatus,
} from './types';
import { getEnabledSources, getSourceById } from './sources';
import { scrapeGrantPage, scrapeListingPage, fetchFromApi, batchVerifyUrls } from './scraper';
import { extractWithLLM, batchExtract, extractFromApiResponse } from './extractor';
import {
  validateGrant,
  normalizeGrant,
  processBatch,
  deduplicateAgainstExisting,
  findExpiredGrants,
  generateFingerprint,
} from './validator';

// ==================== PIPELINE ORCHESTRATION ====================

/**
 * Run ingestion for a single source
 */
export async function runSourceIngestion(
  sourceId: string,
  onProgress?: (progress: PipelineProgress) => void
): Promise<IngestionRunStats> {
  const source = getSourceById(sourceId);
  if (!source) {
    throw new Error(`Unknown source: ${sourceId}`);
  }

  const stats: IngestionRunStats = {
    runId: `run_${Date.now()}_${sourceId}`,
    sourceName: source.name,
    startedAt: new Date(),
    status: 'running',
    pagesScraped: 0,
    grantsFound: 0,
    grantsNew: 0,
    grantsUpdated: 0,
    grantsDuplicates: 0,
    grantsExpired: 0,
    grantsFailed: 0,
    errors: [],
  };

  // Create ingestion run record
  const dbRun = await prisma.ingestionRun.create({
    data: {
      sourceName: source.name,
      status: 'running',
      startedAt: stats.startedAt,
    },
  });

  try {
    onProgress?.({
      stage: 'scrape',
      progress: 0,
      message: `Starting ingestion for ${source.displayName}`,
      itemsProcessed: 0,
      itemsTotal: 0,
    });

    let rawPages: RawGrantPage[] = [];
    let apiGrants: ExtractedGrant[] = [];

    // Stage 1: Scrape or fetch data
    if (source.type === 'api') {
      // API-based source
      const { rawGrants, errors } = await fetchFromApi(source, (msg, count) => {
        onProgress?.({
          stage: 'scrape',
          progress: 10,
          message: msg,
          itemsProcessed: count,
          itemsTotal: 0,
        });
      });

      stats.errors.push(...errors);

      // Convert API responses to ExtractedGrant
      for (const rawGrant of rawGrants) {
        const extracted = extractFromApiResponse(
          rawGrant as Record<string, unknown>,
          source.name
        );
        if (extracted) {
          apiGrants.push(extracted);
        }
      }

      stats.grantsFound = apiGrants.length;
      stats.pagesScraped = 1;
    } else {
      // Scrape-based source
      const { grantUrls, errors: listErrors } = await scrapeListingPage(
        source,
        (msg, count) => {
          onProgress?.({
            stage: 'scrape',
            progress: 5,
            message: msg,
            itemsProcessed: count,
            itemsTotal: 0,
          });
        }
      );

      stats.errors.push(...listErrors);

      // Scrape individual grant pages
      for (let i = 0; i < grantUrls.length; i++) {
        const url = grantUrls[i];

        onProgress?.({
          stage: 'scrape',
          progress: 5 + (i / grantUrls.length) * 25,
          message: `Scraping grant ${i + 1} of ${grantUrls.length}`,
          itemsProcessed: i,
          itemsTotal: grantUrls.length,
        });

        const { page, error } = await scrapeGrantPage(url, source);

        if (error) {
          stats.errors.push(error);
          continue;
        }

        if (page) {
          rawPages.push(page);
          stats.pagesScraped++;
        }
      }
    }

    // Stage 2: Extract structured data (for scraped pages)
    let extractedGrants: ExtractedGrant[] = [];

    if (rawPages.length > 0) {
      onProgress?.({
        stage: 'extract',
        progress: 30,
        message: `Extracting data from ${rawPages.length} pages`,
        itemsProcessed: 0,
        itemsTotal: rawPages.length,
      });

      const { extracted, errors } = await batchExtract(rawPages, (processed, total, current) => {
        onProgress?.({
          stage: 'extract',
          progress: 30 + (processed / total) * 30,
          message: `Extracting ${processed + 1} of ${total}`,
          itemsProcessed: processed,
          itemsTotal: total,
        });
      });

      extractedGrants = extracted;
      stats.errors.push(...errors);
      stats.grantsFound = extracted.length;
    } else if (apiGrants.length > 0) {
      extractedGrants = apiGrants;
    }

    // Stage 3: Get existing fingerprints for deduplication
    onProgress?.({
      stage: 'deduplicate',
      progress: 60,
      message: 'Checking for duplicates',
      itemsProcessed: 0,
      itemsTotal: extractedGrants.length,
    });

    const existingGrants = await prisma.grant.findMany({
      select: {
        id: true,
        hashFingerprint: true,
      },
    });

    const existingHashes = new Set(existingGrants.map((g: { id: string; hashFingerprint: string }) => g.hashFingerprint));

    // Stage 4: Validate and normalize
    onProgress?.({
      stage: 'validate',
      progress: 65,
      message: 'Validating grants',
      itemsProcessed: 0,
      itemsTotal: extractedGrants.length,
    });

    const { valid, invalid, duplicates, errors: validationErrors } = await processBatch(
      extractedGrants,
      existingHashes,
      (processed, total) => {
        onProgress?.({
          stage: 'validate',
          progress: 65 + (processed / total) * 15,
          message: `Validating ${processed + 1} of ${total}`,
          itemsProcessed: processed,
          itemsTotal: total,
        });
      }
    );

    stats.errors.push(...validationErrors);
    stats.grantsDuplicates = duplicates.length;
    stats.grantsFailed = invalid.length + validationErrors.length;

    // Stage 5: Separate new vs updates
    const existingMap = new Map(existingGrants.map((g: { id: string; hashFingerprint: string }) => [g.hashFingerprint, g.id]));
    const { unique, updates } = deduplicateAgainstExisting(valid, existingGrants);

    // Stage 6: Persist to database
    onProgress?.({
      stage: 'persist',
      progress: 80,
      message: `Saving ${unique.length} new grants, updating ${updates.length}`,
      itemsProcessed: 0,
      itemsTotal: unique.length + updates.length,
    });

    // Insert new grants
    if (unique.length > 0) {
      await prisma.grant.createMany({
        data: unique.map((g) => ({
          ...g,
          deadlineDate: g.deadlineDate,
          postedDate: g.postedDate,
          lastVerifiedAt: g.lastVerifiedAt,
        })),
        skipDuplicates: true,
      });
      stats.grantsNew = unique.length;
    }

    // Update existing grants
    for (const { grant, existingId } of updates) {
      await prisma.grant.update({
        where: { id: existingId },
        data: {
          title: grant.title,
          sponsor: grant.sponsor,
          summary: grant.summary,
          description: grant.description,
          categories: grant.categories,
          eligibility: grant.eligibility,
          locations: grant.locations,
          amountMin: grant.amountMin,
          amountMax: grant.amountMax,
          amountText: grant.amountText,
          deadlineType: grant.deadlineType,
          deadlineDate: grant.deadlineDate,
          status: grant.status,
          qualityScore: grant.qualityScore,
          lastVerifiedAt: new Date(),
          lastSeenAt: new Date(),
        },
      });
      stats.grantsUpdated++;
    }

    // Stage 7: Update source record
    await prisma.ingestionSource.upsert({
      where: { name: source.name },
      create: {
        name: source.name,
        displayName: source.displayName,
        type: source.type,
        config: JSON.stringify(source),
        enabled: source.enabled,
        lastRunAt: new Date(),
        lastStatus: 'success',
        grantsCount: stats.grantsNew + stats.grantsUpdated,
      },
      update: {
        lastRunAt: new Date(),
        lastStatus: 'success',
        lastError: null,
        grantsCount: {
          increment: stats.grantsNew,
        },
      },
    });

    stats.status = 'success';
    stats.completedAt = new Date();
    stats.durationMs = stats.completedAt.getTime() - stats.startedAt.getTime();

    onProgress?.({
      stage: 'persist',
      progress: 100,
      message: `Completed: ${stats.grantsNew} new, ${stats.grantsUpdated} updated`,
      itemsProcessed: stats.grantsNew + stats.grantsUpdated,
      itemsTotal: stats.grantsNew + stats.grantsUpdated,
    });
  } catch (error) {
    stats.status = 'failed';
    stats.completedAt = new Date();
    stats.errors.push({
      timestamp: new Date(),
      stage: 'persist',
      message: error instanceof Error ? error.message : 'Unknown error',
      recoverable: false,
    });

    // Update source with error
    await prisma.ingestionSource.upsert({
      where: { name: source.name },
      create: {
        name: source.name,
        displayName: source.displayName,
        type: source.type,
        config: JSON.stringify(source),
        enabled: source.enabled,
        lastRunAt: new Date(),
        lastStatus: 'failed',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
      update: {
        lastRunAt: new Date(),
        lastStatus: 'failed',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }

  // Update run record
  await prisma.ingestionRun.update({
    where: { id: dbRun.id },
    data: {
      status: stats.status,
      grantsFound: stats.grantsFound,
      grantsNew: stats.grantsNew,
      grantsUpdated: stats.grantsUpdated,
      grantsDupes: stats.grantsDuplicates,
      errorMessage:
        stats.errors.length > 0 ? stats.errors.map((e) => e.message).join('; ') : null,
      logs: JSON.stringify(stats.errors),
      completedAt: stats.completedAt,
    },
  });

  return stats;
}

/**
 * Run daily ingestion for all enabled sources
 */
export async function runDailyIngestion(
  onProgress?: (source: string, progress: PipelineProgress) => void
): Promise<{
  totalNew: number;
  totalUpdated: number;
  totalFailed: number;
  sourceResults: IngestionRunStats[];
}> {
  const sources = getEnabledSources();
  const results: IngestionRunStats[] = [];
  let totalNew = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  for (const source of sources) {
    try {
      const stats = await runSourceIngestion(source.id, (progress) => {
        onProgress?.(source.displayName, progress);
      });

      results.push(stats);
      totalNew += stats.grantsNew;
      totalUpdated += stats.grantsUpdated;
      totalFailed += stats.grantsFailed;
    } catch (error) {
      console.error(`Failed to ingest ${source.displayName}:`, error);
      totalFailed++;
    }

    // Pause between sources to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return { totalNew, totalUpdated, totalFailed, sourceResults: results };
}

/**
 * Expire old grants with passed deadlines
 */
export async function expireOldGrants(): Promise<{
  expired: number;
  errors: IngestionError[];
}> {
  const errors: IngestionError[] = [];

  try {
    // Find grants with passed fixed deadlines that are still open
    const grantsToExpire = await prisma.grant.findMany({
      where: {
        status: 'open',
        deadlineType: 'fixed',
        deadlineDate: {
          lt: new Date(),
        },
      },
      select: { id: true },
    });

    const expiredIds = grantsToExpire.map((g: { id: string }) => g.id);

    if (expiredIds.length > 0) {
      await prisma.grant.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: 'closed' },
      });
    }

    return { expired: expiredIds.length, errors };
  } catch (error) {
    errors.push({
      timestamp: new Date(),
      stage: 'expire_old',
      message: error instanceof Error ? error.message : 'Failed to expire grants',
      recoverable: true,
    });
    return { expired: 0, errors };
  }
}

/**
 * Verify links for existing grants
 */
export async function verifyGrantLinks(
  limit: number = 100
): Promise<{
  verified: number;
  broken: number;
  errors: IngestionError[];
}> {
  const errors: IngestionError[] = [];

  try {
    // Get grants that haven't been verified recently
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const grantsToVerify = await prisma.grant.findMany({
      where: {
        status: 'open',
        OR: [{ lastVerifiedAt: null }, { lastVerifiedAt: { lt: oneWeekAgo } }],
      },
      select: { id: true, url: true },
      take: limit,
    });

    if (grantsToVerify.length === 0) {
      return { verified: 0, broken: 0, errors };
    }

    const urls = grantsToVerify.map((g: { id: string; url: string }) => g.url);
    const results = await batchVerifyUrls(urls);

    let verified = 0;
    let broken = 0;

    for (const grant of grantsToVerify) {
      const result = results.get(grant.url);
      if (result) {
        await prisma.grant.update({
          where: { id: grant.id },
          data: {
            linkStatus: result.isValid ? 'active' : 'broken',
            lastVerifiedAt: new Date(),
          },
        });

        if (result.isValid) {
          verified++;
        } else {
          broken++;
        }
      }
    }

    return { verified, broken, errors };
  } catch (error) {
    errors.push({
      timestamp: new Date(),
      stage: 'verify_links',
      message: error instanceof Error ? error.message : 'Failed to verify links',
      recoverable: true,
    });
    return { verified: 0, broken: 0, errors };
  }
}

// ==================== HEALTH & MONITORING ====================

/**
 * Get ingestion system health status
 */
export async function getIngestionHealth(): Promise<IngestionHealthStatus> {
  const alerts: IngestionHealthStatus['alerts'] = [];

  // Get active grants count
  const activeGrantsCount = await prisma.grant.count({
    where: { status: 'open' },
  });

  // Get today's expired grants
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredToday = await prisma.grant.count({
    where: {
      status: 'closed',
      deadlineDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  // Get source statuses
  const sources = await prisma.ingestionSource.findMany({
    orderBy: { name: 'asc' },
  });

  const sourceStatuses = sources.map((source: { displayName: string; lastRunAt: Date | null; lastStatus: string | null; grantsCount: number; lastError: string | null }) => {
    let status: 'healthy' | 'degraded' | 'failed' | 'never_run' = 'never_run';

    if (source.lastRunAt) {
      const hoursSinceRun =
        (Date.now() - source.lastRunAt.getTime()) / (1000 * 60 * 60);

      if (source.lastStatus === 'success') {
        status = hoursSinceRun > 48 ? 'degraded' : 'healthy';
      } else if (source.lastStatus === 'failed') {
        status = 'failed';
      } else {
        status = 'degraded';
      }
    }

    return {
      name: source.displayName,
      lastRun: source.lastRunAt || undefined,
      status,
      grantsCount: source.grantsCount,
      lastError: source.lastError || undefined,
    };
  });

  // Get last successful run
  const lastSuccessfulRun = await prisma.ingestionRun.findFirst({
    where: { status: 'success' },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true },
  });

  // Count failed sources
  const failedSourcesCount = sourceStatuses.filter((s: { status: string }) => s.status === 'failed').length;

  // Generate alerts
  if (activeGrantsCount === 0) {
    alerts.push({
      level: 'error',
      message: 'No active grants in database. Ingestion may have failed.',
      timestamp: new Date(),
    });
  } else if (activeGrantsCount < 50) {
    alerts.push({
      level: 'warning',
      message: `Only ${activeGrantsCount} active grants. Consider running ingestion.`,
      timestamp: new Date(),
    });
  }

  if (failedSourcesCount > 0) {
    alerts.push({
      level: 'error',
      message: `${failedSourcesCount} source(s) failed last ingestion.`,
      timestamp: new Date(),
    });
  }

  if (!lastSuccessfulRun?.completedAt) {
    alerts.push({
      level: 'warning',
      message: 'No successful ingestion runs recorded.',
      timestamp: new Date(),
    });
  } else {
    const hoursSinceSuccess =
      (Date.now() - lastSuccessfulRun.completedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceSuccess > 48) {
      alerts.push({
        level: 'warning',
        message: `Last successful ingestion was ${Math.round(hoursSinceSuccess)} hours ago.`,
        timestamp: new Date(),
      });
    }
  }

  return {
    healthy: alerts.filter((a) => a.level === 'error').length === 0,
    lastSuccessfulRun: lastSuccessfulRun?.completedAt || undefined,
    activeGrantsCount,
    expiredGrantsToday: expiredToday,
    failedSourcesCount,
    sources: sourceStatuses,
    alerts,
  };
}

/**
 * Get recent ingestion runs
 */
export async function getRecentRuns(limit: number = 20) {
  return prisma.ingestionRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: {
      source: {
        select: {
          displayName: true,
        },
      },
    },
  });
}
