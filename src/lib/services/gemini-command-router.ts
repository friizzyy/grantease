/**
 * GEMINI COMMAND ROUTER SERVICE
 * -----------------------------
 * Receives natural language commands from the dashboard and routes them
 * to the appropriate AI action. Parses user intent, extracts parameters,
 * and returns structured responses with suggested next actions.
 *
 * Supports intents:
 * - find_grants: Search for grants (uses Google Search grounding)
 * - check_deadlines: Check upcoming grant deadlines
 * - improve_application: Get application improvement suggestions
 * - ask_question: General grant-related questions
 * - get_recommendations: Personalized grant recommendations
 * - check_eligibility: Quick eligibility pre-check
 * - unknown: Unrecognized intent
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
 * Structured result from the command router
 */
export interface CommandResult {
  intent: 'find_grants' | 'check_deadlines' | 'improve_application' | 'ask_question' | 'get_recommendations' | 'check_eligibility' | 'unknown'
  response: string
  suggestedAction?: {
    type: string
    route: string
    params?: Record<string, string>
  }
  grants?: Array<{ title: string; sponsor: string; url: string; relevance: string }>
}

/**
 * Parse JSON from Gemini response text, handling multiple formats.
 * Grounded responses may include markdown or other wrappers.
 */
function parseResponseJSON(text: string): unknown {
  // Try direct JSON parse first
  try {
    return JSON.parse(text)
  } catch {
    // Continue to fallback methods
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

  // Try finding a JSON object in the response
  const objectMatch = text.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0])
    } catch {
      // Failed
    }
  }

  return null
}

/**
 * Build a profile summary for context injection into prompts
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

  if (profile.companyName) {
    parts.push(`Organization Name: ${sanitizePromptInput(profile.companyName, 200)}`)
  }

  if (profile.companyDescription) {
    parts.push(`Description: ${sanitizePromptInput(profile.companyDescription, 500)}`)
  }

  if (profile.certifications?.length) {
    parts.push(`Certifications: ${sanitizePromptArray(profile.certifications)}`)
  }

  if (profile.fundingNeeds?.length) {
    parts.push(`Funding Needs: ${sanitizePromptArray(profile.fundingNeeds)}`)
  }

  return parts.join('\n')
}

/**
 * Route a natural language command to the appropriate AI action.
 * Uses Google Search grounding for grant-finding intents.
 */
export async function routeCommand(
  command: string,
  profile: UserProfile
): Promise<{ result: CommandResult | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    console.warn('[CommandRouter] Gemini not configured')
    return { result: null, usage: ZERO_USAGE }
  }

  const sanitizedCommand = sanitizePromptInput(command, 2000)
  const profileSummary = buildProfileSummary(profile)

  // First: classify the intent to decide whether we need grounding
  const classificationPrompt = `You are an AI assistant for a grant discovery platform. Analyze the user's command and determine their intent.

## USER PROFILE
${profileSummary}

## USER COMMAND
"${sanitizedCommand}"

## INTENT CLASSIFICATION
Classify the command into ONE of these intents:
- "find_grants" - User wants to search for or discover new grants
- "check_deadlines" - User wants to know about upcoming deadlines
- "improve_application" - User wants help improving a grant application
- "ask_question" - User has a general question about grants or the platform
- "get_recommendations" - User wants personalized grant recommendations based on their profile
- "check_eligibility" - User wants to check if they qualify for a specific grant
- "unknown" - Cannot determine the user's intent

Return JSON:
{
  "intent": "one_of_the_above",
  "extractedParams": {
    "keyword": "any search keyword extracted from the command",
    "grantName": "specific grant name if mentioned",
    "topic": "general topic or subject"
  }
}`

  try {
    const { data: classification, usage: classificationUsage } = await generateJSONWithUsage<{
      intent: CommandResult['intent']
      extractedParams: { keyword?: string; grantName?: string; topic?: string }
    }>(classificationPrompt)

    if (!classification) {
      return { result: null, usage: classificationUsage }
    }

    const intent = classification.intent
    const params = classification.extractedParams || {}

    // For grant-finding intents, use Google Search grounding
    if (intent === 'find_grants' || intent === 'get_recommendations') {
      return handleGrantSearch(sanitizedCommand, profile, profileSummary, intent, params, classificationUsage)
    }

    // For other intents, generate a helpful response without grounding
    return handleGeneralIntent(sanitizedCommand, profile, profileSummary, intent, params, classificationUsage)
  } catch (error) {
    console.error('[CommandRouter] Error:', error)
    return { result: null, usage: ZERO_USAGE }
  }
}

/**
 * Handle grant search/recommendation intents using Google Search grounding
 */
