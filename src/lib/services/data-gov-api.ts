/**
 * Data.gov Grants Datasets Service
 *
 * Provides access to federal grants metadata and datasets through the Data.gov CKAN API.
 * Also includes direct access to key grant datasets like Assistance Listings (CFDA).
 *
 * Documentation: https://open.gsa.gov/api/datadotgov/
 *
 * API KEY: Optional (DEMO_KEY available for testing)
 */

// CKAN API Response Types
export interface DataGovSearchResponse {
  help: string
  success: boolean
  result: {
    count: number
    sort: string
    facets: Record<string, unknown>
    results: DataGovDataset[]
    search_facets: Record<string, unknown>
  }
}

export interface DataGovDataset {
  id: string
  name: string
  title: string
  author: string | null
  author_email: string | null
  maintainer: string | null
  maintainer_email: string | null
  license_title: string
  license_id: string
  notes: string
  url: string
  state: string
  private: boolean
  revision_timestamp: string
  metadata_created: string
  metadata_modified: string
  creator_user_id: string
  type: string
  resources: DataGovResource[]
  num_resources: number
  tags: Array<{ name: string; display_name: string }>
  groups: Array<{ name: string; display_name: string }>
  organization: {
    id: string
    name: string
    title: string
    description: string
  }
  extras: Array<{ key: string; value: string }>
}

export interface DataGovResource {
  id: string
  package_id: string
  url: string
  format: string
  description: string
  name: string
  resource_type: string | null
  mimetype: string | null
  size: number | null
  created: string
  last_modified: string | null
}

// Assistance Listing (CFDA) types
export interface AssistanceListing {
  programNumber: string
  programTitle: string
  popularName: string
  federalAgency: string
  authorization: string
  objectives: string
  typesOfAssistance: string
  usesAndUseRestrictions: string
  applicantEligibility: string
  beneficiaryEligibility: string
  credentialsDocumentation: string
  preapplicationCoordination: string
  applicationProcedures: string
  awardProcedure: string
  deadlines: string
  rangeOfApproval: string
  appeals: string
  renewals: string
  formulaAndMatchingRequirements: string
  lengthAndTimePhasing: string
  reports: string
  audits: string
  records: string
  accountIdentification: string
  obligations: string
  rangeAndAverageOfFinancialAssistance: string
  programAccomplishments: string
  regulationsGuidelinesLiterature: string
  regionalOrLocalOffice: string
  headquartersOffice: string
  websiteAddress: string
  relatedPrograms: string
  examplesOfFundedProjects: string
  criteriaForSelectingProposals: string
  publishedDate: string
  parentShortname: string
  recovery: string
  samUrl: string
}

// Search parameters
export interface DataGovSearchParams {
  query?: string
  tags?: string[]
  organization?: string
  groups?: string[]
  format?: string
  limit?: number
  offset?: number
  sort?: string
}

