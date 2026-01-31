import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/user/collections/[id]
 *
 * Get a specific collection with its grants
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params

    const collection = await prisma.grantCollection.findFirst({
      where: { id, userId },
      include: {
        grants: {
          include: {
            grant: true,
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields in grants
    const formattedGrants = collection.grants.map(item => ({
      ...item,
      grant: {
        ...item.grant,
        categories: JSON.parse(item.grant.categories || '[]'),
        eligibility: JSON.parse(item.grant.eligibility || '[]'),
        locations: JSON.parse(item.grant.locations || '[]'),
      },
    }))

    return NextResponse.json({
      collection: {
        ...collection,
        grants: formattedGrants,
      },
    })
  } catch (error) {
    console.error('Get collection error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/collections/[id]
 *
 * Update a collection
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params

    // Verify ownership
    const existing = await prisma.grantCollection.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, color, icon } = body

    // Check for duplicate names (if changing name)
    if (name && name !== existing.name) {
      const duplicate = await prisma.grantCollection.findFirst({
        where: { userId, name, id: { not: id } },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'A collection with this name already exists' },
          { status: 400 }
        )
      }
    }

    const collection = await prisma.grantCollection.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description !== undefined ? description : existing.description,
        color: color ?? existing.color,
        icon: icon ?? existing.icon,
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
        grantCount: collection._count.grants,
      },
    })
  } catch (error) {
    console.error('Update collection error:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/collections/[id]
 *
 * Delete a collection (grants are not deleted, just removed from collection)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params

    // Verify ownership and not default
    const existing = await prisma.grantCollection.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    if (existing.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default collection' },
        { status: 400 }
      )
    }

    // Delete collection items first (cascade should handle this but being explicit)
    await prisma.grantCollectionItem.deleteMany({
      where: { collectionId: id },
    })

    await prisma.grantCollection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete collection error:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}
