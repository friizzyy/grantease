/**
 * California Grants Portal Service
 *
 * Fetches grant data from the California Grants Portal via data.ca.gov
 * Data is published as CSV and updates daily at 8:45 PM PT
 *
 * Data source: https://data.ca.gov/dataset/california-grants-portal
 * NO API KEY REQUIRED - Public data
 */

import Papa from 'papaparse'

// CSV row type
export interface CaliforniaGrantRow {
  grantTitle: string
  description: string
  agencyName: string
  agencyContactName?: string
  agencyContactEmail?: string
  agencyContactPhone?: string
  estimatedAvailableFunds?: string
  estimatedAwards?: string
  lowestAward?: string
  highestAward?: string
  applicantType: string
  grantCategories: string
  geographicEligibility?: string
  opportunityOpenDate?: string
  opportunityCloseDate?: string
  grantLink: string
  matchingFundsRequired?: string
  expectedAwardDate?: string
  fundingSource?: string
  electronicSubmission?: string
  isForecasted?: string
  costSharing?: string
  additionalEligibilityInformation?: string
}

// Normalized grant type
export interface CaliforniaGrant {
  id: string
  title: string
  description: string
  agency: string
  contact: {
    name?: string
    email?: string
    phone?: string
  }
  estimatedFunding: number | null
  awardRange: {
    min: number | null
    max: number | null
  }
  applicantTypes: string[]
  categories: string[]
  geographicEligibility: string[]
  openDate: Date | null
  closeDate: Date | null
  url: string
  matchingRequired: boolean
  isForecasted: boolean
  fundingSource: string | null
}

// Search parameters
export interface CaliforniaGrantSearchParams {
  keyword?: string
  category?: string
  applicantType?: string
  openOnly?: boolean
  limit?: number
  offset?: number
}

// California Grants Service
export class CaliforniaGrantsService {
  private dataUrl = 'https://data.ca.gov/dataset/e1b1c799-cdd4-4219-af6d-93b79747fffb/resource/111c8c88-21f6-453c-ae2c-b4785a0624f5/download/california-grants-portal-data.csv'
  private cachedData: CaliforniaGrant[] | null = null
  private cacheTimestamp: number = 0
  private cacheDuration = 60 * 60 * 1000 // 1 hour cache

