/**
 * SAM.gov Assistance Listings Adapter
 * 
 * Fetches federal assistance programs from SAM.gov (formerly CFDA).
 * Documentation: https://sam.gov/content/assistance-listings
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

export const samGovConfig: AdapterConfig = {
  id: 'sam-gov',
  name: 'SAM.gov',
  type: 'federal',
  description: 'Federal assistance listings from SAM.gov',
  enabled: true,
  schedule: '0 7 * * *', // 7 AM UTC daily
  rateLimit: {
    requests: 1000,
    windowMs: 3600000, // 1000 requests per hour
  },
  retryConfig: {
    maxRetries: 3,
    backoffMs: 10000,
  },
}

// SAM.gov API response types
interface SamGovListing {
  cfda: string
  title: string
  agency: string
  subAgency: string
  objectives: string
  applicantEligibility: string
  beneficiaryEligibility: string
  awardRange: string
  programDeadlines: string
  webLink: string
  published: string
  archived: string
  status: string
  categories: string[]
}

export class SamGovAdapter implements IngestionAdapter {
  config = samGovConfig
  
  private baseUrl = 'https://api.sam.gov/opportunities/v1'
  
  async fetch(): Promise<RawGrant[]> {
    const grants: RawGrant[] = []
    
    try {
      // In production, this would make actual API calls
      const mockListings = this.getMockListings()
      
      for (const listing of mockListings) {
        grants.push({
          sourceId: listing.cfda,
          sourceName: 'sam-gov',
          rawData: listing as unknown as Record<string, unknown>,
        })
      }
    } catch (error) {
      console.error('Error fetching from SAM.gov:', error)
      throw error
    }
    
    return grants
  }
  
  normalize(raw: RawGrant): NormalizedGrant {
    const data = raw.rawData as unknown as SamGovListing
    
    const { min: amountMin, max: amountMax } = parseAmountRange(data.awardRange)
    const deadlineDate = parseDate(data.programDeadlines)
    const openDate = parseDate(data.published)
    
    return {
      sourceId: raw.sourceId,
      sourceName: raw.sourceName,
      
      title: cleanText(data.title),
      sponsor: cleanText(`${data.agency}${data.subAgency ? ` - ${data.subAgency}` : ''}`),
      summary: cleanText(data.objectives)?.substring(0, 500) || '',
      description: cleanText(data.objectives),
      
      categories: normalizeCategories(data.categories),
      eligibility: normalizeEligibility([data.applicantEligibility, data.beneficiaryEligibility]),
      locations: normalizeLocations(null),
      
      amountMin,
      amountMax,
      
      deadlineDate,
      openDate,
      
      url: data.webLink || `https://sam.gov/fal/${data.cfda}`,
      contactEmail: null,
      contactPhone: null,
      contactName: null,
      
      requirements: extractRequirements(data.applicantEligibility),
      
      status: determineStatus(data.status, openDate, deadlineDate),
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      return true
    } catch {
      return false
    }
  }
  
  private getMockListings(): SamGovListing[] {
    return [
      {
        cfda: '10.500',
        title: 'Cooperative Extension Service',
        agency: 'Department of Agriculture',
        subAgency: 'National Institute of Food and Agriculture',
        objectives: 'To provide educational programs on agriculture, natural resources, home economics, community development, and related subjects to rural and urban residents.',
        applicantEligibility: 'Land-grant colleges and universities',
        beneficiaryEligibility: 'Anyone',
        awardRange: '$1,000,000 - $50,000,000',
        programDeadlines: 'Varies by program',
        webLink: 'https://nifa.usda.gov/extension',
        published: '2024-01-01',
        archived: '',
        status: 'Active',
        categories: ['Agriculture', 'Education'],
      },
      {
        cfda: '93.778',
        title: 'Medical Assistance Program',
        agency: 'Department of Health and Human Services',
        subAgency: 'Centers for Medicare & Medicaid Services',
        objectives: 'To provide financial assistance to States for payments of medical assistance on behalf of cash assistance recipients, children, pregnant women, and the aged who meet income and resource requirements.',
        applicantEligibility: 'State and local governments',
        beneficiaryEligibility: 'Low-income individuals and families',
        awardRange: '$100,000,000 - $5,000,000,000',
        programDeadlines: 'Open enrollment',
        webLink: 'https://www.medicaid.gov',
        published: '2024-01-01',
        archived: '',
        status: 'Active',
        categories: ['Health', 'Social Services'],
      },
    ]
  }
}

export const samGovAdapter = new SamGovAdapter()
