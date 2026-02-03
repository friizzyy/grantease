import { NextRequest, NextResponse } from 'next/server'
import { grantsGovApi, normalizeGrantsGovOpportunity } from '@/lib/services/grants-gov-api'
import { samGovApi, normalizeSamGovOpportunity } from '@/lib/services/sam-gov-api'

/**
 * GET /api/opportunities/search
 *
 * Unified search across multiple opportunity sources.
 * Combines results from Grants.gov (grants) and SAM.gov (contracts).
 *
 * Query params:
 * - q: Search keyword
 * - sources: Comma-separated list of sources (grants-gov, sam-gov). Default: grants-gov
 * - state: Filter by state (for SAM.gov)
 * - agency: Filter by agency (for Grants.gov)
 * - limit: Max results per source (default: 25)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const keyword = searchParams.get('q') || undefined
  const sourcesParam = searchParams.get('sources') || 'grants-gov'
  const sources = sourcesParam.split(',').map(s => s.trim())
  const state = searchParams.get('state') || undefined
  const agency = searchParams.get('agency') || undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 50)

  const results: {
    source: string
    opportunities: Record<string, unknown>[]
    total: number
    error?: string
  }[] = []

  // Search Grants.gov
  if (sources.includes('grants-gov')) {
    try {
      const response = await grantsGovApi.searchOpportunities({
        keywords: keyword,
        agency,
        oppStatuses: 'posted',
        rows: limit,
        sortBy: 'closeDate|asc',
      })

      const opportunities = (response.data?.oppHits || response.hitOppHitList || []).map(opp => {
        const normalized = normalizeGrantsGovOpportunity(opp)
        return {
          id: normalized.sourceId,
          sourceId: normalized.sourceId,
          sourceName: 'grants-gov',
          sourceLabel: 'Grants.gov',
          type: 'grant',
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
        }
      })

      results.push({
        source: 'grants-gov',
        opportunities,
        total: response.data?.hitCount || response.totalCount || 0,
      })
    } catch (error) {
      results.push({
        source: 'grants-gov',
        opportunities: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Search SAM.gov (if API key configured)
  if (sources.includes('sam-gov')) {
    if (!process.env.SAM_GOV_API_KEY) {
      results.push({
        source: 'sam-gov',
        opportunities: [],
        total: 0,
        error: 'SAM.gov API key not configured',
      })
    } else {
      try {
        const response = await samGovApi.searchOpportunities({
          keyword,
          state,
          ptype: 'o,k', // Solicitations
          limit,
        })

        const opportunities = (response.opportunitiesData || []).map(opp => {
          const normalized = normalizeSamGovOpportunity(opp)
          return {
            id: normalized.sourceId,
            sourceId: normalized.sourceId,
            sourceName: 'sam-gov',
            sourceLabel: 'SAM.gov',
            type: 'contract',
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
            solicitationNumber: normalized.solicitationNumber,
            naicsCode: normalized.naicsCode,
          }
        })

        results.push({
          source: 'sam-gov',
          opportunities,
          total: response.totalRecords || 0,
        })
      } catch (error) {
        results.push({
          source: 'sam-gov',
          opportunities: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  // Combine and sort all opportunities by deadline
  const allOpportunities = results
    .flatMap(r => r.opportunities)
    .sort((a, b) => {
      const dateA = a.deadlineDate ? new Date(a.deadlineDate as string).getTime() : Infinity
      const dateB = b.deadlineDate ? new Date(b.deadlineDate as string).getTime() : Infinity
      return dateA - dateB
    })

  return NextResponse.json({
    opportunities: allOpportunities,
    totalCount: allOpportunities.length,
    sources: results.map(r => ({
      name: r.source,
      count: r.opportunities.length,
      total: r.total,
      error: r.error,
    })),
  })
}
