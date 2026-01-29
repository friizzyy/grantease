import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const grant = await prisma.grant.findUnique({
      where: { id },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parsedGrant = {
      ...grant,
      categories: JSON.parse(grant.categories || '[]'),
      eligibility: JSON.parse(grant.eligibility || '[]'),
      locations: JSON.parse(grant.locations || '[]'),
      contact: grant.contact ? JSON.parse(grant.contact) : null,
      requirements: grant.requirements ? JSON.parse(grant.requirements) : [],
    }

    return NextResponse.json(parsedGrant)
  } catch (error) {
    console.error('Get grant error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grant' },
      { status: 500 }
    )
  }
}
