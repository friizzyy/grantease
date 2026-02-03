/**
 * GEMINI GRANT MATCHING SERVICE
 * -----------------------------
 * AI-powered grant matching focused on ACCESSIBLE grants for real people:
 * - Small businesses & startups
 * - Farmers & agricultural operations
 * - Nonprofits & community organizations
 * - Homeowners & individuals
 * - Local/regional businesses
 *
 * NOT for: Massive institutional research grants, government contracts requiring
 * specialized infrastructure, grants needing PhD researchers, etc.
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
  isAccessible: boolean // NEW: Is this grant actually attainable for regular people?
  matchScore: number // 0-100
  accessibilityScore: number // NEW: How easy is this to apply for? (0-100)
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  fitSummary: string // 1-2 sentence explanation of why this grant fits
  reasons: string[] // Key reasons for the match
  concerns: string[] // Any concerns or things to check
  whatYouCanFund: string[] // Specific things this grant could fund for the user
  nextSteps: string[] // Recommended next steps
  urgency: 'high' | 'medium' | 'low'
  difficultyLevel: 'easy' | 'moderate' | 'complex' // NEW: Application difficulty
  estimatedTimeToApply: string // NEW: e.g., "2-4 hours", "1-2 weeks"
}

/**
 * Build the user profile context for Gemini
 */
function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = []

  // Entity type
  const entityLabels: Record<string, string> = {
    individual: 'Individual/Homeowner',
    nonprofit: 'Small Nonprofit Organization',
    small_business: 'Small Business Owner',
    for_profit: 'Small For-Profit Company',
    educational: 'Educational Institution',
    government: 'Local Government Entity',
    tribal: 'Tribal Organization',
  }
  if (profile.entityType) {
    parts.push(`Who I Am: ${entityLabels[profile.entityType] || profile.entityType}`)
  }

  // Location
  if (profile.state) {
    parts.push(`Location: ${profile.state}, USA`)
  }

  // Focus areas
  if (profile.industryTags && profile.industryTags.length > 0) {
    parts.push(`What I Do: ${profile.industryTags.join(', ')}`)
  }

  // Size/budget - emphasize small scale
  if (profile.sizeBand) {
    const sizeLabels: Record<string, string> = {
      '1': 'Solo operation (just me)',
      '2-10': 'Small team (2-10 people)',
      '11-50': 'Growing business (11-50 people)',
      '51-200': 'Medium business (51-200 people)',
      '200+': 'Larger organization (200+ people)',
    }
    parts.push(`Team Size: ${sizeLabels[profile.sizeBand] || profile.sizeBand}`)
  }

  if (profile.annualBudget) {
    const budgetLabels: Record<string, string> = {
      '<50k': 'Under $50,000/year',
      '50k-250k': '$50,000 - $250,000/year',
      '250k-1m': '$250,000 - $1 million/year',
      '1m-5m': '$1 million - $5 million/year',
      '>5m': 'Over $5 million/year',
    }
    parts.push(`Annual Revenue/Budget: ${budgetLabels[profile.annualBudget] || profile.annualBudget}`)
  }

  // Industry-specific details
  if (profile.industryAttributes && Object.keys(profile.industryAttributes).length > 0) {
    const attrs = profile.industryAttributes
    const attrParts: string[] = []

    if (attrs.farmType) attrParts.push(`Farm Type: ${attrs.farmType}`)
    if (attrs.acreage) attrParts.push(`Land: ${attrs.acreage} acres`)
    if (attrs.yearsInOperation) attrParts.push(`Years Operating: ${attrs.yearsInOperation}`)
    if (attrs.products && Array.isArray(attrs.products)) {
      attrParts.push(`Products/Services: ${attrs.products.join(', ')}`)
    }
    if (attrs.certifications && Array.isArray(attrs.certifications)) {
      attrParts.push(`Certifications: ${attrs.certifications.join(', ')}`)
    }

    if (attrParts.length > 0) {
      parts.push(`My Operation: ${attrParts.join('; ')}`)
    }
  }

  return parts.join('\n')
}

