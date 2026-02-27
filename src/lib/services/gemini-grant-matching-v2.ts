/**
 * GEMINI GRANT MATCHING SERVICE V2
 * --------------------------------
 * AI-powered grant matching with strict JSON validation.
 *
 * PRINCIPLES:
 * 1. LLM does NOT decide eligibility - only provides summaries/explanations
 * 2. All responses are validated against strict schemas
 * 3. Graceful fallback when LLM fails
 * 4. Never invent missing data
 */

import { generateText, isGeminiConfigured } from './gemini-client'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'
import {
  GrantMatchResultSchema,
  GrantMatchResult,
  getJSONSchemaInstruction,
  createFallbackMatchResult,
  validateGrantMatchResults,
} from '@/lib/schemas/llm-responses'
import { UserProfileForScoring } from '@/lib/scoring/engine'
import { GrantForEligibility } from '@/lib/eligibility/engine'
import {
  ENTITY_TYPE_LABELS,
  INDUSTRY_LABELS,
  IndustryTag,
  EntityType,
  SIZE_BAND_LABELS,
  BUDGET_RANGE_LABELS,
  BudgetRange,
  formatFundingDisplay,
} from '@/lib/constants/taxonomy'

// ============= TYPES =============

export interface GrantForAIMatching {
  id: string
  title: string
  sponsor: string
  summary?: string | null
  description?: string | null
  categories: string[]
  eligibility: string[]
  amountMin?: number | null
  amountMax?: number | null
  amountText?: string | null
  deadlineDate?: Date | string | null
  url: string
}

export interface AIMatchingOptions {
  maxRetries?: number
  strictMode?: boolean  // If true, reject any invalid responses
  batchSize?: number    // Max grants per API call
}

// ============= PROFILE CONTEXT BUILDER =============

/**
 * Build sanitized profile context for LLM
 * Only includes structured, canonical values
 */
function buildProfileContext(profile: UserProfileForScoring): string {
  const parts: string[] = []

  // Entity type (use label lookup for known types, sanitize fallback)
  if (profile.entityType) {
    const label = ENTITY_TYPE_LABELS[profile.entityType as EntityType] || sanitizePromptInput(profile.entityType, 100)
    parts.push(`Organization Type: ${label}`)
  }

  // Location
  if (profile.state) {
    parts.push(`Location: ${sanitizePromptInput(profile.state, 100)}, USA`)
  }

  // Focus areas (use label lookup for known tags, sanitize fallback)
  if (profile.industryTags && profile.industryTags.length > 0) {
    const labels = profile.industryTags.map(tag =>
      INDUSTRY_LABELS[tag as IndustryTag] || sanitizePromptInput(tag, 100)
    ).join(', ')
    parts.push(`Focus Areas: ${labels}`)
  }

  // Size
  if (profile.sizeBand) {
    const label = SIZE_BAND_LABELS[profile.sizeBand as keyof typeof SIZE_BAND_LABELS] || sanitizePromptInput(profile.sizeBand, 50)
    parts.push(`Team Size: ${label}`)
  }

  // Budget
  if (profile.annualBudget) {
    const label = BUDGET_RANGE_LABELS[profile.annualBudget as BudgetRange] || sanitizePromptInput(profile.annualBudget, 50)
    parts.push(`Annual Budget: ${label}`)
  }

  // Goals
  if (profile.goals && profile.goals.length > 0) {
    parts.push(`Funding Goals: ${sanitizePromptArray(profile.goals)}`)
  }

  return parts.join('\n')
}

/**
 * Format grants for LLM prompt
 */
function formatGrantsForPrompt(grants: GrantForAIMatching[]): string {
  return grants.map((g, i) => {
    const funding = formatFundingDisplay(g.amountMin, g.amountMax, g.amountText)
    const deadline = g.deadlineDate
      ? new Date(g.deadlineDate).toLocaleDateString()
      : 'Rolling/TBD'

    return `
### Grant ${i + 1}
- ID: ${g.id}
- Title: ${sanitizePromptInput(g.title, 500)}
- Sponsor: ${sanitizePromptInput(g.sponsor, 500)}
- Summary: ${sanitizePromptInput(g.summary, 1000) || 'No summary available'}
- Categories: ${sanitizePromptArray(g.categories)}
- Eligibility: ${sanitizePromptArray(g.eligibility)}
- Funding: ${funding}
- Deadline: ${deadline}`
  }).join('\n')
}

