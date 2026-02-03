import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/analytics/trends
 *
 * Get activity trends over time
 * Query params:
 *   - period: '7d' | '30d' | '90d' | '365d' (default: 30d)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const days = parseInt(period.replace('d', '')) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get saved grants over time
    const savedGrants = await prisma.savedGrant.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Get workspace activity over time
    const workspaceActivity = await prisma.workspace.findMany({
      where: {
        userId,
        updatedAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
      },
      orderBy: { updatedAt: 'asc' },
    })

    // Group by date
    const dateGroups: Record<string, {
      saved: number
      created: number
      updated: number
      submitted: number
    }> = {}

    // Initialize all dates in range
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      dateGroups[dateKey] = { saved: 0, created: 0, updated: 0, submitted: 0 }
    }

    // Count saved grants by date
    savedGrants.forEach(sg => {
      const dateKey = sg.createdAt.toISOString().split('T')[0]
      if (dateGroups[dateKey]) {
        dateGroups[dateKey].saved++
      }
    })

    // Count workspace activity by date
    workspaceActivity.forEach(ws => {
      const createdKey = ws.createdAt.toISOString().split('T')[0]
      const updatedKey = ws.updatedAt.toISOString().split('T')[0]

      if (dateGroups[createdKey]) {
        dateGroups[createdKey].created++
      }
      if (dateGroups[updatedKey] && updatedKey !== createdKey) {
        dateGroups[updatedKey].updated++
      }
      if (ws.status === 'submitted' && dateGroups[updatedKey]) {
        dateGroups[updatedKey].submitted++
      }
    })

    // Convert to array for charting
    const trendData = Object.entries(dateGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))

    // Calculate summary stats
    const totalSaved = savedGrants.length
    const totalCreated = workspaceActivity.filter(ws => ws.createdAt >= startDate).length
    const totalSubmitted = workspaceActivity.filter(ws => ws.status === 'submitted').length

    // Calculate week-over-week change
    const midPoint = new Date(startDate)
    midPoint.setDate(midPoint.getDate() + Math.floor(days / 2))

    const firstHalfSaved = savedGrants.filter(sg => sg.createdAt < midPoint).length
    const secondHalfSaved = savedGrants.filter(sg => sg.createdAt >= midPoint).length

    const savedChange = firstHalfSaved > 0
      ? Math.round(((secondHalfSaved - firstHalfSaved) / firstHalfSaved) * 100)
      : (secondHalfSaved > 0 ? 100 : 0)

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      summary: {
        totalSaved,
        totalCreated,
        totalSubmitted,
        savedChange,
        avgDailySaves: Math.round((totalSaved / days) * 10) / 10,
      },
      trends: trendData,
    })
  } catch (error) {
    console.error('Get analytics trends error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    )
  }
}
