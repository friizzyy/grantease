import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const query = searchParams.get('q') || ''
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
    const eligibility = searchParams.get('eligibility')?.split(',').filter(Boolean) || []
    const states = searchParams.get('states')?.split(',').filter(Boolean) || []
    const minAmount = searchParams.get('minAmount') ? parseInt(searchParams.get('minAmount')!) : undefined
    const maxAmount = searchParams.get('maxAmount') ? parseInt(searchParams.get('maxAmount')!) : undefined
    const status = searchParams.get('status') || 'open'
    const sortBy = searchParams.get('sortBy') || 'deadline'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.GrantWhereInput = {
      status: status === 'all' ? undefined : status,
      duplicateOf: null, // Exclude duplicates
    }

    // Text search across multiple fields
    // Note: SQLite doesn't support case-insensitive mode, so we use contains directly
    if (query) {
      const lowerQuery = query.toLowerCase()
      where.OR = [
        { title: { contains: query } },
        { summary: { contains: query } },
        { description: { contains: query } },
        { sponsor: { contains: query } },
      ]
    }

    // Category filter (JSON array contains)
    if (categories.length > 0) {
      where.AND = [
        ...(where.AND as Prisma.GrantWhereInput[] || []),
        {
          OR: categories.map(cat => ({
            categories: { contains: cat }
          }))
        }
      ]
    }

    // Eligibility filter
    if (eligibility.length > 0) {
      where.AND = [
        ...(where.AND as Prisma.GrantWhereInput[] || []),
        {
          OR: eligibility.map(elig => ({
            eligibility: { contains: elig }
          }))
        }
      ]
    }

    // Location filter
    if (states.length > 0) {
      where.AND = [
        ...(where.AND as Prisma.GrantWhereInput[] || []),
        {
          OR: [
            ...states.map(state => ({
              locations: { contains: state }
            })),
            { locations: { contains: 'National' } },
            { locations: { contains: 'Nationwide' } },
          ]
        }
      ]
    }

    // Amount filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amountMax = {}
      if (minAmount !== undefined) {
        where.amountMax.gte = minAmount
      }
      if (maxAmount !== undefined) {
        where.amountMin = { lte: maxAmount }
      }
    }

    // Determine sort order
    let orderBy: Prisma.GrantOrderByWithRelationInput = {}
    switch (sortBy) {
      case 'deadline':
        orderBy = { deadlineDate: 'asc' }
        break
      case 'amount':
        orderBy = { amountMax: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'relevance':
      default:
        // For relevance, we'll use createdAt as fallback
        // In production, you'd implement full-text search scoring
        orderBy = { createdAt: 'desc' }
    }

    // Execute query with count
    const [grants, total] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.grant.count({ where }),
    ])

    // Parse JSON fields
    const parsedGrants = grants.map(grant => ({
      ...grant,
      categories: JSON.parse(grant.categories || '[]'),
      eligibility: JSON.parse(grant.eligibility || '[]'),
      locations: JSON.parse(grant.locations || '[]'),
    }))

    return NextResponse.json({
      grants: parsedGrants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + grants.length < total,
      },
    })
  } catch (error) {
    console.error('Grant search error:', error)
    return NextResponse.json(
      { error: 'Failed to search grants' },
      { status: 500 }
    )
  }
}
