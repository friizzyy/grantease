/**
 * GEMINI COMPETITIVE INTELLIGENCE SERVICE
 * ----------------------------------------
 * Uses Google Search grounding to research a specific grant and provide
 * competitive intelligence: typical winners, winning strategies, common
 * pitfalls, and how the user's profile compares.
 *
 * Two-pass approach:
 * 1. Grounded search (getAIClient + googleSearch tool) to gather real data
 * 2. Structured JSON generation (generateJSONWithUsage) to format the analysis
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
 * Grant details needed for competitive analysis
 */
export interface GrantForAnalysis {
  id: string
  title: string
  sponsor: string
  description?: string
  url?: string
  amountMin?: number
  amountMax?: number
}

/**
 * Full competitive intelligence report
 */
export interface CompetitiveAnalysis {
  grantOverview: string
  typicalWinners: {
    organizationTypes: string[]
    commonCharacteristics: string[]
    averageSize: string
    geographicPattern: string
  }
  winningStrategies: Array<{
    strategy: string
    description: string
    importance: 'critical' | 'important' | 'helpful'
  }>
  commonMistakes: Array<{
    mistake: string
    impact: string
    howToAvoid: string
  }>
  competitiveEdge: {
    userStrengths: string[]
    userWeaknesses: string[]
    differentiators: string[]
    suggestedAngle: string
  }
  fundingTrends: {
    recentAwardCount?: string
    averageAwardSize?: string
    successRate?: string
    trending: string
  }
  resources: Array<{
    title: string
    description: string
    url?: string
  }>
}

/**
 * Build a summary of the user's profile for competitive comparison
 */
function buildProfileSummary(profile: UserProfile): string {
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

  if (profile.state) {
    parts.push(`Location: ${sanitizePromptInput(profile.state, 100)}, USA`)
  }

  if (profile.industryTags?.length) {
    parts.push(`Focus Areas: ${sanitizePromptArray(profile.industryTags)}`)
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
    parts.push(`Annual Budget/Revenue: ${budgetLabels[profile.annualBudget] || sanitizePromptInput(profile.annualBudget, 50)}`)
  }

  if (profile.certifications?.length) {
    parts.push(`Certifications: ${sanitizePromptArray(profile.certifications)}`)
  }

  if (profile.specializations?.length) {
    parts.push(`Specializations: ${sanitizePromptArray(profile.specializations)}`)
  }

  if (profile.companyDescription) {
    parts.push(`Description: ${sanitizePromptInput(profile.companyDescription, 500)}`)
  }

  return parts.join('\n')
}

/**
 * Format currency amount for display in prompts
 */
function formatAmount(amount: number | undefined): string {
  if (!amount) return 'Not specified'
  return `$${amount.toLocaleString('en-US')}`
}

/**
 * Combine usage from two Gemini calls
 */
function combineUsage(a: GeminiUsage, b: GeminiUsage): GeminiUsage {
  return {
    promptTokens: a.promptTokens + b.promptTokens,
    completionTokens: a.completionTokens + b.completionTokens,
    totalTokens: a.totalTokens + b.totalTokens,
  }
}

/**
 * Analyze the competitive landscape for a specific grant.
 *
 * Pass 1: Grounded Google Search to find real-world data about past awardees,
 *          success rates, and reviewer criteria.
 * Pass 2: Structured JSON generation to format the research into a
 *          CompetitiveAnalysis object, comparing against the user's profile.
 */
