import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  startApplication,
  getUserApplications,
  getUserApplicationStats,
} from '@/lib/services/application-service'
import type { ApplicationStatus } from '@/lib/types/application'

/**
 * GET /api/applications
 * Get user's applications with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const includeStats = searchParams.get('stats') === 'true'

    const options: {
      status?: ApplicationStatus | ApplicationStatus[]
      limit?: number
      offset?: number
    } = {}

    if (status) {
      // Support comma-separated statuses
      const statuses = status.split(',') as ApplicationStatus[]
      options.status = statuses.length === 1 ? statuses[0] : statuses
    }

    if (limit) options.limit = parseInt(limit)
    if (offset) options.offset = parseInt(offset)

    const result = await getUserApplications(session.user.id, options)

    // Optionally include stats
    if (includeStats) {
      const stats = await getUserApplicationStats(session.user.id)
      return NextResponse.json({ ...result, stats })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications
 * Start a new application for a grant
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { grantId } = body

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID required' },
        { status: 400 }
      )
    }

    const application = await startApplication(session.user.id, grantId)
    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error starting application:', error)
    return NextResponse.json(
      { error: 'Failed to start application' },
      { status: 500 }
    )
  }
}
