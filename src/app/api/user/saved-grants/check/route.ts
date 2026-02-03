import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/user/saved-grants/check
 *
 * Check which grants from a list are saved by the user.
 * Useful for efficiently showing saved status on grant listings.
 *
 * Body:
 *   - grantIds: string[] (max 100)
 *
 * Returns:
 *   - savedIds: string[] - IDs of grants that are saved
 *   - savedMap: Record<string, boolean> - Map of grantId to saved status
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const { grantIds } = body

    if (!Array.isArray(grantIds) || grantIds.length === 0) {
      return NextResponse.json(
        { error: 'grantIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Limit to 100 grants per request
    if (grantIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 grants per check request' },
        { status: 400 }
      )
    }

    // Validate all IDs are strings
    if (!grantIds.every(id => typeof id === 'string' && id.length > 0)) {
      return NextResponse.json(
        { error: 'All grantIds must be non-empty strings' },
        { status: 400 }
      )
    }

    // Find which of the provided grants are saved
    const savedGrants = await prisma.savedGrant.findMany({
      where: {
        userId,
        grantId: { in: grantIds },
      },
      select: {
        grantId: true,
      },
    })

    const savedIds = savedGrants.map(sg => sg.grantId)
    const savedSet = new Set(savedIds)

    // Build a map for easy lookup
    const savedMap: Record<string, boolean> = {}
    for (const id of grantIds) {
      savedMap[id] = savedSet.has(id)
    }

    return NextResponse.json({
      savedIds,
      savedMap,
      total: savedIds.length,
    })
  } catch (error) {
    console.error('Check saved grants error:', error)
    return NextResponse.json(
      { error: 'Failed to check saved grants' },
      { status: 500 }
    )
  }
}
