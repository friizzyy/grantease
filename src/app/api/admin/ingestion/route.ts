/**
 * Admin Ingestion API
 *
 * Provides endpoints for:
 * - Viewing ingestion health and stats
 * - Triggering manual ingestion runs
 * - Managing sources
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  getIngestionHealth,
  getRecentRuns,
  runSourceIngestion,
  expireOldGrants,
  verifyGrantLinks,
} from '@/lib/ingestion/pipeline';
import { getEnabledSources, GRANT_SOURCES } from '@/lib/ingestion/sources';

const ingestionPostSchema = z.object({
  action: z.enum(['run_source', 'expire_old', 'verify_links', 'toggle_source'], {
    errorMap: () => ({ message: 'Unknown action' }),
  }),
  sourceId: z.string().optional(),
  limit: z.number().int().min(1).optional(),
  enabled: z.boolean().optional(),
});

/**
 * Verify admin access
 */
async function verifyAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === 'admin';
}

/**
 * GET /api/admin/ingestion
 * Get ingestion health, stats, and recent runs
 */
export async function GET(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'health': {
        const health = await getIngestionHealth();
        return NextResponse.json({ health });
      }

      case 'runs': {
        const limit = parseInt(searchParams.get('limit') || '20');
        const runs = await getRecentRuns(limit);
        return NextResponse.json({ runs });
      }

      case 'sources': {
        const allSources = GRANT_SOURCES;
        const dbSources = await prisma.ingestionSource.findMany();

        const sources = allSources.map((config) => {
          const dbSource = dbSources.find((s: { name: string }) => s.name === config.name);
          return {
            id: config.id,
            name: config.name,
            displayName: config.displayName,
            type: config.type,
            enabled: config.enabled,
            priority: config.priority,
            scheduleIntervalHours: config.scheduleIntervalHours,
            lastRunAt: dbSource?.lastRunAt || null,
            lastStatus: dbSource?.lastStatus || 'never_run',
            lastError: dbSource?.lastError || null,
            grantsCount: dbSource?.grantsCount || 0,
          };
        });

        return NextResponse.json({ sources });
      }

      case 'stats': {
        // Get database stats
        const [
          totalGrants,
          activeGrants,
          expiredGrants,
          brokenLinks,
          lastWeekNew,
        ] = await Promise.all([
          prisma.grant.count(),
          prisma.grant.count({ where: { status: 'open' } }),
          prisma.grant.count({ where: { status: 'closed' } }),
          prisma.grant.count({ where: { linkStatus: 'broken' } }),
          prisma.grant.count({
            where: {
              firstSeenAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        ]);

        // Get grants by source
        const grantsBySource = await prisma.grant.groupBy({
          by: ['sourceName'],
          _count: { id: true },
          where: { status: 'open' },
        });

        // Get grants by entity type
        const allGrants = await prisma.grant.findMany({
          where: { status: 'open' },
          select: { eligibleEntityTypes: true },
        });

        const entityTypeCounts: Record<string, number> = {};
        for (const grant of allGrants) {
          try {
            const types: unknown = JSON.parse(grant.eligibleEntityTypes);
            if (Array.isArray(types)) {
              for (const type of types) {
                if (typeof type === 'string') {
                  entityTypeCounts[type] = (entityTypeCounts[type] || 0) + 1;
                }
              }
            }
          } catch {
            // Invalid JSON
          }
        }

        return NextResponse.json({
          stats: {
            total: totalGrants,
            active: activeGrants,
            expired: expiredGrants,
            brokenLinks,
            newLastWeek: lastWeekNew,
            bySource: grantsBySource.map((g: { sourceName: string; _count: { id: number } }) => ({
              source: g.sourceName,
              count: g._count.id,
            })),
            byEntityType: Object.entries(entityTypeCounts).map(([type, count]) => ({
              type,
              count,
            })),
          },
        });
      }

      default: {
        // Return overview
        const [health, runs] = await Promise.all([
          getIngestionHealth(),
          getRecentRuns(5),
        ]);

        return NextResponse.json({
          health,
          recentRuns: runs,
          enabledSources: getEnabledSources().map((s) => ({
            id: s.id,
            name: s.displayName,
          })),
        });
      }
    }
  } catch (error) {
    console.error('[Admin Ingestion] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ingestion
 * Trigger ingestion actions
 */
export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = ingestionPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action, sourceId } = parsed.data;

    switch (action) {
      case 'run_source': {
        if (!sourceId) {
          return NextResponse.json({ error: 'sourceId required' }, { status: 400 });
        }

        const stats = await runSourceIngestion(sourceId, () => {
          // Progress callback - no-op in production
        });

        return NextResponse.json({
          success: true,
          stats: {
            source: stats.sourceName,
            status: stats.status,
            pagesScraped: stats.pagesScraped,
            grantsFound: stats.grantsFound,
            grantsNew: stats.grantsNew,
            grantsUpdated: stats.grantsUpdated,
            grantsDuplicates: stats.grantsDuplicates,
            errors: stats.errors.length,
            durationMs: stats.durationMs,
          },
        });
      }

      case 'expire_old': {
        const { expired, errors } = await expireOldGrants();
        return NextResponse.json({
          success: true,
          expired,
          errors: errors.length,
        });
      }

      case 'verify_links': {
        const limit = parsed.data.limit || 100;
        const { verified, broken, errors } = await verifyGrantLinks(limit);
        return NextResponse.json({
          success: true,
          verified,
          broken,
          errors: errors.length,
        });
      }

      case 'toggle_source': {
        if (!sourceId) {
          return NextResponse.json({ error: 'sourceId required' }, { status: 400 });
        }

        const enabled = Boolean(parsed.data.enabled);

        await prisma.ingestionSource.upsert({
          where: { name: sourceId },
          create: {
            name: sourceId,
            displayName: sourceId,
            type: 'scrape',
            config: '{}',
            enabled,
          },
          update: { enabled },
        });

        return NextResponse.json({ success: true, sourceId, enabled });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Admin Ingestion] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