// ============= MAIN MATCHING FUNCTION =============

/**
 * Match grants using Gemini AI with strict validation
 *
 * Returns AI-generated match explanations for grants that have
 * ALREADY passed deterministic eligibility filters.
 */
export async function matchGrantsWithAI(
  grants: GrantForAIMatching[],
  profile: UserProfileForScoring,
  options: AIMatchingOptions = {}
): Promise<GrantMatchResult[]> {
  const {
    maxRetries = 2,
    strictMode = false,
    batchSize = 30,
  } = options

  // Check configuration
  if (!isGeminiConfigured()) {
    console.warn('[Gemini] Not configured, returning fallback results')
    return grants.map(g => createFallbackMatchResult(g.id))
  }

  if (grants.length === 0) {
    return []
  }

  const profileContext = buildProfileContext(profile)

  // Process in batches if needed
  if (grants.length > batchSize) {
    const results: GrantMatchResult[] = []
    for (let i = 0; i < grants.length; i += batchSize) {
      const batch = grants.slice(i, i + batchSize)
      const batchResults = await processBatch(batch, profileContext, profile, maxRetries, strictMode)
      results.push(...batchResults)
    }
    return results
  }

  return processBatch(grants, profileContext, profile, maxRetries, strictMode)
}

/**
 * Process a batch of grants
 */
