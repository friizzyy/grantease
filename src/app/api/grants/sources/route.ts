import { NextResponse } from 'next/server'
import { isGeminiConfigured } from '@/lib/services/gemini-client'

/**
 * GET /api/grants/sources
 *
 * Get list of available grant sources and their status.
 * Now uses only Gemini AI for grant discovery.
 */
export async function GET() {
  const geminiConfigured = isGeminiConfigured()

  const sources = [
    {
      name: 'gemini-ai',
      label: 'Gemini AI Discovery',
      description: 'AI-powered grant discovery that searches and analyzes grants from across the web',
      type: 'ai',
      requiresApiKey: true,
      apiKeyEnvVar: 'GEMINI_API_KEY',
      isConfigured: geminiConfigured,
    },
  ]

  return NextResponse.json({
    sources,
    configured: geminiConfigured ? ['gemini-ai'] : [],
    total: 1,
    configuredCount: geminiConfigured ? 1 : 0,
  })
}
