/**
 * Grant Normalization Utilities
 * 
 * Converts raw grant data from various sources into our standardized format.
 * Handles text cleaning, date parsing, and field mapping.
 */

import { GRANT_CATEGORIES, ELIGIBILITY_TYPES, US_STATES } from '@/lib/utils'

/**
 * Clean and normalize text content
 */
export function cleanText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Parse date from various formats
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  
  const cleaned = dateStr.trim()
  
  // Try ISO format first
  const isoDate = new Date(cleaned)
  if (!isNaN(isoDate.getTime())) return isoDate
  
  // Try MM/DD/YYYY
  const mdyMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  // Try YYYY-MM-DD
  const ymdMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  // Try Month DD, YYYY
  const textMatch = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/)
  if (textMatch) {
    const [, monthName, day, year] = textMatch
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth()
    if (!isNaN(monthIndex)) {
      return new Date(parseInt(year), monthIndex, parseInt(day))
    }
  }
  
  return null
}

/**
 * Parse amount from various formats
 */
export function parseAmount(amountStr: string | number | null | undefined): number | null {
  if (amountStr === null || amountStr === undefined) return null
  
  if (typeof amountStr === 'number') {
    return isNaN(amountStr) ? null : amountStr
  }
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr.replace(/[$,\s]/g, '')
  
  // Handle "K" and "M" suffixes
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)[Kk]$/)
  if (kMatch) return parseFloat(kMatch[1]) * 1000
  
  const mMatch = cleaned.match(/^(\d+(?:\.\d+)?)[Mm]$/)
  if (mMatch) return parseFloat(mMatch[1]) * 1000000
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Extract amount range from text
 */
export function parseAmountRange(text: string | null | undefined): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null }
  
  // Look for range patterns like "$10,000 - $50,000" or "$10K to $50K"
  const rangeMatch = text.match(/\$?([\d,]+(?:\.\d+)?[KkMm]?)\s*(?:-|to|–)\s*\$?([\d,]+(?:\.\d+)?[KkMm]?)/i)
  if (rangeMatch) {
    return {
      min: parseAmount(rangeMatch[1]),
      max: parseAmount(rangeMatch[2]),
    }
  }
  
  // Look for "up to" patterns
  const upToMatch = text.match(/up\s+to\s+\$?([\d,]+(?:\.\d+)?[KkMm]?)/i)
  if (upToMatch) {
    return { min: null, max: parseAmount(upToMatch[1]) }
  }
  
  // Look for "minimum" patterns
  const minMatch = text.match(/(?:minimum|at\s+least)\s+\$?([\d,]+(?:\.\d+)?[KkMm]?)/i)
  if (minMatch) {
    return { min: parseAmount(minMatch[1]), max: null }
  }
  
  // Single amount
  const singleMatch = text.match(/\$?([\d,]+(?:\.\d+)?[KkMm]?)/)
  if (singleMatch) {
    const amount = parseAmount(singleMatch[1])
    return { min: amount, max: amount }
  }
  
  return { min: null, max: null }
}

/**
 * Map raw categories to our standardized category list
 */
export function normalizeCategories(raw: string | string[] | null | undefined): string[] {
  if (!raw) return []
  
  const rawArray = Array.isArray(raw) ? raw : [raw]
  const normalized: string[] = []
  
  const categoryKeywords: Record<string, string[]> = {
    'Agriculture': ['agriculture', 'farm', 'rural', 'usda', 'crop', 'livestock'],
    'Arts & Culture': ['arts', 'culture', 'museum', 'heritage', 'humanities', 'creative'],
    'Community Development': ['community', 'neighborhood', 'civic', 'local', 'municipal'],
    'Economic Development': ['economic', 'business', 'commerce', 'trade', 'workforce'],
    'Education': ['education', 'school', 'student', 'learning', 'academic', 'university'],
    'Energy': ['energy', 'renewable', 'solar', 'wind', 'efficiency', 'power'],
    'Environment': ['environment', 'conservation', 'climate', 'sustainability', 'epa'],
    'Health': ['health', 'medical', 'healthcare', 'disease', 'nih', 'cdc'],
    'Housing': ['housing', 'home', 'shelter', 'hud', 'residential'],
    'Infrastructure': ['infrastructure', 'transportation', 'roads', 'bridges', 'transit'],
    'Research': ['research', 'science', 'nsf', 'laboratory', 'study'],
    'Social Services': ['social', 'welfare', 'assistance', 'human services'],
    'Technology': ['technology', 'tech', 'digital', 'cyber', 'innovation', 'sbir'],
    'Disaster Relief': ['disaster', 'emergency', 'fema', 'recovery', 'resilience'],
    'Other': [],
  }
  
  for (const rawCat of rawArray) {
    const lower = rawCat.toLowerCase()
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        if (!normalized.includes(category)) {
          normalized.push(category)
        }
        break
      }
    }
  }
  
  return normalized.length > 0 ? normalized : ['Other']
}

