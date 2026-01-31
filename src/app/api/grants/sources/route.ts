import { NextResponse } from 'next/server'
import { getAllSources, getConfiguredSources } from '@/lib/services/grant-sources'

/**
 * GET /api/grants/sources
 *
 * Get list of available grant sources and their status
 */
export async function GET() {
  const allSources = getAllSources()
  const configuredSources = getConfiguredSources()

  const sources = allSources.map(source => ({
    name: source.name,
    label: source.label,
    description: source.description,
    type: source.type,
    region: source.region,
    requiresApiKey: source.requiresApiKey,
    apiKeyEnvVar: source.apiKeyEnvVar,
    isConfigured: source.isConfigured(),
  }))

  return NextResponse.json({
    sources,
    configured: configuredSources.map(s => s.name),
    total: allSources.length,
    configuredCount: configuredSources.length,
  })
}
