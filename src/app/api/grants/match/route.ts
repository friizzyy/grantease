import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  openaiMatching,
  simpleKeywordMatch,
  OrganizationProfile,
  GrantForMatching,
} from '@/lib/services/openai-matching'

/**
 * POST /api/grants/match
 *
 * AI-powered grant matching based on organization profile.
 * Falls back to keyword matching if OpenAI is not configured.
 *
 * Request body:
 * - profile: OrganizationProfile (optional, uses saved profile if not provided)
 * - grantIds: string[] (optional, matches against specific grants)
 * - maxResults: number (default: 10)
 * - minScore: number (default: 50)
 *
 * If no grants specified, fetches recent grants from database.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      profile: providedProfile,
      grantIds,
      maxResults = 10,
      minScore = 50,
    } = body

    // Get or build organization profile
    let profile: OrganizationProfile

    if (providedProfile) {
      profile = providedProfile
    } else {
      // Try to build profile from user's saved searches and preferences
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          savedSearches: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Build profile from user data
      const focusAreas: string[] = []
      user.savedSearches.forEach(search => {
        try {
          const filters = JSON.parse(search.filters || '{}')
          if (filters.category) focusAreas.push(filters.category)
          if (filters.categories) focusAreas.push(...filters.categories)
        } catch {
          // Ignore parse errors
        }
      })

      profile = {
        name: user.name || 'Organization',
        type: 'nonprofit', // Default, should come from user profile
        focusAreas: [...new Set(focusAreas)],
        location: undefined, // Should come from user profile
      }
    }

    // Get grants to match against
    let grants: GrantForMatching[]

    if (grantIds && grantIds.length > 0) {
      // Match against specific grants
      const dbGrants = await prisma.grant.findMany({
        where: { id: { in: grantIds } },
      })

      grants = dbGrants.map(g => ({
        id: g.id,
        title: g.title,
        sponsor: g.sponsor,
        summary: g.summary || '',
        categories: parseJsonArray(g.categories),
        eligibility: parseJsonArray(g.eligibility),
        amountMin: g.amountMin,
        amountMax: g.amountMax,
        deadlineDate: g.deadlineDate,
      }))
    } else {
      // Get recent open grants
      const dbGrants = await prisma.grant.findMany({
        where: {
          status: 'open',
          OR: [
            { deadlineDate: null },
            { deadlineDate: { gte: new Date() } },
          ],
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      })

      grants = dbGrants.map(g => ({
        id: g.id,
        title: g.title,
        sponsor: g.sponsor,
        summary: g.summary || '',
        categories: parseJsonArray(g.categories),
        eligibility: parseJsonArray(g.eligibility),
        amountMin: g.amountMin,
        amountMax: g.amountMax,
        deadlineDate: g.deadlineDate,
      }))
    }

    if (grants.length === 0) {
      return NextResponse.json({
        matches: [],
        summary: 'No grants available for matching',
        totalAnalyzed: 0,
        method: 'none',
      })
    }

    // Perform matching
    let result
    let method: 'ai' | 'keyword'

    if (openaiMatching.isConfigured()) {
      try {
        result = await openaiMatching.matchGrants(profile, grants, {
          maxResults,
          minScore,
        })
        method = 'ai'
      } catch (error) {
        console.error('OpenAI matching failed, falling back to keyword:', error)
        const matches = simpleKeywordMatch(profile, grants)
          .filter(m => m.score >= minScore)
          .slice(0, maxResults)
        result = {
          matches,
          summary: 'Matched using keyword analysis',
          totalAnalyzed: grants.length,
        }
        method = 'keyword'
      }
    } else {
      const matches = simpleKeywordMatch(profile, grants)
        .filter(m => m.score >= minScore)
        .slice(0, maxResults)
      result = {
        matches,
        summary: 'Matched using keyword analysis (AI matching available with OpenAI API key)',
        totalAnalyzed: grants.length,
      }
      method = 'keyword'
    }

    // Enrich matches with grant details
    const enrichedMatches = result.matches.map(match => {
      const grant = grants.find(g => g.id === match.grantId)
      return {
        ...match,
        grant: grant || null,
      }
    })

    return NextResponse.json({
      matches: enrichedMatches,
      summary: result.summary,
      totalAnalyzed: result.totalAnalyzed,
      method,
    })
  } catch (error) {
    console.error('Grant matching error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Matching failed', message }, { status: 500 })
  }
}

/**
 * GET /api/grants/match
 *
 * Get quick matches based on user's saved profile.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const maxResults = parseInt(searchParams.get('limit') || '10')

    // Redirect to POST with empty body
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxResults }),
    })

    return POST(postRequest as unknown as NextRequest)
  } catch (error) {
    console.error('Grant matching error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Matching failed', message }, { status: 500 })
  }
}

// Helper to parse JSON arrays safely
function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
