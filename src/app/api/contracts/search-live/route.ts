import { NextRequest, NextResponse } from 'next/server'
import { searchGrantsByKeyword } from '@/lib/services/gemini-grant-discovery'

/**
 * GET /api/contracts/search-live
 *
 * Search for contract opportunities using Gemini AI.
 *
 * Query params:
 * - q: Search keyword
 * - state: Filter by state
 * - limit: Max results (default: 25, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const keyword = searchParams.get('q') || 'government contracts'
    const state = searchParams.get('state') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 50)

    // Use Gemini to search for contracts
    const grants = await searchGrantsByKeyword(
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

    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to search contracts',
        message,
        contracts: [],
        total: 0,
      },
      { status: 502 }
    )
  }
}
