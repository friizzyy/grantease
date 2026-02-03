import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

// Generate a hash fingerprint for deduplication
function generateHashFingerprint(data: { title: string; sponsor: string; sourceId: string }): string {
  const input = `${data.title}|${data.sponsor}|${data.sourceId}`.toLowerCase().trim()
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 32)
}

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
    const { grantId, notes, grantData } = body

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    // Check if grant exists
    let grant = await prisma.grant.findUnique({
      where: { id: grantId },
    })

    // If grant doesn't exist but we have grant data (from live API), create it first
    if (!grant && grantData) {
      try {
        const sourceId = grantData.sourceId || grantId
        const title = grantData.title || 'Unknown Grant'
        const sponsor = grantData.sponsor || 'Unknown'

        grant = await prisma.grant.create({
          data: {
            id: grantId,
            sourceId,
            sourceName: grantData.sourceName || 'live-api',
            title,
            sponsor,
            summary: grantData.summary || '',
            description: grantData.description || null,
            categories: JSON.stringify(grantData.categories || []),
            eligibility: JSON.stringify(Array.isArray(grantData.eligibility) ? { tags: grantData.eligibility } : { tags: grantData.eligibility || [] }),
            locations: JSON.stringify(grantData.locations || []),
            amountMin: grantData.amountMin || null,
            amountMax: grantData.amountMax || null,
            amountText: grantData.amountText || null,
            deadlineType: grantData.deadlineType || 'hard',
            deadlineDate: grantData.deadlineDate ? new Date(grantData.deadlineDate) : null,
            url: grantData.url || '',
            contact: grantData.contact ? JSON.stringify(grantData.contact) : null,
            requirements: JSON.stringify(grantData.requirements || []),
            status: grantData.status || 'open',
            hashFingerprint: generateHashFingerprint({ title, sponsor, sourceId }),
          },
        })
      } catch (createError) {
        // Grant might have been created by another request, try to fetch it again
        console.warn('Grant creation failed, trying to fetch:', createError)
        grant = await prisma.grant.findUnique({
          where: { id: grantId },
        })
      }
    }

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found. Please try saving from the discover page.' },
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
