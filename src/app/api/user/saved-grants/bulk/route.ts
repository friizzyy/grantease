import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const bulkSaveSchema = z.object({
  action: z.enum(['save', 'unsave']),
  grantIds: z.array(z.string().min(1)).min(1, 'grantIds must be a non-empty array').max(50, 'Maximum 50 grants per bulk operation'),
})

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
    const validated = bulkSaveSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { action, grantIds } = validated.data

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