/**
 * Match grants with focus on ACCESSIBILITY for regular people
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

  const prompt = `You are a grant advisor helping REGULAR PEOPLE find funding they can ACTUALLY get.

Your users are NOT:
- Major research universities
- Large corporations
- Government agencies with grant-writing departments
- Organizations with PhD researchers on staff

Your users ARE:
- Small business owners trying to grow
- Farmers and ranchers working their land
- Homeowners wanting to improve their property
- Small nonprofits serving their community
- Individual entrepreneurs and sole proprietors
- Local/family businesses

## WHO NEEDS HELP
${profileContext}

## CRITICAL FILTERING RULES

IMMEDIATELY REJECT grants that are:
1. **Research grants requiring institutional affiliation** - NIH, NSF research grants that need a university
2. **Massive contracts** ($10M+) clearly meant for large contractors
3. **Grants requiring specialized facilities** - biosafety labs, supercomputers, etc.
4. **Grants for specific organizations** - "for XYZ University" or "for ABC Hospital"
5. **Government-to-government grants** - Federal to State agency transfers
6. **International development grants** - USAID programs in foreign countries
7. **Highly technical research** - clinical trials, drug development, advanced scientific research
8. **Grants requiring cost-sharing** of millions of dollars
9. **Contracts for government services** - IT services for federal agencies, military contracts

PRIORITIZE grants that are:
1. **Designed for small entities** - USDA programs for small farms, SBA for small business
2. **Community-focused** - Local development, rural communities, neighborhoods
3. **Accessible application process** - Online applications, reasonable requirements
4. **Reasonable funding amounts** - $1K to $500K range is the sweet spot
5. **Direct benefit to applicant** - Equipment, land improvement, business expansion
6. **State/local programs** - Often easier than federal
7. **Beginning/new operator programs** - Starting farmers, new businesses
8. **Conservation/improvement programs** - Help with property, land, sustainability

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
For each grant, evaluate:

1. **Is this ACCESSIBLE to a regular person/small organization?**
   - Can someone without a grants department apply?
   - Is the funding amount appropriate for small entities?
   - Does it require institutional backing they don't have?

2. **Is this RELEVANT to their specific situation?**
   - Does it match their industry/focus area?
   - Does it fit their location?
   - Does it match their entity type?

3. **How DIFFICULT is the application?**
   - Simple online form vs. 100-page proposal
   - Required attachments and documentation
   - Technical requirements

## OUTPUT FORMAT
Return a JSON array. ONLY include grants that are BOTH accessible AND relevant.
Score grants higher if they're easier to apply for and more likely to help this specific person.

\`\`\`json
[
  {
    "grantId": "string",
    "isRelevant": true,
    "isAccessible": true,
    "matchScore": 0-100,
    "accessibilityScore": 0-100,
    "eligibilityStatus": "eligible" | "likely_eligible" | "check_requirements" | "not_eligible",
    "fitSummary": "Plain English explanation of why this grant could help them",
    "reasons": ["Specific reasons this is a good match"],
    "concerns": ["Things to check or be aware of"],
    "whatYouCanFund": ["Concrete examples of what they could use this money for"],
    "nextSteps": ["Simple, actionable steps to apply"],
    "urgency": "high" | "medium" | "low",
    "difficultyLevel": "easy" | "moderate" | "complex",
    "estimatedTimeToApply": "e.g., 2-4 hours"
  }
]
\`\`\`

IMPORTANT:
- Return EMPTY ARRAY [] if no grants are accessible AND relevant
- Be STRICT - it's better to show 3 great matches than 20 mediocre ones
- Prioritize grants the user can REALISTICALLY get
- Think: "Would I recommend this to my friend who owns a small farm/business?"

The user's focus is: ${profile.industryTags?.join(', ') || 'general'}
Their organization type is: ${profile.entityType || 'individual'}

Only return grants that would genuinely help someone like them.`

  try {
    const results = await generateJSON<GeminiMatchResult[]>(prompt, true)

    if (!results || !Array.isArray(results)) {
      console.error('Gemini returned invalid results')
      return []
    }

    // Filter to only accessible + relevant grants with good scores
    return results
      .filter(r => r.isRelevant && r.isAccessible && r.matchScore >= 40)
      .sort((a, b) => {
        // Sort by combined score: matchScore + accessibilityScore
        const scoreA = (a.matchScore || 0) + (a.accessibilityScore || 0)
        const scoreB = (b.matchScore || 0) + (b.accessibilityScore || 0)
        return scoreB - scoreA
      })
  } catch (error) {
    console.error('Gemini grant matching error:', error)
    return []
  }
}

/**
 * Quick accessibility check - is this grant even worth showing to regular people?
 */