export async function analyzeCompetition(
  grant: GrantForAnalysis,
  profile: UserProfile
): Promise<{ result: CompetitiveAnalysis | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const ai = getAIClient()
  if (!ai) {
    return { result: null, usage: ZERO_USAGE }
  }

  const sanitizedTitle = sanitizePromptInput(grant.title, 500)
  const sanitizedSponsor = sanitizePromptInput(grant.sponsor, 500)
  const sanitizedDescription = sanitizePromptInput(grant.description, 2000)
  const sanitizedUrl = sanitizePromptInput(grant.url, 500)

  // --- Pass 1: Grounded web search for competitive intelligence ---
  const searchPrompt = `You are a grant research analyst. Research the following grant program to gather competitive intelligence.

## GRANT PROGRAM
Title: ${sanitizedTitle}
Sponsor: ${sanitizedSponsor}
${grant.description ? `Description: ${sanitizedDescription}` : ''}
${grant.url ? `URL: ${sanitizedUrl}` : ''}
${grant.amountMin || grant.amountMax ? `Funding Range: ${formatAmount(grant.amountMin)} - ${formatAmount(grant.amountMax)}` : ''}

## RESEARCH TASKS
Search the web thoroughly to find:

1. **Past Awardees**: Who has received this grant or similar grants from ${sanitizedSponsor} in recent years? Look for award announcements, press releases, and news articles.

2. **Award Patterns**: What types of organizations typically win? Are there geographic patterns? What size organizations succeed?

3. **Success Rates & Statistics**: What is the typical number of applicants vs awards? What are average award sizes? How competitive is this program?

4. **Reviewer Criteria**: What do reviewers look for? Are there published scoring rubrics, evaluation criteria, or reviewer guidelines?

5. **Common Themes**: What project themes or approaches seem to succeed? Are there trends in what gets funded?

6. **Application Tips**: Are there published tips, webinars, or guidance documents from the sponsor about how to apply successfully?

7. **Related Resources**: Links to helpful resources, past award lists, application guides, or informational sessions.

Provide a thorough research summary with specific examples and verifiable details. Include URLs where possible.`

  let searchResearchText: string | null = null
  let searchUsage: GeminiUsage = ZERO_USAGE

  try {
    const searchResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: searchPrompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        tools: [{ googleSearch: {} }],
      },
    })

    searchResearchText = searchResponse.text ?? null
    searchUsage = extractUsageFromResponse(searchResponse)
  } catch (error) {
    console.error('[CompetitiveAnalysis] Grounded search error:', error)
    return { result: null, usage: ZERO_USAGE }
  }

  if (!searchResearchText) {
    console.warn('[CompetitiveAnalysis] Empty response from grounded search')
    return { result: null, usage: searchUsage }
  }

  // --- Pass 2: Structure the research into CompetitiveAnalysis JSON ---
  const profileSummary = buildProfileSummary(profile)

  const structuringPrompt = `You are a grant strategy advisor. Structure the following research into a competitive analysis report.

## GRANT BEING ANALYZED
Title: ${sanitizedTitle}
Sponsor: ${sanitizedSponsor}
${grant.amountMin || grant.amountMax ? `Funding Range: ${formatAmount(grant.amountMin)} - ${formatAmount(grant.amountMax)}` : ''}

## RESEARCH DATA
${sanitizePromptInput(searchResearchText, 6000)}

## APPLICANT PROFILE
${profileSummary}

## YOUR TASK
Based on the research above, create a competitive analysis comparing the applicant's profile to typical winners. Be specific and actionable.

Return a JSON object with this exact structure:
{
  "grantOverview": "2-3 sentence summary of the grant program and its competitive landscape",
  "typicalWinners": {
    "organizationTypes": ["Types of organizations that typically win"],
    "commonCharacteristics": ["Shared traits of successful applicants"],
    "averageSize": "Typical size of winning organizations",
    "geographicPattern": "Geographic trends in awards"
  },
  "winningStrategies": [
    {
      "strategy": "Strategy name",
      "description": "How to implement this strategy",
      "importance": "critical" or "important" or "helpful"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "What applicants do wrong",
      "impact": "How it hurts their application",
      "howToAvoid": "What to do instead"
    }
  ],
  "competitiveEdge": {
    "userStrengths": ["Strengths of THIS applicant relative to typical winners"],
    "userWeaknesses": ["Areas where THIS applicant may fall short"],
    "differentiators": ["Unique angles this applicant could emphasize"],
    "suggestedAngle": "Recommended overall approach for the application"
  },
  "fundingTrends": {
    "recentAwardCount": "Number of recent awards if known",
    "averageAwardSize": "Average award amount if known",
    "successRate": "Estimated success rate if known",
    "trending": "Description of current funding trends for this program"
  },
  "resources": [
    {
      "title": "Resource name",
      "description": "Why it's useful",
      "url": "https://example.com (if available)"
    }
  ]
}

Be honest about unknowns. If you couldn't find specific data (e.g., exact success rate), say so rather than guessing. Focus on actionable insights.`

  try {
    const { data, usage: structureUsage } = await generateJSONWithUsage<CompetitiveAnalysis>(structuringPrompt)
    const totalUsage = combineUsage(searchUsage, structureUsage)

    return { result: data, usage: totalUsage }
  } catch (error) {
    console.error('[CompetitiveAnalysis] Structuring error:', error)
    return { result: null, usage: searchUsage }
  }
}
