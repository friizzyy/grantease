/**
 * SAM.gov Get Opportunities Public API Service
 *
 * Integration with SAM.gov for federal contract opportunities.
 * Documentation: https://open.gsa.gov/api/get-opportunities-public-api/
 *
 * Note: SAM.gov focuses on CONTRACT opportunities (procurement),
 * while Grants.gov focuses on GRANT opportunities.
 *
 * IMPORTANT: Requires API key from SAM.gov
 * - Register at SAM.gov
 * - Request API key in Account Details
 * - Add to .env as SAM_GOV_API_KEY
 */

// API Response Types
export interface SamGovSearchResponse {
  totalRecords: number
  limit: number
  offset: number
  opportunitiesData?: SamGovOpportunity[]
  error?: {
    code: string
    message: string
  }
}

export interface SamGovOpportunity {
  noticeId: string
  title: string
  solicitationNumber?: string
  fullParentPathName?: string
  fullParentPathCode?: string
  postedDate: string
  type: string
  baseType?: string
  archiveType?: string
  archiveDate?: string
  typeOfSetAsideDescription?: string
  typeOfSetAside?: string
  responseDeadLine?: string
  naicsCode?: string
  naicsCodes?: string[]
  classificationCode?: string
  active?: string
  award?: {
    date?: string
    number?: string
    amount?: string
    awardee?: {
      name?: string
      location?: {
        streetAddress?: string
        city?: { code?: string; name?: string }
        state?: { code?: string; name?: string }
        zip?: string
        country?: { code?: string; name?: string }
      }
      ueiSAM?: string
    }
  }
  pointOfContact?: Array<{
    fax?: string
    type?: string
    email?: string
    phone?: string
    title?: string
    fullName?: string
  }>
  description?: string
  organizationType?: string
  additionalInfoLink?: string
  uiLink?: string
  office?: {
    code?: string
    name?: string
  }
  officeAddress?: {
    city?: string
    state?: string
    zipcode?: string
  }
  placeOfPerformance?: {
    streetAddress?: string
    city?: { code?: string; name?: string }
    state?: { code?: string; name?: string }
    zip?: string
    country?: { code?: string; name?: string }
  }
  links?: Array<{ rel?: string; href?: string }>
  resourceLinks?: string[]
}

// Search parameters
export interface SamGovSearchParams {
  postedFrom?: string // MM/dd/yyyy format
  postedTo?: string // MM/dd/yyyy format
  keyword?: string
  ptype?: string // Procurement type: u, p, a, r, s, o, g, k, i
  solnum?: string // Solicitation number
  title?: string
  state?: string // Place of performance state
  zip?: string
  naicsCode?: string
  typeOfSetAside?: string
  limit?: number // Max 1000
  offset?: number
}

// Procurement types
export const PROCUREMENT_TYPES = {
  u: 'Justification and Approval',
  p: 'Presolicitation',
  a: 'Award Notice',
  r: 'Sources Sought',
  s: 'Special Notice',
  o: 'Solicitation',
  g: 'Sale of Surplus Property',
  k: 'Combined Synopsis/Solicitation',
  i: 'Intent to Bundle Requirements',
} as const

// Set-aside types
export const SET_ASIDE_TYPES = {
  SBA: 'Total Small Business Set-Aside',
  SBP: 'Partial Small Business Set-Aside',
  '8A': '8(a) Set-Aside',
  '8AN': '8(a) Sole Source',
  HZC: 'HUBZone Set-Aside',
  HZS: 'HUBZone Sole Source',
  SDVOSBC: 'Service-Disabled Veteran-Owned Small Business Set-Aside',
  SDVOSBS: 'Service-Disabled Veteran-Owned Small Business Sole Source',
  WOSB: 'Women-Owned Small Business Program Set-Aside',
  WOSBSS: 'Women-Owned Small Business Program Sole Source',
  EDWOSB: 'Economically Disadvantaged WOSB Program Set-Aside',
  EDWOSBSS: 'Economically Disadvantaged WOSB Program Sole Source',
  VSA: 'Veteran-Owned Small Business Set-Aside',
  VSS: 'Veteran-Owned Small Business Sole Source',
} as const

