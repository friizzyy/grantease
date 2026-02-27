/**
 * GEMINI SUCCESS PREDICTOR SERVICE
 * ---------------------------------
 * Predicts the likelihood of a successful grant application based on:
 * - User profile completeness and quality
 * - Grant requirements match
 * - Historical context (what types of organizations typically win this grant)
 * - Application preparedness (vault completeness)
 *
 * Uses generateJSONWithUsage for structured predictions and
 * Google Search grounding to research competitive landscape.
 */

import {
  getAIClient,
  extractUsageFromResponse,
  generateJSONWithUsage,
  isGeminiConfigured,
  GEMINI_MODEL,
  type GeminiUsage,
} from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Grant data needed for success prediction
 */
export interface GrantForPrediction {
  id: string
  title: string
  sponsor: string
  description?: string
  eligibility?: string
  requirements?: string
  amountMin?: number
  amountMax?: number
}

/**
 * Detailed success prediction result
 */
export interface SuccessPrediction {
  overallScore: number // 0-100
  confidence: number // 0-100
  factors: Array<{
    name: string
    score: number
    weight: number
    explanation: string
    improvementTip?: string
  }>
  strengthSummary: string
  weaknessSummary: string
  improvementPlan: Array<{
    action: string
    impact: 'high' | 'medium' | 'low'
    effort: 'easy' | 'moderate' | 'hard'
    description: string
  }>
  competitivePosition: string // "strong", "moderate", "needs work"
  estimatedSuccessRate: string // "High (>50%)", "Moderate (25-50%)", "Low (<25%)"
}

/**
 * Competitive landscape data from Google Search grounding
 */
interface CompetitiveLandscape {
  typicalWinners: string
  competitionLevel: string
  keySuccessFactors: string[]
}

/**
 * Build a profile context string for the prompt
 */
function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = []

  const entityLabels: Record<string, string> = {
    individual: 'Individual / Sole Proprietor',
    nonprofit: 'Nonprofit Organization (501c3)',
    small_business: 'Small Business',
    for_profit: 'For-Profit Company',
    educational: 'Educational Institution',
    government: 'Government Entity',
    tribal: 'Tribal Organization',
  }
  parts.push(`Organization Type: ${entityLabels[profile.entityType] || sanitizePromptInput(profile.entityType, 100)}`)

  if (profile.companyName) {
    parts.push(`Organization Name: ${sanitizePromptInput(profile.companyName, 200)}`)
  }

  if (profile.companyDescription) {
    parts.push(`Description: ${sanitizePromptInput(profile.companyDescription, 500)}`)
  }

  if (profile.state) {
    parts.push(`Location: ${sanitizePromptInput(profile.state, 100)}, USA`)
  }

  if (profile.industryTags?.length) {
    parts.push(`Industries/Focus Areas: ${sanitizePromptArray(profile.industryTags)}`)
  }

  if (profile.sizeBand) {
    const sizeLabels: Record<string, string> = {
      solo: '1 person',
      small: '2-10 employees',
      medium: '11-50 employees',
      large: '50+ employees',
    }
    parts.push(`Size: ${sizeLabels[profile.sizeBand] || sanitizePromptInput(profile.sizeBand, 50)}`)
  }

  if (profile.stage) {
    const stageLabels: Record<string, string> = {
      idea: 'Idea stage',
      early: 'Early stage (0-2 years)',
      growth: 'Growth stage (2-5 years)',
      established: 'Established (5+ years)',
    }
    parts.push(`Stage: ${stageLabels[profile.stage] || sanitizePromptInput(profile.stage, 50)}`)
  }

  if (profile.annualBudget) {
    const budgetLabels: Record<string, string> = {
      under_100k: 'Under $100,000',
      '100k_500k': '$100,000 - $500,000',
      '500k_1m': '$500,000 - $1 million',
      '1m_5m': '$1 million - $5 million',
      over_5m: 'Over $5 million',
    }
    parts.push(`Annual Budget: ${budgetLabels[profile.annualBudget] || sanitizePromptInput(profile.annualBudget, 50)}`)
  }

  if (profile.certifications?.length) {
    parts.push(`Certifications: ${sanitizePromptArray(profile.certifications)}`)
  }

  if (profile.specializations?.length) {
    parts.push(`Specializations: ${sanitizePromptArray(profile.specializations)}`)
  }

  if (profile.fundingNeeds?.length) {
    parts.push(`Funding Needs: ${sanitizePromptArray(profile.fundingNeeds)}`)
  }

  if (profile.farmDetails) {
    const farmParts: string[] = []
    if (profile.farmDetails.farmType) farmParts.push(`Type: ${sanitizePromptInput(profile.farmDetails.farmType, 100)}`)
    if (profile.farmDetails.acreage) farmParts.push(`Acreage: ${sanitizePromptInput(profile.farmDetails.acreage, 50)}`)
    if (profile.farmDetails.organic) farmParts.push('Certified Organic')
    if (profile.farmDetails.sustainable) farmParts.push('Sustainable Practices')
    if (farmParts.length) {
      parts.push(`Farm Details: ${farmParts.join(', ')}`)
    }
  }

  return parts.join('\n')
}

