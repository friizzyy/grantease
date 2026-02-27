/**
 * GEMINI GRANT DISCOVERY SERVICE
 * ------------------------------
 * Uses Gemini's Google Search grounding to find grants in real-time.
 * This finds grants that aren't in federal databases:
 * - State and local grants
 * - Foundation grants
 * - Corporate giving programs
 * - Industry-specific opportunities
 * - Recently announced grants
 */

import { getAIClient, extractUsageFromResponse, isGeminiConfigured, GEMINI_MODEL, type GeminiUsage } from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Result from grant discovery including token usage
 */
export interface GrantDiscoveryResult {
  grants: DiscoveredGrant[]
  usage: GeminiUsage
}

/**
 * Discovered grant from web search
 */
export interface DiscoveredGrant {
  title: string
  sponsor: string
  description: string
  url: string
  amountRange?: string
  deadline?: string
  eligibility?: string[]
  categories?: string[]
  source: string
  confidence: number
  relevanceScore: number
  discoveredAt: string
}

/**
 * Search parameters for grant discovery
 */
export interface GrantDiscoveryParams {
  industryTags: string[]
  entityType: string
  state?: string
  searchFocus?: 'new_grants' | 'local_grants' | 'foundation_grants' | 'all'
  specificNeeds?: string[]
  excludeKeywords?: string[]
}

/** Get the current year dynamically */
function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Build search queries based on user profile
 */