// SAM.gov API Client
export class SamGovApiClient {
  private baseUrl = 'https://api.sam.gov/opportunities/v2/search'
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SAM_GOV_API_KEY
  }

  /**
   * Format date to MM/dd/yyyy format required by SAM.gov
   */
  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  /**
   * Search for contract opportunities
   */
  async searchOpportunities(params: SamGovSearchParams = {}): Promise<SamGovSearchResponse> {
    if (!this.apiKey) {
      throw new Error('SAM.gov API key is required. Set SAM_GOV_API_KEY in environment variables.')
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.set('api_key', this.apiKey)

    // Date range is required - default to last 30 days if not provided
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const postedFrom = params.postedFrom || this.formatDate(thirtyDaysAgo)
    const postedTo = params.postedTo || this.formatDate(today)

    queryParams.set('postedFrom', postedFrom)
    queryParams.set('postedTo', postedTo)

    // Optional parameters
    if (params.keyword) {
      queryParams.set('title', params.keyword) // SAM.gov uses 'title' for keyword search
    }
    if (params.ptype) {
      queryParams.set('ptype', params.ptype)
    }
    if (params.solnum) {
      queryParams.set('solnum', params.solnum)
    }
    if (params.state) {
      queryParams.set('state', params.state)
    }
    if (params.zip) {
      queryParams.set('zip', params.zip)
    }
    if (params.naicsCode) {
      queryParams.set('ncode', params.naicsCode)
    }
    if (params.typeOfSetAside) {
      queryParams.set('typeOfSetAside', params.typeOfSetAside)
    }

    // Pagination
    const limit = Math.min(Math.max(params.limit || 25, 1), 1000)
    const offset = Math.max(params.offset || 0, 0)
    queryParams.set('limit', String(limit))
    queryParams.set('offset', String(offset))

    const url = `${this.baseUrl}?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SAM.gov API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data as SamGovSearchResponse
  }

  /**
   * Search for active solicitations (most common use case)
   */
  async searchActiveSolicitations(
    keyword?: string,
    options: { state?: string; limit?: number; offset?: number } = {}
  ): Promise<SamGovSearchResponse> {
    return this.searchOpportunities({
      keyword,
      ptype: 'o,k', // Solicitations and Combined Synopsis/Solicitation
      state: options.state,
      limit: options.limit || 25,
      offset: options.offset || 0,
    })
  }

  /**
   * Get opportunities by NAICS code
   */
  async searchByNaicsCode(
    naicsCode: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<SamGovSearchResponse> {
    return this.searchOpportunities({
      naicsCode,
      ptype: 'o,k',
      limit: options.limit || 25,
      offset: options.offset || 0,
    })
  }

  /**
   * Get small business opportunities
   */
  async searchSmallBusinessOpportunities(
    keyword?: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<SamGovSearchResponse> {
    return this.searchOpportunities({
      keyword,
      ptype: 'o,k',
      typeOfSetAside: 'SBA', // Total Small Business Set-Aside
      limit: options.limit || 25,
      offset: options.offset || 0,
    })
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.searchOpportunities({ limit: 1 })
      return response.totalRecords !== undefined
    } catch {
      return false
    }
  }
}

// Export singleton instance (will be undefined if no API key)
export const samGovApi = new SamGovApiClient()

/**
 * Convert SAM.gov opportunity to our normalized format
 */
export function normalizeSamGovOpportunity(opp: SamGovOpportunity) {
  // Parse dates
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  // Determine status based on type and dates
  const getStatus = (opp: SamGovOpportunity): 'forecasted' | 'open' | 'closed' => {
    if (opp.archiveDate) {
      const archiveDate = new Date(opp.archiveDate)
      if (archiveDate < new Date()) return 'closed'
    }
    if (opp.type === 'p' || opp.type === 'r') return 'forecasted' // Presolicitation or Sources Sought
    if (opp.active === 'Yes') return 'open'
    return 'closed'
  }

  // Format amount
  const formatAmount = (amount: string | undefined): string | null => {
    if (!amount) return null
    const num = parseFloat(amount.replace(/[^0-9.-]+/g, ''))
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Get location from place of performance
  const getLocation = (opp: SamGovOpportunity): string[] => {
    const locations: string[] = []
    if (opp.placeOfPerformance?.state?.name) {
      locations.push(opp.placeOfPerformance.state.name)
    }
    if (opp.placeOfPerformance?.city?.name) {
      locations.push(opp.placeOfPerformance.city.name)
    }
    return locations.length > 0 ? locations : ['National']
  }

  // Get primary contact
  const getPrimaryContact = (opp: SamGovOpportunity): string | null => {
    const contact = opp.pointOfContact?.find(c => c.type === 'primary') || opp.pointOfContact?.[0]
    if (!contact) return null
    return JSON.stringify({
      name: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      title: contact.title,
    })
  }

  // Get categories from NAICS codes
  const getCategories = (opp: SamGovOpportunity): string[] => {
    const categories: string[] = []
    if (opp.naicsCode) categories.push(`NAICS: ${opp.naicsCode}`)
    if (opp.naicsCodes) categories.push(...opp.naicsCodes.map(c => `NAICS: ${c}`))
    if (opp.classificationCode) categories.push(`PSC: ${opp.classificationCode}`)
    if (opp.typeOfSetAsideDescription) categories.push(opp.typeOfSetAsideDescription)
    return categories
  }

  const deadlineDate = parseDate(opp.responseDeadLine)
  const postedDate = parseDate(opp.postedDate)

  // Get agency from fullParentPathName (format: "DEPT.AGENCY.OFFICE")
  const agencyParts = opp.fullParentPathName?.split('.') || []
  const sponsor = agencyParts[0] || opp.office?.name || 'Federal Agency'

  // Clean up description - remove URLs and HTML, extract meaningful text
  const cleanDescription = (desc: string | undefined): string | null => {
    if (!desc) return null
    // Remove URLs
    let cleaned = desc.replace(/https?:\/\/[^\s]+/g, '').trim()
    // Remove HTML tags if any
    cleaned = cleaned.replace(/<[^>]*>/g, '')
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    return cleaned.length > 10 ? cleaned : null
  }

  const cleanedDescription = cleanDescription(opp.description)

  // Build a meaningful summary from available data
  const buildSummary = (): string => {
    // First try to use cleaned description
    if (cleanedDescription && cleanedDescription.length > 20) {
      return cleanedDescription.substring(0, 500)
    }

    // Build summary from available metadata
    const parts: string[] = []

    // Add procurement type
    const procType = PROCUREMENT_TYPES[opp.type as keyof typeof PROCUREMENT_TYPES]
    if (procType) parts.push(procType)

    // Add set-aside info if available
    if (opp.typeOfSetAsideDescription) {
      parts.push(opp.typeOfSetAsideDescription)
    }

    // Add agency info
    if (opp.office?.name) {
      parts.push(`Issued by ${opp.office.name}`)
    }

    // Add location if available
    if (opp.placeOfPerformance?.state?.name) {
      parts.push(`Location: ${opp.placeOfPerformance.state.name}`)
    }

    // Add NAICS code context if available
    if (opp.naicsCode) {
      parts.push(`NAICS: ${opp.naicsCode}`)
    }

    return parts.length > 0 ? parts.join('. ') : 'Federal contract opportunity. View details for more information.'
  }

  return {
    sourceId: opp.noticeId,
    sourceName: 'sam-gov',
    title: opp.title,
    sponsor,
    summary: buildSummary(),
    description: cleanedDescription,
    categories: getCategories(opp),
    eligibility: opp.typeOfSetAside ? [opp.typeOfSetAsideDescription || opp.typeOfSetAside] : [],
    locations: getLocation(opp),
    amountMin: opp.award?.amount ? parseFloat(opp.award.amount.replace(/[^0-9.-]+/g, '')) : null,
    amountMax: opp.award?.amount ? parseFloat(opp.award.amount.replace(/[^0-9.-]+/g, '')) : null,
    amountText: formatAmount(opp.award?.amount),
    deadlineDate,
    deadlineType: deadlineDate ? 'hard' : undefined,
    openDate: postedDate,
    url: opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`,
    contact: getPrimaryContact(opp),
    requirements: [],
    status: getStatus(opp),
    hashFingerprint: `sam-gov-${opp.noticeId}-${opp.postedDate}`,
    // Additional SAM.gov specific fields
    solicitationNumber: opp.solicitationNumber,
    naicsCode: opp.naicsCode,
    setAsideType: opp.typeOfSetAside,
    procurementType: opp.type,
  }
}
