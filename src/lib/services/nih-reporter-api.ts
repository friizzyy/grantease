/**
 * NIH RePORTER API Service
 *
 * Provides access to NIH-funded research projects and publications.
 * Documentation: https://api.reporter.nih.gov
 *
 * NO API KEY REQUIRED - Free public access
 * Rate limit: 1 request per second recommended
 */

// API Response Types
export interface NIHReporterSearchResponse {
  meta: {
    search_id: string
    total: number
    offset: number
    limit: number
    sort_field: string
    sort_order: string
    sorted_by_relevance: boolean
  }
  results: NIHProject[]
}

export interface NIHProject {
  appl_id: number
  subproject_id: number | null
  fiscal_year: number
  project_num: string
  project_serial_num: string
  organization: {
    org_name: string
    city: string
    state: string
    country: string
    org_city: string
    org_state: string
    org_zipcode: string
    org_fips: string
    org_duns: string[]
    org_ueis: string[]
    dept_type: string
    fips_country_code: string
    org_ipf_code: string
    external_org_id: number
  }
  award_type: string
  activity_code: string
  award_amount: number
  is_active: boolean
  project_num_split: {
    appl_type_code: string
    activity_code: string
    ic_code: string
    serial_num: string
    support_year: string
    suffix_code: string
  }
  principal_investigators: Array<{
    profile_id: number
    first_name: string
    middle_name: string | null
    last_name: string
    is_contact_pi: boolean
    full_name: string
    title: string | null
    email: string | null
  }>
  contact_pi_name: string
  program_officers: Array<{
    first_name: string
    last_name: string
    full_name: string
  }>
  agency_ic_admin: {
    abbreviation: string
    code: string
  }
  agency_ic_fundings: Array<{
    fy: number
    code: string
    name: string
    abbreviation: string
    total_cost: number
  }>
  cong_dist: string
  spending_categories_desc: string | null
  project_title: string
  phr_text: string | null
  abstract_text: string | null
  project_start_date: string
  project_end_date: string
  organization_type: {
    name: string
    code: string
  }
  opportunity_number: string | null
  full_study_section: {
    srg_code: string
    srg_flex: string
    sra_designator_code: string
    sra_flex_code: string
    group_code: string
    name: string
  } | null
  award_notice_date: string | null
  is_new: boolean
  mechanism_code_dc: string
  core_project_num: string
  terms: string | null
  pref_terms: string | null
  covid_response: string[]
  arra_funded: string
  budget_start: string
  budget_end: string
  cfda_code: string
  funding_mechanism: string
  direct_cost_amt: number
  indirect_cost_amt: number
}

// Search parameters
export interface NIHSearchParams {
  keyword?: string
  fiscalYears?: number[]
  agencies?: string[] // NIH institute codes like 'NCI', 'NIAID', etc.
  states?: string[]
  orgNames?: string[]
  piNames?: string[]
  fundingMechanism?: string
  activityCodes?: string[]
  awardTypes?: string[]
  minAwardAmount?: number
  maxAwardAmount?: number
  isActive?: boolean
  limit?: number
  offset?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

// NIH Institute codes
export const NIH_INSTITUTES = {
  NCI: 'National Cancer Institute',
  NIAID: 'National Institute of Allergy and Infectious Diseases',
  NHLBI: 'National Heart, Lung, and Blood Institute',
  NIGMS: 'National Institute of General Medical Sciences',
  NINDS: 'National Institute of Neurological Disorders and Stroke',
  NIDDK: 'National Institute of Diabetes and Digestive and Kidney Diseases',
  NIA: 'National Institute on Aging',
  NICHD: 'Eunice Kennedy Shriver National Institute of Child Health and Human Development',
  NIMH: 'National Institute of Mental Health',
  NEI: 'National Eye Institute',
  NIDCR: 'National Institute of Dental and Craniofacial Research',
  NIEHS: 'National Institute of Environmental Health Sciences',
  NIAAA: 'National Institute on Alcohol Abuse and Alcoholism',
  NIDA: 'National Institute on Drug Abuse',
  NINR: 'National Institute of Nursing Research',
  NHGRI: 'National Human Genome Research Institute',
  NIBIB: 'National Institute of Biomedical Imaging and Bioengineering',
  NIMHD: 'National Institute on Minority Health and Health Disparities',
  NCATS: 'National Center for Advancing Translational Sciences',
  NLM: 'National Library of Medicine',
  NCCIH: 'National Center for Complementary and Integrative Health',
  OD: 'NIH Office of the Director',
} as const

// NIH RePORTER API Client
export class NIHReporterApiClient {
  private baseUrl = 'https://api.reporter.nih.gov/v2'
  private lastRequestTime = 0
  private minRequestInterval = 1000 // 1 second between requests

