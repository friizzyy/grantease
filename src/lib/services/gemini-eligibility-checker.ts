/**
 * GEMINI ELIGIBILITY CHECKER
 * --------------------------
 * Deep analysis of grant requirements vs user profile
 * to determine if they're actually eligible before applying.
 */

import { generateJSON, isGeminiConfigured } from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'

/**
 * Grant details for eligibility check
 */
export interface GrantForEligibility {
  id: string
  title: string
  sponsor: string
  description?: string
  eligibilityText?: string
  requirements?: string
  url: string
}

/**
 * Detailed eligibility analysis result
 */
export interface EligibilityAnalysis {
  grantId: string
  grantTitle: string

  // Overall verdict
  isEligible: boolean
  eligibilityScore: number // 0-100
  verdict: 'definitely_eligible' | 'likely_eligible' | 'unclear' | 'likely_ineligible' | 'definitely_ineligible'
  confidenceLevel: number // How confident we are in this assessment

  // Requirement breakdown
  requirementChecks: Array<{
    requirement: string
    status: 'met' | 'likely_met' | 'unclear' | 'likely_not_met' | 'not_met'
    explanation: string
    actionNeeded?: string
  }>

  // Strengths and weaknesses
  strengths: string[] // Why they're a good fit
  weaknesses: string[] // Potential issues
  missingInfo: string[] // What we need to know to be sure

  // Actionable advice
  nextSteps: string[]
  documentsNeeded: string[]
  estimatedPrepTime: string

  // Red flags
  dealBreakers: string[] // Things that definitely disqualify them
  warnings: string[] // Things to be careful about
}

/**
 * Build profile context for eligibility check
 */
function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = []

  // Entity type
  const entityLabels: Record<string, string> = {
    individual: 'Individual / Sole Proprietor',
    nonprofit: 'Nonprofit Organization (501c3)',
    small_business: 'Small Business',
    for_profit: 'For-Profit Company',
    educational: 'Educational Institution',
    government: 'Government Entity',
    tribal: 'Tribal Organization',
  }
  parts.push(`Organization Type: ${entityLabels[profile.entityType] || profile.entityType}`)

  if (profile.state) {
    parts.push(`Location: ${profile.state}, USA`)
  }

  if (profile.industryTags?.length) {
    parts.push(`Industry/Focus: ${profile.industryTags.join(', ')}`)
  }

  if (profile.sizeBand) {
    const sizeLabels: Record<string, string> = {
      'solo': '1 person',
      'small': '2-10 employees',
      'medium': '11-50 employees',
      'large': '50+ employees',
    }
    parts.push(`Size: ${sizeLabels[profile.sizeBand] || profile.sizeBand}`)
  }

  if (profile.stage) {
    const stageLabels: Record<string, string> = {
      'idea': 'Idea stage',
      'early': 'Early stage (0-2 years)',
      'growth': 'Growth stage (2-5 years)',
      'established': 'Established (5+ years)',
    }
    parts.push(`Stage: ${stageLabels[profile.stage] || profile.stage}`)
  }

  if (profile.annualBudget) {
    const budgetLabels: Record<string, string> = {
      'under_100k': 'Under $100,000',
      '100k_500k': '$100,000 - $500,000',
      '500k_1m': '$500,000 - $1 million',
      '1m_5m': '$1 million - $5 million',
      'over_5m': 'Over $5 million',
    }
    parts.push(`Annual Budget/Revenue: ${budgetLabels[profile.annualBudget] || profile.annualBudget}`)
  }

  // Additional details
  if (profile.certifications?.length) {
    parts.push(`Certifications: ${profile.certifications.join(', ')}`)
  }

  if (profile.farmDetails) {
    const farmParts: string[] = []
    if (profile.farmDetails.farmType) farmParts.push(`Type: ${profile.farmDetails.farmType}`)
    if (profile.farmDetails.acreage) farmParts.push(`Acreage: ${profile.farmDetails.acreage}`)
    if (profile.farmDetails.organic) farmParts.push('Certified Organic')
    if (farmParts.length) {
      parts.push(`Farm Details: ${farmParts.join(', ')}`)
    }
  }

  return parts.join('\n')
}

/**
 * Check eligibility for a specific grant
 */
