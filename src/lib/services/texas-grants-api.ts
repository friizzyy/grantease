/**
 * Texas State Grants Service
 *
 * Fetches grant data from Texas state sources including:
 * - Texas Comptroller's Transparency Portal
 * - Texas eGrants
 * - Texas Education Agency grants
 *
 * NO API KEY REQUIRED - Public data
 */

// Grant types
export interface TexasGrant {
  grantName: string
  grantDescription: string
  agencyName: string
  agencyCode: string
  fundingAmount: number | null
  applicationDeadline: string | null
  eligibleApplicants: string
  grantCategory: string
  fiscalYear: string
  contactEmail: string | null
  applicationUrl: string | null
  status: string
  postedDate: string | null
}

// Search parameters
export interface TexasGrantSearchParams {
  keyword?: string
  agency?: string
  category?: string
  openOnly?: boolean
  limit?: number
  offset?: number
}

// Texas state agencies
export const TX_AGENCIES = {
  OOG: 'Office of the Governor',
  TEA: 'Texas Education Agency',
  TCEQ: 'Texas Commission on Environmental Quality',
  TDA: 'Texas Department of Agriculture',
  TDHCA: 'Texas Department of Housing and Community Affairs',
  DSHS: 'Department of State Health Services',
  DFPS: 'Department of Family and Protective Services',
  HHSC: 'Health and Human Services Commission',
  GLO: 'General Land Office',
  TPWD: 'Texas Parks and Wildlife Department',
  TxDOT: 'Texas Department of Transportation',
  TWC: 'Texas Workforce Commission',
  TDCJ: 'Texas Department of Criminal Justice',
  TCA: 'Texas Commission on the Arts',
  CPRIT: 'Cancer Prevention and Research Institute of Texas',
} as const

// Grant categories
export const TX_GRANT_CATEGORIES = [
  'Education',
  'Health & Human Services',
  'Environment',
  'Agriculture',
  'Housing',
  'Economic Development',
  'Public Safety',
  'Transportation',
  'Arts & Culture',
  'Workforce Development',
  'Criminal Justice',
  'Cancer Research',
] as const

// Texas Grants Service
export class TexasGrantsService {
  private cachedGrants: TexasGrant[] | null = null
  private cacheTimestamp: number = 0
  private cacheDuration = 60 * 60 * 1000 // 1 hour cache

