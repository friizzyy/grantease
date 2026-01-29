/**
 * Foundation and Nonprofit Feed Adapters
 * 
 * Plugin system for ingesting grants from foundation and nonprofit sources
 * via RSS, Atom, or JSON feeds.
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

// Ford Foundation Adapter
export const fordFoundationConfig: AdapterConfig = {
  id: 'ford-foundation',
  name: 'Ford Foundation',
  type: 'foundation',
  description: 'Grant opportunities from the Ford Foundation',
  enabled: true,
  schedule: '0 10 * * 1', // 10 AM UTC every Monday
  rateLimit: {
    requests: 10,
    windowMs: 60000,
  },
}

interface FordFoundationGrant {
  id: string
  title: string
  description: string
  program: string
  focus: string[]
  region: string[]
  amount: string
  deadline: string
  publishedDate: string
  link: string
  status: string
}

export class FordFoundationAdapter implements IngestionAdapter {
  config = fordFoundationConfig
  
  async fetch(): Promise<RawGrant[]> {
    const grants: RawGrant[] = []
    
    try {
      // In production, this would fetch from their RSS/JSON feed
      const mockGrants = this.getMockGrants()
      
      for (const grant of mockGrants) {
        grants.push({
          sourceId: grant.id,
          sourceName: 'ford-foundation',
          rawData: grant as unknown as Record<string, unknown>,
        })
      }
    } catch (error) {
      console.error('Error fetching from Ford Foundation:', error)
      throw error
    }
    
    return grants
  }
  
  normalize(raw: RawGrant): NormalizedGrant {
    const data = raw.rawData as unknown as FordFoundationGrant
    
    const { min: amountMin, max: amountMax } = parseAmountRange(data.amount)
    const deadlineDate = parseDate(data.deadline)
    const openDate = parseDate(data.publishedDate)
    
    return {
      sourceId: raw.sourceId,
      sourceName: raw.sourceName,
      
      title: cleanText(data.title),
      sponsor: 'Ford Foundation',
      summary: cleanText(data.description)?.substring(0, 500) || '',
      description: cleanText(data.description),
      
      categories: normalizeCategories([data.program, ...data.focus]),
      eligibility: normalizeEligibility(['Nonprofit', 'Individual']),
      locations: normalizeLocations(data.region),
      
      amountMin,
      amountMax,
      
      deadlineDate,
      openDate,
      
      url: data.link,
      contactEmail: 'grants@fordfoundation.org',
      contactPhone: null,
      contactName: null,
      
      requirements: extractRequirements(data.description),
      
      status: determineStatus(data.status, openDate, deadlineDate),
    }
  }
  
  async testConnection(): Promise<boolean> {
    return true
  }
  
  private getMockGrants(): FordFoundationGrant[] {
    return [
      {
        id: 'FF-2024-001',
        title: 'Civic Engagement and Government',
        description: 'Supporting organizations working to strengthen democracy, civic participation, and accountable governance. Focus on increasing voter access, electoral reform, and government transparency.',
        program: 'Civic Engagement',
        focus: ['Democracy', 'Government Transparency', 'Voter Access'],
        region: ['National', 'United States'],
        amount: '$100,000 - $500,000',
        deadline: '2025-06-30',
        publishedDate: '2025-01-01',
        link: 'https://www.fordfoundation.org/work/our-grants/civic-engagement/',
        status: 'Open',
      },
      {
        id: 'FF-2024-002',
        title: 'Creativity and Free Expression',
        description: 'Supporting artists, creators, and cultural organizations that explore social issues and promote diverse perspectives through creative work.',
        program: 'Arts & Culture',
        focus: ['Arts', 'Culture', 'Free Expression'],
        region: ['National'],
        amount: '$25,000 - $250,000',
        deadline: '2025-04-15',
        publishedDate: '2025-01-15',
        link: 'https://www.fordfoundation.org/work/our-grants/creativity/',
        status: 'Open',
      },
    ]
  }
}

// Gates Foundation Adapter
export const gatesFoundationConfig: AdapterConfig = {
  id: 'gates-foundation',
  name: 'Bill & Melinda Gates Foundation',
  type: 'foundation',
  description: 'Grant opportunities from the Gates Foundation',
  enabled: true,
  schedule: '0 10 * * 1',
  rateLimit: {
    requests: 10,
    windowMs: 60000,
  },
}

interface GatesFoundationGrant {
  grantId: string
  programTitle: string
  overview: string
  strategicFocus: string
  targetAreas: string[]
  geographicFocus: string[]
  fundingRange: string
  closingDate: string
  openingDate: string
  applicationUrl: string
  grantStatus: string
}

export class GatesFoundationAdapter implements IngestionAdapter {
  config = gatesFoundationConfig
  
  async fetch(): Promise<RawGrant[]> {
    const grants: RawGrant[] = []
    
    try {
      const mockGrants = this.getMockGrants()
      
      for (const grant of mockGrants) {
        grants.push({
          sourceId: grant.grantId,
          sourceName: 'gates-foundation',
          rawData: grant as unknown as Record<string, unknown>,
        })
      }
    } catch (error) {
      console.error('Error fetching from Gates Foundation:', error)
      throw error
    }
    
    return grants
  }
  
  normalize(raw: RawGrant): NormalizedGrant {
    const data = raw.rawData as unknown as GatesFoundationGrant
    
    const { min: amountMin, max: amountMax } = parseAmountRange(data.fundingRange)
    const deadlineDate = parseDate(data.closingDate)
    const openDate = parseDate(data.openingDate)
    
    return {
      sourceId: raw.sourceId,
      sourceName: raw.sourceName,
      
      title: cleanText(data.programTitle),
      sponsor: 'Bill & Melinda Gates Foundation',
      summary: cleanText(data.overview)?.substring(0, 500) || '',
      description: cleanText(data.overview),
      
      categories: normalizeCategories([data.strategicFocus, ...data.targetAreas]),
      eligibility: normalizeEligibility(['Nonprofit', 'Research', 'Educational']),
      locations: normalizeLocations(data.geographicFocus),
      
      amountMin,
      amountMax,
      
      deadlineDate,
      openDate,
      
      url: data.applicationUrl,
      contactEmail: null,
      contactPhone: null,
      contactName: null,
      
      requirements: extractRequirements(data.overview),
      
      status: determineStatus(data.grantStatus, openDate, deadlineDate),
    }
  }
  
  async testConnection(): Promise<boolean> {
    return true
  }
  
  private getMockGrants(): GatesFoundationGrant[] {
    return [
      {
        grantId: 'BMGF-2024-001',
        programTitle: 'Global Health Discovery',
        overview: 'Supporting innovative research to develop new tools, technologies, and interventions for diseases that disproportionately affect people in low-income countries.',
        strategicFocus: 'Global Health',
        targetAreas: ['Infectious Disease', 'Vaccine Development', 'Health Technology'],
        geographicFocus: ['Global', 'Africa', 'South Asia'],
        fundingRange: '$100,000 - $2,000,000',
        closingDate: '2025-05-31',
        openingDate: '2025-02-01',
        applicationUrl: 'https://www.gatesfoundation.org/about/how-we-work/grants',
        grantStatus: 'Open',
      },
    ]
  }
}

/**
 * Generic RSS/Atom Feed Adapter Factory
 * Creates adapters for foundation feeds that follow standard formats
 */
