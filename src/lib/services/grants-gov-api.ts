/**
 * Grants.gov API Service
 *
 * Real integration with the Grants.gov REST API.
 * Documentation: https://www.grants.gov/api/api-guide
 *
 * The search2 API endpoint does NOT require authentication.
 * Base URL: https://api.grants.gov/v1/api/search2
 */

// API Response Types - based on actual Grants.gov search2 response
export interface GrantsGovSearchResponse {
  errorcode?: number
  msg?: string
  data?: {
    hitCount?: number
    startRecord?: number
    oppHits?: GrantsGovOpportunity[]
    suggestion?: string
  }
  // Legacy format fallback
  totalCount?: number
  hitOppHitList?: GrantsGovOpportunity[]
}

export interface GrantsGovOpportunity {
  id?: string
  opportunityId?: string
  number?: string
  opportunityNumber?: string
  title?: string
  opportunityTitle?: string
  agency?: string
  agencyName?: string
  agencyCode?: string
  openDate?: string
  closeDate?: string
  postDate?: string
  archiveDate?: string | null
  oppStatus?: string
  opportunityStatus?: string
  docType?: string
  cfdaList?: string[]
  synopsis?: {
    agencyName?: string
    agencyCode?: string
    synopsisDesc?: string
    applicantTypes?: string[]
    fundingActivityCategories?: string[]
    fundingInstruments?: string[]
  }
  description?: string
  version?: string
  awardFloor?: number
  awardCeiling?: number
  estimatedFunding?: number
}

// Search parameters for search2 API
export interface GrantsGovSearchParams {
  keywords?: string
  keyword?: string
  oppNum?: string
  cfda?: string
  agency?: string
  oppStatuses?: string // pipe-separated: "posted|forecasted"
  fundingCategories?: string
  eligibilities?: string
  sortBy?: string
  rows?: number
  startRecordNum?: number
}

// Grants.gov API Client
export class GrantsGovApiClient {
  private searchUrl = 'https://api.grants.gov/v1/api/search2'

  /**
   * Search for grant opportunities using the search2 API
   * This API does NOT require authentication
   */
  async searchOpportunities(params: GrantsGovSearchParams = {}): Promise<GrantsGovSearchResponse> {
    const rows = Math.min(Math.max(params.rows || 25, 1), 1000)
    const startRecordNum = Math.max(params.startRecordNum || 0, 0)

    // Build request body for POST
    const body: Record<string, unknown> = {
      rows,
      startRecordNum,
    }

    // Add search parameters
    if (params.keywords || params.keyword) {
      body.keyword = params.keywords || params.keyword
    }
    if (params.oppNum) {
      body.oppNum = params.oppNum
    }
    if (params.agency) {
      body.agency = params.agency
    }
    if (params.oppStatuses) {
      body.oppStatuses = params.oppStatuses
    } else {
      // Default to posted opportunities
      body.oppStatuses = 'posted'
    }
    if (params.fundingCategories) {
      body.fundingCategories = params.fundingCategories
    }
    if (params.eligibilities) {
      body.eligibilities = params.eligibilities
    }
    if (params.sortBy) {
      body.sortBy = params.sortBy
    }

    const response = await fetch(this.searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Grants.gov API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data as GrantsGovSearchResponse
  }

  /**
   * Fetch all posted opportunities (with pagination)
   */
  async fetchAllPostedOpportunities(
    options: {
      maxPages?: number
      onProgress?: (fetched: number, total: number) => void
    } = {}
  ): Promise<GrantsGovOpportunity[]> {
    const { maxPages = 10, onProgress } = options
    const allOpportunities: GrantsGovOpportunity[] = []
    let startRecordNum = 0
    const rows = 100
    let totalHits = 0
    let page = 0

    do {
      const response = await this.searchOpportunities({
        oppStatuses: 'posted',
        rows,
        startRecordNum,
        sortBy: 'openDate|desc',
      })

      // Handle both response formats
      const opportunities = response.data?.oppHits || response.hitOppHitList || []
      totalHits = response.data?.hitCount || response.totalCount || 0
      allOpportunities.push(...opportunities)

      if (onProgress) {
        onProgress(allOpportunities.length, totalHits)
      }

      startRecordNum += rows
      page++

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500))

    } while (startRecordNum < totalHits && page < maxPages)

