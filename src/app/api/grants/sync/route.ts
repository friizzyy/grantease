import { NextRequest, NextResponse } from 'next/server'
import { searchGrantsByKeyword } from '@/lib/services/gemini-grant-discovery'

// Protect this endpoint with admin API key
function isAuthorized(request: NextRequest): boolean {
  const expectedKey = process.env.ADMIN_API_KEY
  if (!expectedKey) {
    console.error('ADMIN_API_KEY not configured')
    return false
  }
  const apiKey = request.headers.get('x-api-key')
  return apiKey === expectedKey
}

/**
 * POST /api/grants/sync
 *
 * Manually trigger grant discovery using Gemini AI.
 * Protected by admin API key.
 *
 * Query params:
 * - keyword: Search keyword
 * - state: State filter
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword') || 'grants funding opportunities'
  const state = searchParams.get('state') || undefined

  const startTime = Date.now()
  const results = {
    success: true,
    grantsFound: 0,
    errors: [] as string[],
    duration: 0,
    grants: [] as unknown[],
  }

  try {

    const { grants } = await searchGrantsByKeyword(keyword, { state })

    results.grantsFound = grants.length
    results.grants = grants
    results.duration = Date.now() - startTime


    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    results.errors.push(errorMsg)

    console.error('Discovery failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}

/**
 * GET /api/grants/sync
 *
 * Get discovery status
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    source: 'gemini-discovery',
    description: 'Gemini AI-powered grant discovery',
    status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
  })
}
