import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/user/collections
 *
 * Get all grant collections for the user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const collections = await prisma.grantCollection.findMany({
      where: { userId },
      include: {
        grants: {
          include: {
            grant: {
              select: {
                id: true,
                title: true,
                sponsor: true,
                deadlineDate: true,
                amountMin: true,
                amountMax: true,
                status: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
        _count: {
          select: { grants: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
    })

    return NextResponse.json({
      collections: collections.map(c => ({
        ...c,
        grantCount: c._count.grants,
      })),
    })
  } catch (error) {
    console.error('Get collections error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/collections
 *
 * Create a new grant collection
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate names
    const existing = await prisma.grantCollection.findFirst({
      where: { userId, name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A collection with this name already exists' },
        { status: 400 }
      )
    }

    const collection = await prisma.grantCollection.create({
      data: {
        userId,
        name,
        description: description || null,
        color: color || '#3B82F6', // Default blue
        icon: icon || 'folder',
      },
      include: {
        _count: {
          select: { grants: true },
        },
      },
    })

    return NextResponse.json({
      collection: {
        ...collection,
        grants: [],
        grantCount: 0,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create collection error:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}
