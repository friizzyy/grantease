import { NextRequest, NextResponse } from 'next/server'
import { grantsGovApi, normalizeGrantsGovOpportunity } from '@/lib/services/grants-gov-api'

/**
 * GET /api/grants/search-live
 *
 * Search Grants.gov API directly for real-time results.
 * This bypasses our database and hits the live API.
 *
 * Use this for:
 * - Real-time keyword search
 * - Getting the latest opportunities
 * - When database might be stale
 *
 * Query params:
 * - q: Search keyword
 * - agency: Filter by agency code (e.g., NSF, HUD, EPA)
 * - status: 'posted', 'forecasted', 'closed' (default: posted)
 * - limit: Max results (default: 25, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const keyword = searchParams.get('q') || undefined
    const agency = searchParams.get('agency') || undefined
    const status = searchParams.get('status') || 'posted'
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)

    // Call Grants.gov API
    const response = await grantsGovApi.searchOpportunities({
      keywords: keyword,
      agency,
      oppStatuses: status,
      rows: limit,
      sortBy: 'closeDate|asc',
    })

    // Normalize results - handle nested response format
    const opportunities = response.data?.oppHits || response.hitOppHitList || []
    const grants = opportunities.map(opp => {
      const normalized = normalizeGrantsGovOpportunity(opp)
      return {
        id: normalized.sourceId,
        sourceId: normalized.sourceId,
        sourceName: normalized.sourceName,
        title: normalized.title,
        sponsor: normalized.sponsor,
        summary: normalized.summary,
        categories: normalized.categories,
        eligibility: normalized.eligibility,
        locations: normalized.locations,
        amountMin: normalized.amountMin,
        amountMax: normalized.amountMax,
        amountText: normalized.amountText,
        deadlineDate: normalized.deadlineDate,
        url: normalized.url,
        status: normalized.status,
        isLive: true, // Flag to indicate this is live data
      }
    })

    return NextResponse.json({
      grants,
      total: response.data?.hitCount || response.totalCount || 0,
      source: 'grants.gov',
      cached: false,
    })
  } catch (error) {
    console.error('Live search error:', error)

    // Return a helpful error message
    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to search Grants.gov',
        message,
        suggestion: 'Try using /api/grants for cached results',
      },
      { status: 502 }
    )
  }
}
