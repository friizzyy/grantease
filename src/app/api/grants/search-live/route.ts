import { NextRequest, NextResponse } from 'next/server'
import { searchGrants } from '@/lib/services/grant-sources'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { EntityType } from '@/lib/types/onboarding'

/**
 * GET /api/grants/search-live
 *
 * Search for grants using Gemini AI-powered discovery.
 * Searches the web in real-time to find grants from all sources.
 *
 * Query params:
 * - q: Search keyword
 * - state: Filter by state
 * - status: 'open', 'forecasted', 'closed', 'all' (default: open)
 * - limit: Max results (default: 25, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const keyword = searchParams.get('q') || undefined
    const state = searchParams.get('state') || undefined
    const status = (searchParams.get('status') || 'open') as 'open' | 'forecasted' | 'closed' | 'all'
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

    // Search using Gemini
    const result = await searchGrants(
      {
        keyword,
        state,
        status,
        limit,
      },
      profile
    )

    return NextResponse.json({
      grants: result.grants,
      total: result.total,
      source: 'gemini-ai',
      cached: false,
    })
  } catch (error) {
    console.error('Live search error:', error)

    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to search grants',
        message,
        grants: [],
      },
      { status: 502 }
    )
  }
}
