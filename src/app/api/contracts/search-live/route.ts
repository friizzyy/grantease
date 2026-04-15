import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { searchGrantsByKeyword } from '@/lib/services/gemini-grant-discovery'
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().max(500).default('government contracts'),
  state: z.string().max(20).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(25),
})

/**
 * GET /api/contracts/search-live
 *
 * Search for contract opportunities using Gemini AI.
 * Authenticated + rate-limited — this calls an expensive AI backend.
 */
export async function GET(request: NextRequest) {
  try {
    // Require an authenticated user: this endpoint burns AI budget.
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Per-user AI rate limit (20/min)
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { q: keyword, state, limit } = parsed.data

    // Use Gemini to search for contracts
    const { grants } = await searchGrantsByKeyword(
      `${keyword} government contracts RFP solicitations`,
      { state }
    )

    // Map to contract format
    const contracts = grants.slice(0, limit).map(grant => ({
      id: `contract-${Buffer.from(grant.url).toString('base64').slice(0, 20)}`,
      sourceId: grant.url,
      sourceName: 'gemini-discovery',
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.description,
      categories: grant.categories || [],
      eligibility: grant.eligibility || [],
      locations: [],
      amountMin: null,
      amountMax: null,
      amountText: grant.amountRange || null,
      deadlineDate: grant.deadline ? new Date(grant.deadline) : null,
      url: grant.url,
      status: 'open',
      isLive: true,
    }))

    return NextResponse.json({
      contracts,
      total: contracts.length,
      source: 'gemini-ai',
      cached: false,
    })
  } catch (error) {
    console.error('Contract search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search contracts',
        contracts: [],
        total: 0,
      },
      { status: 502 }
    )
  }
}
