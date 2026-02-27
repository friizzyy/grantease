/**
 * GEMINI AI CLIENT
 * ----------------
 * Centralized Gemini AI configuration using the new @google/genai SDK.
 * Uses gemini-2.0-flash for all tasks with retry logic and proper JSON mode.
 */

import { GoogleGenAI, type GenerateContentResponse } from '@google/genai'

/** Default model for all AI tasks */
export const GEMINI_MODEL = 'gemini-2.0-flash'

/** Max retries for transient failures */
const MAX_RETRIES = 2
const BASE_DELAY_MS = 1000

/**
 * Token usage metadata from a Gemini API response
 */
export interface GeminiUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/**
 * Response from Gemini that includes both content and usage metadata
 */
export interface GeminiTextResponse {
  text: string | null
  usage: GeminiUsage
}

/**
 * Response from Gemini JSON generation that includes parsed data and usage metadata
 */
export interface GeminiJSONResponse<T> {
  data: T | null
  usage: GeminiUsage
}

/** Default zero usage for error/null cases */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

let aiInstance: GoogleGenAI | null = null

/**
 * Check if Gemini is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Get or create the GoogleGenAI client instance.
 * Returns the client for services that need direct access (e.g., grounding).
 */
export function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured')
    return null
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  return aiInstance
}

/**
 * Extract token usage from a GenerateContentResponse
 */
export function extractUsageFromResponse(response: GenerateContentResponse): GeminiUsage {
  const meta = response.usageMetadata
  return {
    promptTokens: meta?.promptTokenCount ?? 0,
    completionTokens: meta?.candidatesTokenCount ?? 0,
    totalTokens: meta?.totalTokenCount ?? 0,
  }
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper with exponential backoff for transient API failures
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const msg = lastError.message.toLowerCase()

      // Don't retry on non-transient errors
      if (msg.includes('api key') || msg.includes('permission') || msg.includes('invalid')) {
        throw lastError
      }

      if (attempt < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        console.warn(`[Gemini] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message)
        await sleep(delay)
      }
    }
  }

  throw lastError!
}

/**
 * Text generation with usage metadata and retry logic.
 * @param prompt - The prompt to send
 * @param _useProModel - Deprecated, kept for backward compatibility (ignored)
 */
export async function generateTextWithUsage(prompt: string, _useProModel = false): Promise<GeminiTextResponse> {
  const ai = getAIClient()
  if (!ai) return { text: null, usage: ZERO_USAGE }

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
      })
    )

    const usage = extractUsageFromResponse(response)
    const text = response.text ?? null
    return { text, usage }
  } catch (error) {
    console.error('[Gemini] Text generation error:', error)
    return { text: null, usage: ZERO_USAGE }
  }
}

/**
 * Simple wrapper for text generation (backward-compatible).
 */
export async function generateText(prompt: string, _useProModel = false): Promise<string | null> {
  const response = await generateTextWithUsage(prompt)
  return response.text
}

/**
 * JSON generation using native JSON response mode with retry logic.
 * Uses responseMimeType: 'application/json' for reliable structured output.
 * @param prompt - The prompt (should instruct the model to return JSON)
 * @param _useProModel - Deprecated, kept for backward compatibility (ignored)
 */
export async function generateJSONWithUsage<T>(prompt: string, _useProModel = false): Promise<GeminiJSONResponse<T>> {
  const ai = getAIClient()
  if (!ai) return { data: null, usage: ZERO_USAGE }

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      })
    )

    const usage = extractUsageFromResponse(response)
    const text = response.text

    if (!text) return { data: null, usage }

    try {
      return { data: JSON.parse(text) as T, usage }
    } catch (parseError) {
      // Fallback: try extracting JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        return { data: JSON.parse(jsonMatch[1].trim()) as T, usage }
      }
      console.error('[Gemini] Failed to parse JSON response:', parseError)
      return { data: null, usage }
    }
  } catch (error) {
    console.error('[Gemini] JSON generation error:', error)
    return { data: null, usage: ZERO_USAGE }
  }
}

/**
 * Generate JSON response from Gemini (backward-compatible).
 */
export async function generateJSON<T>(prompt: string, _useProModel = false): Promise<T | null> {
  const response = await generateJSONWithUsage<T>(prompt)
  return response.data
}

// ============= BACKWARD COMPATIBILITY =============
// These functions exist for services that previously called model.generateContent() directly.
// They are thin wrappers that map old patterns to the new SDK.

/**
 * @deprecated Use getAIClient() + ai.models.generateContent() directly.
 * Kept for backward compatibility during migration.
 */
export function getGeminiClient(): GoogleGenAI | null {
  return getAIClient()
}

/**
 * @deprecated Use generateTextWithUsage() or getAIClient() directly.
 */
export function getGeminiModel(): null {
  console.warn('[Gemini] getGeminiModel() is deprecated. Use getAIClient() or generateText() instead.')
  return null
}

/**
 * @deprecated Use generateTextWithUsage() or getAIClient() directly.
 */
export function getGeminiProModel(): null {
  console.warn('[Gemini] getGeminiProModel() is deprecated. Use getAIClient() or generateText() instead.')
  return null
}

/**
 * @deprecated Use generateJSONWithUsage() or getAIClient() directly.
 */
export function getGeminiJsonModel(): null {
  console.warn('[Gemini] getGeminiJsonModel() is deprecated. Use getAIClient() or generateJSON() instead.')
  return null
}

/**
 * @deprecated Use getAIClient() directly.
 */
export function getGeminiExtractionModel(): null {
  console.warn('[Gemini] getGeminiExtractionModel() is deprecated. Use getAIClient() directly.')
  return null
}

/**
 * @deprecated Use extractUsageFromResponse() with new SDK response type.
 */
export function extractUsageFromResult(_result: unknown): GeminiUsage {
  console.warn('[Gemini] extractUsageFromResult() is deprecated. Use extractUsageFromResponse() instead.')
  return ZERO_USAGE
}