  /**
   * Rate limiting helper
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()
  }

  /**
   * Search for NIH projects/grants
   */
  async searchProjects(params: NIHSearchParams = {}): Promise<NIHReporterSearchResponse> {
    await this.rateLimit()

    const criteria: Record<string, unknown> = {}

    // Add search criteria
    if (params.keyword) {
      criteria.advanced_text_search = {
        operator: 'and',
        search_field: 'terms',
        search_text: params.keyword,
      }
    }

    if (params.fiscalYears && params.fiscalYears.length > 0) {
      criteria.fiscal_years = params.fiscalYears
    } else {
      // Default to current and recent years
      const currentYear = new Date().getFullYear()
      criteria.fiscal_years = [currentYear, currentYear - 1]
    }

    if (params.agencies && params.agencies.length > 0) {
      criteria.agencies = params.agencies
    }

    if (params.states && params.states.length > 0) {
      criteria.org_states = params.states
    }

    if (params.orgNames && params.orgNames.length > 0) {
      criteria.org_names = params.orgNames
    }

    if (params.piNames && params.piNames.length > 0) {
      criteria.pi_names = params.piNames.map(name => ({ any_name: name }))
    }

    if (params.fundingMechanism) {
      criteria.funding_mechanism = params.fundingMechanism
    }

    if (params.activityCodes && params.activityCodes.length > 0) {
      criteria.activity_codes = params.activityCodes
    }

    if (params.awardTypes && params.awardTypes.length > 0) {
      criteria.award_types = params.awardTypes
    }

    if (params.minAwardAmount || params.maxAwardAmount) {
      criteria.award_amount_range = {
        min_amount: params.minAwardAmount || 0,
        max_amount: params.maxAwardAmount || 999999999,
      }
    }

    if (params.isActive !== undefined) {
      criteria.is_active = params.isActive
    }

    const body = {
      criteria,
      offset: params.offset || 0,
      limit: Math.min(params.limit || 25, 500),
      sort_field: params.sortField || 'award_amount',
      sort_order: params.sortOrder || 'desc',
    }

    const response = await fetch(`${this.baseUrl}/projects/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NIH RePORTER API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Search active grants only
   */
  async searchActiveGrants(
    keyword?: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<NIHReporterSearchResponse> {
    return this.searchProjects({
      keyword,
      isActive: true,
      limit: options.limit,
      offset: options.offset,
    })
  }

  /**
   * Search by NIH institute
   */
  async searchByInstitute(
    instituteCode: string,
    options: { keyword?: string; limit?: number; offset?: number } = {}
  ): Promise<NIHReporterSearchResponse> {
    return this.searchProjects({
      keyword: options.keyword,
      agencies: [instituteCode],
      isActive: true,
      limit: options.limit,
      offset: options.offset,
    })
  }

  /**
   * Search by state
   */
  async searchByState(
    stateCode: string,
    options: { keyword?: string; limit?: number; offset?: number } = {}
  ): Promise<NIHReporterSearchResponse> {
    return this.searchProjects({
      keyword: options.keyword,
      states: [stateCode],
      isActive: true,
      limit: options.limit,
      offset: options.offset,
    })
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.searchProjects({ limit: 1 })
      return response.meta !== undefined
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const nihReporterApi = new NIHReporterApiClient()

/**
 * Convert NIH project to our normalized format
 */
export function normalizeNIHProject(project: NIHProject) {
  const formatAmount = (amount: number | undefined): string | null => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  // Determine status
  const getStatus = (): 'forecasted' | 'open' | 'closed' => {
    if (!project.is_active) return 'closed'
    const endDate = parseDate(project.project_end_date)
    if (endDate && endDate < new Date()) return 'closed'
    return 'open'
  }

  // Get categories
  const categories: string[] = []
  if (project.activity_code) categories.push(`Activity: ${project.activity_code}`)
  if (project.funding_mechanism) categories.push(project.funding_mechanism)
  if (project.agency_ic_admin?.abbreviation) {
    const institute = NIH_INSTITUTES[project.agency_ic_admin.abbreviation as keyof typeof NIH_INSTITUTES]
    if (institute) categories.push(institute)
  }
  if (project.spending_categories_desc) {
    categories.push(...project.spending_categories_desc.split(';').map(c => c.trim()))
  }

  // Get location
  const locations: string[] = []
  if (project.organization?.state) locations.push(project.organization.state)
  if (project.organization?.city) locations.push(project.organization.city)

  const startDate = parseDate(project.project_start_date)
  const endDate = parseDate(project.project_end_date)

  return {
    sourceId: project.project_num || String(project.appl_id),
    sourceName: 'nih-reporter',
    title: project.project_title,
    sponsor: project.agency_ic_admin?.abbreviation
      ? `NIH - ${NIH_INSTITUTES[project.agency_ic_admin.abbreviation as keyof typeof NIH_INSTITUTES] || project.agency_ic_admin.abbreviation}`
      : 'National Institutes of Health',
    summary: project.phr_text || project.abstract_text?.substring(0, 500) || '',
    description: project.abstract_text || project.phr_text || null,
    categories,
    eligibility: project.organization_type ? [project.organization_type.name] : [],
    locations: locations.length > 0 ? locations : ['National'],
    amountMin: project.award_amount,
    amountMax: project.award_amount,
    amountText: formatAmount(project.award_amount),
    deadlineDate: endDate,
    deadlineType: undefined,
    openDate: startDate,
    url: `https://reporter.nih.gov/project-details/${project.appl_id}`,
    contact: JSON.stringify({
      pi: project.contact_pi_name,
      programOfficers: project.program_officers,
      organization: project.organization?.org_name,
    }),
    requirements: [],
    status: getStatus(),
    hashFingerprint: `nih-${project.appl_id}-${project.fiscal_year}`,
    // Additional NIH-specific fields
    projectNumber: project.project_num,
    fiscalYear: project.fiscal_year,
    isActive: project.is_active,
    activityCode: project.activity_code,
    instituteCode: project.agency_ic_admin?.abbreviation,
  }
}
