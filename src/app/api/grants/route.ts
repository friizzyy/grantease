import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { safeJsonParse } from '@/lib/api-utils'
import { rateLimiters, rateLimitExceededResponse, getClientIdentifier } from '@/lib/rate-limit'
import { z } from 'zod'

const grantsQuerySchema = z.object({
  q: z.string().max(500).default(''),
  categories: z.string().max(1000).optional(),
  eligibility: z.string().max(1000).optional(),
  states: z.string().max(500).optional(),
  minAmount: z.coerce.number().int().min(0).max(100_000_000_000).optional(),
  maxAmount: z.coerce.number().int().min(0).max(100_000_000_000).optional(),
  status: z.string().max(50).default('open'),
  deadlineType: z.string().max(200).optional(),
  sponsor: z.string().max(1000).optional(),
  sourceName: z.string().max(500).optional(),
  sortBy: z.enum(['deadline', 'amount', 'newest', 'relevance']).default('deadline'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * Calculate relevance score for a grant based on query match
 * Weights: title (10), summary (5), description (3), sponsor (4), categories (3)
 */
function calculateRelevanceScore(
  grant: { title: string; summary: string; description?: string | null; sponsor: string; categories: string },
  queryTerms: string[]
): number {
  if (queryTerms.length === 0) return 0

  let score = 0
  const titleLower = grant.title.toLowerCase()
  const summaryLower = grant.summary.toLowerCase()
  const descriptionLower = (grant.description || '').toLowerCase()
  const sponsorLower = grant.sponsor.toLowerCase()
  const categoriesLower = grant.categories.toLowerCase()

  for (const term of queryTerms) {
    const termLower = term.toLowerCase()

    // Title matches (highest weight)
    if (titleLower.includes(termLower)) {
      score += 10
      // Bonus for exact word match
      if (titleLower.split(/\s+/).includes(termLower)) {
        score += 5
      }
    }

    // Summary matches
    if (summaryLower.includes(termLower)) {
      score += 5
    }

    // Description matches
    if (descriptionLower.includes(termLower)) {
      score += 3
    }

    // Sponsor matches
    if (sponsorLower.includes(termLower)) {
      score += 4
    }

    // Category matches
    if (categoriesLower.includes(termLower)) {
      score += 3
    }
  }

  // Normalize by number of terms
  return score / queryTerms.length
}

export async function GET(request: NextRequest) {
  // Rate limit search requests
  const clientId = getClientIdentifier(request)
  const rateLimit = rateLimiters.search(clientId)
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit.resetAt)
  }

  try {
    const searchParams = request.nextUrl.searchParams

    // Parse and validate query parameters with Zod
    const rawParams: Record<string, string | undefined> = {}
    for (const key of ['q', 'categories', 'eligibility', 'states', 'minAmount', 'maxAmount', 'status', 'deadlineType', 'sponsor', 'sourceName', 'sortBy', 'page', 'limit']) {
      const val = searchParams.get(key)
      if (val !== null) rawParams[key] = val
    }

    const validated = grantsQuerySchema.safeParse(rawParams)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const params = validated.data
    const query = params.q
    const categories = params.categories?.split(',').filter(Boolean) || []
    const eligibility = params.eligibility?.split(',').filter(Boolean) || []
    const states = params.states?.split(',').filter(Boolean) || []
    const minAmount = params.minAmount
    const maxAmount = params.maxAmount
    const status = params.status
    const deadlineTypes = params.deadlineType?.split(',').filter(Boolean) || []
    const sponsors = params.sponsor?.split(',').filter(Boolean) || []
    const sourceNames = params.sourceName?.split(',').filter(Boolean) || []
    const sortBy = params.sortBy
    const page = params.page
    const limit = params.limit
    const skip = (page - 1) * limit

    // Validate amount range
    if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
      return NextResponse.json(
        { error: 'minAmount cannot be greater than maxAmount' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: Prisma.GrantWhereInput = {
      status: status === 'all' ? undefined : status,
      duplicateOf: null, // Exclude duplicates
    }

    // Text search across multiple fields
    // Note: SQLite LIKE is case-insensitive by default for ASCII, so contains works well
    // For PostgreSQL in production, you may want to add mode: 'insensitive'
    if (query) {
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
            categories: { contains: `"${cat}"` }
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
            eligibility: { contains: `"${elig}"` }
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
              locations: { contains: `"${state}"` }
            })),
            { locations: { contains: '"National"' } },
            { locations: { contains: '"Nationwide"' } },
            { isNational: true },
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

    // Deadline type filter (fixed, rolling, unknown)
    if (deadlineTypes.length > 0) {
      where.deadlineType = { in: deadlineTypes }
    }

    // Sponsor filter
    if (sponsors.length > 0) {
      where.AND = [
        ...(where.AND as Prisma.GrantWhereInput[] || []),
        {
          OR: sponsors.map(sponsor => ({
            sponsor: { contains: sponsor }
          }))
        }
      ]
    }

    // Source name filter
    if (sourceNames.length > 0) {
      where.sourceName = { in: sourceNames }
    }

    // Determine sort order
    const useRelevanceSort = sortBy === 'relevance' && query
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
        // For relevance, we fetch more results and sort in-memory
        // If no query, fall back to newest
        orderBy = { createdAt: 'desc' }
    }

    // For relevance sorting, we need to fetch all matching results and sort by score
    // Then paginate the sorted results
    let grants
    let total

    if (useRelevanceSort) {
      // Fetch all matching grants (up to a reasonable limit for scoring)
      const maxFetchForRelevance = 500
      const [allGrants, count] = await Promise.all([
        prisma.grant.findMany({
          where,
          take: maxFetchForRelevance,
          select: {
            id: true,
            sourceId: true,
            sourceName: true,
            title: true,
            sponsor: true,
            summary: true,
            description: true,
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

      // Calculate relevance scores
      const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
      const scoredGrants = allGrants.map(grant => ({
        ...grant,
        relevanceScore: calculateRelevanceScore(grant, queryTerms),
      }))

      // Sort by relevance score descending, then by deadline
      scoredGrants.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore
        }
        // Secondary sort by deadline (upcoming first)
        if (a.deadlineDate && b.deadlineDate) {
          return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
        }
        return 0
      })

      // Paginate
      grants = scoredGrants.slice(skip, skip + limit)
      total = count
    } else {
      // Standard database-level sorting and pagination
      const [dbGrants, count] = await Promise.all([
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
      grants = dbGrants
      total = count
    }

    // Parse JSON fields safely
    const parsedGrants = grants.map(grant => ({
      ...grant,
      categories: safeJsonParse<string[]>(grant.categories, []),
      eligibility: safeJsonParse<string[]>(grant.eligibility, []),
      locations: safeJsonParse<string[]>(grant.locations, []),
      // Include relevance score if calculated
      ...('relevanceScore' in grant ? { relevanceScore: grant.relevanceScore } : {}),
    }))

    return NextResponse.json({
      grants: parsedGrants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: grants.length === limit && skip + grants.length < total,
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
