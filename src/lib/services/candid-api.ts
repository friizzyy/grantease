/**
 * Candid Foundation Directory API Service
 *
 * Provides access to foundation grants data including funders, recipients, and transactions.
 * Documentation: https://developer.candid.org/
 *
 * REQUIRES API KEY - Contact Candid for subscription access
 * Free trial available through developer.candid.org
 */

// API Response Types
export interface CandidGrantsSearchResponse {
  total_count: number
  page: number
  per_page: number
  transactions: CandidGrantTransaction[]
}

export interface CandidGrantTransaction {
  transaction_id: string
  amount: number
  year_authorized: number
  year_issued: number | null
  description: string | null
  purpose: string | null
  subject: string[]
  population: string[]
  support_strategy: string[]
  transaction_type: string
  grant_duration: string | null
  funder: {
    organization_id: string
    name: string
    city: string
    state: string
    country: string
    ein: string
    ntee_code: string | null
  }
  recipient: {
    organization_id: string
    name: string
    city: string
    state: string
    country: string
    ein: string | null
    ntee_code: string | null
  }
}

export interface CandidFunderSearchResponse {
  total_count: number
  page: number
  per_page: number
  funders: CandidFunder[]
}

export interface CandidFunder {
  organization_id: string
  name: string
  ein: string
  city: string
  state: string
  country: string
  ntee_code: string | null
  total_giving: number
  total_assets: number
  fiscal_year_end: string | null
  website: string | null
  mission: string | null
  geographic_focus: string[]
  subject_focus: string[]
  population_focus: string[]
  application_info: string | null
  application_deadline: string | null
  accepts_unsolicited: boolean | null
}

export interface CandidRecipientSearchResponse {
  total_count: number
  page: number
  per_page: number
  recipients: CandidRecipient[]
}

export interface CandidRecipient {
  organization_id: string
  name: string
  ein: string
  city: string
  state: string
  country: string
  ntee_code: string | null
  total_received: number
  funder_count: number
  fiscal_year_end: string | null
  website: string | null
  mission: string | null
}

