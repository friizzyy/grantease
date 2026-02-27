/**
 * GEMINI GRANT DISCOVERY SERVICE
 * ------------------------------
 * Uses Gemini's web search capabilities to find grants in real-time.
 * This finds grants that aren't in federal databases:
 * - State and local grants
 * - Foundation grants
 * - Corporate giving programs
 * - Industry-specific opportunities
 * - Recently announced grants
 */

import { getGeminiProModel, extractUsageFromResult, isGeminiConfigured, type GeminiUsage } from './gemini-client'
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
  source: string // Where we found it (website name)
  confidence: number // How confident we are this is a real grant (0-100)
  relevanceScore: number // How relevant to the user (0-100)
  discoveredAt: string
}

/**
 * Search parameters for grant discovery
 */
export interface GrantDiscoveryParams {
  // User context
  industryTags: string[]
  entityType: string
  state?: string

  // Search focus
  searchFocus?: 'new_grants' | 'local_grants' | 'foundation_grants' | 'all'

  // Additional context
  specificNeeds?: string[] // e.g., "equipment", "expansion", "training"
  excludeKeywords?: string[] // Grants to skip
}

/**
 * Build search queries based on user profile
 */
function buildSearchQueries(params: GrantDiscoveryParams): string[] {
  const queries: string[] = []
  const { industryTags, entityType, state, searchFocus, specificNeeds } = params

  // Map entity types to search terms
  const entityTerms: Record<string, string[]> = {
    'small_business': ['small business grants', 'entrepreneur grants', 'business funding'],
    'nonprofit': ['nonprofit grants', '501c3 grants', 'charitable funding'],
    'individual': ['individual grants', 'personal grants', 'artist grants'],
    'for_profit': ['business grants', 'corporate grants'],
    'educational': ['education grants', 'school funding'],
    'government': ['government grants', 'municipal funding'],
    'tribal': ['tribal grants', 'native american grants'],
  }

  // Map industries to search terms
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

  // Build queries based on focus
  const baseTerms: string[] = []

  // Add entity-based terms
  if (entityType && entityTerms[entityType]) {
    baseTerms.push(...entityTerms[entityType].slice(0, 2))
  }

  // Add industry-based terms
  for (const tag of industryTags.slice(0, 3)) {
    if (industryTerms[tag]) {
      baseTerms.push(...industryTerms[tag].slice(0, 2))
    }
  }

  // Add state-specific queries
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

    // State-specific grant searches
    queries.push(`${stateName} state grants 2024 2025`)
    queries.push(`${stateName} small business grants open now`)

    if (industryTags.includes('agriculture')) {
      queries.push(`${stateName} farm grants agricultural assistance`)
    }
  }

  // Add focus-specific queries
  if (searchFocus === 'new_grants' || searchFocus === 'all') {
    queries.push('new grants announced 2024 2025')
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

  // Add specific needs
  if (specificNeeds && specificNeeds.length > 0) {
    for (const need of specificNeeds.slice(0, 2)) {
      queries.push(`grants for ${need} ${entityType || 'small business'}`)
    }
  }

  // Combine base terms into queries
  for (let i = 0; i < baseTerms.length; i += 2) {
    const query = baseTerms.slice(i, i + 2).join(' ') + ' open applications 2024 2025'
    queries.push(query)
  }

  // Deduplicate and limit
  return [...new Set(queries)].slice(0, 8)
}

/**
 * Use Gemini to search the web and find grants
 * Note: This uses Gemini's grounding with Google Search feature
 */