/**
 * Map raw eligibility types to our standardized list
 */
export function normalizeEligibility(raw: string | string[] | null | undefined): string[] {
  if (!raw) return []
  
  const rawArray = Array.isArray(raw) ? raw : [raw]
  const normalized: string[] = []
  
  const eligibilityKeywords: Record<string, string[]> = {
    'Nonprofit': ['nonprofit', 'non-profit', '501(c)', 'charity', 'ngo'],
    'Small Business': ['small business', 'sbir', 'sttr', 'sba', 'entrepreneur'],
    'Individual': ['individual', 'person', 'citizen', 'researcher'],
    'Government': ['government', 'municipal', 'state agency', 'local government', 'tribal'],
    'Educational': ['education', 'university', 'college', 'school', 'academic', 'institution'],
    'For-Profit': ['for-profit', 'business', 'corporation', 'company'],
    'Tribal': ['tribal', 'tribe', 'native', 'indigenous'],
    'Healthcare': ['healthcare', 'hospital', 'clinic', 'medical'],
    'Research': ['research', 'laboratory', 'institute', 'r&d'],
  }
  
  for (const rawElig of rawArray) {
    const lower = rawElig.toLowerCase()
    for (const [elig, keywords] of Object.entries(eligibilityKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        if (!normalized.includes(elig)) {
          normalized.push(elig)
        }
      }
    }
  }
  
  return normalized
}

/**
 * Extract US states from location text
 */
export function normalizeLocations(raw: string | string[] | null | undefined): string[] {
  if (!raw) return ['National']
  
  const rawArray = Array.isArray(raw) ? raw : [raw]
  const locations: string[] = []
  
  const text = rawArray.join(' ').toLowerCase()
  
  // Check for national scope
  if (text.includes('national') || text.includes('all states') || text.includes('nationwide')) {
    return ['National']
  }
  
  // Extract state names and abbreviations
  for (const state of US_STATES) {
    if (text.includes(state.name.toLowerCase()) ||
        text.includes(state.code.toLowerCase())) {
      if (!locations.includes(state.name)) {
        locations.push(state.name)
      }
    }
  }
  
  return locations.length > 0 ? locations : ['National']
}

/**
 * Determine grant status from dates and raw status
 */
export function determineStatus(
  rawStatus: string | null | undefined,
  openDate: Date | null,
  closeDate: Date | null
): 'forecasted' | 'open' | 'closed' {
  const now = new Date()
  
  // Check raw status first
  if (rawStatus) {
    const lower = rawStatus.toLowerCase()
    if (lower.includes('closed') || lower.includes('expired') || lower.includes('archived')) {
      return 'closed'
    }
    if (lower.includes('forecast') || lower.includes('upcoming') || lower.includes('anticipated')) {
      return 'forecasted'
    }
  }
  
  // Check dates
  if (closeDate && closeDate < now) return 'closed'
  if (openDate && openDate > now) return 'forecasted'
  
  return 'open'
}

/**
 * Extract requirements from description text
 */
export function extractRequirements(text: string | null | undefined): string[] {
  if (!text) return []
  
  const requirements: string[] = []
  
  // Look for bullet points or numbered lists
  const listItems = text.match(/(?:•|·|‣|\*|-|\d+\.)\s*([^\n•·‣*\-]+)/g)
  if (listItems) {
    for (const item of listItems) {
      const cleaned = cleanText(item.replace(/^(?:•|·|‣|\*|-|\d+\.)\s*/, ''))
      if (cleaned.length > 10 && cleaned.length < 200) {
        requirements.push(cleaned)
      }
    }
  }
  
  return requirements.slice(0, 10) // Limit to 10 requirements
}
