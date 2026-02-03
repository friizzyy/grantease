import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'

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

    // Parse JSON fields safely
    const parsedGrant = {
      ...grant,
      categories: safeJsonParse<string[]>(grant.categories, []),
      eligibility: safeJsonParse<string[]>(grant.eligibility, []),
      locations: safeJsonParse<string[]>(grant.locations, []),
      contact: safeJsonParse<Record<string, unknown> | null>(grant.contact, null),
      requirements: safeJsonParse<string[]>(grant.requirements, []),
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
