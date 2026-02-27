/**
 * V2 ONBOARDING API
 * =================
 * Minimal farm profile creation for MVP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  OnboardingRequestV2,
  OnboardingResponseV2,
  FarmProfileV2,
  FarmType,
  AcresBand,
  OperatorType,
  FundingGoal,
} from '@/lib/v2/types';

const VALID_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI',
] as const;

const onboardingSchema = z.object({
  state: z.string().min(1, 'State is required').transform(s => s.toUpperCase()).pipe(
    z.enum(VALID_STATES, { errorMap: () => ({ message: 'Invalid state code' }) })
  ),
  county: z.string().optional(),
  farmType: z.enum(['crop', 'cattle', 'mixed', 'specialty'], {
    errorMap: () => ({ message: 'Valid farm type is required (crop, cattle, mixed, specialty)' }),
  }),
  acresBand: z.enum(['under_50', '50_100', '100_500', '500_1000', 'over_1000'], {
    errorMap: () => ({ message: 'Valid acres band is required' }),
  }),
  operatorType: z.enum(['individual', 'small_business'], {
    errorMap: () => ({ message: 'Valid operator type is required (individual, small_business)' }),
  }),
  employeeCount: z.number().int().min(0, 'Employee count must be a non-negative number').max(15, 'Employee count must be 15 or fewer for small farm program'),
  goals: z.array(
    z.enum(['irrigation', 'equipment', 'land_development', 'cattle', 'conservation', 'operating'])
  ).min(1, 'At least one funding goal is required'),
});

/**
 * POST /api/v2/onboarding
 * Create or update farm profile
 */
export async function POST(req: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Store in UserProfile (using existing table with v2 data structure)
    // We store v2 data in JSON fields for now
    const v2ProfileData = {
      farmType: data.farmType,
      acresBand: data.acresBand,
      operatorType: data.operatorType,
      employeeCount: data.employeeCount,
      goals: data.goals,
      county: data.county,
      version: 2,
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        entityType: data.operatorType === 'individual' ? 'individual' : 'small_business',
        state: data.state,
        industryTags: JSON.stringify(['agriculture']),
        sizeBand: data.employeeCount <= 1 ? 'solo' : data.employeeCount <= 5 ? 'micro' : 'small',
        industryAttributes: JSON.stringify(v2ProfileData),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        profileVersion: 2,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        entityType: data.operatorType === 'individual' ? 'individual' : 'small_business',
        state: data.state,
        industryTags: JSON.stringify(['agriculture']),
        sizeBand: data.employeeCount <= 1 ? 'solo' : data.employeeCount <= 5 ? 'micro' : 'small',
        industryAttributes: JSON.stringify(v2ProfileData),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        profileVersion: 2,
      },
    });

    // Build response profile
    const farmProfile: FarmProfileV2 = {
      id: profile.id,
      userId: profile.userId,
      state: data.state,
      county: data.county || null,
      farmType: data.farmType,
      acresBand: data.acresBand,
      operatorType: data.operatorType,
      employeeCount: data.employeeCount,
      goals: data.goals,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      version: 2,
    };

    const response: OnboardingResponseV2 = {
      success: true,
      profile: farmProfile,
      message: 'Farm profile saved successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[V2 Onboarding] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v2/onboarding
 * Get current farm profile
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile || !profile.onboardingCompleted) {
      return NextResponse.json(
        { success: false, message: 'Profile not found', hasProfile: false },
        { status: 404 }
      );
    }

    // Parse v2 data from industryAttributes
    let v2Data: Record<string, unknown> = {};
    try {
      v2Data = JSON.parse(profile.industryAttributes || '{}');
    } catch {
      v2Data = {};
    }

    // Build farm profile
    const farmProfile: FarmProfileV2 = {
      id: profile.id,
      userId: profile.userId,
      state: profile.state || '',
      county: v2Data.county as string | null,
      farmType: (v2Data.farmType as FarmType) || 'mixed',
      acresBand: (v2Data.acresBand as AcresBand) || '50_100',
      operatorType: (v2Data.operatorType as OperatorType) || (profile.entityType === 'individual' ? 'individual' : 'small_business'),
      employeeCount: (v2Data.employeeCount as number) || 1,
      goals: (v2Data.goals as FundingGoal[]) || ['equipment'],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      version: (v2Data.version as number) ?? profile.profileVersion ?? 1,
    };

    return NextResponse.json({
      success: true,
      profile: farmProfile,
      hasProfile: true,
    });
  } catch (error) {
    console.error('[V2 Onboarding] GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