export async function isGrantAccessible(
  grant: GrantForMatching
): Promise<boolean> {
  if (!isGeminiConfigured()) {
    return true
  }

  // Quick heuristics first (before calling AI)
  const title = grant.title.toLowerCase()
  const sponsor = grant.sponsor.toLowerCase()
  const summary = (grant.summary || '').toLowerCase()
  const combined = `${title} ${sponsor} ${summary}`

  // Auto-reject patterns (these are almost never accessible to regular people)
  const rejectPatterns = [
    'clinical trial', 'drug development', 'phase i', 'phase ii', 'phase iii',
    'genome', 'genomic', 'biomedical research', 'cancer research center',
    'national laboratory', 'research institution', 'university-based',
    'r01', 'r21', 'r03', // NIH grant codes
    'defense contract', 'dod contract', 'military procurement',
    'foreign assistance', 'international development', 'usaid overseas',
  ]

  if (rejectPatterns.some(pattern => combined.includes(pattern))) {
    return false
  }

  // Auto-accept patterns (these are usually accessible)
  const acceptPatterns = [
    'small business', 'small farm', 'beginning farmer', 'young farmer',
    'family farm', 'rural development', 'community development',
    'local business', 'micro-enterprise', 'homeowner', 'property owner',
    'conservation easement', 'cost-share', 'matching grant',
    'technical assistance', 'usda rural', 'sba loan', 'sba grant',
  ]

  if (acceptPatterns.some(pattern => combined.includes(pattern))) {
    return true
  }

  // For edge cases, let Gemini decide
  const prompt = `Quick check: Is this grant accessible to a regular small business owner, farmer, or individual?

GRANT: "${grant.title}" from ${grant.sponsor}
Summary: ${grant.summary || 'N/A'}
Amount: ${grant.amountMax ? `Up to $${grant.amountMax.toLocaleString()}` : 'Varies'}

Answer considering:
- Does this need a university/research institution?
- Is the amount appropriate for individuals/small orgs ($5K-$500K)?
- Can someone apply without a grants department?

Respond in JSON: {"accessible": true/false, "reason": "brief explanation"}`

  try {
    const response = await generateJSON<{ accessible: boolean; reason: string }>(prompt, false)
    return response?.accessible ?? true
  } catch {
    return true
  }
}

/**
 * Quick relevance check for a single grant
 */
export async function isGrantRelevant(
  grant: GrantForMatching,
  profile: UserProfile
): Promise<boolean> {
  if (!isGeminiConfigured()) {
    return true
  }

  const profileContext = buildProfileContext(profile)

  const prompt = `Quick check: Is this grant relevant for this person?

WHO: ${profileContext}

GRANT: "${grant.title}" from ${grant.sponsor}
Summary: ${grant.summary || 'N/A'}
Categories: ${grant.categories.join(', ') || 'N/A'}

For someone focused on "${profile.industryTags?.join(', ') || 'general'}" - is this grant directly helpful?

Respond in JSON: {"relevant": true/false}`

  try {
    const response = await generateJSON<{ relevant: boolean }>(prompt, false)
    return response?.relevant ?? true
  } catch {
    return true
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

/**
 * Pre-filter grants before sending to Gemini (saves API calls)
 * Returns grants that are LIKELY accessible based on quick heuristics
 */
export function preFilterForAccessibility(grants: GrantForMatching[]): GrantForMatching[] {
  return grants.filter(grant => {
    const title = grant.title.toLowerCase()
    const sponsor = grant.sponsor.toLowerCase()
    const summary = (grant.summary || '').toLowerCase()
    const combined = `${title} ${sponsor} ${summary}`

    // Hard rejections - definitely not for regular people
    const hardReject = [
      'clinical trial', 'drug development', 'cancer research center',
      'genome sequencing', 'national laboratory', 'defense contract',
      'foreign assistance', 'international development program',
      'research institution only', 'university-affiliated',
      'phase i study', 'phase ii study', 'phase iii study',
    ]

    if (hardReject.some(term => combined.includes(term))) {
      return false
    }

    // Check funding amount - very large grants are usually institutional
    if (grant.amountMin && grant.amountMin > 5000000) {
      // $5M+ minimum is probably not for small entities
      return false
    }

    return true
  })
}
