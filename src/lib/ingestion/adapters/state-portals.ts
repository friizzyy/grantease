/**
 * State Portal Adapters
 * 
 * Framework for ingesting grants from state-level portals.
 * Each state may have different data formats and APIs.
 */

import type { IngestionAdapter, AdapterConfig, RawGrant, NormalizedGrant } from '../types'
import {
  cleanText,
  parseDate,
  parseAmountRange,
  normalizeCategories,
  normalizeEligibility,
  determineStatus,
  extractRequirements,
} from '../utils/normalize'

// California Grants Portal Adapter
export const californiaConfig: AdapterConfig = {
  id: 'ca-grants-portal',
  name: 'California Grants Portal',
  type: 'state',
  description: 'Grant opportunities from the State of California',
  enabled: true,
  schedule: '0 8 * * *', // 8 AM UTC daily
  rateLimit: {
    requests: 60,
    windowMs: 60000,
  },
  retryConfig: {
    maxRetries: 3,
    backoffMs: 5000,
  },
}

interface CaliforniaGrant {
  grantId: string
  title: string
  grantorName: string
  description: string
  category: string
  eligibility: string[]
  fundingAmount: string
  applicationDeadline: string
  applicationOpen: string
  status: string
  url: string
  contactEmail: string
}

export class CaliforniaGrantsAdapter implements IngestionAdapter {
  config = californiaConfig
  
  private baseUrl = 'https://www.grants.ca.gov/api'
  
  async fetch(): Promise<RawGrant[]> {
    const grants: RawGrant[] = []
    
    try {
      const mockGrants = this.getMockGrants()
      
      for (const grant of mockGrants) {
        grants.push({
          sourceId: grant.grantId,
          sourceName: 'ca-grants-portal',
          rawData: grant as unknown as Record<string, unknown>,
        })
      }
    } catch (error) {
      console.error('Error fetching from California Grants Portal:', error)
      throw error
    }
    
    return grants
  }
  
  normalize(raw: RawGrant): NormalizedGrant {
    const data = raw.rawData as unknown as CaliforniaGrant
    
    const { min: amountMin, max: amountMax } = parseAmountRange(data.fundingAmount)
    const deadlineDate = parseDate(data.applicationDeadline)
    const openDate = parseDate(data.applicationOpen)
    
    return {
      sourceId: raw.sourceId,
      sourceName: raw.sourceName,
      
      title: cleanText(data.title),
      sponsor: cleanText(data.grantorName),
      summary: cleanText(data.description)?.substring(0, 500) || '',
      description: cleanText(data.description),
      
      categories: normalizeCategories(data.category),
      eligibility: normalizeEligibility(data.eligibility),
      locations: ['California'],
      
      amountMin,
      amountMax,
      
      deadlineDate,
      openDate,
      
      url: data.url,
      contactEmail: data.contactEmail,
      contactPhone: null,
      contactName: null,
      
      requirements: extractRequirements(data.description),
      
      status: determineStatus(data.status, openDate, deadlineDate),
    }
  }
  
  async testConnection(): Promise<boolean> {
    return true
  }
  
  private getMockGrants(): CaliforniaGrant[] {
    return [
      {
        grantId: 'CA-2024-001',
        title: 'California Climate Action Grants',
        grantorName: 'California Air Resources Board',
        description: 'Funding for local governments and community organizations to implement climate action projects that reduce greenhouse gas emissions and improve air quality in disadvantaged communities.',
        category: 'Environment',
        eligibility: ['Local Government', 'Nonprofit', 'Tribal'],
        fundingAmount: '$100,000 - $2,000,000',
        applicationDeadline: '2025-05-15',
        applicationOpen: '2025-02-01',
        status: 'Open',
        url: 'https://ww2.arb.ca.gov/climate-action-grants',
        contactEmail: 'climategrants@arb.ca.gov',
      },
      {
        grantId: 'CA-2024-002',
        title: 'California Arts Council Grants',
        grantorName: 'California Arts Council',
        description: 'Supporting arts organizations and individual artists to advance California\'s creative workforce, strengthen communities through arts, and increase arts access statewide.',
        category: 'Arts & Culture',
        eligibility: ['Nonprofit', 'Individual'],
        fundingAmount: '$5,000 - $150,000',
        applicationDeadline: '2025-03-30',
        applicationOpen: '2025-01-15',
        status: 'Open',
        url: 'https://arts.ca.gov/grants/',
        contactEmail: 'grants@arts.ca.gov',
      },
    ]
  }
}

