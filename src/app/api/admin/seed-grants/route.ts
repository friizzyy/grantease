/**
 * Admin Seed Grants API
 *
 * Seeds the database with initial grants.
 * Admin access required.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { seedGrants, SEED_GRANTS } from '@/lib/ingestion/seed-grants';

/**
 * Verify admin access
 */
async function verifyAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === 'admin';
}

/**
 * GET /api/admin/seed-grants
 * Check seed status
 */
export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Count current grants
    const totalGrants = await prisma.grant.count();
    const activeGrants = await prisma.grant.count({ where: { status: 'open' } });

    // Check which seed grants exist
    const seedSourceIds = SEED_GRANTS.map((g) => g.sourceId);
    const existingSeedGrants = await prisma.grant.count({
      where: {
        sourceId: { in: seedSourceIds },
      },
    });

    return NextResponse.json({
      status: 'ready',
      currentGrants: {
        total: totalGrants,
        active: activeGrants,
      },
      seedData: {
        available: SEED_GRANTS.length,
        alreadySeeded: existingSeedGrants,
        remaining: SEED_GRANTS.length - existingSeedGrants,
      },
      message:
        existingSeedGrants === SEED_GRANTS.length
          ? 'All seed grants already exist'
          : `${SEED_GRANTS.length - existingSeedGrants} seed grants can be added`,
    });
  } catch (error) {
    console.error('[Seed Grants] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/seed-grants
 * Run the seeding process
 */
export async function POST() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {

    // Count before
    const beforeCount = await prisma.grant.count({ where: { status: 'open' } });

    // Run seeding
    await seedGrants();

    // Count after
    const afterCount = await prisma.grant.count({ where: { status: 'open' } });

    return NextResponse.json({
      success: true,
      before: beforeCount,
      after: afterCount,
      added: afterCount - beforeCount,
      message: `Successfully seeded grants. Active grants: ${beforeCount} -> ${afterCount}`,
    });
  } catch (error) {
    console.error('[Seed Grants] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
