/**
 * V2 GRANT DETAIL API
 * ===================
 * Get details for a single grant.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getGrantById, getGrantDetailForProfile } from '@/lib/v2/matching';
import {
  FarmProfileV2,
  FarmType,
  AcresBand,
  OperatorType,
  FundingGoal,
} from '@/lib/v2/types';

/**
 * GET /api/v2/grants/[id]
 * Get grant details with match info
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: grantId } = await params;

    if (!grantId) {
      return NextResponse.json(
        { success: false, message: 'Grant ID is required' },
        { status: 400 }
      );
    }

    // Get basic grant info (available without auth)
    const grant = getGrantById(grantId);

    if (!grant) {
      return NextResponse.json(
        { success: false, message: 'Grant not found' },
        { status: 404 }
      );
    }

    // Check if user is authenticated for personalized match info
    const session = await getServerSession(authOptions);
    let matchInfo = null;

    if (session?.user?.id) {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (dbProfile && dbProfile.onboardingCompleted) {
        // Parse v2 data
        let v2Data: Record<string, unknown> = {};
        try {
          v2Data = JSON.parse(dbProfile.industryAttributes || '{}');
        } catch {
          v2Data = {};
        }

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

        const detail = getGrantDetailForProfile(grantId, farmProfile);
        if (detail) {
          matchInfo = {
            score: detail.match.score,
            matchReasons: detail.match.matchReasons,
            warnings: detail.match.warnings,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      grant: {
        id: grant.id,
        title: grant.title,
        sponsor: grant.sponsor,
        applyUrl: grant.applyUrl,
        summaryShort: grant.summaryShort,
        descriptionClean: grant.descriptionClean,
        geographyScope: grant.geographyScope,
        statesIncluded: grant.statesIncluded,
        purposeTags: grant.purposeTags,
        applicantTypes: grant.applicantTypes,
        fundingMin: grant.fundingMin,
        fundingMax: grant.fundingMax,
        fundingDisplay: grant.fundingDisplay,
        deadlineType: grant.deadlineType,
        deadlineDate: grant.deadlineDate,
        deadlineDisplay: grant.deadlineDisplay,
        requirementsBullets: grant.requirementsBullets,
        source: grant.source,
        lastVerified: grant.lastVerified,
      },
      matchInfo,
      version: 2,
    });
  } catch (error) {
    console.error('[V2 Grant Detail] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch grant' },
      { status: 500 }
    );
  }
}
