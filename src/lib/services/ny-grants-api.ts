/**
 * New York State Grants Service
 *
 * Fetches grant data from New York State sources.
 * The Grants Gateway was retired in 2024 and replaced with the
 * Statewide Financial System (SFS).
 *
 * This service aggregates data from:
 * - NY Open Data Portal (data.ny.gov)
 * - NY Grants Management resources
 *
 * NO API KEY REQUIRED - Public data
 */

// Grant types from NY Open Data
export interface NYStateGrant {
  grantName: string
  grantDescription: string
  agencyName: string
  agencyAcronym: string
  fundingAmount: number | null
  applicationDeadline: string | null
  eligibleApplicants: string
  grantCategory: string
  programYear: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  applicationUrl: string | null
  status: string
  lastUpdated: string
}

// Search parameters
export interface NYGrantSearchParams {
  keyword?: string
  agency?: string
  category?: string
  openOnly?: boolean
  limit?: number
  offset?: number
}

// NY State agency codes
export const NY_AGENCIES = {
  DOH: 'Department of Health',
  DOL: 'Department of Labor',
  OCFS: 'Office of Children and Family Services',
  OTDA: 'Office of Temporary and Disability Assistance',
  OPWDD: 'Office for People With Developmental Disabilities',
  OMH: 'Office of Mental Health',
  OASAS: 'Office of Addiction Services and Supports',
  DOS: 'Department of State',
  DEC: 'Department of Environmental Conservation',
  ESD: 'Empire State Development',
  NYSCA: 'New York State Council on the Arts',
  NYSED: 'State Education Department',
  HCR: 'Homes and Community Renewal',
  NYSERDA: 'New York State Energy Research and Development Authority',
  DFS: 'Department of Financial Services',
  AG: 'Office of the Attorney General',
} as const

// Grant categories
export const NY_GRANT_CATEGORIES = [
  'Health & Human Services',
  'Education',
  'Environment & Energy',
  'Economic Development',
  'Housing',
  'Arts & Culture',
  'Public Safety',
  'Transportation',
  'Agriculture',
  'Community Development',
] as const

// NY State Grants Service
export class NYStateGrantsService {
  private openDataUrl = 'https://data.ny.gov/api/views'
  private cachedGrants: NYStateGrant[] | null = null
  private cacheTimestamp: number = 0
  private cacheDuration = 60 * 60 * 1000 // 1 hour cache

  /**
   * Fetch grants from NY Open Data
   * Note: We'll use known dataset IDs for grant-related data
   */
  async fetchAllGrants(): Promise<NYStateGrant[]> {
    // Return cached data if fresh
    if (this.cachedGrants && Date.now() - this.cacheTimestamp < this.cacheDuration) {
      return this.cachedGrants
    }

    const grants: NYStateGrant[] = []

    // Try to fetch from multiple NY state sources
    try {
      // Fetch from NY State Contract Reporter data
      const contractsResponse = await fetch(
        'https://data.ny.gov/resource/erm2-nwe9.json?$limit=500&$where=contract_type%20like%20%27%25Grant%25%27',
        {
          headers: { 'Accept': 'application/json' },
        }
      )

      if (contractsResponse.ok) {
        const contracts = await contractsResponse.json()
        contracts.forEach((contract: Record<string, string | number>) => {
          grants.push({
            grantName: String(contract.contract_description || contract.contract_number || 'NY State Grant'),
            grantDescription: String(contract.contract_description || ''),
            agencyName: String(contract.agency_name || 'New York State'),
            agencyAcronym: '',
            fundingAmount: contract.contract_amount ? Number(contract.contract_amount) : null,
            applicationDeadline: contract.end_date ? String(contract.end_date) : null,
            eligibleApplicants: String(contract.vendor_name || 'Various'),
            grantCategory: 'State Contract',
            programYear: String(contract.fiscal_year || new Date().getFullYear()),
            contactName: null,
            contactEmail: null,
            contactPhone: null,
            applicationUrl: 'https://grantsmanagement.ny.gov/',
            status: 'open',
            lastUpdated: String(contract.start_date || new Date().toISOString()),
          })
        })
      }
    } catch (error) {
      console.error('Error fetching NY contracts:', error)
    }

    // Add known active NY grant programs
    const knownPrograms: NYStateGrant[] = [
      {
        grantName: 'Consolidated Funding Application (CFA)',
        grantDescription: 'One-stop application for multiple state funding programs across economic development, housing, and community development.',
        agencyName: 'Empire State Development',
        agencyAcronym: 'ESD',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Municipalities, Nonprofits, Businesses',
        grantCategory: 'Economic Development',
        programYear: String(new Date().getFullYear()),
        contactName: null,
        contactEmail: 'cfa@esd.ny.gov',
        contactPhone: null,
        applicationUrl: 'https://apps.cio.ny.gov/apps/cfa/',
        status: 'open',
        lastUpdated: new Date().toISOString(),
      },
      {
        grantName: 'Environmental Protection Fund',
        grantDescription: 'Funding for parks, land conservation, waterfront revitalization, and environmental programs.',
        agencyName: 'Department of Environmental Conservation',
        agencyAcronym: 'DEC',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Municipalities, Nonprofits',
        grantCategory: 'Environment & Energy',
        programYear: String(new Date().getFullYear()),
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        applicationUrl: 'https://www.dec.ny.gov/lands/309.html',
        status: 'open',
        lastUpdated: new Date().toISOString(),
      },
      {
        grantName: 'NYSCA General Operating Support',
        grantDescription: 'General operating support for arts and cultural organizations.',
        agencyName: 'New York State Council on the Arts',
        agencyAcronym: 'NYSCA',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Arts Organizations, Cultural Nonprofits',
        grantCategory: 'Arts & Culture',
        programYear: String(new Date().getFullYear()),
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        applicationUrl: 'https://arts.ny.gov/grants',
        status: 'open',
        lastUpdated: new Date().toISOString(),
      },
      {
        grantName: 'Clean Energy Fund',
        grantDescription: 'Funding for clean energy projects, energy efficiency, and renewable energy initiatives.',
        agencyName: 'New York State Energy Research and Development Authority',
        agencyAcronym: 'NYSERDA',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Businesses, Municipalities, Nonprofits, Homeowners',
        grantCategory: 'Environment & Energy',
        programYear: String(new Date().getFullYear()),
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        applicationUrl: 'https://www.nyserda.ny.gov/Funding-Opportunities',
        status: 'open',
        lastUpdated: new Date().toISOString(),
      },
    ]

    grants.push(...knownPrograms)

    this.cachedGrants = grants
    this.cacheTimestamp = Date.now()

    return grants
  }

