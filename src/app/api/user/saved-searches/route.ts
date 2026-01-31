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

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Parse JSON fields
    const searches = savedSearches.map(search => ({
      ...search,
      filters: JSON.parse(search.filters || '{}'),
    }))

    return NextResponse.json({ searches })
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
    const { name, query, filters, alertEnabled, alertFreq } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Search name is required' },
        { status: 400 }
      )
    }

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
    const { id, alertEnabled, alertFreq } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

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
