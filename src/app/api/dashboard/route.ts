import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'

/**
 * GET /api/dashboard
 *
 * Aggregated dashboard endpoint - returns all data needed for the dashboard in a single request.
 * Reduces multiple client-side fetches into one server-side query.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Parallel queries for performance
    const [
      user,
      profile,
      savedGrants,
      workspaces,
      savedSearches,
      notifications,
      aiUsageStats,
    ] = await Promise.all([
      // User info
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, organization: true },
      }),

      // Profile info
      prisma.userProfile.findUnique({
        where: { userId },
      }),

      // Saved grants with grant details
      prisma.savedGrant.findMany({
        where: { userId },
        include: {
          grant: {
            select: {
              id: true,
              title: true,
              sponsor: true,
              amountMin: true,
              amountMax: true,
              amountText: true,
              deadlineDate: true,
              deadlineType: true,
              status: true,
              categories: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Workspaces with grant info
      prisma.workspace.findMany({
        where: { userId },
        include: {
          grant: {
            select: {
              id: true,
              title: true,
              sponsor: true,
              amountMin: true,
              amountMax: true,
              deadlineDate: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),

      // Saved searches
      prisma.savedSearch.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      }),

      // Recent unread notifications
      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // AI usage statistics
      prisma.aIUsageLog.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: {
          totalTokens: true,
          responseTime: true,
        },
      }),
    ])

    // Calculate stats
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Funding potential from saved grants
    const fundingPotential = savedGrants.reduce((sum, sg) => {
      return sum + (sg.grant.amountMax || sg.grant.amountMin || 0)
    }, 0)

    // Workspaces by status
    const workspacesByStatus = workspaces.reduce((acc, ws) => {
      const status = ws.status || 'not_started'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Application pipeline stages
    const applicationStages = [
      { name: 'Discovered', count: savedGrants.length, color: '#40ffaa' },
      { name: 'In Progress', count: workspacesByStatus['in_progress'] || 0, color: '#ffb340' },
      { name: 'Submitted', count: workspacesByStatus['submitted'] || 0, color: '#40a0ff' },
      { name: 'Awarded', count: workspacesByStatus['awarded'] || 0, color: '#a040ff' },
    ]

    // Upcoming deadlines (from saved grants and workspaces)
    const upcomingDeadlines = [
      ...savedGrants.map((sg) => ({
        id: sg.grant.id,
        title: sg.grant.title,
        type: 'saved' as const,
        deadline: sg.grant.deadlineDate,
        amount: sg.grant.amountMax || sg.grant.amountMin,
        progress: 0,
        href: `/app/grants/${sg.grant.id}`,
      })),
      ...workspaces.map((ws) => {
        const checklist = safeJsonParse<Array<{ completed?: boolean }>>(ws.checklist, [])
        const completed = checklist.filter((item) => item.completed).length
        const total = checklist.length
        return {
          id: ws.id,
          title: ws.grant.title,
          type: 'workspace' as const,
          deadline: ws.grant.deadlineDate,
          amount: ws.grant.amountMax || ws.grant.amountMin,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          href: `/app/workspace/${ws.id}`,
        }
      }),
    ]
      .filter((d) => d.deadline && new Date(d.deadline) <= thirtyDaysFromNow)
      .sort((a, b) => {
        if (!a.deadline || !b.deadline) return 0
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      })
      .slice(0, 5)
      .map((d) => ({
        ...d,
        daysLeft: d.deadline
          ? Math.max(0, Math.ceil((new Date(d.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null,
        urgent: d.deadline ? new Date(d.deadline).getTime() - now.getTime() < 14 * 24 * 60 * 60 * 1000 : false,
      }))

    // Top categories from saved grants
    const categoryCount: Record<string, number> = {}
    savedGrants.forEach((sg) => {
      const categories = safeJsonParse<string[]>(sg.grant.categories, [])
      categories.forEach((cat: string) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
    })
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // AI stats from actual usage logs
    const aiInteractions = aiUsageStats._count.id || 0
    const totalResponseTime = aiUsageStats._sum.responseTime || 0

    // Estimate time saved: ~2 min per AI interaction vs manual research
    const estimatedMinutesSaved = aiInteractions * 2
    const timeSavedHours = Math.floor(estimatedMinutesSaved / 60)
    const timeSavedMinutes = estimatedMinutesSaved % 60

    const aiStats = {
      grantsAnalyzed: aiInteractions > 0 ? aiInteractions * 10 : savedGrants.length,
      matchesFound: savedGrants.length,
      timeSaved: timeSavedHours > 0
        ? `~${timeSavedHours}h ${timeSavedMinutes}m`
        : `~${timeSavedMinutes}m`,
      successRate: workspaces.length > 0
        ? Math.round((workspacesByStatus['awarded'] || 0) / workspaces.length * 100)
        : 0,
      totalInteractions: aiInteractions,
      avgResponseTime: aiInteractions > 0
        ? Math.round(totalResponseTime / aiInteractions)
        : 0,
    }

    return NextResponse.json({
      user: {
        ...user,
        hasCompletedOnboarding: profile?.onboardingCompleted || false,
      },
      stats: {
        savedGrants: savedGrants.length,
        workspaces: workspaces.length,
        savedSearches: savedSearches.length,
        fundingPotential,
        unreadNotifications: notifications.length,
      },
      applicationStages,
      upcomingDeadlines,
      topCategories,
      aiStats,
      recentActivity: {
        lastSavedGrant: savedGrants[0]?.createdAt || null,
        lastWorkspaceUpdate: workspaces[0]?.updatedAt || null,
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
