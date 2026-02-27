import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(200),
  query: z.string().max(500).optional(),
  filters: z.record(z.unknown()).optional(),
  alertEnabled: z.boolean().optional(),
  alertFreq: z.enum(['daily', 'weekly', 'monthly']).optional(),
})

const updateSearchSchema = z.object({
  id: z.string().min(1, 'Search ID is required').max(200),
  alertEnabled: z.boolean().optional(),
  alertFreq: z.enum(['daily', 'weekly', 'monthly']).optional(),
})

const deleteSearchQuerySchema = z.object({
  id: z.string().min(1, 'Search ID is required').max(200),
})

/**
 * GET /api/user/saved-searches
 *
 * Get saved searches for the user with pagination
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - alertsOnly: If true, only return searches with alerts enabled
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
    const alertsOnly = searchParams.get('alertsOnly') === 'true'
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(alertsOnly ? { alertEnabled: true } : {}),
    }

    const [savedSearches, total] = await Promise.all([
      prisma.savedSearch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedSearch.count({ where }),
    ])

    // Parse JSON fields
    const searches = savedSearches.map(search => ({
      ...search,
      filters: JSON.parse(search.filters || '{}'),
    }))

    return NextResponse.json({
      searches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + searches.length < total,
      },
    })
  } catch (error) {
    console.error('Get saved searches error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const validated = createSearchSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, query, filters, alertEnabled, alertFreq } = validated.data

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name,
        query: query || '',
        filters: JSON.stringify(filters || {}),
        alertEnabled: alertEnabled ?? false,
        alertFreq: alertFreq || 'daily',
      },
    })

    return NextResponse.json({
      search: {
        ...savedSearch,
        filters: JSON.parse(savedSearch.filters || '{}'),
      },
    })
  } catch (error) {
    console.error('Save search error:', error)
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const validated = updateSearchSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { id, alertEnabled, alertFreq } = validated.data

    // Verify ownership
    const existing = await prisma.savedSearch.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: {
        alertEnabled: alertEnabled ?? existing.alertEnabled,
        alertFreq: alertFreq || existing.alertFreq,
      },
    })

    return NextResponse.json({
      search: {
        ...updated,
        filters: JSON.parse(updated.filters || '{}'),
      },
    })
  } catch (error) {
    console.error('Update search error:', error)
    return NextResponse.json(
      { error: 'Failed to update search' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const queryValidated = deleteSearchQuerySchema.safeParse({
      id: searchParams.get('id'),
    })

    if (!queryValidated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: queryValidated.error.flatten() },
        { status: 400 }
      )
    }

    const { id } = queryValidated.data

    // Verify ownership
    const existing = await prisma.savedSearch.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      )
    }

    await prisma.savedSearch.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete search error:', error)
    return NextResponse.json(
      { error: 'Failed to delete search' },
      { status: 500 }
    )
  }
}