async function processBatch(
  grants: GrantForAIMatching[],
  profileContext: string,
  profile: UserProfileForScoring,
  maxRetries: number,
  strictMode: boolean
): Promise<GrantMatchResult[]> {
  const prompt = buildMatchingPrompt(grants, profileContext, profile)

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await generateText(prompt, true) // Use Pro model

      if (!response) {
        throw new Error(`Gemini returned empty response while matching ${grants.length} grant(s) on attempt ${attempt + 1}`)
      }

      // Parse and validate response
      const parsed = parseJSONResponse(response)

      if (!parsed) {
        throw new Error(`Failed to parse JSON from Gemini response while matching ${grants.length} grant(s) on attempt ${attempt + 1}. Response starts with: "${response.substring(0, 100)}"`)
      }

      // Validate against schema
      const validated = validateGrantMatchResults(parsed)

      if (validated && validated.length > 0) {
        // Map results back to grant IDs
        return mapResultsToGrants(validated, grants)
      }

      if (strictMode) {
        throw new Error(`Gemini response validation failed in strict mode for ${grants.length} grant(s) on attempt ${attempt + 1}: parsed ${Array.isArray(parsed) ? parsed.length : 0} results but none passed schema validation`)
      }

      // Partial success - return what we can
      console.warn('[Gemini] Partial validation success, using fallbacks for missing grants')
      return createFallbacksForMissing(validated || [], grants)

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[Gemini] Attempt ${attempt + 1} failed:`, lastError.message)

      // On last attempt, use tighter prompt
      if (attempt < maxRetries) {
        await sleep(1000 * (attempt + 1)) // Exponential backoff
      }
    }
  }

  console.error('[Gemini] All attempts failed, using fallbacks')
  return grants.map(g => createFallbackMatchResult(g.id))
}

/**
 * Build the matching prompt
 */
function buildMatchingPrompt(
  grants: GrantForAIMatching[],
  profileContext: string,
  profile: UserProfileForScoring
): string {
  return `You are a grant advisor providing match explanations for a user.

IMPORTANT: These grants have ALREADY been filtered for eligibility. Your job is to:
1. Explain WHY each grant is a good fit (or not)
2. Provide helpful next steps
3. Identify what the funding could be used for
4. Flag any concerns

DO NOT:
- Guess or invent missing information
- Decide eligibility (already determined)
- Provide inaccurate funding amounts or deadlines

## USER PROFILE
${profileContext}

## GRANTS TO ANALYZE
${formatGrantsForPrompt(grants)}

## YOUR TASK
For each grant, provide a match analysis. Focus on:
1. How well it fits the user's specific situation
2. What they could realistically fund with it
3. Practical next steps to apply
4. Any concerns or things to verify

${getJSONSchemaInstruction()}

User's primary focus: ${profile.industryTags?.slice(0, 2).map(t => INDUSTRY_LABELS[t as IndustryTag] || sanitizePromptInput(t, 100)).join(', ') || 'Not specified'}
Organization type: ${profile.entityType ? (ENTITY_TYPE_LABELS[profile.entityType as EntityType] || sanitizePromptInput(profile.entityType, 100)) : 'Not specified'}

Return the JSON array now:`
}

/**
 * Parse JSON from LLM response
 */
function parseJSONResponse(response: string): unknown {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim())
    } catch {
      // Continue to try other methods
    }
  }

  // Try to parse as raw JSON
  try {
    return JSON.parse(response.trim())
  } catch {
    // Continue
  }

  // Try to find JSON array in response
  const arrayMatch = response.match(/\[[\s\S]*\]/)
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
 * Map validated results back to grants (by ID)
 */
function mapResultsToGrants(
  results: GrantMatchResult[],
  grants: GrantForAIMatching[]
): GrantMatchResult[] {
  const grantIds = new Set(grants.map(g => g.id))
  const resultMap = new Map(results.map(r => [r.grantId, r]))

  return grants.map(grant => {
    const result = resultMap.get(grant.id)
    if (result) {
      return result
    }
    // No result for this grant - create fallback
    return createFallbackMatchResult(grant.id)
  })
}

/**
 * Create fallbacks for missing grants
 */
function createFallbacksForMissing(
  results: GrantMatchResult[],
  grants: GrantForAIMatching[]
): GrantMatchResult[] {
  const resultIds = new Set(results.map(r => r.grantId))

  return grants.map(grant => {
    const existing = results.find(r => r.grantId === grant.id)
    if (existing) {
      return existing
    }
    return createFallbackMatchResult(grant.id)
  })
}

/**
 * Utility sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============= SINGLE GRANT ANALYSIS =============

/**
 * Get detailed analysis for a single grant
 */
export async function analyzeGrantFit(
  grant: GrantForAIMatching,
  profile: UserProfileForScoring
): Promise<GrantMatchResult> {
  const results = await matchGrantsWithAI([grant], profile, { maxRetries: 1 })
  return results[0] || createFallbackMatchResult(grant.id)
}

// ============= RERANK FUNCTION =============

/**
 * Rerank grants using AI (after deterministic scoring)
 *
 * Takes the top N grants from deterministic scoring and
 * uses AI to refine the order based on nuanced understanding.
 */
export async function rerankGrantsWithAI(
  grants: Array<GrantForAIMatching & { deterministicScore: number }>,
  profile: UserProfileForScoring,
  limit: number = 20
): Promise<Array<GrantForAIMatching & { deterministicScore: number; aiMatchResult: GrantMatchResult }>> {
  // Get AI analysis
  const aiResults = await matchGrantsWithAI(grants, profile)

  // Create result map
  const aiResultMap = new Map(aiResults.map(r => [r.grantId, r]))

  // Combine scores and rerank
  const combined = grants.map(grant => ({
    ...grant,
    aiMatchResult: aiResultMap.get(grant.id) || createFallbackMatchResult(grant.id),
  }))

  // Sort by combined score (deterministic + AI)
  combined.sort((a, b) => {
    // Primary: AI match score (if confident)
    const aAiScore = a.aiMatchResult.confidence !== 'low' ? a.aiMatchResult.matchScore : 0
    const bAiScore = b.aiMatchResult.confidence !== 'low' ? b.aiMatchResult.matchScore : 0

    // Combined score: 60% deterministic, 40% AI
    const aCombined = (a.deterministicScore * 0.6) + (aAiScore * 0.4)
    const bCombined = (b.deterministicScore * 0.6) + (bAiScore * 0.4)

    return bCombined - aCombined
  })

  return combined.slice(0, limit)
}

// ============= ACCESSIBILITY CHECK =============

/**
 * Pre-filter grants for accessibility (before full AI matching)
 * Uses simple heuristics to remove obviously inaccessible grants
 */
export function preFilterForAccessibility(grants: GrantForAIMatching[]): GrantForAIMatching[] {
  return grants.filter(grant => {
    const title = grant.title.toLowerCase()
    const sponsor = grant.sponsor.toLowerCase()
    const summary = (grant.summary || '').toLowerCase()
    const combined = `${title} ${sponsor} ${summary}`

    // Hard rejections - not for regular people
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
      return false
    }

    return true
  })
}
