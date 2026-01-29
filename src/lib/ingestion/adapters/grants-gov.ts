/**
 * Grants.gov Ingestion Adapter
 * 
 * Fetches federal grant opportunities from the Grants.gov API.
 * Documentation: https://www.grants.gov/web/grants/s2s/applicant/applicant-system-to-system.html
 */

import type { IngestionAdapter, AdapterConfig, RawGrant, NormalizedGrant } from '../types'
import {
  cleanText,
  parseDate,
  parseAmountRange,
  normalizeCategories,
  normalizeEligibility,
  normalizeLocations,
  determineStatus,
  extractRequirements,
} from '../utils/normalize'

export const grantsGovConfig: AdapterConfig = {
  id: 'grants-gov',
  name: 'Grants.gov',
  type: 'federal',
  description: 'Federal grant opportunities from Grants.gov',
  enabled: true,
  schedule: '0 6,18 * * *', // 6 AM and 6 PM UTC
  rateLimit: {
    requests: 100,
    windowMs: 60000, // 100 requests per minute
  },
  retryConfig: {
    maxRetries: 3,
    backoffMs: 5000,
  },
}

// Grants.gov API response types
interface GrantsGovOpportunity {
  opportunityId: string
  opportunityNumber: string
  opportunityTitle: string
  agencyCode: string
  agencyName: string
  synopsis: {
    synopsisDesc: string
    applicantTypes: string[]
    fundingActivityCategories: string[]
    fundingInstruments: string[]
  }
  fundingDetails: {
    estimatedFunding: string
    awardFloor: string
    awardCeiling: string
  }
  closeDate: string
  openDate: string
  archiveDate: string
  postDate: string
  opportunityStatus: string
}

export class GrantsGovAdapter implements IngestionAdapter {
  config = grantsGovConfig
  
  private baseUrl = 'https://api.grants.gov/v1'
  
  async fetch(): Promise<RawGrant[]> {
    const grants: RawGrant[] = []
    let page = 1
    const pageSize = 100
    let hasMore = true
    
    while (hasMore) {
      try {
        // In production, this would make actual API calls
        // For now, return mock data
        const mockOpportunities = this.getMockOpportunities()
        
        for (const opp of mockOpportunities) {
          grants.push({
            sourceId: opp.opportunityId,
            sourceName: 'grants-gov',
            rawData: opp as unknown as Record<string, unknown>,
          })
        }
        
        // Simulate pagination
        hasMore = false
      } catch (error) {
        console.error(`Error fetching page ${page} from Grants.gov:`, error)
        throw error
      }
    }
    
    return grants
  }
  
  normalize(raw: RawGrant): NormalizedGrant {
    const data = raw.rawData as unknown as GrantsGovOpportunity
    
    // Parse funding amounts
    const { min: amountMin, max: amountMax } = parseAmountRange(
      data.fundingDetails?.awardFloor && data.fundingDetails?.awardCeiling
        ? `${data.fundingDetails.awardFloor} - ${data.fundingDetails.awardCeiling}`
        : data.fundingDetails?.estimatedFunding
    )
    
    const closeDate = parseDate(data.closeDate)
    const openDate = parseDate(data.openDate)
    
    return {
      sourceId: raw.sourceId,
      sourceName: raw.sourceName,
      
      title: cleanText(data.opportunityTitle),
      sponsor: cleanText(data.agencyName),
      summary: cleanText(data.synopsis?.synopsisDesc)?.substring(0, 500) || '',
      description: cleanText(data.synopsis?.synopsisDesc),
      
      categories: normalizeCategories(data.synopsis?.fundingActivityCategories),
      eligibility: normalizeEligibility(data.synopsis?.applicantTypes),
      locations: normalizeLocations(null), // Grants.gov is typically national
      
      amountMin,
      amountMax,
      
      deadlineDate: closeDate,
      openDate,
      
      url: `https://www.grants.gov/search-results-detail/${data.opportunityId}`,
      contactEmail: null,
      contactPhone: null,
      contactName: null,
      
      requirements: extractRequirements(data.synopsis?.synopsisDesc),
      
      status: determineStatus(data.opportunityStatus, openDate, closeDate),
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      // In production, make a simple API call to verify connectivity
      return true
    } catch {
      return false
    }
  }
  
  // Mock data for development
  private getMockOpportunities(): GrantsGovOpportunity[] {
    return [
      {
        opportunityId: 'GRANTS-GOV-001',
        opportunityNumber: 'NSF-24-001',
        opportunityTitle: 'Small Business Innovation Research (SBIR) Phase I',
        agencyCode: 'NSF',
        agencyName: 'National Science Foundation',
        synopsis: {
          synopsisDesc: 'The NSF SBIR Phase I program supports early-stage research and development of innovative technologies by small businesses. Awards provide funding for proof-of-concept research.',
          applicantTypes: ['Small Business', 'For-Profit'],
          fundingActivityCategories: ['Science and Technology', 'Research'],
          fundingInstruments: ['Grant'],
        },
        fundingDetails: {
          estimatedFunding: '$50,000,000',
          awardFloor: '$50,000',
          awardCeiling: '$275,000',
        },
        closeDate: '2025-03-15',
        openDate: '2025-01-01',
        archiveDate: '2025-06-15',
        postDate: '2024-12-01',
        opportunityStatus: 'Posted',
      },
      {
        opportunityId: 'GRANTS-GOV-002',
        opportunityNumber: 'HUD-24-002',
        opportunityTitle: 'Community Development Block Grant (CDBG)',
        agencyCode: 'HUD',
        agencyName: 'Department of Housing and Urban Development',
        synopsis: {
          synopsisDesc: 'The CDBG program provides annual grants on a formula basis to entitled cities and counties to develop viable urban communities by providing decent housing and a suitable living environment.',
          applicantTypes: ['State', 'Local Government', 'Tribal'],
          fundingActivityCategories: ['Community Development', 'Housing'],
          fundingInstruments: ['Grant'],
        },
        fundingDetails: {
          estimatedFunding: '$3,000,000,000',
          awardFloor: '$100,000',
          awardCeiling: '$10,000,000',
        },
        closeDate: '2025-04-30',
        openDate: '2025-02-01',
        archiveDate: '2025-07-30',
        postDate: '2025-01-15',
        opportunityStatus: 'Posted',
      },
    ]
  }
}

export const grantsGovAdapter = new GrantsGovAdapter()