export async function checkEligibility(
  grant: GrantForEligibility,
  profile: UserProfile
): Promise<EligibilityAnalysis | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const profileContext = buildProfileContext(profile)

  const prompt = `You are a grant eligibility expert. Analyze whether this applicant is eligible for this grant.

## APPLICANT PROFILE
${profileContext}

## GRANT DETAILS
Title: ${grant.title}
Sponsor: ${grant.sponsor}
${grant.description ? `Description: ${grant.description}` : ''}
${grant.eligibilityText ? `Eligibility Requirements: ${grant.eligibilityText}` : ''}
${grant.requirements ? `Application Requirements: ${grant.requirements}` : ''}
URL: ${grant.url}

## YOUR TASK
Analyze EVERY eligibility requirement and determine if the applicant meets it.

Be thorough and check for:
1. **Entity Type Requirements** - Does the grant require nonprofit, small business, etc.?
2. **Geographic Requirements** - Is this limited to certain states/regions?
3. **Industry Requirements** - Is this for specific industries only?
4. **Size Requirements** - Revenue limits, employee count limits?
5. **Experience Requirements** - Years in operation, prior grants?
6. **Documentation Requirements** - What will they need to provide?
7. **Match/Cost-Share Requirements** - Do they need to contribute funds?
8. **Hidden Requirements** - Things not obvious but important

## OUTPUT FORMAT
Return detailed eligibility analysis as JSON:

\`\`\`json
{
  "grantId": "${grant.id}",
  "grantTitle": "${grant.title}",

  "isEligible": true/false,
  "eligibilityScore": 0-100,
  "verdict": "definitely_eligible" | "likely_eligible" | "unclear" | "likely_ineligible" | "definitely_ineligible",
  "confidenceLevel": 0-100,

  "requirementChecks": [
    {
      "requirement": "Must be a 501(c)(3) nonprofit",
      "status": "met" | "likely_met" | "unclear" | "likely_not_met" | "not_met",
      "explanation": "The applicant is a nonprofit organization",
      "actionNeeded": "May need to provide 501(c)(3) determination letter"
    }
  ],

  "strengths": ["Clear match with grant focus area", "Located in target region"],
  "weaknesses": ["May be too early stage for this grant"],
  "missingInfo": ["Years in operation not specified"],

  "nextSteps": ["Review full grant guidelines", "Gather tax-exempt documentation"],
  "documentsNeeded": ["501(c)(3) letter", "Most recent tax return"],
  "estimatedPrepTime": "2-3 weeks",

  "dealBreakers": [],
  "warnings": ["Deadline is in 3 weeks - tight timeline"]
}
\`\`\`

Be honest and specific. If you're not sure about something, say so.
It's better to flag potential issues than to miss them.`

  try {
    const result = await generateJSON<EligibilityAnalysis>(prompt, true)
    return result
  } catch (error) {
    console.error('Eligibility check error:', error)
    return null
  }
}

/**
 * Quick eligibility pre-check (faster, less detailed)
 */
export async function quickEligibilityCheck(
  grant: GrantForEligibility,
  profile: UserProfile
): Promise<{
  isLikelyEligible: boolean
  confidence: number
  mainIssues: string[]
} | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Quick eligibility check:

APPLICANT: ${profile.entityType} in ${profile.state || 'USA'}, focus: ${profile.industryTags?.join(', ')}

GRANT: "${grant.title}" from ${grant.sponsor}
${grant.eligibilityText ? `Requirements: ${grant.eligibilityText}` : ''}

Is this applicant likely eligible? Return JSON:
{
  "isLikelyEligible": true/false,
  "confidence": 0-100,
  "mainIssues": ["Any obvious disqualifying issues"]
}`

  try {
    return await generateJSON(prompt, false)
  } catch {
    return null
  }
}

/**
 * Batch eligibility check for multiple grants
 */
export async function batchEligibilityCheck(
  grants: GrantForEligibility[],
  profile: UserProfile
): Promise<Map<string, { eligible: boolean; score: number; issues: string[] }>> {
  const results = new Map<string, { eligible: boolean; score: number; issues: string[] }>()

  // Check grants in parallel (limit concurrency)
  const batchSize = 3
  for (let i = 0; i < grants.length; i += batchSize) {
    const batch = grants.slice(i, i + batchSize)
    const checks = await Promise.all(
      batch.map(async (grant) => {
        const result = await quickEligibilityCheck(grant, profile)
        return {
          grantId: grant.id,
          result: result ? {
            eligible: result.isLikelyEligible,
            score: result.confidence,
            issues: result.mainIssues,
          } : {
            eligible: true, // Default to showing if check fails
            score: 50,
            issues: ['Could not verify eligibility'],
          },
        }
      })
    )

    for (const check of checks) {
      results.set(check.grantId, check.result)
    }
  }

  return results
}