function buildSearchQueries(params: GrantDiscoveryParams): string[] {
  const queries: string[] = []
  const { industryTags, entityType, state, searchFocus, specificNeeds } = params
  const year = getCurrentYear()

  const entityTerms: Record<string, string[]> = {
    'small_business': ['small business grants', 'entrepreneur grants', 'business funding'],
    'nonprofit': ['nonprofit grants', '501c3 grants', 'charitable funding'],
    'individual': ['individual grants', 'personal grants', 'artist grants'],
    'for_profit': ['business grants', 'corporate grants'],
    'educational': ['education grants', 'school funding'],
    'government': ['government grants', 'municipal funding'],
    'tribal': ['tribal grants', 'native american grants'],
  }

  const industryTerms: Record<string, string[]> = {
    'agriculture': ['farm grants', 'agricultural grants', 'USDA grants', 'rural development grants', 'farmer assistance'],
    'arts_culture': ['arts grants', 'cultural grants', 'NEA grants', 'artist funding'],
    'business': ['small business grants', 'SBA grants', 'entrepreneur grants'],
    'climate': ['environmental grants', 'clean energy grants', 'sustainability grants', 'conservation funding'],
    'community': ['community development grants', 'neighborhood grants', 'CDBG'],
    'education': ['education grants', 'school grants', 'teacher grants', 'STEM funding'],
    'health': ['health grants', 'healthcare funding', 'medical grants', 'wellness grants'],
    'housing': ['housing grants', 'affordable housing funding', 'HUD grants'],
    'infrastructure': ['infrastructure grants', 'broadband grants', 'transportation funding'],
    'nonprofit': ['nonprofit grants', 'foundation grants', 'charitable funding'],
    'research': ['research grants', 'R&D funding', 'scientific grants'],
    'technology': ['technology grants', 'innovation grants', 'tech startup funding'],
    'workforce': ['workforce grants', 'job training grants', 'employment funding'],
    'youth': ['youth grants', 'children grants', 'family services funding'],
  }

  const baseTerms: string[] = []

  if (entityType && entityTerms[entityType]) {
    baseTerms.push(...entityTerms[entityType].slice(0, 2))
  }

  for (const tag of industryTags.slice(0, 3)) {
    if (industryTerms[tag]) {
      baseTerms.push(...industryTerms[tag].slice(0, 2))
    }
  }

  if (state) {
    const stateNames: Record<string, string> = {
      'CA': 'California', 'TX': 'Texas', 'NY': 'New York', 'FL': 'Florida',
      'PA': 'Pennsylvania', 'IL': 'Illinois', 'OH': 'Ohio', 'GA': 'Georgia',
      'NC': 'North Carolina', 'MI': 'Michigan', 'NJ': 'New Jersey', 'VA': 'Virginia',
      'WA': 'Washington', 'AZ': 'Arizona', 'MA': 'Massachusetts', 'TN': 'Tennessee',
      'IN': 'Indiana', 'MO': 'Missouri', 'MD': 'Maryland', 'WI': 'Wisconsin',
      'CO': 'Colorado', 'MN': 'Minnesota', 'SC': 'South Carolina', 'AL': 'Alabama',
      'LA': 'Louisiana', 'KY': 'Kentucky', 'OR': 'Oregon', 'OK': 'Oklahoma',
      'CT': 'Connecticut', 'UT': 'Utah', 'IA': 'Iowa', 'NV': 'Nevada',
      'AR': 'Arkansas', 'MS': 'Mississippi', 'KS': 'Kansas', 'NM': 'New Mexico',
      'NE': 'Nebraska', 'ID': 'Idaho', 'WV': 'West Virginia', 'HI': 'Hawaii',
      'NH': 'New Hampshire', 'ME': 'Maine', 'MT': 'Montana', 'RI': 'Rhode Island',
      'DE': 'Delaware', 'SD': 'South Dakota', 'ND': 'North Dakota', 'AK': 'Alaska',
      'VT': 'Vermont', 'WY': 'Wyoming', 'DC': 'District of Columbia',
    }
    const stateName = stateNames[state] || state

    queries.push(`${stateName} state grants ${year}`)
    queries.push(`${stateName} small business grants open now`)

    if (industryTags.includes('agriculture')) {
      queries.push(`${stateName} farm grants agricultural assistance`)
    }
  }

  if (searchFocus === 'new_grants' || searchFocus === 'all') {
    queries.push(`new grants announced ${year}`)
    queries.push('grants opening soon applications')
  }

  if (searchFocus === 'foundation_grants' || searchFocus === 'all') {
    queries.push('foundation grants open applications')
    queries.push('private foundation funding opportunities')
  }

  if (searchFocus === 'local_grants' || searchFocus === 'all') {
    queries.push('local community grants small organizations')
    queries.push('regional grants funding programs')
  }

  if (specificNeeds && specificNeeds.length > 0) {
    for (const need of specificNeeds.slice(0, 2)) {
      queries.push(`grants for ${need} ${entityType || 'small business'}`)
    }
  }

  for (let i = 0; i < baseTerms.length; i += 2) {
    const query = baseTerms.slice(i, i + 2).join(' ') + ` open applications ${year}`
    queries.push(query)
  }

  return [...new Set(queries)].slice(0, 8)
}

/**
 * Parse JSON from Gemini response text, handling multiple formats
 */
function parseGrantsJSON(text: string): unknown {
  // Try direct JSON parse first (when using JSON mode)
  try {
    return JSON.parse(text)
  } catch {
    // Continue to other methods
  }

  // Try extracting JSON from markdown code blocks
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {
      // Continue
    }
  }

  // Try finding a JSON array in the response
  const arrayMatch = text.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0])
    } catch {
      // Failed
    }
  }

  return null
}

/**
 * Use Gemini with Google Search grounding to discover grants in real-time
 */
