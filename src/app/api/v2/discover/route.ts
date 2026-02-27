/**
 * V2 DISCOVER API
 * ===============
 * Returns matching grants for the user's farm profile.
 * Pure deterministic matching - no LLM.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { findMatchingGrants, getMatchingHealth } from '@/lib/v2/matching';
import {
  FarmProfileV2,
  FarmType,
  AcresBand,
  OperatorType,
  FundingGoal,
} from '@/lib/v2/types';

/**
 * GET /api/v2/discover
 * Get matching grants for the authenticated user
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!dbProfile || !dbProfile.onboardingCompleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please complete onboarding first',
          redirect: '/onboarding',
        },
        { status: 400 }
      );
    }

    // Parse v2 data
    let v2Data: Record<string, unknown> = {};
    try {
      v2Data = JSON.parse(dbProfile.industryAttributes || '{}');
    } catch {
      v2Data = {};
    }

    // Build farm profile for matching
    const farmProfile: FarmProfileV2 = {
      id: dbProfile.id,
      userId: dbProfile.userId,
      state: dbProfile.state || 'CA',
      county: v2Data.county as string | null,
      farmType: (v2Data.farmType as FarmType) || 'mixed',
      acresBand: (v2Data.acresBand as AcresBand) || '50_100',
      operatorType: (v2Data.operatorType as OperatorType) || 'individual',
      employeeCount: (v2Data.employeeCount as number) || 1,
      goals: (v2Data.goals as FundingGoal[]) || ['equipment'],
      createdAt: dbProfile.createdAt,
      updatedAt: dbProfile.updatedAt,
      version: (v2Data.version as number) ?? dbProfile.profileVersion ?? 1,
    };

    // Parse query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const minScore = parseInt(url.searchParams.get('minScore') || '20');

    // Find matching grants
    const result = findMatchingGrants(farmProfile, { limit, minScore });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      ...result,
      meta: {
        durationMs: duration,
        version: 2,
      },
    });
  } catch (error) {
    console.error('[V2 Discover] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to discover grants' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v2/discover/health
 * Health check endpoint for the matching system
 */
export async function HEAD(req: NextRequest) {
  const health = getMatchingHealth();
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Seed-Grant-Count': health.seedGrantCount.toString(),
      'X-Last-Loaded': health.lastLoaded,
    },
  });
}