export function createFeedAdapter(config: AdapterConfig & {
  feedUrl: string
  feedType: 'rss' | 'atom' | 'json'
  fieldMapping: Record<string, string>
}): IngestionAdapter {
  return {
    config,
    
    async fetch(): Promise<RawGrant[]> {
      // In production, this would:
      // 1. Fetch the feed from config.feedUrl
      // 2. Parse based on config.feedType
      // 3. Extract fields using config.fieldMapping
      console.log(`Would fetch from ${config.feedUrl} (${config.feedType})`)
      return []
    },
    
    normalize(raw: RawGrant): NormalizedGrant {
      const data = raw.rawData as Record<string, unknown>
      
      return {
        sourceId: raw.sourceId,
        sourceName: raw.sourceName,
        title: cleanText(data.title as string),
        sponsor: config.name,
        summary: cleanText(data.description as string)?.substring(0, 500) || '',
        description: cleanText(data.description as string),
        categories: [],
        eligibility: [],
        locations: ['National'],
        amountMin: null,
        amountMax: null,
        deadlineDate: parseDate(data.deadline as string),
        openDate: null,
        url: data.link as string,
        contactEmail: null,
        contactPhone: null,
        contactName: null,
        requirements: [],
        status: 'open',
      }
    },
    
    async testConnection(): Promise<boolean> {
      return true
    },
  }
}

export const fordFoundationAdapter = new FordFoundationAdapter()
export const gatesFoundationAdapter = new GatesFoundationAdapter()
