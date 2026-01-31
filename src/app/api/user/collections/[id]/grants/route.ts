import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/user/collections/[id]/grants
 *
 * Add a grant to a collection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id: collectionId } = await params

    // Verify collection ownership
    const collection = await prisma.grantCollection.findFirst({
      where: { id: collectionId, userId },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { grantId, notes } = body

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    // Verify grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    // Check if already in collection
    const existing = await prisma.grantCollectionItem.findFirst({
      where: { collectionId, grantId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Grant is already in this collection' },
        { status: 400 }
      )
    }

    const item = await prisma.grantCollectionItem.create({
      data: {
        collectionId,
        grantId,
        notes: notes || null,
      },
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
    })

    // Update collection timestamp
    await prisma.grantCollection.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Add grant to collection error:', error)
    return NextResponse.json(
      { error: 'Failed to add grant to collection' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/collections/[id]/grants
 *
 * Remove a grant from a collection
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

    const { id: collectionId } = await params

    // Verify collection ownership
    const collection = await prisma.grantCollection.findFirst({
      where: { id: collectionId, userId },
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const grantId = searchParams.get('grantId')

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    // Delete the collection item
    const result = await prisma.grantCollectionItem.deleteMany({
      where: { collectionId, grantId },
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Grant not found in collection' },
        { status: 404 }
      )
    }

    // Update collection timestamp
    await prisma.grantCollection.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove grant from collection error:', error)
    return NextResponse.json(
      { error: 'Failed to remove grant from collection' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/collections/[id]/grants
 *
 * Move a grant to a different collection
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

    const { id: fromCollectionId } = await params

    // Verify source collection ownership
    const fromCollection = await prisma.grantCollection.findFirst({
      where: { id: fromCollectionId, userId },
    })

    if (!fromCollection) {
      return NextResponse.json(
        { error: 'Source collection not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { grantId, toCollectionId } = body

    if (!grantId || !toCollectionId) {
      return NextResponse.json(
        { error: 'Grant ID and target collection ID are required' },
        { status: 400 }
      )
    }

    // Verify target collection ownership
    const toCollection = await prisma.grantCollection.findFirst({
      where: { id: toCollectionId, userId },
    })

    if (!toCollection) {
      return NextResponse.json(
        { error: 'Target collection not found' },
        { status: 404 }
      )
    }

    // Get existing item
    const existingItem = await prisma.grantCollectionItem.findFirst({
      where: { collectionId: fromCollectionId, grantId },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Grant not found in source collection' },
        { status: 404 }
      )
    }

    // Check if already in target collection
    const alreadyInTarget = await prisma.grantCollectionItem.findFirst({
      where: { collectionId: toCollectionId, grantId },
    })

    if (alreadyInTarget) {
      // Just delete from source
      await prisma.grantCollectionItem.delete({
        where: { id: existingItem.id },
      })
    } else {
      // Move the item
      await prisma.grantCollectionItem.update({
        where: { id: existingItem.id },
        data: { collectionId: toCollectionId },
      })
    }

    // Update both collection timestamps
    await Promise.all([
      prisma.grantCollection.update({
        where: { id: fromCollectionId },
        data: { updatedAt: new Date() },
      }),
      prisma.grantCollection.update({
        where: { id: toCollectionId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Move grant error:', error)
    return NextResponse.json(
      { error: 'Failed to move grant' },
      { status: 500 }
    )
  }
}