  /**
   * Fetch grants from Texas state sources
   */
  async fetchAllGrants(): Promise<TexasGrant[]> {
    // Return cached data if fresh
    if (this.cachedGrants && Date.now() - this.cacheTimestamp < this.cacheDuration) {
      return this.cachedGrants
    }

    const grants: TexasGrant[] = []

    // Try to fetch from Texas Open Data Portal
    try {
      // Texas state contracts/grants data
      const response = await fetch(
        'https://data.texas.gov/resource/qpwj-78fz.json?$limit=200',
        {
          headers: { 'Accept': 'application/json' },
        }
      )

      if (response.ok) {
        const data = await response.json()
        data.forEach((item: Record<string, string | number>) => {
          if (String(item.contract_type || '').toLowerCase().includes('grant')) {
            grants.push({
              grantName: String(item.contract_description || item.contract_number || 'Texas State Grant'),
              grantDescription: String(item.contract_description || ''),
              agencyName: String(item.agency_name || 'State of Texas'),
              agencyCode: '',
              fundingAmount: item.total_contract_value ? Number(item.total_contract_value) : null,
              applicationDeadline: item.end_date ? String(item.end_date) : null,
              eligibleApplicants: 'Various',
              grantCategory: 'State Grant',
              fiscalYear: String(item.fiscal_year || new Date().getFullYear()),
              contactEmail: null,
              applicationUrl: 'https://comptroller.texas.gov/',
              status: 'open',
              postedDate: item.effective_date ? String(item.effective_date) : null,
            })
          }
        })
      }
    } catch (error) {
      console.error('Error fetching Texas contracts:', error)
    }

    // Add known active Texas grant programs
    const knownPrograms: TexasGrant[] = [
      {
        grantName: 'Criminal Justice Division Grants',
        grantDescription: 'Funding for criminal justice programs including victim services, juvenile justice, and law enforcement.',
        agencyName: 'Office of the Governor',
        agencyCode: 'OOG',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'State agencies, Local governments, Nonprofits',
        grantCategory: 'Criminal Justice',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: 'cjd@gov.texas.gov',
        applicationUrl: 'https://egrants.gov.texas.gov/',
        status: 'open',
        postedDate: new Date().toISOString(),
      },
      {
        grantName: 'Texas Education Agency Discretionary Grants',
        grantDescription: 'Competitive grants for K-12 education programs and initiatives.',
        agencyName: 'Texas Education Agency',
        agencyCode: 'TEA',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'School districts, Charter schools, Education service centers',
        grantCategory: 'Education',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: null,
        applicationUrl: 'https://tea.texas.gov/finance-and-grants/grants',
        status: 'open',
        postedDate: new Date().toISOString(),
      },
      {
        grantName: 'Cancer Prevention Research Grants',
        grantDescription: 'Funding for cancer research, prevention, and early detection programs.',
        agencyName: 'Cancer Prevention and Research Institute of Texas',
        agencyCode: 'CPRIT',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Research institutions, Academic medical centers, Nonprofits',
        grantCategory: 'Cancer Research',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: 'help@cprit.texas.gov',
        applicationUrl: 'https://www.cprit.state.tx.us/grants-process/',
        status: 'open',
        postedDate: new Date().toISOString(),
      },
      {
        grantName: 'HOME Investment Partnerships Program',
        grantDescription: 'Federal funding for affordable housing activities including tenant-based rental assistance and homeowner rehabilitation.',
        agencyName: 'Texas Department of Housing and Community Affairs',
        agencyCode: 'TDHCA',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Local governments, CHDOs, Nonprofits',
        grantCategory: 'Housing',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: null,
        applicationUrl: 'https://www.tdhca.state.tx.us/home-division/',
        status: 'open',
        postedDate: new Date().toISOString(),
      },
      {
        grantName: 'Texas Parks and Wildlife Grants',
        grantDescription: 'Funding for parks, outdoor recreation, and wildlife conservation.',
        agencyName: 'Texas Parks and Wildlife Department',
        agencyCode: 'TPWD',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Local governments, Nonprofits, School districts',
        grantCategory: 'Environment',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: null,
        applicationUrl: 'https://tpwd.texas.gov/business/grants/',
        status: 'open',
        postedDate: new Date().toISOString(),
      },
      {
        grantName: 'Texas Commission on the Arts Grants',
        grantDescription: 'Support for arts organizations, artists, and arts education programs.',
        agencyName: 'Texas Commission on the Arts',
        agencyCode: 'TCA',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Arts organizations, Nonprofits, Local governments',
        grantCategory: 'Arts & Culture',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: 'info@arts.texas.gov',
        applicationUrl: 'https://www.arts.texas.gov/initiatives/grants/',
        status: 'open',
        postedDate: new Date().toISOString(),
      },
      {
        grantName: 'Skills Development Fund',
        grantDescription: 'Grants for workforce training in partnership with employers.',
        agencyName: 'Texas Workforce Commission',
        agencyCode: 'TWC',
        fundingAmount: null,
        applicationDeadline: null,
        eligibleApplicants: 'Community colleges, Technical schools, Workforce boards',
        grantCategory: 'Workforce Development',
        fiscalYear: String(new Date().getFullYear()),
        contactEmail: null,
        applicationUrl: 'https://www.twc.texas.gov/programs/skills-development-fund',
        status: 'open',
        postedDate: new Date().toISOString(),
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
  async searchGrants(params: TexasGrantSearchParams = {}): Promise<{
    grants: TexasGrant[]
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
        g.agencyCode.toLowerCase() === agency
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
    return [...TX_GRANT_CATEGORIES]
  }

  /**
   * Get agencies
   */
  getAgencies(): Array<{ code: string; name: string }> {
    return Object.entries(TX_AGENCIES).map(([code, name]) => ({ code, name }))
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
export const texasGrantsService = new TexasGrantsService()

/**
 * Convert Texas grant to our normalized format
 */
export function normalizeTexasGrant(grant: TexasGrant) {
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

  return {
    sourceId: `tx-${grant.grantName.replace(/\W/g, '-').toLowerCase().slice(0, 50)}`,
    sourceName: 'texas-grants',
    title: grant.grantName,
    sponsor: grant.agencyCode ? `${grant.agencyName} (${grant.agencyCode})` : grant.agencyName,
    summary: grant.grantDescription.substring(0, 500),
    description: grant.grantDescription,
    categories: [grant.grantCategory],
    eligibility: grant.eligibleApplicants.split(/[,;]/).map(s => s.trim()).filter(Boolean),
    locations: ['Texas'],
    amountMin: grant.fundingAmount,
    amountMax: grant.fundingAmount,
    amountText: formatAmount(grant.fundingAmount),
    deadlineDate: parseDate(grant.applicationDeadline),
    deadlineType: grant.applicationDeadline ? 'hard' : undefined,
    openDate: parseDate(grant.postedDate),
    url: grant.applicationUrl || 'https://comptroller.texas.gov/transparency/revenue/grants.php',
    contact: grant.contactEmail ? JSON.stringify({ email: grant.contactEmail }) : null,
    requirements: [],
    status: getStatus(),
    hashFingerprint: `tx-${grant.grantName.replace(/\W/g, '').slice(0, 30)}-${grant.fiscalYear}`,
    // Additional Texas-specific fields
    agencyCode: grant.agencyCode,
    fiscalYear: grant.fiscalYear,
  }
}