export async function discoverGrants(
  profile: UserProfile,
  options?: Partial<GrantDiscoveryParams>
): Promise<GrantDiscoveryResult> {
  if (!isGeminiConfigured()) {
    console.warn('[GrantDiscovery] Gemini not configured')
    return { grants: [], usage: ZERO_USAGE }
  }

  const ai = getAIClient()
  if (!ai) {
    return { grants: [], usage: ZERO_USAGE }
  }

  const params: GrantDiscoveryParams = {
    industryTags: profile.industryTags || [],
    entityType: profile.entityType || 'small_business',
    state: profile.state || undefined,
    searchFocus: options?.searchFocus || 'all',
    specificNeeds: profile.fundingNeeds || options?.specificNeeds,
    ...options,
  }

  const searchQueries = buildSearchQueries(params)
  const year = getCurrentYear()

  const prompt = `You are a grant research assistant helping find real funding opportunities.

## USER PROFILE
- Organization Type: ${sanitizePromptInput(params.entityType, 100)}
- Location: ${params.state ? `${sanitizePromptInput(params.state, 100)}, USA` : 'United States'}
- Focus Areas: ${sanitizePromptArray(params.industryTags)}
${params.specificNeeds ? `- Funding Needs: ${sanitizePromptArray(params.specificNeeds)}` : ''}

## YOUR TASK
Search for REAL, CURRENTLY OPEN grants that match this profile. Focus on:

1. **State & Local Grants** - State agencies, county programs, city initiatives
2. **Foundation Grants** - Private foundations, community foundations
3. **Corporate Programs** - Corporate giving, business grants
4. **Federal Grants** - USDA, SBA, and other federal programs
5. **Industry-Specific** - Trade associations, industry groups

## SEARCH TERMS TO USE
${searchQueries.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

## IMPORTANT RULES
1. Only include REAL grants with verifiable URLs
2. Only include grants that are CURRENTLY OPEN or opening soon in ${year}
3. Focus on grants accessible to ${params.entityType === 'small_business' ? 'small businesses' : params.entityType === 'individual' ? 'individuals' : params.entityType}
4. Prioritize grants with reasonable application requirements
5. Include the actual grant website URL, not a news article

## OUTPUT FORMAT
Return a JSON array of discovered grants:

[
  {
    "title": "Exact grant program name",
    "sponsor": "Organization offering the grant",
    "description": "2-3 sentence description of what the grant funds",
    "url": "https://actual-grant-application-page.gov",
    "amountRange": "$5,000 - $50,000",
    "deadline": "March 15, ${year} or Rolling",
    "eligibility": ["Small businesses", "Located in California"],
    "categories": ["agriculture", "small business"],
    "source": "California Governor's Office",
    "confidence": 90,
    "relevanceScore": 85,
    "discoveredAt": "${new Date().toISOString().split('T')[0]}"
  }
]

Find 5-10 real grants. If you can't find verified grants, return an empty array [].
Quality over quantity - only include grants you're confident are real and currently available.`

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        tools: [{ googleSearch: {} }],
      },
    })

    const usage = extractUsageFromResponse(response)
    const text = response.text

    if (!text) {
      console.warn('[GrantDiscovery] Empty response from Gemini')
      return { grants: [], usage }
    }

    const parsed = parseGrantsJSON(text)
    if (Array.isArray(parsed)) {
      return { grants: validateAndCleanGrants(parsed as DiscoveredGrant[], params), usage }
    }

    console.warn('[GrantDiscovery] Could not parse grants from response')
    return { grants: [], usage }
  } catch (error) {
    console.error('[GrantDiscovery] Error:', error)
    return { grants: [], usage: ZERO_USAGE }
  }
}

/**
 * Validate and clean discovered grants
 */
function validateAndCleanGrants(
  grants: DiscoveredGrant[],
  _params: GrantDiscoveryParams
): DiscoveredGrant[] {
  if (!Array.isArray(grants)) {
    return []
  }

  return grants
    .filter(grant => {
      if (!grant.title || !grant.sponsor || !grant.url) {
        return false
      }
      if (!grant.url.startsWith('http')) {
        return false
      }
      if (grant.confidence && grant.confidence < 50) {
        return false
      }
      return true
    })
    .map(grant => ({
      ...grant,
      discoveredAt: grant.discoveredAt || new Date().toISOString().split('T')[0],
      confidence: grant.confidence || 70,
      relevanceScore: grant.relevanceScore || 60,
    }))
    .sort((a, b) => {
      const scoreA = (a.relevanceScore || 0) * (a.confidence || 0)
      const scoreB = (b.relevanceScore || 0) * (b.confidence || 0)
      return scoreB - scoreA
    })
    .slice(0, 15)
}

