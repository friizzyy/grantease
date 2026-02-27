/**
 * V2 HEALTH CHECK API
 * ===================
 * System health and status for the v2 matching system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMatchingHealth } from '@/lib/v2/matching';
import { validateSeedData, getSeedGrantCount, getCoveredStates, getAvailablePurposeTags } from '@/lib/v2/data/seed-grants';

/**
 * GET /api/v2/health
 * Get system health info
 */
export async function GET(req: NextRequest) {
  try {
    const matchingHealth = getMatchingHealth();
    const seedValidation = validateSeedData();
    const coveredStates = getCoveredStates();
    const purposeTags = getAvailablePurposeTags();

    return NextResponse.json({
      status: 'healthy',
      version: 2,
      timestamp: new Date().toISOString(),

      seedData: {
        grantCount: getSeedGrantCount(),
        valid: seedValidation.valid,
        errors: seedValidation.errors,
      },

      matching: {
        seedGrantCount: matchingHealth.seedGrantCount,
        lastLoaded: matchingHealth.lastLoaded,
        purposeTags: matchingHealth.purposeTags,
      },

      coverage: {
        statesWithGrants: coveredStates,
        stateCount: coveredStates.length,
        nationalGrants: matchingHealth.coverageByState['NATIONAL'] || 0,
        purposeTagsAvailable: purposeTags,
      },

      features: {
        aiMatching: false,        // Disabled for MVP
        llmReranking: false,      // Disabled for MVP
        caching: false,           // Disabled for MVP
        realTimeScraping: false,  // Disabled for MVP
      },
    });
  } catch (error) {
    console.error('[V2 Health] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        version: 2,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