    return allOpportunities
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.searchOpportunities({ rows: 1 })
      return response.errorcode === 0 || !!(response.data?.oppHits || response.hitOppHitList)
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const grantsGovApi = new GrantsGovApiClient()

/**
 * Convert Grants.gov opportunity to our normalized format
 * Handles multiple response formats from the API
 */
export function normalizeGrantsGovOpportunity(opp: GrantsGovOpportunity) {
  // Parse dates
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  // Determine status
  const getStatus = (oppStatus: string | undefined): 'forecasted' | 'open' | 'closed' => {
    const status = oppStatus?.toLowerCase()
    if (status === 'forecasted') return 'forecasted'
    if (status === 'posted' || status === 'open') return 'open'
    return 'closed'
  }

  // Format amount
  const formatAmount = (amount: number | undefined): string | null => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get values from either format
  const id = opp.id || opp.opportunityId || ''
  const title = opp.title || opp.opportunityTitle || ''
  const agency = opp.agency || opp.agencyName || opp.synopsis?.agencyName || 'Federal Agency'
  const status = opp.oppStatus || opp.opportunityStatus || 'posted'
  const rawDescription = opp.description || opp.synopsis?.synopsisDesc || ''

  // Clean the description - remove URLs and extra whitespace
  const cleanDescription = (desc: string): string => {
    if (!desc) return ''
    // Remove URLs
    let cleaned = desc.replace(/https?:\/\/[^\s]+/g, '').trim()
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '')
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    return cleaned
  }

  const description = cleanDescription(rawDescription)

  // Build summary - either from description or from metadata
  const buildSummary = (): string => {
    if (description && description.length > 20) {
      return description.substring(0, 500)
    }

    // Build from metadata if no good description
    const parts: string[] = []

    if (opp.synopsis?.fundingActivityCategories?.length) {
      parts.push(`Funding categories: ${opp.synopsis.fundingActivityCategories.join(', ')}`)
    }

    if (opp.synopsis?.applicantTypes?.length) {
      parts.push(`Eligible: ${opp.synopsis.applicantTypes.slice(0, 3).join(', ')}`)
    }

    if (opp.synopsis?.fundingInstruments?.length) {
      parts.push(opp.synopsis.fundingInstruments.join(', '))
    }

    return parts.length > 0 ? parts.join('. ') : 'Federal grant opportunity. View details for eligibility and application information.'
  }

  const closeDate = parseDate(opp.closeDate)
  const openDate = parseDate(opp.openDate)

  return {
    sourceId: id,
    sourceName: 'grants-gov',
    title,
    sponsor: agency,
    summary: buildSummary(),
    description: description || null,
    categories: opp.synopsis?.fundingActivityCategories || opp.cfdaList || [],
    eligibility: opp.synopsis?.applicantTypes || [],
    locations: ['National'], // Federal grants are typically national
    amountMin: opp.awardFloor || null,
    amountMax: opp.awardCeiling || null,
    amountText: opp.awardFloor && opp.awardCeiling
      ? `${formatAmount(opp.awardFloor)} - ${formatAmount(opp.awardCeiling)}`
      : formatAmount(opp.estimatedFunding),
    deadlineDate: closeDate,
    deadlineType: closeDate ? 'hard' : undefined,
    openDate,
    url: `https://www.grants.gov/search-results-detail/${id}`,
    contact: JSON.stringify({
      agency,
      agencyCode: opp.agencyCode || opp.synopsis?.agencyCode,
    }),
    requirements: [],
    status: getStatus(status),
    hashFingerprint: `grants-gov-${id}-${opp.version || '1'}`,
  }
}