/**
 * Search for grants matching specific keywords with Google Search grounding
 */
export async function searchGrantsByKeyword(
  keyword: string,
  profile?: Partial<UserProfile>
): Promise<GrantDiscoveryResult> {
  if (!isGeminiConfigured()) {
    return { grants: [], usage: ZERO_USAGE }
  }

  const ai = getAIClient()
  if (!ai) {
    return { grants: [], usage: ZERO_USAGE }
  }

  const year = getCurrentYear()

  const prompt = `Search for real, currently open grants related to: "${sanitizePromptInput(keyword, 500)}"
${profile?.state ? `Location focus: ${sanitizePromptInput(profile.state, 100)}, USA` : ''}
${profile?.entityType ? `For: ${sanitizePromptInput(profile.entityType, 100)}` : ''}

Find 5-10 real grant programs with verifiable URLs that are open in ${year}.
Return a JSON array with objects containing: title, sponsor, description, url, amountRange, deadline, eligibility (array), categories (array), source, confidence (0-100), relevanceScore (0-100), discoveredAt.
Only include grants you're confident are real and currently accepting applications.`

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        tools: [{ googleSearch: {} }],
      },
    })

    const usage = extractUsageFromResponse(response)
    const text = response.text

    if (!text) return { grants: [], usage }

    const parsed = parseGrantsJSON(text)
    if (Array.isArray(parsed)) {
      return {
        grants: validateAndCleanGrants(parsed as DiscoveredGrant[], {
          industryTags: [],
          entityType: profile?.entityType || 'small_business',
          state: profile?.state || undefined,
        }),
        usage,
      }
    }

    return { grants: [], usage }
  } catch (error) {
    console.error('[GrantDiscovery] Keyword search error:', error)
    return { grants: [], usage: ZERO_USAGE }
  }
}

/**
 * Find grants for a specific use case
 */
export async function findGrantsForNeed(
  need: string,
  profile: UserProfile
): Promise<GrantDiscoveryResult> {
  return discoverGrants(profile, {
    specificNeeds: [need],
    searchFocus: 'all',
  })
}

/**
 * Monitor for new grants (for scheduled job)
 */
export async function checkForNewGrants(
  profile: UserProfile,
  lastCheckDate: string
): Promise<DiscoveredGrant[]> {
  if (!isGeminiConfigured()) {
    return []
  }

  const ai = getAIClient()
  if (!ai) {
    return []
  }

  const prompt = `Find grants announced or opened AFTER ${sanitizePromptInput(lastCheckDate, 50)} that match:
- Organization: ${sanitizePromptInput(profile.entityType, 100)}
- Location: ${sanitizePromptInput(profile.state, 100) || 'USA'}
- Industries: ${sanitizePromptArray(profile.industryTags)}

Only include NEW grants announced since ${sanitizePromptInput(lastCheckDate, 50)}.
Return a JSON array with objects containing: title, sponsor, description, url, amountRange, deadline, confidence (0-100), relevanceScore (0-100), discoveredAt.
If no new grants found, return empty array [].`

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        tools: [{ googleSearch: {} }],
      },
    })

    const text = response.text
    if (!text) return []

    const parsed = parseGrantsJSON(text)
    if (Array.isArray(parsed)) {
      return validateAndCleanGrants(parsed as DiscoveredGrant[], {
        industryTags: profile.industryTags || [],
        entityType: profile.entityType,
        state: profile.state || undefined,
      })
    }

    return []
  } catch (error) {
    console.error('[GrantDiscovery] New grant check error:', error)
    return []
  }
}
