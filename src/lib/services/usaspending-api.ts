/**
 * USAspending.gov API Service
 *
 * Provides access to comprehensive U.S. government spending data,
 * including grants, contracts, and other federal awards.
 *
 * Documentation: https://api.usaspending.gov/docs/
 *
 * NO API KEY REQUIRED - Free public access
 */

// API Response Types
export interface USASpendingSearchResponse {
  page_metadata: {
    page: number
    hasNext: boolean
    hasPrevious: boolean
    total: number
    limit: number
  }
  results: USASpendingAward[]
}

export interface USASpendingAward {
  Award_ID: string
  Recipient_Name: string
  Start_Date: string
  End_Date: string
  Award_Amount: number
  Awarding_Agency: string
  Awarding_Sub_Agency: string
  Award_Type: string
  Funding_Agency: string
  Funding_Sub_Agency: string
  generated_internal_id: string
  Description: string
  def_codes: string[]
  COVID_Related: boolean | null
  Infrastructure_Related: boolean | null
  recipient_id: string
  prime_award_recipient_id: string
}

export interface USASpendingGrantDetails {
  id: string
  type: string
  category: string
  type_description: string
  description: string
  generated_unique_award_id: string
  piid: string | null
  fain: string
  uri: string | null
  total_obligation: number
  base_and_all_options_value: number | null
  base_exercised_options_val: number | null
  date_signed: string
  action_date: string
  period_of_performance: {
    start_date: string
    end_date: string
    last_modified_date: string
  }
  recipient: {
    recipient_name: string
    recipient_uei: string
    recipient_hash: string
    parent_recipient_name: string | null
    parent_recipient_uei: string | null
    parent_recipient_hash: string | null
    location: {
      address_line1: string
      address_line2: string | null
      city_name: string
      county_name: string
      state_code: string
      zip5: string
      congressional_code: string
      country_name: string
    }
    business_categories: string[]
  }
  awarding_agency: {
    id: number
    toptier_agency: { name: string; code: string }
    subtier_agency: { name: string; code: string }
    office_agency_name: string
  }
  funding_agency: {
    id: number
    toptier_agency: { name: string; code: string }
    subtier_agency: { name: string; code: string }
    office_agency_name: string
  }
  place_of_performance: {
    address_line1: string | null
    city_name: string
    county_name: string
    state_code: string
    zip5: string
    congressional_code: string
    country_name: string
  }
  cfda_info: Array<{
    cfda_number: string
    cfda_title: string
    cfda_objectives: string
    applicant_eligibility: string
    beneficiary_eligibility: string
  }>
}

// Search parameters
export interface USASpendingSearchParams {
  keywords?: string[]
  time_period?: Array<{ start_date: string; end_date: string }>
  agencies?: Array<{ type: string; tier: string; name: string; toptier_name?: string }>
  recipient_locations?: Array<{ country: string; state?: string; county?: string; city?: string }>
  place_of_performance_locations?: Array<{ country: string; state?: string }>
  award_type_codes?: string[] // '02'-'05' for grants, '06'-'10' for direct payments
  award_amounts?: Array<{ lower_bound?: number; upper_bound?: number }>
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

// Award type codes for grants
export const GRANT_AWARD_TYPES = {
  '02': 'Block Grant',
  '03': 'Formula Grant',
  '04': 'Project Grant',
  '05': 'Cooperative Agreement',
} as const

// USAspending API Client
export class USASpendingApiClient {
  private baseUrl = 'https://api.usaspending.gov/api/v2'

