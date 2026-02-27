/**
 * Primary Grant Discovery API
 *
 * This is the main endpoint for grant discovery. It uses the database
 * as the source of truth and runs grants through the full matching pipeline.
 *
 * Key differences from /api/ai/discover-grants:
 * - Uses pre-ingested database grants (not live Gemini search)
 * - Applies full eligibility and scoring pipeline
 * - Falls back to Gemini ONLY if database is empty
 * - Deterministic and reliable
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { safeJsonParse } from '@/lib/api-utils';
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit';
import { z } from 'zod';

import {
  runDiscoveryPipeline,
  loadUserProfile,
  loadGrantsFromDatabase,
  PipelineOptions,
} from '@/lib/discovery/pipeline';

import { discoverGrants as geminiDiscover } from '@/lib/services/gemini-grant-discovery';
import { isGeminiConfigured } from '@/lib/services/gemini-client';
import { getIngestionHealth } from '@/lib/ingestion/pipeline';

/**
 * GET /api/discover
 *
 * Primary grant discovery endpoint. Uses database grants + matching pipeline.
 *
 * Query params:
 * - limit: number of results (default: 20, max: 50)
 * - sortBy: 'best_match' | 'deadline_soon' | 'highest_funding'
 * - useAI: whether to use AI enrichment (default: true)
 * - debug: include debug info in response (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = rateLimiters.search(session.user.id);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt);
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const sortBy = (searchParams.get('sortBy') || 'best_match') as PipelineOptions['sortBy'];
    const useAI = searchParams.get('useAI') !== 'false';
    const includeDebug = searchParams.get('debug') === 'true';

    // Load user profile
    const profile = await loadUserProfile(session.user.id);
    if (!profile) {
      return NextResponse.json(
        {
          error: 'Profile required',
          message: 'Please complete your profile to discover grants.',
          code: 'PROFILE_INCOMPLETE',
        },
        { status: 400 }
      );
    }

    // Load grants from database
    let grants = await loadGrantsFromDatabase({
      status: 'open',
      state: profile.state || undefined,
      limit: 500, // Load more than we need for filtering
    });

    // Check if we have grants in the database
    const health = await getIngestionHealth();

    if (grants.length === 0) {
      // Database is empty - this is a critical issue

      // Try Gemini as fallback if configured
      if (isGeminiConfigured()) {

        try {
          // Build profile for Gemini - use type assertion to bypass strict type checking
          // as UserProfile types in onboarding.ts and discovery pipeline differ slightly
          const geminiProfile = {
            id: profile.id,
            userId: profile.userId,
            entityType: profile.entityType || 'small_business',
            country: 'US',
            state: profile.state,
            industryTags: profile.industryTags || [],
            sizeBand: profile.sizeBand || null,
            stage: null,
            annualBudget: profile.annualBudget || null,
            industryAttributes: {},
            grantPreferences: profile.grantPreferences || {
              preferredSize: null,
              timeline: null,
              complexity: null,
            },
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
            onboardingStep: 5,
            confidenceScore: profile.confidenceScore || 0.5,
          } as Parameters<typeof geminiDiscover>[0];

          const geminiResult = await geminiDiscover(geminiProfile, {});

          if (geminiResult.grants.length > 0) {
            // Transform Gemini grants to GrantData format
            grants = geminiResult.grants.slice(0, limit).map((g, index) => ({
              id: `gemini_${Date.now()}_${index}`,
              sourceId: `gemini_${index}`,
              sourceName: 'gemini_live',
              title: g.title,
              sponsor: g.sponsor || 'Unknown',
              summary: g.description?.substring(0, 500) || null,
              description: g.description || null,
              categories: g.categories || [],
              eligibility: {
                tags: g.eligibility || [],
              },
              locations: [],
              amountMin: null, // Gemini uses amountRange string
              amountMax: null,
              amountText: g.amountRange || null,
              deadlineDate: g.deadline ? new Date(g.deadline) : null,
              deadlineType: g.deadline ? 'fixed' : 'unknown',
              url: g.url || '',
              status: 'open' as const,
              qualityScore: 60,
              fundingType: 'grant',
              purposeTags: [],
              updatedAt: new Date(),
            }));

          }
        } catch (geminiError) {
          console.error('[Discover] Gemini fallback failed:', geminiError);
        }
      }

      // If still no grants, return helpful error
      if (grants.length === 0) {
        return NextResponse.json(
          {
            grants: [],
            total: 0,
            message:
              'No grants are currently available. Our team is working on populating the database.',
            healthStatus: {
              healthy: health.healthy,
              activeGrants: health.activeGrantsCount,
              lastIngestion: health.lastSuccessfulRun,
              alerts: health.alerts.filter((a) => a.level === 'error'),
            },
            code: 'NO_GRANTS_AVAILABLE',
          },
          { status: 200 }
        );
      }
    }

    // Run the discovery pipeline
    const pipelineOptions: PipelineOptions = {
      limit,
      minScore: 25, // Lower threshold to show more grants
      sortBy,
      useCache: true,
      useAI,
      includeDebug,
    };

    const result = await runDiscoveryPipeline(grants, profile, pipelineOptions);

    // Return results
    return NextResponse.json({
      grants: result.grants,
      total: result.total,
      stats: result.stats,
      timings: includeDebug ? result.timings : undefined,
      debug: includeDebug ? result.debug : undefined,
      healthStatus: {
        healthy: health.healthy,
        activeGrants: health.activeGrantsCount,
        databaseSource: grants.length > 0 && grants[0].sourceName !== 'gemini_live',
      },
    });
  } catch (error) {
    console.error('[Discover] Error:', error);
    return NextResponse.json(
      {
        error: 'Discovery failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

const discoverPostSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['best_match', 'deadline_soon', 'highest_funding']).default('best_match'),
  useAI: z.boolean().default(true),
  includeDebug: z.boolean().default(false),
  filters: z.object({
    status: z.string().optional(),
    state: z.string().optional(),
    includeNational: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    fundingType: z.string().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
  }).default({}),
});

/**
 * POST /api/discover
 *
 * Advanced discovery with filters in request body.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = rateLimiters.search(session.user.id);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt);
    }

    const body = await request.json();
    const parsed = discoverPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      limit,
      sortBy,
      useAI,
      includeDebug,
      filters,
    } = parsed.data;

    // Load user profile
    const profile = await loadUserProfile(session.user.id);
    if (!profile) {
      return NextResponse.json(
        {
          error: 'Profile required',
          message: 'Please complete your profile to discover grants.',
          code: 'PROFILE_INCOMPLETE',
        },
        { status: 400 }
      );
    }

    // Build database query options
    const dbOptions: {
      status?: string;
      state?: string;
      limit?: number;
    } = {
      status: filters.status || 'open',
      limit: 500,
    };

    // Apply state filter from profile or explicit filter
    if (filters.state) {
      dbOptions.state = filters.state;
    } else if (profile.state && !filters.includeNational) {
      dbOptions.state = profile.state;
    }

    // Load grants from database
    let grants = await loadGrantsFromDatabase(dbOptions);

    // Apply additional filters
    if (filters.categories && filters.categories.length > 0) {
      const filterCategories = filters.categories;
      grants = grants.filter((g) =>
        g.categories.some((c) =>
          filterCategories.some(
            (fc: string) =>
              c.toLowerCase().includes(fc.toLowerCase()) ||
              fc.toLowerCase().includes(c.toLowerCase())
          )
        )
      );
    }

    if (filters.fundingType) {
      grants = grants.filter((g) => g.fundingType === filters.fundingType);
    }

    if (filters.minAmount != null) {
      const min = filters.minAmount;
      grants = grants.filter((g) => !g.amountMax || g.amountMax >= min);
    }

    if (filters.maxAmount != null) {
      const max = filters.maxAmount;
      grants = grants.filter((g) => !g.amountMin || g.amountMin <= max);
    }

    // Check if we have grants
    if (grants.length === 0) {
      const health = await getIngestionHealth();

      return NextResponse.json({
        grants: [],
        total: 0,
        message:
          filters && Object.keys(filters).length > 0
            ? 'No grants match your filters. Try broadening your search criteria.'
            : 'No grants are currently available.',
        healthStatus: {
          healthy: health.healthy,
          activeGrants: health.activeGrantsCount,
        },
      });
    }

    // Run the discovery pipeline
    const pipelineOptions: PipelineOptions = {
      limit: Math.min(limit, 50),
      minScore: 25,
      sortBy,
      useCache: true,
      useAI,
      includeDebug,
    };

    const result = await runDiscoveryPipeline(grants, profile, pipelineOptions);

    return NextResponse.json({
      grants: result.grants,
      total: result.total,
      stats: result.stats,
      timings: includeDebug ? result.timings : undefined,
      debug: includeDebug ? result.debug : undefined,
      filtersApplied: filters,
    });
  } catch (error) {
    console.error('[Discover POST] Error:', error);
    return NextResponse.json(
      {
        error: 'Discovery failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