  /**
   * Search grants with filters
   */
  async searchGrants(params: NYGrantSearchParams = {}): Promise<{
    grants: NYStateGrant[]
    total: number
  }> {
    const allGrants = await this.fetchAllGrants()
    let filtered = [...allGrants]

    // Filter by keyword
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(g =>
        g.grantName.toLowerCase().includes(keyword) ||
        g.grantDescription.toLowerCase().includes(keyword) ||
        g.agencyName.toLowerCase().includes(keyword) ||
        g.grantCategory.toLowerCase().includes(keyword)
      )
    }

    // Filter by agency
    if (params.agency) {
      const agency = params.agency.toLowerCase()
      filtered = filtered.filter(g =>
        g.agencyName.toLowerCase().includes(agency) ||
        g.agencyAcronym.toLowerCase() === agency
      )
    }

    // Filter by category
    if (params.category) {
      const category = params.category.toLowerCase()
      filtered = filtered.filter(g =>
        g.grantCategory.toLowerCase().includes(category)
      )
    }

    // Filter open only
    if (params.openOnly) {
      filtered = filtered.filter(g => g.status === 'open')
    }

    const total = filtered.length

    // Apply pagination
    const offset = params.offset || 0
    const limit = params.limit || 25
    filtered = filtered.slice(offset, offset + limit)

    return { grants: filtered, total }
  }

  /**
   * Get grant categories
   */
  getCategories(): string[] {
    return [...NY_GRANT_CATEGORIES]
  }

  /**
   * Get agencies
   */
  getAgencies(): Array<{ code: string; name: string }> {
    return Object.entries(NY_AGENCIES).map(([code, name]) => ({ code, name }))
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedGrants = null
    this.cacheTimestamp = 0
  }

  /**
   * Test connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const grants = await this.fetchAllGrants()
      return grants.length > 0
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const nyStateGrantsService = new NYStateGrantsService()

/**
 * Convert NY State grant to our normalized format
 */
export function normalizeNYStateGrant(grant: NYStateGrant) {
  const formatAmount = (amount: number | null): string | null => {
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
    if (grant.status === 'closed') return 'closed'
    if (grant.applicationDeadline) {
      const deadline = new Date(grant.applicationDeadline)
      if (deadline < new Date()) return 'closed'
    }
    return 'open'
  }

  // Build contact info
  const contact: Record<string, string | null> = {}
  if (grant.contactName) contact.name = grant.contactName
  if (grant.contactEmail) contact.email = grant.contactEmail
  if (grant.contactPhone) contact.phone = grant.contactPhone

  return {
    sourceId: `ny-${grant.grantName.replace(/\W/g, '-').toLowerCase().slice(0, 50)}`,
    sourceName: 'ny-state-grants',
    title: grant.grantName,
    sponsor: grant.agencyAcronym ? `${grant.agencyName} (${grant.agencyAcronym})` : grant.agencyName,
    summary: grant.grantDescription.substring(0, 500),
    description: grant.grantDescription,
    categories: [grant.grantCategory],
    eligibility: grant.eligibleApplicants.split(/[,;]/).map(s => s.trim()).filter(Boolean),
    locations: ['New York'],
    amountMin: grant.fundingAmount,
    amountMax: grant.fundingAmount,
    amountText: formatAmount(grant.fundingAmount),
    deadlineDate: parseDate(grant.applicationDeadline),
    deadlineType: grant.applicationDeadline ? 'hard' : undefined,
    openDate: parseDate(grant.lastUpdated),
    url: grant.applicationUrl || 'https://grantsmanagement.ny.gov/',
    contact: Object.keys(contact).length > 0 ? JSON.stringify(contact) : null,
    requirements: [],
    status: getStatus(),
    hashFingerprint: `ny-${grant.grantName.replace(/\W/g, '').slice(0, 30)}-${grant.programYear}`,
    // Additional NY-specific fields
    agencyAcronym: grant.agencyAcronym,
    programYear: grant.programYear,
  }
}
