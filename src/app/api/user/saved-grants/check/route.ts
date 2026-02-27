import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const checkGrantsSchema = z.object({
  grantIds: z.array(z.string().min(1)).min(1, 'grantIds must be a non-empty array').max(100, 'Maximum 100 grants per check request'),
})

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
    const validated = checkGrantsSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { grantIds } = validated.data

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
