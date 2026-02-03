import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/user/saved-grants/bulk
 *
 * Bulk save or unsave grants
 * Body:
 *   - action: 'save' | 'unsave'
 *   - grantIds: string[] (max 50)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const { action, grantIds } = body

    if (!action || !['save', 'unsave'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "save" or "unsave"' },
        { status: 400 }
      )
    }

    if (!Array.isArray(grantIds) || grantIds.length === 0) {
      return NextResponse.json(
        { error: 'grantIds must be a non-empty array' },
        { status: 400 }
      )
    }

    // Limit to 50 grants per request to prevent abuse
    if (grantIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 grants per bulk operation' },
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

    if (action === 'save') {
      // Verify all grants exist
      const existingGrants = await prisma.grant.findMany({
        where: { id: { in: grantIds } },
        select: { id: true },
      })

      const existingIds = new Set(existingGrants.map(g => g.id))
      const missingIds = grantIds.filter(id => !existingIds.has(id))

      if (missingIds.length > 0) {
        return NextResponse.json(
          { error: 'Some grants not found', missingIds },
          { status: 404 }
        )
      }

      // Get already saved grant IDs to avoid duplicates
      const existingSaved = await prisma.savedGrant.findMany({
        where: {
          userId,
          grantId: { in: grantIds },
        },
        select: { grantId: true },
      })
      const alreadySavedIds = new Set(existingSaved.map(s => s.grantId))
      const newGrantIds = grantIds.filter(id => !alreadySavedIds.has(id))

      // Only create entries for grants not already saved
      if (newGrantIds.length > 0) {
        await prisma.savedGrant.createMany({
          data: newGrantIds.map(grantId => ({
            userId,
            grantId,
          })),
        })
      }

      return NextResponse.json({
        success: true,
        action: 'save',
        processed: grantIds.length,
        created: newGrantIds.length,
        alreadySaved: alreadySavedIds.size,
      })
    } else {
      // Unsave - delete all matching records
      const result = await prisma.savedGrant.deleteMany({
        where: {
          userId,
          grantId: { in: grantIds },
        },
      })

      return NextResponse.json({
        success: true,
        action: 'unsave',
        processed: grantIds.length,
        deleted: result.count,
        notFound: grantIds.length - result.count,
      })
    }
  } catch (error) {
    console.error('Bulk save/unsave error:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk operation' },
      { status: 500 }
    )
  }
}
