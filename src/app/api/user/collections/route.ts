import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(200),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(50).optional(),
})

/**
 * GET /api/user/collections
 *
 * Get all grant collections for the user
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - includeGrants: Whether to include grants in each collection (default: true)
 *   - grantsLimit: Max grants to include per collection (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const includeGrants = searchParams.get('includeGrants') !== 'false'
    const grantsLimit = Math.min(50, Math.max(1, parseInt(searchParams.get('grantsLimit') || '10')))
    const skip = (page - 1) * limit

    const [collections, total] = await Promise.all([
      prisma.grantCollection.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          grants: includeGrants ? {
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
            take: grantsLimit,
          } : false,
          _count: {
            select: { grants: true },
          },
        },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' },
        ],
      }),
      prisma.grantCollection.count({ where: { userId } }),
    ])

    return NextResponse.json({
      collections: collections.map(c => ({
        ...c,
        grantCount: c._count.grants,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + collections.length < total,
      },
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
    const validated = createCollectionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, color, icon } = validated.data

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