/**
 * Build a grant context string for the prompt
 */
function buildGrantContext(grant: GrantForPrediction): string {
  const parts: string[] = []

  parts.push(`Title: ${sanitizePromptInput(grant.title, 500)}`)
  parts.push(`Sponsor: ${sanitizePromptInput(grant.sponsor, 500)}`)

  if (grant.description) {
    parts.push(`Description: ${sanitizePromptInput(grant.description)}`)
  }

  if (grant.eligibility) {
    parts.push(`Eligibility: ${sanitizePromptInput(grant.eligibility)}`)
  }

  if (grant.requirements) {
    parts.push(`Requirements: ${sanitizePromptInput(grant.requirements)}`)
  }

  if (grant.amountMin !== undefined || grant.amountMax !== undefined) {
    const min = grant.amountMin ? `$${grant.amountMin.toLocaleString()}` : 'N/A'
    const max = grant.amountMax ? `$${grant.amountMax.toLocaleString()}` : 'N/A'
    parts.push(`Funding Range: ${min} - ${max}`)
  }

  return parts.join('\n')
}

/**
 * Research the competitive landscape for this grant using Google Search grounding.
 * Returns insights about typical winners and competition level.
 */
async function researchCompetitiveLandscape(
  grant: GrantForPrediction
): Promise<{ landscape: CompetitiveLandscape | null; usage: GeminiUsage }> {
  const ai = getAIClient()
  if (!ai) {
    return { landscape: null, usage: ZERO_USAGE }
  }

  const prompt = `Research the grant program "${sanitizePromptInput(grant.title, 500)}" from "${sanitizePromptInput(grant.sponsor, 500)}".

Find information about:
1. What types of organizations typically receive this grant?
2. How competitive is this grant program? (number of applicants vs awards)
3. What are the key factors that successful applicants have in common?

Return a JSON object:
{
  "typicalWinners": "Brief description of typical winners (e.g., 'Established nonprofits with 5+ years of community service experience')",
  "competitionLevel": "low" | "moderate" | "high" | "very_high" | "unknown",
  "keySuccessFactors": ["Factor 1", "Factor 2", "Factor 3"]
}

If you cannot find specific information about this grant program, provide reasonable estimates based on similar programs from the same sponsor. Be honest if information is limited.`

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        tools: [{ googleSearch: {} }],
      },
    })

    const usage = extractUsageFromResponse(response)
    const text = response.text

    if (!text) {
      return { landscape: null, usage }
    }

    // Parse JSON from potentially markdown-wrapped response
    let parsed: CompetitiveLandscape | null = null
    try {
      parsed = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1])
        } catch {
          // Continue
        }
      }
      if (!parsed) {
        const objectMatch = text.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          try {
            parsed = JSON.parse(objectMatch[0])
          } catch {
            // Failed to parse
          }
        }
      }
    }

    return { landscape: parsed, usage }
  } catch (error) {
    console.error('[SuccessPredictor] Competitive landscape research error:', error)
    return { landscape: null, usage: ZERO_USAGE }
  }
}

/**
 * Predict the likelihood of a successful grant application.
 *
 * Evaluates the match across multiple dimensions:
 * 1. Profile-grant alignment (entity type, industry, location)
 * 2. Organizational readiness (stage, budget, certifications)
 * 3. Application preparedness (vault completeness)
 * 4. Competitive positioning (researched via Google Search)
 *
 * @param grant - Grant details for prediction
 * @param profile - User's organizational profile
 * @param vaultCompleteness - Optional 0-100 score of how complete the user's vault is
 */