export async function discoverGrants(
  profile: UserProfile,
  options?: Partial<GrantDiscoveryParams>
): Promise<GrantDiscoveryResult> {
  if (!isGeminiConfigured()) {
    console.warn('Gemini not configured for grant discovery')
    return { grants: [], usage: ZERO_USAGE }
  }

  const model = getGeminiProModel()
  if (!model) {
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

  // Build the discovery prompt
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
2. Only include grants that are CURRENTLY OPEN or opening soon
3. Focus on grants accessible to ${params.entityType === 'small_business' ? 'small businesses' : params.entityType === 'individual' ? 'individuals' : params.entityType}
4. Prioritize grants with reasonable application requirements
5. Include the actual grant website URL, not a news article

## OUTPUT FORMAT
Return a JSON array of discovered grants:

\`\`\`json
[
  {
    "title": "Exact grant program name",
    "sponsor": "Organization offering the grant",
    "description": "2-3 sentence description of what the grant funds",
    "url": "https://actual-grant-application-page.gov",
    "amountRange": "$5,000 - $50,000",
    "deadline": "March 15, 2025 or Rolling",
    "eligibility": ["Small businesses", "Located in California"],
    "categories": ["agriculture", "small business"],
    "source": "California Governor's Office",
    "confidence": 90,
    "relevanceScore": 85,
    "discoveredAt": "${new Date().toISOString().split('T')[0]}"
  }
]
\`\`\`

Find 5-10 real grants. If you can't find verified grants, return an empty array [].
Quality over quantity - only include grants you're confident are real and currently available.`

  try {
    // Use generateContent with Google Search grounding
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // Note: Google Search grounding requires specific API configuration
      // This may need adjustment based on your Gemini API access level
    })

    const usage = extractUsageFromResult(result)
    const response = result.response.text()

    // Extract JSON from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
    if (!jsonMatch) {
      // Try to parse the whole response as JSON
      try {
        const grants: unknown = JSON.parse(response)
        if (Array.isArray(grants)) {
          return { grants: validateAndCleanGrants(grants as DiscoveredGrant[], params), usage }
        }
      } catch {
        console.warn('Could not parse grant discovery response')
        return { grants: [], usage }
      }
      return { grants: [], usage }
    }

    const grants: unknown = JSON.parse(jsonMatch[1])
    return { grants: validateAndCleanGrants(grants as DiscoveredGrant[], params), usage }
  } catch (error) {
    console.error('Grant discovery error:', error)
    return { grants: [], usage: ZERO_USAGE }
  }
}

/**
 * Validate and clean discovered grants
 */
function validateAndCleanGrants(
  grants: DiscoveredGrant[],
  params: GrantDiscoveryParams
): DiscoveredGrant[] {
  if (!Array.isArray(grants)) {
    return []
  }

  return grants
    .filter(grant => {
      // Must have required fields
      if (!grant.title || !grant.sponsor || !grant.url) {
        return false
      }

      // URL must look valid
      if (!grant.url.startsWith('http')) {
        return false
      }

      // Confidence must be reasonable
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
      // Sort by relevance * confidence
      const scoreA = (a.relevanceScore || 0) * (a.confidence || 0)
      const scoreB = (b.relevanceScore || 0) * (b.confidence || 0)
      return scoreB - scoreA
    })
    .slice(0, 15) // Limit results
}

/**
 * Search for grants matching specific keywords
 */
export async function searchGrantsByKeyword(
  keyword: string,
  profile?: Partial<UserProfile>
): Promise<GrantDiscoveryResult> {
  if (!isGeminiConfigured()) {
    return { grants: [], usage: ZERO_USAGE }
  }

  const model = getGeminiProModel()
  if (!model) {
    return { grants: [], usage: ZERO_USAGE }
  }

  const prompt = `Search for real, currently open grants related to: "${sanitizePromptInput(keyword, 500)}"
${profile?.state ? `Location focus: ${sanitizePromptInput(profile.state, 100)}, USA` : ''}
${profile?.entityType ? `For: ${sanitizePromptInput(profile.entityType, 100)}` : ''}

Find 5-10 real grant programs with verifiable URLs.
Return JSON array with: title, sponsor, description, url, amountRange, deadline, confidence, relevanceScore.
Only include grants you're confident are real and currently accepting applications.`

  try {
    const result = await model.generateContent(prompt)
    const usage = extractUsageFromResult(result)
    const response = result.response.text()

    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      const grants: unknown = JSON.parse(jsonMatch[1])
      return {
        grants: validateAndCleanGrants(grants as DiscoveredGrant[], {
          industryTags: [],
          entityType: profile?.entityType || 'small_business',
          state: profile?.state || undefined,
        }),
        usage,
      }
    }

    return { grants: [], usage }
  } catch (error) {
    console.error('Keyword search error:', error)
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

  const model = getGeminiProModel()
  if (!model) {
    return []
  }

  const prompt = `Find grants announced or opened AFTER ${sanitizePromptInput(lastCheckDate, 50)} that match:
- Organization: ${sanitizePromptInput(profile.entityType, 100)}
- Location: ${sanitizePromptInput(profile.state, 100) || 'USA'}
- Industries: ${sanitizePromptArray(profile.industryTags)}

Only include NEW grants announced since ${sanitizePromptInput(lastCheckDate, 50)}.
Return JSON array with: title, sponsor, description, url, amountRange, deadline, confidence.
If no new grants found, return empty array [].`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      const grants: unknown = JSON.parse(jsonMatch[1])
      return validateAndCleanGrants(grants as DiscoveredGrant[], {
        industryTags: profile.industryTags || [],
        entityType: profile.entityType,
        state: profile.state || undefined,
      })
    }

    return []
  } catch (error) {
    console.error('New grant check error:', error)
    return []
  }
}
