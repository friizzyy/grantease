/**
 * GEMINI AI CLIENT
 * ----------------
 * Centralized Gemini AI configuration and client setup
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

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
 * Simple wrapper for text generation
 */
export async function generateText(prompt: string, useProModel = false): Promise<string | null> {
  const model = useProModel ? getGeminiProModel() : getGeminiModel()
  if (!model) return null

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('Gemini generation error:', error)
    return null
  }
}

/**
 * Generate JSON response from Gemini
 */
export async function generateJSON<T>(prompt: string, useProModel = false): Promise<T | null> {
  const text = await generateText(prompt, useProModel)
  if (!text) return null

  try {
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.error('Failed to parse Gemini JSON response:', error)
    console.error('Raw response:', text)
    return null
  }
}