export async function predictSuccess(
  grant: GrantForPrediction,
  profile: UserProfile,
  vaultCompleteness?: number
): Promise<{ result: SuccessPrediction | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    console.warn('[SuccessPredictor] Gemini not configured')
    return { result: null, usage: ZERO_USAGE }
  }

  // Step 1: Research competitive landscape with Google Search grounding
  const { landscape, usage: landscapeUsage } = await researchCompetitiveLandscape(grant)

  const profileContext = buildProfileContext(profile)
  const grantContext = buildGrantContext(grant)

  // Step 2: Generate the prediction using structured JSON output
  const prompt = `You are a grant success prediction expert. Analyze the likelihood of this applicant winning this grant.

## APPLICANT PROFILE
${profileContext}

## GRANT DETAILS
${grantContext}

## APPLICATION PREPAREDNESS
Vault Completeness: ${vaultCompleteness !== undefined ? `${vaultCompleteness}%` : 'Not assessed'}
${vaultCompleteness !== undefined && vaultCompleteness < 50 ? '(Warning: Low vault completeness - applicant may not have required documents ready)' : ''}

## COMPETITIVE LANDSCAPE
${landscape ? `Typical Winners: ${sanitizePromptInput(landscape.typicalWinners, 500)}
Competition Level: ${sanitizePromptInput(landscape.competitionLevel, 50)}
Key Success Factors: ${landscape.keySuccessFactors?.map(f => sanitizePromptInput(f, 200)).join(', ') || 'Not available'}` : 'Competitive landscape data not available - use your best judgment based on the grant type and sponsor.'}

## YOUR TASK
Evaluate the applicant's chances of successfully winning this grant. Consider:

1. **Profile-Grant Alignment** (weight: 30%)
   - Does the entity type match?
   - Are their industries relevant?
   - Is their location eligible?

2. **Organizational Readiness** (weight: 25%)
   - Is their stage appropriate?
   - Is their budget/revenue in the right range?
   - Do they have relevant experience?

3. **Application Preparedness** (weight: 20%)
   - How complete is their vault/documentation?
   - Do they have the certifications needed?
   - Are they likely to have the required documents?

4. **Competitive Positioning** (weight: 15%)
   - How do they compare to typical winners?
   - What advantages or disadvantages do they have?

5. **Grant Complexity Match** (weight: 10%)
   - Is this grant appropriate for their experience level?
   - Can they realistically fulfill the grant requirements?

## OUTPUT FORMAT
Return detailed success prediction as JSON:

{
  "overallScore": 0-100,
  "confidence": 0-100,
  "factors": [
    {
      "name": "Profile-Grant Alignment",
      "score": 0-100,
      "weight": 30,
      "explanation": "Clear explanation of the score",
      "improvementTip": "Specific actionable tip (optional, only if score < 80)"
    },
    {
      "name": "Organizational Readiness",
      "score": 0-100,
      "weight": 25,
      "explanation": "...",
      "improvementTip": "..."
    },
    {
      "name": "Application Preparedness",
      "score": 0-100,
      "weight": 20,
      "explanation": "...",
      "improvementTip": "..."
    },
    {
      "name": "Competitive Positioning",
      "score": 0-100,
      "weight": 15,
      "explanation": "...",
      "improvementTip": "..."
    },
    {
      "name": "Grant Complexity Match",
      "score": 0-100,
      "weight": 10,
      "explanation": "...",
      "improvementTip": "..."
    }
  ],
  "strengthSummary": "2-3 sentences summarizing key strengths",
  "weaknessSummary": "2-3 sentences summarizing key weaknesses and risks",
  "improvementPlan": [
    {
      "action": "Short action title",
      "impact": "high" | "medium" | "low",
      "effort": "easy" | "moderate" | "hard",
      "description": "Detailed description of what to do and why"
    }
  ],
  "competitivePosition": "strong" | "moderate" | "needs work",
  "estimatedSuccessRate": "High (>50%)" | "Moderate (25-50%)" | "Low (<25%)"
}

## RULES
1. Be realistic - don't inflate scores to make the applicant feel good
2. The overallScore should be a weighted average of the factor scores
3. Include 3-5 improvement plan items, prioritized by impact/effort ratio
4. The confidence score reflects how sure you are about the prediction (lower if information is limited)
5. Be specific in explanations - reference actual profile/grant details
6. improvementTip is optional per factor - only include if score < 80`

  try {
    const { data, usage: predictionUsage } = await generateJSONWithUsage<SuccessPrediction>(prompt)

    const totalUsage: GeminiUsage = {
      promptTokens: landscapeUsage.promptTokens + predictionUsage.promptTokens,
      completionTokens: landscapeUsage.completionTokens + predictionUsage.completionTokens,
      totalTokens: landscapeUsage.totalTokens + predictionUsage.totalTokens,
    }

    return { result: data, usage: totalUsage }
  } catch (error) {
    console.error('[SuccessPredictor] Prediction error:', error)
    return { result: null, usage: landscapeUsage }
  }
}