  /**
   * Search for grant awards
   */
  async searchAwards(params: USASpendingSearchParams = {}): Promise<USASpendingSearchResponse> {
    const body: Record<string, unknown> = {
      filters: {
        // Default to grant award types
        award_type_codes: params.award_type_codes || ['02', '03', '04', '05'],
      },
      fields: [
        'Award_ID',
        'Recipient_Name',
        'Start_Date',
        'End_Date',
        'Award_Amount',
        'Awarding_Agency',
        'Awarding_Sub_Agency',
        'Award_Type',
        'Funding_Agency',
        'Funding_Sub_Agency',
        'generated_internal_id',
        'Description',
        'def_codes',
        'COVID_Related',
        'Infrastructure_Related',
      ],
      page: params.page || 1,
      limit: Math.min(params.limit || 25, 100),
      sort: params.sort || 'Award_Amount',
      order: params.order || 'desc',
    }

    // Add filters
    if (params.keywords && params.keywords.length > 0) {
      body.filters = { ...body.filters as object, keywords: params.keywords }
    }

    if (params.time_period && params.time_period.length > 0) {
      body.filters = { ...body.filters as object, time_period: params.time_period }
    } else {
      // Default to last fiscal year
      const now = new Date()
      const currentYear = now.getFullYear()
      const fiscalYearStart = now.getMonth() >= 9 ? currentYear : currentYear - 1
      body.filters = {
        ...body.filters as object,
        time_period: [{
          start_date: `${fiscalYearStart}-10-01`,
          end_date: `${fiscalYearStart + 1}-09-30`,
        }],
      }
    }

    if (params.agencies && params.agencies.length > 0) {
      body.filters = { ...body.filters as object, agencies: params.agencies }
    }

    if (params.recipient_locations && params.recipient_locations.length > 0) {
      body.filters = { ...body.filters as object, recipient_locations: params.recipient_locations }
    }

    if (params.place_of_performance_locations && params.place_of_performance_locations.length > 0) {
      body.filters = { ...body.filters as object, place_of_performance_locations: params.place_of_performance_locations }
    }

    if (params.award_amounts && params.award_amounts.length > 0) {
      body.filters = { ...body.filters as object, award_amounts: params.award_amounts }
    }

    const response = await fetch(`${this.baseUrl}/search/spending_by_award/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`USAspending API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Get award details by ID
   */
  async getAwardDetails(awardId: string): Promise<USASpendingGrantDetails> {
    const response = await fetch(`${this.baseUrl}/awards/${awardId}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`USAspending API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Search by agency
   */
  async searchByAgency(
    agencyName: string,
    options: { limit?: number; page?: number } = {}
  ): Promise<USASpendingSearchResponse> {
    return this.searchAwards({
      agencies: [{
        type: 'awarding',
        tier: 'toptier',
        name: agencyName,
      }],
      limit: options.limit,
      page: options.page,
    })
  }

  /**
   * Search by state
   */
  async searchByState(
    stateCode: string,
    options: { limit?: number; page?: number } = {}
  ): Promise<USASpendingSearchResponse> {
    return this.searchAwards({
      recipient_locations: [{
        country: 'USA',
        state: stateCode,
      }],
      limit: options.limit,
      page: options.page,
    })
  }

  /**
   * Search by keyword
   */
  async searchByKeyword(
    keyword: string,
    options: { limit?: number; page?: number } = {}
  ): Promise<USASpendingSearchResponse> {
    return this.searchAwards({
      keywords: [keyword],
      limit: options.limit,
      page: options.page,
    })
  }

  /**
   * Get agency list
   */
  async getAgencies(): Promise<Array<{ agency_name: string; agency_id: number }>> {
    const response = await fetch(`${this.baseUrl}/references/toptier_agencies/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch agencies: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.searchAwards({ limit: 1 })
      return response.results !== undefined
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const usaSpendingApi = new USASpendingApiClient()

/**
 * Convert USAspending award to our normalized format
 */
export function normalizeUSASpendingAward(award: USASpendingAward) {
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  const formatAmount = (amount: number | undefined): string | null => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const endDate = parseDate(award.End_Date)
  const startDate = parseDate(award.Start_Date)

  // Determine status based on end date
  const getStatus = (): 'forecasted' | 'open' | 'closed' => {
    if (!endDate) return 'open'
    return endDate > new Date() ? 'open' : 'closed'
  }

  // Get categories from award type and def codes
  const categories: string[] = []
  if (award.Award_Type) {
    categories.push(award.Award_Type)
  }
  if (award.def_codes && award.def_codes.length > 0) {
    categories.push(...award.def_codes)
  }
  if (award.COVID_Related) {
    categories.push('COVID-19 Related')
  }
  if (award.Infrastructure_Related) {
    categories.push('Infrastructure')
  }

  return {
    sourceId: award.Award_ID || award.generated_internal_id,
    sourceName: 'usaspending',
    title: award.Description || `${award.Award_Type} - ${award.Recipient_Name}`,
    sponsor: award.Awarding_Agency || award.Funding_Agency,
    summary: `${award.Award_Type} awarded to ${award.Recipient_Name}. Agency: ${award.Awarding_Sub_Agency || award.Awarding_Agency}`,
    description: award.Description || null,
    categories,
    eligibility: [], // USAspending shows awarded grants, not open opportunities
    locations: ['National'],
    amountMin: award.Award_Amount,
    amountMax: award.Award_Amount,
    amountText: formatAmount(award.Award_Amount),
    deadlineDate: endDate, // Using end date as reference
    deadlineType: undefined,
    openDate: startDate,
    url: `https://www.usaspending.gov/award/${award.generated_internal_id}`,
    contact: JSON.stringify({
      agency: award.Awarding_Agency,
      subAgency: award.Awarding_Sub_Agency,
      fundingAgency: award.Funding_Agency,
    }),
    requirements: [],
    status: getStatus(),
    hashFingerprint: `usaspending-${award.Award_ID || award.generated_internal_id}`,
    // Additional USAspending specific fields
    recipientName: award.Recipient_Name,
    awardType: award.Award_Type,
    internalId: award.generated_internal_id,
  }
}
