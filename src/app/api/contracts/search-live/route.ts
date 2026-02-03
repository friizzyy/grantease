import { NextRequest, NextResponse } from 'next/server'
import { samGovApi, normalizeSamGovOpportunity, PROCUREMENT_TYPES } from '@/lib/services/sam-gov-api'

/**
 * GET /api/contracts/search-live
 *
 * Search SAM.gov API directly for real-time contract opportunities.
 *
 * Query params:
 * - q: Search keyword (searches in title)
 * - state: Filter by state (2-letter code, e.g., CA, NY)
 * - ptype: Procurement type (o=Solicitation, k=Combined, p=Presolicitation, r=Sources Sought)
 * - naics: NAICS code
 * - setAside: Set-aside type (SBA, 8A, HZC, SDVOSBC, WOSB, etc.)
 * - limit: Max results (default: 25, max: 100)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.SAM_GOV_API_KEY) {
      return NextResponse.json(
        {
          error: 'SAM.gov API not configured',
          message: 'SAM_GOV_API_KEY environment variable is not set',
          suggestion: 'Register at SAM.gov and add your API key to .env',
          contracts: [],
          total: 0,
        },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams

    const keyword = searchParams.get('q') || undefined
    const state = searchParams.get('state') || undefined
    const ptype = searchParams.get('ptype') || 'o,k' // Default to solicitations
    const naicsCode = searchParams.get('naics') || undefined
    const setAside = searchParams.get('setAside') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Call SAM.gov API
    const response = await samGovApi.searchOpportunities({
      keyword,
      state,
      ptype,
      naicsCode,
      typeOfSetAside: setAside,
      limit,
      offset,
    })

    // Normalize results
    const opportunities = response.opportunitiesData || []
    const contracts = opportunities.map(opp => {
      const normalized = normalizeSamGovOpportunity(opp)
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
        solicitationNumber: normalized.solicitationNumber,
        naicsCode: normalized.naicsCode,
        setAsideType: normalized.setAsideType,
        procurementType: normalized.procurementType,
        procurementTypeLabel: PROCUREMENT_TYPES[normalized.procurementType as keyof typeof PROCUREMENT_TYPES],
        isLive: true,
      }
    })

    return NextResponse.json({
      contracts,
      total: response.totalRecords || 0,
      source: 'sam.gov',
      cached: false,
    })
  } catch (error) {
    console.error('SAM.gov search error:', error)

    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to search SAM.gov',
        message,
        contracts: [],
        total: 0,
      },
      { status: 502 }
    )
  }
}
