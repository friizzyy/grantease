/**
 * Daily Grant Ingestion Cron Job
 *
 * This endpoint is called by Vercel Cron to run daily grant ingestion.
 * It scrapes all enabled sources and persists grants to the database.
 *
 * Schedule: Every day at 2 AM UTC
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  runDailyIngestion,
  expireOldGrants,
  verifyGrantLinks,
  getIngestionHealth,
} from '@/lib/ingestion/pipeline';

// Vercel Cron requires this export
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

/**
 * Verify the request is from Vercel Cron
 */
async function verifyCronRequest(): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  // Check for Vercel Cron secret
  if (process.env.CRON_SECRET) {
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
  }

  // In development, allow requests without auth
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  // Verify cron authentication
  const isAuthorized = await verifyCronRequest();
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Step 1: Expire old grants
    const { expired, errors: expireErrors } = await expireOldGrants();

    // Step 2: Run ingestion for all sources
    const { totalNew, totalUpdated, totalFailed, sourceResults } = await runDailyIngestion(
      () => {
        // Progress callback - no-op in production
      }
    );

    // Step 3: Verify some links
    const { verified, broken } = await verifyGrantLinks(50);

    // Step 4: Get health status
    const health = await getIngestionHealth();

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      duration: durationMs,
      stats: {
        grantsNew: totalNew,
        grantsUpdated: totalUpdated,
        grantsFailed: totalFailed,
        grantsExpired: expired,
        linksVerified: verified,
        linksBroken: broken,
      },
      sources: sourceResults.map((r) => ({
        name: r.sourceName,
        status: r.status,
        new: r.grantsNew,
        updated: r.grantsUpdated,
        errors: r.errors.length,
      })),
      health: {
        healthy: health.healthy,
        activeGrants: health.activeGrantsCount,
        alerts: health.alerts,
      },
    });
  } catch (error) {
    console.error('[CRON] Ingestion failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