async function handleGrantSearch(
  command: string,
  profile: UserProfile,
  profileSummary: string,
  intent: CommandResult['intent'],
  params: { keyword?: string; grantName?: string; topic?: string },
  priorUsage: GeminiUsage
): Promise<{ result: CommandResult | null; usage: GeminiUsage }> {
  const ai = getAIClient()
  if (!ai) {
    return { result: null, usage: priorUsage }
  }

  const year = new Date().getFullYear()

  const prompt = `You are a grant research assistant. The user asked: "${command}"

## USER PROFILE
${profileSummary}

## YOUR TASK
Search for REAL, CURRENTLY OPEN grants that match the user's request and profile.
Focus on grants that are open for applications in ${year}.

${params.keyword ? `Search focus: "${sanitizePromptInput(params.keyword, 500)}"` : ''}
${params.topic ? `Topic: "${sanitizePromptInput(params.topic, 500)}"` : ''}

## RESPONSE FORMAT
Provide a helpful response and include any real grants you find.
Return a JSON object:

{
  "intent": "${intent}",
  "response": "A helpful 2-4 sentence response summarizing what you found and any advice",
  "suggestedAction": {
    "type": "navigate",
    "route": "/app/discover",
    "params": { "search": "relevant search term" }
  },
  "grants": [
    {
      "title": "Exact grant program name",
      "sponsor": "Organization offering the grant",
      "url": "https://actual-grant-page.gov",
      "relevance": "Brief explanation of why this matches"
    }
  ]
}

Rules:
1. Only include REAL grants with verifiable URLs
2. Only include grants that are CURRENTLY OPEN or opening soon
3. Include 3-5 grants maximum
4. If you cannot find verified grants, return an empty grants array and explain in the response
5. The response should be conversational and helpful`

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

    const groundedUsage = extractUsageFromResponse(response)
    const totalUsage: GeminiUsage = {
      promptTokens: priorUsage.promptTokens + groundedUsage.promptTokens,
      completionTokens: priorUsage.completionTokens + groundedUsage.completionTokens,
      totalTokens: priorUsage.totalTokens + groundedUsage.totalTokens,
    }

    const text = response.text
    if (!text) {
      return { result: null, usage: totalUsage }
    }

    const parsed = parseResponseJSON(text) as CommandResult | null
    if (parsed && parsed.response) {
      // Ensure intent is set correctly
      parsed.intent = intent
      return { result: parsed, usage: totalUsage }
    }

    // Fallback: use the raw text as the response
    return {
      result: {
        intent,
        response: text.slice(0, 1000),
        suggestedAction: {
          type: 'navigate',
          route: '/app/discover',
          params: params.keyword ? { search: params.keyword } : undefined,
        },
      },
      usage: totalUsage,
    }
  } catch (error) {
    console.error('[CommandRouter] Grant search error:', error)
    return { result: null, usage: priorUsage }
  }
}

/**
 * Handle non-search intents (deadlines, application help, questions, eligibility)
 */
async function handleGeneralIntent(
  command: string,
  _profile: UserProfile,
  profileSummary: string,
  intent: CommandResult['intent'],
  params: { keyword?: string; grantName?: string; topic?: string },
  priorUsage: GeminiUsage
): Promise<{ result: CommandResult | null; usage: GeminiUsage }> {
  // Build suggested action based on intent
  const suggestedActions: Record<string, { type: string; route: string }> = {
    check_deadlines: { type: 'navigate', route: '/app/saved' },
    improve_application: { type: 'navigate', route: '/app/workspace' },
    ask_question: { type: 'info', route: '/app/discover' },
    check_eligibility: { type: 'navigate', route: '/app/discover' },
    unknown: { type: 'info', route: '/app/discover' },
  }

  const prompt = `You are a helpful grant assistant on a grant discovery platform. The user asked: "${command}"

## USER PROFILE
${profileSummary}

## DETECTED INTENT: ${intent}
${params.grantName ? `Referenced Grant: "${sanitizePromptInput(params.grantName, 500)}"` : ''}
${params.topic ? `Topic: "${sanitizePromptInput(params.topic, 500)}"` : ''}

## YOUR TASK
Provide a helpful, actionable response based on the user's intent:

${intent === 'check_deadlines' ? '- Help them understand upcoming deadlines and how to stay organized\n- Suggest they check their saved searches for deadline alerts' : ''}
${intent === 'improve_application' ? '- Give specific, actionable advice for improving their grant application\n- Reference their profile strengths and areas for improvement' : ''}
${intent === 'ask_question' ? '- Answer their question clearly and concisely\n- Provide practical advice related to grant seeking' : ''}
${intent === 'check_eligibility' ? '- Help them understand eligibility criteria\n- Suggest they use the eligibility checker on specific grants' : ''}
${intent === 'unknown' ? '- Try to provide a helpful response anyway\n- Suggest relevant features they might want to use' : ''}

Return JSON:
{
  "intent": "${intent}",
  "response": "A helpful 2-4 sentence response with actionable advice",
  "suggestedAction": {
    "type": "${suggestedActions[intent]?.type || 'info'}",
    "route": "${suggestedActions[intent]?.route || '/app/discover'}"
  }
}`

  try {
    const { data, usage: responseUsage } = await generateJSONWithUsage<CommandResult>(prompt)

    const totalUsage: GeminiUsage = {
      promptTokens: priorUsage.promptTokens + responseUsage.promptTokens,
      completionTokens: priorUsage.completionTokens + responseUsage.completionTokens,
      totalTokens: priorUsage.totalTokens + responseUsage.totalTokens,
    }

    if (data && data.response) {
      // Ensure intent is preserved from classification
      data.intent = intent
      return { result: data, usage: totalUsage }
    }

    return { result: null, usage: totalUsage }
  } catch (error) {
    console.error('[CommandRouter] General intent error:', error)
    return { result: null, usage: priorUsage }
  }
}