// Search parameters
export interface CandidSearchParams {
  keyword?: string
  funderId?: string
  recipientId?: string
  subject?: string[]
  population?: string[]
  geoFocus?: string[]
  state?: string
  minAmount?: number
  maxAmount?: number
  yearFrom?: number
  yearTo?: number
  page?: number
  perPage?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Common subject codes
export const CANDID_SUBJECTS = {
  'A': 'Arts, Culture & Humanities',
  'B': 'Education',
  'C': 'Environment',
  'D': 'Animal-Related',
  'E': 'Health Care',
  'F': 'Mental Health & Crisis Intervention',
  'G': 'Disease/Disorder/Medical Disciplines',
  'H': 'Medical Research',
  'I': 'Crime & Legal-Related',
  'J': 'Employment',
  'K': 'Food, Agriculture & Nutrition',
  'L': 'Housing & Shelter',
  'M': 'Public Safety/Disaster Preparedness',
  'N': 'Recreation & Sports',
  'O': 'Youth Development',
  'P': 'Human Services',
  'Q': 'International/Foreign Affairs & National Security',
  'R': 'Civil Rights/Social Action/Advocacy',
  'S': 'Community Improvement/Capacity Building',
  'T': 'Philanthropy/Voluntarism/Grantmaking Foundations',
  'U': 'Science & Technology',
  'V': 'Social Science',
  'W': 'Public/Society Benefit',
  'X': 'Religion-Related',
  'Y': 'Mutual/Membership Benefit',
  'Z': 'Unknown',
} as const

// Candid API Client
export class CandidApiClient {
  private baseUrl = 'https://api.candid.org/grants/v1'
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CANDID_API_KEY
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Make authenticated request
   */
  private async request<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Candid API key is required. Set CANDID_API_KEY in environment variables.')
    }

    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.set(key, String(value))
      }
    })

    const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Candid API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Search grant transactions
   */
  async searchTransactions(params: CandidSearchParams = {}): Promise<CandidGrantsSearchResponse> {
    const queryParams: Record<string, string | number | undefined> = {
      page: params.page || 1,
      per_page: Math.min(params.perPage || 25, 100),
    }

    if (params.keyword) {
      queryParams.q = params.keyword
    }
    if (params.funderId) {
      queryParams.funder_id = params.funderId
    }
    if (params.recipientId) {
      queryParams.recip_id = params.recipientId
    }
    if (params.subject && params.subject.length > 0) {
      queryParams.subject = params.subject.join(',')
    }
    if (params.population && params.population.length > 0) {
      queryParams.population = params.population.join(',')
    }
    if (params.geoFocus && params.geoFocus.length > 0) {
      queryParams.geo_focus = params.geoFocus.join(',')
    }
    if (params.state) {
      queryParams.state = params.state
    }
    if (params.minAmount) {
      queryParams.min_amt = params.minAmount
    }
    if (params.maxAmount) {
      queryParams.max_amt = params.maxAmount
    }
    if (params.yearFrom) {
      queryParams.year_from = params.yearFrom
    }
    if (params.yearTo) {
      queryParams.year_to = params.yearTo
    }
    if (params.sortBy) {
      queryParams.sort_by = params.sortBy
    }
    if (params.sortOrder) {
      queryParams.sort_order = params.sortOrder
    }

    return this.request<CandidGrantsSearchResponse>('/transactions', queryParams)
  }

  /**
   * Search funders (foundations)
   */
  async searchFunders(params: CandidSearchParams = {}): Promise<CandidFunderSearchResponse> {
    const queryParams: Record<string, string | number | undefined> = {
      page: params.page || 1,
      per_page: Math.min(params.perPage || 25, 100),
    }

    if (params.keyword) {
      queryParams.q = params.keyword
    }
    if (params.subject && params.subject.length > 0) {
      queryParams.subject = params.subject.join(',')
    }
    if (params.geoFocus && params.geoFocus.length > 0) {
      queryParams.geo_focus = params.geoFocus.join(',')
    }
    if (params.state) {
      queryParams.state = params.state
    }

    return this.request<CandidFunderSearchResponse>('/funders', queryParams)
  }

  /**
   * Search recipients
   */
  async searchRecipients(params: CandidSearchParams = {}): Promise<CandidRecipientSearchResponse> {
    const queryParams: Record<string, string | number | undefined> = {
      page: params.page || 1,
      per_page: Math.min(params.perPage || 25, 100),
    }

    if (params.keyword) {
      queryParams.q = params.keyword
    }
    if (params.subject && params.subject.length > 0) {
      queryParams.subject = params.subject.join(',')
    }
    if (params.state) {
      queryParams.state = params.state
    }

    return this.request<CandidRecipientSearchResponse>('/recipients', queryParams)
  }

  /**
   * Get funder details
   */
  async getFunder(organizationId: string): Promise<CandidFunder> {
    return this.request<CandidFunder>(`/funders/${organizationId}`)
  }

  /**
   * Search for grants by subject area
   */
  async searchBySubject(
    subjectCode: string,
    options: { keyword?: string; limit?: number; page?: number } = {}
  ): Promise<CandidGrantsSearchResponse> {
    return this.searchTransactions({
      keyword: options.keyword,
      subject: [subjectCode],
      perPage: options.limit,
      page: options.page,
    })
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false
    try {
      await this.searchTransactions({ perPage: 1 })
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const candidApi = new CandidApiClient()

/**
 * Convert Candid grant transaction to our normalized format
 */
export function normalizeCandidTransaction(transaction: CandidGrantTransaction) {
  const formatAmount = (amount: number | undefined): string | null => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get categories from subject codes
  const categories: string[] = transaction.subject?.map(code => {
    const subject = CANDID_SUBJECTS[code.charAt(0) as keyof typeof CANDID_SUBJECTS]
    return subject || code
  }) || []

  // Add population and support strategy
  if (transaction.population?.length) {
    categories.push(...transaction.population)
  }
  if (transaction.support_strategy?.length) {
    categories.push(...transaction.support_strategy)
  }

  // Get location
  const locations: string[] = []
  if (transaction.recipient?.state) locations.push(transaction.recipient.state)
  if (transaction.recipient?.city) locations.push(transaction.recipient.city)

  // Build funder URL
  const funderUrl = transaction.funder?.ein
    ? `https://fconline.foundationcenter.org/fdo-search/foundation/${transaction.funder.ein}`
    : 'https://fconline.foundationcenter.org/'

  return {
    sourceId: transaction.transaction_id,
    sourceName: 'candid',
    title: transaction.description || `Grant to ${transaction.recipient?.name || 'Organization'}`,
    sponsor: transaction.funder?.name || 'Foundation',
    summary: transaction.purpose || transaction.description || `${formatAmount(transaction.amount)} grant from ${transaction.funder?.name}`,
    description: transaction.purpose || transaction.description || null,
    categories: [...new Set(categories)],
    eligibility: [],
    locations: locations.length > 0 ? locations : ['National'],
    amountMin: transaction.amount,
    amountMax: transaction.amount,
    amountText: formatAmount(transaction.amount),
    deadlineDate: null, // Historical data
    deadlineType: undefined,
    openDate: transaction.year_authorized ? new Date(transaction.year_authorized, 0, 1) : null,
    url: funderUrl,
    contact: JSON.stringify({
      funder: transaction.funder,
      recipient: transaction.recipient,
    }),
    requirements: [],
    status: 'closed' as const, // Historical grants
    hashFingerprint: `candid-${transaction.transaction_id}`,
    // Additional Candid-specific fields
    yearAuthorized: transaction.year_authorized,
    yearIssued: transaction.year_issued,
    transactionType: transaction.transaction_type,
    grantDuration: transaction.grant_duration,
    funderEin: transaction.funder?.ein,
    recipientEin: transaction.recipient?.ein,
  }
}

/**
 * Convert Candid funder to a grant opportunity format
 */
export function normalizeCandidFunder(funder: CandidFunder) {
  const formatAmount = (amount: number | undefined): string | null => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get categories from focus areas
  const categories = [
    ...(funder.subject_focus || []).map(code => CANDID_SUBJECTS[code.charAt(0) as keyof typeof CANDID_SUBJECTS] || code),
    ...(funder.population_focus || []),
  ]

  // Determine status based on application info
  const getStatus = (): 'forecasted' | 'open' | 'closed' => {
    if (funder.accepts_unsolicited === false) return 'closed'
    return 'open'
  }

  return {
    sourceId: funder.organization_id,
    sourceName: 'candid',
    title: `Funding from ${funder.name}`,
    sponsor: funder.name,
    summary: funder.mission || `Foundation with ${formatAmount(funder.total_giving)} in total giving`,
    description: funder.mission || funder.application_info || null,
    categories: [...new Set(categories)],
    eligibility: funder.geographic_focus || [],
    locations: funder.state ? [funder.state] : ['National'],
    amountMin: null,
    amountMax: funder.total_giving,
    amountText: `Total Giving: ${formatAmount(funder.total_giving)}`,
    deadlineDate: funder.application_deadline ? new Date(funder.application_deadline) : null,
    deadlineType: funder.application_deadline ? 'hard' : undefined,
    openDate: null,
    url: funder.website || `https://fconline.foundationcenter.org/fdo-search/foundation/${funder.ein}`,
    contact: JSON.stringify({
      name: funder.name,
      city: funder.city,
      state: funder.state,
      website: funder.website,
    }),
    requirements: funder.application_info ? [funder.application_info] : [],
    status: getStatus(),
    hashFingerprint: `candid-funder-${funder.organization_id}`,
    // Additional funder-specific fields
    ein: funder.ein,
    totalAssets: funder.total_assets,
    acceptsUnsolicited: funder.accepts_unsolicited,
    nteeCode: funder.ntee_code,
  }
}
