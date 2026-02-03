/**
 * GEMINI GRANT MATCHING SERVICE
 * -----------------------------
 * Uses Gemini AI to intelligently match grants to user profiles
 *
 * This replaces the keyword-based filtering with AI-powered understanding
 * of what grants are actually for and whether they fit the user's needs.
 */

import { generateJSON, isGeminiConfigured } from './gemini-client'
import { UserProfile } from '@/lib/types/onboarding'

/**
 * Grant data structure for matching
 */
export interface GrantForMatching {
  id: string
  title: string
  sponsor: string
  summary: string
  description?: string | null
  categories: string[]
  eligibility: string[]
  amountMin?: number
  amountMax?: number
  deadlineDate?: Date | string | null
  url: string
}

/**
 * Result of Gemini grant matching
 */
export interface GeminiMatchResult {
  grantId: string
  isRelevant: boolean
  matchScore: number // 0-100
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  fitSummary: string // 1-2 sentence explanation of why this grant fits (or doesn't)
  reasons: string[] // Key reasons for the match
  concerns: string[] // Any concerns or things to check
  whatYouCanFund: string[] // Specific things this grant could fund for the user
  nextSteps: string[] // Recommended next steps
  urgency: 'high' | 'medium' | 'low'
}

/**
 * Build the user profile context for Gemini
 */
function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = []

  // Entity type
  const entityLabels: Record<string, string> = {
    individual: 'Individual/Sole Proprietor',
    nonprofit: 'Nonprofit Organization',
    small_business: 'Small Business',
    for_profit: 'For-Profit Company',
    educational: 'Educational Institution',
    government: 'Government Entity',
    tribal: 'Tribal Organization',
  }
  if (profile.entityType) {
    parts.push(`Organization Type: ${entityLabels[profile.entityType] || profile.entityType}`)
  }

  // Location
  if (profile.state) {
    parts.push(`Location: ${profile.state}, USA`)
  }

  // Focus areas - THIS IS KEY
  if (profile.industryTags && profile.industryTags.length > 0) {
    parts.push(`Focus Areas: ${profile.industryTags.join(', ')}`)
  }

  // Size/budget
  if (profile.sizeBand) {
    const sizeLabels: Record<string, string> = {
      '1': '1 person (solo)',
      '2-10': '2-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '200+': '200+ employees',
    }
    parts.push(`Organization Size: ${sizeLabels[profile.sizeBand] || profile.sizeBand}`)
  }

  if (profile.annualBudget) {
    const budgetLabels: Record<string, string> = {
      '<50k': 'Under $50,000',
      '50k-250k': '$50,000 - $250,000',
      '250k-1m': '$250,000 - $1 million',
      '1m-5m': '$1 million - $5 million',
      '>5m': 'Over $5 million',
    }
    parts.push(`Annual Budget: ${budgetLabels[profile.annualBudget] || profile.annualBudget}`)
  }

  // Industry attributes (specific details about their operation)
  if (profile.industryAttributes && Object.keys(profile.industryAttributes).length > 0) {
    const attrs = profile.industryAttributes
    const attrParts: string[] = []

    if (attrs.farmType) attrParts.push(`Farm Type: ${attrs.farmType}`)
    if (attrs.acreage) attrParts.push(`Acreage: ${attrs.acreage}`)
    if (attrs.yearsInOperation) attrParts.push(`Years in Operation: ${attrs.yearsInOperation}`)
    if (attrs.products && Array.isArray(attrs.products)) {
      attrParts.push(`Products/Services: ${attrs.products.join(', ')}`)
    }
    if (attrs.certifications && Array.isArray(attrs.certifications)) {
      attrParts.push(`Certifications: ${attrs.certifications.join(', ')}`)
    }

    if (attrParts.length > 0) {
      parts.push(`Additional Details: ${attrParts.join('; ')}`)
    }
  }

  return parts.join('\n')
}

/**
 * Match a batch of grants against a user profile using Gemini
 */