// New York Grants Portal Adapter
export const newYorkConfig: AdapterConfig = {
  id: 'ny-grants-portal',
  name: 'New York Grants Gateway',
  type: 'state',
  description: 'Grant opportunities from New York State',
  enabled: true,
  schedule: '0 9 * * *',
  rateLimit: {
    requests: 60,
    windowMs: 60000,
  },
}

interface NewYorkGrant {
  grantId: string
  opportunityName: string
  fundingAgency: string
  programDescription: string
  fundingCategory: string
  eligibleApplicants: string[]
  awardRange: string
  deadline: string
  postedDate: string
  grantStatus: string
  applicationUrl: string
}

export class NewYorkGrantsAdapter implements IngestionAdapter {
  config = newYorkConfig
  
  async fetch(): Promise<RawGrant[]> {
    const grants: RawGrant[] = []
    
    try {
      const mockGrants = this.getMockGrants()
      
      for (const grant of mockGrants) {
        grants.push({
          sourceId: grant.grantId,
          sourceName: 'ny-grants-portal',
          rawData: grant as unknown as Record<string, unknown>,
        })
      }
    } catch (error) {
      console.error('Error fetching from NY Grants Gateway:', error)
      throw error
    }
    
    return grants
  }
  
  normalize(raw: RawGrant): NormalizedGrant {
    const data = raw.rawData as unknown as NewYorkGrant
    
    const { min: amountMin, max: amountMax } = parseAmountRange(data.awardRange)
    const deadlineDate = parseDate(data.deadline)
    const openDate = parseDate(data.postedDate)
    
    return {
      sourceId: raw.sourceId,
      sourceName: raw.sourceName,
      
      title: cleanText(data.opportunityName),
      sponsor: cleanText(data.fundingAgency),
      summary: cleanText(data.programDescription)?.substring(0, 500) || '',
      description: cleanText(data.programDescription),
      
      categories: normalizeCategories(data.fundingCategory),
      eligibility: normalizeEligibility(data.eligibleApplicants),
      locations: ['New York'],
      
      amountMin,
      amountMax,
      
      deadlineDate,
      openDate,
      
      url: data.applicationUrl,
      contactEmail: null,
      contactPhone: null,
      contactName: null,
      
      requirements: extractRequirements(data.programDescription),
      
      status: determineStatus(data.grantStatus, openDate, deadlineDate),
    }
  }
  
  async testConnection(): Promise<boolean> {
    return true
  }
  
  private getMockGrants(): NewYorkGrant[] {
    return [
      {
        grantId: 'NY-2024-001',
        opportunityName: 'Empire State Development Grants',
        fundingAgency: 'Empire State Development',
        programDescription: 'Supporting economic development projects across New York State, including business expansion, workforce development, and community revitalization initiatives.',
        fundingCategory: 'Economic Development',
        eligibleApplicants: ['Small Business', 'Nonprofit', 'Local Government'],
        awardRange: '$50,000 - $500,000',
        deadline: '2025-04-15',
        postedDate: '2025-01-01',
        grantStatus: 'Open',
        applicationUrl: 'https://esd.ny.gov/grants',
      },
    ]
  }
}

export const californiaAdapter = new CaliforniaGrantsAdapter()
export const newYorkAdapter = new NewYorkGrantsAdapter()
