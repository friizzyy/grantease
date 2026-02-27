import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/analytics/dashboard
 *
 * Get dashboard analytics for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Get counts in parallel
    const [
      savedGrantsCount,
      workspacesData,
      savedSearchesCount,
      recentActivity,
      upcomingDeadlines,
    ] = await Promise.all([
      // Total saved grants
      prisma.savedGrant.count({ where: { userId } }),

      // Workspaces by status
      prisma.workspace.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),

      // Saved searches
      prisma.savedSearch.count({ where: { userId } }),

      // Recent activity (last 10 workspace updates)
      prisma.workspace.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
          grant: {
            select: {
              title: true,
              sponsor: true,
            },
          },
        },
      }),

      // Upcoming deadlines (next 30 days)
      prisma.workspace.findMany({
        where: {
          userId,
          status: { in: ['not_started', 'in_progress'] },
          grant: {
            deadlineDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        orderBy: {
          grant: {
            deadlineDate: 'asc',
          },
        },
        take: 5,
        include: {
          grant: {
            select: {
              title: true,
              sponsor: true,
              deadlineDate: true,
              amountMin: true,
              amountMax: true,
            },
          },
        },
      }),
    ])

    // Process workspace status data
    const workspacesByStatus: Record<string, number> = {
      not_started: 0,
      in_progress: 0,
      submitted: 0,
      awarded: 0,
      rejected: 0,
    }

    workspacesData.forEach(item => {
      workspacesByStatus[item.status] = item._count.status
    })

    const totalWorkspaces = Object.values(workspacesByStatus).reduce((a, b) => a + b, 0)

    // Calculate success rate (awarded / (awarded + rejected))
    const successRate = workspacesByStatus.awarded + workspacesByStatus.rejected > 0
      ? Math.round((workspacesByStatus.awarded / (workspacesByStatus.awarded + workspacesByStatus.rejected)) * 100)
      : null

    // Calculate pipeline value (sum of max amounts for in-progress applications)
    const pipelineGrants = await prisma.workspace.findMany({
      where: {
        userId,
        status: { in: ['not_started', 'in_progress', 'submitted'] },
      },
      select: {
        grant: {
          select: {
            amountMax: true,
            amountMin: true,
          },
        },
      },
    })

    const pipelineValue = pipelineGrants.reduce((total, ws) => {
      return total + (ws.grant.amountMax || ws.grant.amountMin || 0)
    }, 0)

    // Get category distribution from saved grants
    const savedGrantsWithCategories = await prisma.savedGrant.findMany({
      where: { userId },
      include: {
        grant: {
          select: { categories: true },
        },
      },
    })

    const categoryCount: Record<string, number> = {}
    savedGrantsWithCategories.forEach(sg => {
      const categories: unknown = JSON.parse(sg.grant.categories || '[]')
      if (Array.isArray(categories)) {
        categories.forEach((cat: unknown) => {
          if (typeof cat === 'string') {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1
          }
        })
      }
    })

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))

    return NextResponse.json({
      overview: {
        savedGrants: savedGrantsCount,
        totalWorkspaces,
        savedSearches: savedSearchesCount,
        successRate,
        pipelineValue,
      },
      workspacesByStatus,
      topCategories,
      recentActivity: recentActivity.map(ws => ({
        id: ws.id,
        name: ws.name,
        status: ws.status,
        updatedAt: ws.updatedAt,
        grantTitle: ws.grant.title,
        sponsor: ws.grant.sponsor,
      })),
      upcomingDeadlines: upcomingDeadlines.map(ws => ({
        workspaceId: ws.id,
        workspaceName: ws.name,
        status: ws.status,
        grantTitle: ws.grant.title,
        sponsor: ws.grant.sponsor,
        deadline: ws.grant.deadlineDate,
        amountMin: ws.grant.amountMin,
        amountMax: ws.grant.amountMax,
        daysUntilDeadline: ws.grant.deadlineDate
          ? Math.ceil((new Date(ws.grant.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      })),
    })
  } catch (error) {
    console.error('Get dashboard analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