// Data.gov API Client
export class DataGovApiClient {
  private baseUrl = 'https://api.gsa.gov/technology/datagov/v3/action'
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DATA_GOV_API_KEY || 'DEMO_KEY'
  }

  /**
   * Search for datasets
   */
  async searchDatasets(params: DataGovSearchParams = {}): Promise<DataGovSearchResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('api_key', this.apiKey)

    // Build search query
    const searchTerms: string[] = []
    if (params.query) {
      searchTerms.push(params.query)
    }
    if (params.tags && params.tags.length > 0) {
      searchTerms.push(...params.tags.map(t => `tags:${t}`))
    }
    if (params.organization) {
      searchTerms.push(`organization:${params.organization}`)
    }
    if (params.groups && params.groups.length > 0) {
      searchTerms.push(...params.groups.map(g => `groups:${g}`))
    }

    if (searchTerms.length > 0) {
      queryParams.set('q', searchTerms.join(' '))
    }

    if (params.format) {
      queryParams.set('fq', `res_format:${params.format}`)
    }

    queryParams.set('rows', String(Math.min(params.limit || 25, 100)))
    queryParams.set('start', String(params.offset || 0))

    if (params.sort) {
      queryParams.set('sort', params.sort)
    }

    const response = await fetch(`${this.baseUrl}/package_search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Data.gov API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Search specifically for grants-related datasets
   */
  async searchGrantsDatasets(
    keyword?: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<DataGovSearchResponse> {
    return this.searchDatasets({
      query: keyword,
      tags: ['grants'],
      limit: options.limit,
      offset: options.offset,
      sort: 'metadata_modified desc',
    })
  }

  /**
   * Get dataset details by ID
   */
  async getDataset(datasetId: string): Promise<DataGovDataset> {
    const queryParams = new URLSearchParams()
    queryParams.set('api_key', this.apiKey)
    queryParams.set('id', datasetId)

    const response = await fetch(`${this.baseUrl}/package_show?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Data.gov API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.result
  }

  /**
   * Fetch Assistance Listings (CFDA) data directly
   */
  async fetchAssistanceListings(): Promise<AssistanceListing[]> {
    const csvUrl = 'https://sam.gov/api/prod/fileextractservices/v2/api/download?fileName=Assistance%20Listings%20Public%20Extract%20V2.csv&fileType=Assistance%20Listings%20Public%20Extract%20V2&mode=api'

    try {
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch Assistance Listings: ${response.status}`)
      }

      const csvText = await response.text()

      // Parse CSV - this is a simplified parser, in production use papaparse
      const lines = csvText.split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

      const listings: AssistanceListing[] = []
      for (let i = 1; i < Math.min(lines.length, 1000); i++) {
        if (!lines[i].trim()) continue

        const values = this.parseCSVLine(lines[i])
        const listing: Record<string, string> = {}

        headers.forEach((header, idx) => {
          listing[header] = values[idx] || ''
        })

        listings.push(listing as unknown as AssistanceListing)
      }

      return listings
    } catch {
      // Fallback to Data.gov metadata
      return []
    }
  }

  /**
   * Simple CSV line parser
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    values.push(current.trim())
    return values
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.searchDatasets({ limit: 1 })
      return response.success === true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const dataGovApi = new DataGovApiClient()

/**
 * Convert Data.gov dataset to our normalized format
 * Note: Data.gov contains metadata about grants datasets, not individual grants
 */
export function normalizeDataGovDataset(dataset: DataGovDataset) {
  // Find download URLs by format
  const getResourceUrl = (format: string): string | null => {
    const resource = dataset.resources.find(r =>
      r.format?.toLowerCase() === format.toLowerCase()
    )
    return resource?.url || null
  }

  // Get formats available
  const formats = [...new Set(dataset.resources.map(r => r.format).filter(Boolean))]

  // Get tags
  const categories = dataset.tags?.map(t => t.display_name) || []

  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null
    try {
      return new Date(dateStr)
    } catch {
      return null
    }
  }

  return {
    sourceId: dataset.id,
    sourceName: 'data-gov',
    title: dataset.title,
    sponsor: dataset.organization?.title || 'Federal Government',
    summary: dataset.notes?.substring(0, 500) || '',
    description: dataset.notes || null,
    categories,
    eligibility: [],
    locations: ['National'],
    amountMin: null,
    amountMax: null,
    amountText: null,
    deadlineDate: null,
    deadlineType: undefined,
    openDate: parseDate(dataset.metadata_created),
    url: dataset.url || `https://catalog.data.gov/dataset/${dataset.name}`,
    contact: dataset.maintainer_email || dataset.author_email || null,
    requirements: [],
    status: 'open' as const,
    hashFingerprint: `data-gov-${dataset.id}`,
    // Additional Data.gov specific fields
    formats,
    resourceCount: dataset.num_resources,
    csvUrl: getResourceUrl('CSV'),
    jsonUrl: getResourceUrl('JSON'),
    apiUrl: getResourceUrl('API'),
    lastModified: dataset.metadata_modified,
  }
}