  /**
   * Fetch and parse the CSV data
   */
  async fetchAllGrants(): Promise<CaliforniaGrant[]> {
    // Return cached data if fresh
    if (this.cachedData && Date.now() - this.cacheTimestamp < this.cacheDuration) {
      return this.cachedData
    }

    const response = await fetch(this.dataUrl)
    if (!response.ok) {
      throw new Error(`California Grants Portal API fetchAllGrants failed (HTTP ${response.status}): unable to retrieve CSV data from data.ca.gov`)
    }

    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const grants = (results.data as Record<string, string>[]).map((row, index) => {
            return this.normalizeGrant(row, index)
          }).filter(g => g !== null) as CaliforniaGrant[]

          this.cachedData = grants
          this.cacheTimestamp = Date.now()
          resolve(grants)
        },
        error: (error: Error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`))
        },
      })
    })
  }

  /**
   * Normalize a CSV row to our grant format
   */
  private normalizeGrant(row: Record<string, string>, index: number): CaliforniaGrant | null {
    // Skip rows without required fields
    if (!row['grantTitle'] && !row['Grant Title']) {
      return null
    }

    // Handle different column name formats
    const getValue = (keys: string[]): string => {
      for (const key of keys) {
        if (row[key]) return row[key]
      }
      return ''
    }

    const parseAmount = (str: string): number | null => {
      if (!str) return null
      const cleaned = str.replace(/[$,]/g, '')
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num
    }

    const parseDate = (str: string): Date | null => {
      if (!str) return null
      try {
        const date = new Date(str)
        return isNaN(date.getTime()) ? null : date
      } catch {
        return null
      }
    }

    const parseList = (str: string): string[] => {
      if (!str) return []
      return str.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0)
    }

    const title = getValue(['grantTitle', 'Grant Title', 'title'])
    const description = getValue(['description', 'Description'])
    const agency = getValue(['agencyName', 'Agency Name', 'agency'])

    return {
      id: `ca-${index}-${title.slice(0, 20).replace(/\W/g, '')}`,
      title,
      description,
      agency,
      contact: {
        name: getValue(['agencyContactName', 'Agency Contact Name']),
        email: getValue(['agencyContactEmail', 'Agency Contact Email']),
        phone: getValue(['agencyContactPhone', 'Agency Contact Phone']),
      },
      estimatedFunding: parseAmount(getValue(['estimatedAvailableFunds', 'Estimated Available Funds'])),
      awardRange: {
        min: parseAmount(getValue(['lowestAward', 'Lowest Award'])),
        max: parseAmount(getValue(['highestAward', 'Highest Award'])),
      },
      applicantTypes: parseList(getValue(['applicantType', 'Applicant Type'])),
      categories: parseList(getValue(['grantCategories', 'Grant Categories'])),
      geographicEligibility: parseList(getValue(['geographicEligibility', 'Geographic Eligibility'])),
      openDate: parseDate(getValue(['opportunityOpenDate', 'Opportunity Open Date'])),
      closeDate: parseDate(getValue(['opportunityCloseDate', 'Opportunity Close Date'])),
      url: getValue(['grantLink', 'Grant Link', 'url']),
      matchingRequired: getValue(['matchingFundsRequired', 'Matching Funds Required']).toLowerCase() === 'yes',
      isForecasted: getValue(['isForecasted', 'Is Forecasted']).toLowerCase() === 'yes',
      fundingSource: getValue(['fundingSource', 'Funding Source']) || null,
    }
  }

  /**
   * Search grants with filters
   */
  async searchGrants(params: CaliforniaGrantSearchParams = {}): Promise<{
    grants: CaliforniaGrant[]
    total: number
  }> {
    const allGrants = await this.fetchAllGrants()
    let filtered = [...allGrants]

    // Filter by keyword
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(keyword) ||
        g.description.toLowerCase().includes(keyword) ||
        g.agency.toLowerCase().includes(keyword) ||
        g.categories.some(c => c.toLowerCase().includes(keyword))
      )
    }

    // Filter by category
    if (params.category) {
      const category = params.category.toLowerCase()
      filtered = filtered.filter(g =>
        g.categories.some(c => c.toLowerCase().includes(category))
      )
    }

    // Filter by applicant type
    if (params.applicantType) {
      const applicantType = params.applicantType.toLowerCase()
      filtered = filtered.filter(g =>
        g.applicantTypes.some(t => t.toLowerCase().includes(applicantType))
      )
    }

    // Filter open only
    if (params.openOnly) {
      const now = new Date()
      filtered = filtered.filter(g => {
        if (g.closeDate && g.closeDate < now) return false
        if (g.isForecasted) return false
        return true
      })
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
  async getCategories(): Promise<string[]> {
    const allGrants = await this.fetchAllGrants()
    const categories = new Set<string>()
    allGrants.forEach(g => {
      g.categories.forEach(c => categories.add(c))
    })
    return Array.from(categories).sort()
  }

  /**
   * Get applicant types
   */
  async getApplicantTypes(): Promise<string[]> {
    const allGrants = await this.fetchAllGrants()
    const types = new Set<string>()
    allGrants.forEach(g => {
      g.applicantTypes.forEach(t => types.add(t))
    })
    return Array.from(types).sort()
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedData = null
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
export const californiaGrantsService = new CaliforniaGrantsService()

/**
 * Convert California grant to our normalized format
 */
export function normalizeCaliforniaGrant(grant: CaliforniaGrant) {
  const formatAmount = (amount: number | null): string | null => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Determine status
  const getStatus = (): 'forecasted' | 'open' | 'closed' => {
    if (grant.isForecasted) return 'forecasted'
    if (grant.closeDate && grant.closeDate < new Date()) return 'closed'
    return 'open'
  }

  return {
    sourceId: grant.id,
    sourceName: 'california-grants',
    title: grant.title,
    sponsor: grant.agency || 'California State Agency',
    summary: grant.description.substring(0, 500),
    description: grant.description,
    categories: grant.categories,
    eligibility: grant.applicantTypes,
    locations: grant.geographicEligibility.length > 0 ? grant.geographicEligibility : ['California'],
    amountMin: grant.awardRange.min,
    amountMax: grant.awardRange.max,
    amountText: grant.awardRange.min && grant.awardRange.max
      ? `${formatAmount(grant.awardRange.min)} - ${formatAmount(grant.awardRange.max)}`
      : formatAmount(grant.estimatedFunding),
    deadlineDate: grant.closeDate,
    deadlineType: grant.closeDate ? 'hard' : undefined,
    openDate: grant.openDate,
    url: grant.url || `https://www.grants.ca.gov/`,
    contact: JSON.stringify(grant.contact),
    requirements: grant.matchingRequired ? ['Matching funds required'] : [],
    status: getStatus(),
    hashFingerprint: `california-${grant.id}`,
    // Additional California-specific fields
    fundingSource: grant.fundingSource,
    matchingRequired: grant.matchingRequired,
  }
}
