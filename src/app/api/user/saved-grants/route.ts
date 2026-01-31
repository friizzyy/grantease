import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const savedGrants = await prisma.savedGrant.findMany({
      where: { userId },
      include: {
        grant: {
          select: {
            id: true,
            sourceId: true,
            sourceName: true,
            title: true,
            sponsor: true,
            summary: true,
            categories: true,
            eligibility: true,
            locations: true,
            amountMin: true,
            amountMax: true,
            amountText: true,
            deadlineDate: true,
            deadlineType: true,
            url: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Parse JSON fields and format response
    const grants = savedGrants.map(sg => ({
      savedAt: sg.createdAt,
      notes: sg.notes,
      ...sg.grant,
      categories: JSON.parse(sg.grant.categories || '[]'),
      eligibility: JSON.parse(sg.grant.eligibility || '[]'),
      locations: JSON.parse(sg.grant.locations || '[]'),
    }))

    return NextResponse.json({ grants })
  } catch (error) {
    console.error('Get saved grants error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved grants' },
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
    const { grantId, notes } = body

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    // Create or update saved grant
    const savedGrant = await prisma.savedGrant.upsert({
      where: {
        userId_grantId: { userId, grantId },
      },
      update: { notes },
      create: { userId, grantId, notes },
    })

    return NextResponse.json({ savedGrant })
  } catch (error) {
    console.error('Save grant error:', error)
    return NextResponse.json(
      { error: 'Failed to save grant' },
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
    const grantId = searchParams.get('grantId')

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    await prisma.savedGrant.delete({
      where: {
        userId_grantId: { userId, grantId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete saved grant error:', error)
    return NextResponse.json(
      { error: 'Failed to remove saved grant' },
      { status: 500 }
    )
  }
}