export async function matchGrantsWithGemini(
  grants: GrantForMatching[],
  profile: UserProfile
): Promise<GeminiMatchResult[]> {
  if (!isGeminiConfigured()) {
    console.warn('Gemini not configured, returning empty results')
    return []
  }

  if (grants.length === 0) {
    return []
  }

  const profileContext = buildProfileContext(profile)

  // Build the prompt
  const prompt = `You are an expert grant matching assistant. Your job is to analyze grants and determine if they are a good fit for a specific organization.

## USER PROFILE
${profileContext}

## IMPORTANT MATCHING RULES
1. ONLY mark grants as relevant if they DIRECTLY serve the user's focus areas
2. For "agriculture" focus: The grant must be for farms, farming operations, rural land, agricultural businesses, food production, or rural development.
   - REJECT: Medical research, health programs, urban projects, arts/culture, general small business (unless specifically for farms)
   - ACCEPT: Farm equipment, crop programs, livestock, rural development, land conservation, agricultural training, beginning farmer programs
3. Consider the organization type - some grants are only for nonprofits, some only for businesses, etc.
4. Location matters - state-specific grants should match the user's state
5. Budget/size should be reasonable for the grant amount

## GRANTS TO ANALYZE
${grants.map((g, i) => `
### Grant ${i + 1}
- ID: ${g.id}
- Title: ${g.title}
- Sponsor: ${g.sponsor}
- Summary: ${g.summary || 'No summary available'}
- Categories: ${g.categories.join(', ') || 'Uncategorized'}
- Eligibility: ${g.eligibility.join(', ') || 'Not specified'}
- Amount: ${g.amountMin && g.amountMax ? `$${g.amountMin.toLocaleString()} - $${g.amountMax.toLocaleString()}` : g.amountMax ? `Up to $${g.amountMax.toLocaleString()}` : 'Varies'}
- Deadline: ${g.deadlineDate ? new Date(g.deadlineDate).toLocaleDateString() : 'Rolling/TBD'}
`).join('\n')}

## YOUR TASK
For each grant, determine:
1. Is this grant ACTUALLY relevant to the user's focus areas? (Be strict - don't include tangentially related grants)
2. What's the match score (0-100)?
3. What's their eligibility status?
4. A 1-2 sentence explanation of why this fits (or doesn't)
5. Key reasons for the match
6. Any concerns
7. What specifically could they fund with this grant?
8. Recommended next steps
9. Urgency level

## OUTPUT FORMAT
Return a JSON array with objects for each grant. Only include grants that are at least somewhat relevant (score >= 30).

\`\`\`json
[
  {
    "grantId": "string",
    "isRelevant": true/false,
    "matchScore": 0-100,
    "eligibilityStatus": "eligible" | "likely_eligible" | "check_requirements" | "not_eligible",
    "fitSummary": "string",
    "reasons": ["string"],
    "concerns": ["string"],
    "whatYouCanFund": ["string"],
    "nextSteps": ["string"],
    "urgency": "high" | "medium" | "low"
  }
]
\`\`\`

If NO grants are relevant, return an empty array: []

Analyze each grant carefully and be STRICT about relevance. The user is in ${profile.industryTags?.join(', ') || 'general'} - only show grants that truly serve that purpose.`

  try {
    const results = await generateJSON<GeminiMatchResult[]>(prompt, true) // Use Pro model for better reasoning

    if (!results || !Array.isArray(results)) {
      console.error('Gemini returned invalid results')
      return []
    }

    // Filter to only relevant grants with score >= 30
    return results.filter(r => r.isRelevant && r.matchScore >= 30)
  } catch (error) {
    console.error('Gemini grant matching error:', error)
    return []
  }
}

/**
 * Quick relevance check for a single grant (faster, less detailed)
 */
export async function isGrantRelevant(
  grant: GrantForMatching,
  profile: UserProfile
): Promise<boolean> {
  if (!isGeminiConfigured()) {
    return true // Default to showing if no AI
  }

  const profileContext = buildProfileContext(profile)

  const prompt = `Quick relevance check: Is this grant relevant for this user?

USER: ${profileContext}

GRANT: "${grant.title}" from ${grant.sponsor}
Summary: ${grant.summary || 'N/A'}
Categories: ${grant.categories.join(', ') || 'N/A'}

For "${profile.industryTags?.join(', ') || 'general'}" focus - is this grant directly relevant?

Answer with just "YES" or "NO" and nothing else.`

  try {
    const response = await generateJSON<{ relevant: boolean }>(
      prompt + '\n\nRespond in JSON: {"relevant": true/false}',
      false
    )
    return response?.relevant ?? true
  } catch {
    return true // Default to showing
  }
}

/**
 * Get detailed analysis of a single grant for a user
 */
export async function analyzeGrantFit(
  grant: GrantForMatching,
  profile: UserProfile
): Promise<GeminiMatchResult | null> {
  const results = await matchGrantsWithGemini([grant], profile)
  return results[0] || null
}
