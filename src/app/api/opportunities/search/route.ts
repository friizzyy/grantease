import { NextRequest, NextResponse } from 'next/server'
import { searchGrants } from '@/lib/services/grant-sources'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { EntityType } from '@/lib/types/onboarding'

/**
 * GET /api/opportunities/search
 *
 * Unified search for grants and opportunities using Gemini AI.
 *
 * Query params:
 * - q: Search keyword
 * - state: Filter by state
 * - limit: Max results (default: 25)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const keyword = searchParams.get('q') || undefined
  const state = searchParams.get('state') || undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 50)

  // Try to get user profile for better results
  let profile = undefined
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        entityType: true,
        industryTags: true,
        state: true,
      },
    })
    if (userProfile) {
      let industryTags: string[] = []
      try {
        industryTags = JSON.parse(userProfile.industryTags || '[]')
      } catch {
        industryTags = []
      }
      profile = {
        entityType: userProfile.entityType as EntityType,
        industryTags,
        state: userProfile.state || undefined,
      }
    }
  }

  try {
    const result = await searchGrants(
      {
        keyword,
        state,
        limit,
      },
      profile
    )

    return NextResponse.json({
      opportunities: result.grants,
      totalCount: result.total,
      sources: [{
        name: 'gemini-discovery',
        count: result.grants.length,
        total: result.total,
        error: result.error,
      }],
    })
  } catch (error) {
    console.error('Search error:', error)

    return NextResponse.json({
      opportunities: [],
      totalCount: 0,
      sources: [{
        name: 'gemini-discovery',
        count: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }],
    })
  }
}
