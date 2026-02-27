/**
 * GEMINI AI CLIENT
 * ----------------
 * Centralized Gemini AI configuration and client setup
 */

import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from '@google/generative-ai'

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

/**
 * Extract token usage from a Gemini GenerateContentResult.
 * Falls back to zeros if usageMetadata is not available.
 */
function extractUsage(result: GenerateContentResult): GeminiUsage {
  const meta = result.response.usageMetadata
  return {
    promptTokens: meta?.promptTokenCount ?? 0,
    completionTokens: meta?.candidatesTokenCount ?? 0,
    totalTokens: meta?.totalTokenCount ?? 0,
  }
}

/** Default zero usage for error/null cases */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

let geminiInstance: GoogleGenerativeAI | null = null
let modelInstance: GenerativeModel | null = null

/**
 * Check if Gemini is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Get or create the Gemini client instance
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured')
    return null
  }

  if (!geminiInstance) {
    geminiInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }

  return geminiInstance
}

/**
 * Get the Gemini Pro model for text generation
 */
export function getGeminiModel(): GenerativeModel | null {
  const client = getGeminiClient()
  if (!client) return null

  if (!modelInstance) {
    // Use gemini-1.5-flash for faster responses, or gemini-1.5-pro for complex tasks
    modelInstance = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower for more consistent/factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })
  }

  return modelInstance
}

/**
 * Get the Gemini Pro model for complex reasoning tasks
 */
export function getGeminiProModel(): GenerativeModel | null {
  const client = getGeminiClient()
  if (!client) return null

  return client.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.2, // Even lower for analytical tasks
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 4096,
    },
  })
}

/**
 * Get a Gemini model configured for JSON responses (application AI service)
 */
export function getGeminiJsonModel(): GenerativeModel | null {
  const client = getGeminiClient()
  if (!client) return null

  return client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  })
}

/**
 * Get a Gemini model for data extraction (extractor + enrich routes)
 */
export function getGeminiExtractionModel(): GenerativeModel | null {
  const client = getGeminiClient()
  if (!client) return null

  return client.getGenerativeModel({
    model: 'gemini-1.5-flash',
  })
}

/**
 * Text generation with usage metadata.
 * Returns both the generated text and token counts from the API response.
 */
export async function generateTextWithUsage(prompt: string, useProModel = false): Promise<GeminiTextResponse> {
  const model = useProModel ? getGeminiProModel() : getGeminiModel()
  if (!model) return { text: null, usage: ZERO_USAGE }

  try {
    const result = await model.generateContent(prompt)
    const usage = extractUsage(result)
    const text = result.response.text()
    return { text, usage }
  } catch (error) {
    console.error('Gemini generation error:', error)
    return { text: null, usage: ZERO_USAGE }
  }
}

/**
 * Simple wrapper for text generation (backward-compatible).
 * Use generateTextWithUsage() when you need token counts.
 */
export async function generateText(prompt: string, useProModel = false): Promise<string | null> {
  const response = await generateTextWithUsage(prompt, useProModel)
  return response.text
}

/**
 * JSON generation with usage metadata.
 * Returns both the parsed JSON data and token counts from the API response.
 */
export async function generateJSONWithUsage<T>(prompt: string, useProModel = false): Promise<GeminiJSONResponse<T>> {
  const { text, usage } = await generateTextWithUsage(prompt, useProModel)
  if (!text) return { data: null, usage }

  try {
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    return { data: JSON.parse(jsonStr) as T, usage }
  } catch (error) {
    console.error('Failed to parse Gemini JSON response:', error)
    return { data: null, usage }
  }
}

/**
 * Generate JSON response from Gemini (backward-compatible).
 * Use generateJSONWithUsage() when you need token counts.
 */
export async function generateJSON<T>(prompt: string, useProModel = false): Promise<T | null> {
  const response = await generateJSONWithUsage<T>(prompt, useProModel)
  return response.data
}

/**
 * Extract token usage from a raw GenerateContentResult.
 * Useful for services that call model.generateContent() directly.
 */
export function extractUsageFromResult(result: GenerateContentResult): GeminiUsage {
  return extractUsage(result)
}
