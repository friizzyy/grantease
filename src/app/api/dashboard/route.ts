import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { calculateVaultCompleteness } from '@/lib/services/vault-service'

/**
 * GET /api/dashboard
 *
 * Aggregated dashboard endpoint — returns all data needed for the dashboard
 * in a single request. All data is collected at request time (no caching).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Rate limiting: 30 requests per minute
    const rateLimit = rateLimiters.general(userId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    // Parallel queries — bounded with .take() to prevent unbounded fetches
    const [
      user,
      profile,
      savedGrants,
      workspaces,
      savedSearchCount,
      unreadNotificationCount,
      aiUsageStats,
      totalGrantCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, organization: true },
      }),

      prisma.userProfile.findUnique({
        where: { userId },
      }),

      // Saved grants — capped at 200 for dashboard aggregation
      prisma.savedGrant.findMany({
        where: { userId },
        take: 200,
        include: {
          grant: {
            select: {
              id: true,
              title: true,
              sponsor: true,
              amountMin: true,
              amountMax: true,
              deadlineDate: true,
              status: true,
              categories: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Workspaces — capped at 100
      prisma.workspace.findMany({
        where: { userId },
        take: 100,
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

      // Counts only — no need to fetch full objects
      prisma.savedSearch.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),

      prisma.aIUsageLog.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { totalTokens: true, responseTime: true },
      }),

      // Total grants in database for "Browse X opportunities" display
      prisma.grant.count({ where: { status: 'open' } }),
    ])

    // Vault completeness — graceful degradation if vault service fails
    let vaultCompleteness: { overall: number; sections: Record<string, number>; missingCritical: string[] } | null = null
    try {
      const vc = await calculateVaultCompleteness(userId)
      vaultCompleteness = {
        overall: vc.overall,
        sections: vc.sections,
        missingCritical: vc.missingCritical,
      }
    } catch (vcError) {
      console.warn('Vault completeness unavailable:', vcError instanceof Error ? vcError.message : vcError)
    }

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
      { name: 'Discovered', count: savedGrants.length, color: '#40ffaa', href: '/app/saved' },
      { name: 'In Progress', count: workspacesByStatus['in_progress'] || 0, color: '#ffb340', href: '/app/workspace' },
      { name: 'Submitted', count: workspacesByStatus['submitted'] || 0, color: '#40a0ff', href: '/app/workspace' },
      { name: 'Awarded', count: workspacesByStatus['awarded'] || 0, color: '#a040ff', href: '/app/workspace' },
    ]

    // Upcoming deadlines — filter to next 30 days, guard against orphaned grants
    const upcomingDeadlines = [
      ...savedGrants
        .filter((sg) => sg.grant) // Guard against orphaned references
        .map((sg) => ({
          id: sg.grant.id,
          title: sg.grant.title,
          type: 'saved' as const,
          deadline: sg.grant.deadlineDate,
          amount: sg.grant.amountMax || sg.grant.amountMin,
          progress: 0,
          href: `/app/grants/${sg.grant.id}`,
        })),
      ...workspaces
        .filter((ws) => ws.grant) // Guard against orphaned references
        .map((ws) => {
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
      if (!sg.grant) return
      const categories = safeJsonParse<string[]>(sg.grant.categories, [])
      categories.forEach((cat: string) => {
        if (typeof cat === 'string') categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
    })
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // AI stats from actual usage logs
    const aiInteractions = aiUsageStats._count.id || 0
    const totalResponseTime = aiUsageStats._sum.responseTime || 0
    const estimatedMinutesSaved = aiInteractions * 2
    const timeSavedHours = Math.floor(estimatedMinutesSaved / 60)
    const timeSavedMinutes = estimatedMinutesSaved % 60

    const aiStats = {
      interactions: aiInteractions,
      matchesFound: savedGrants.length,
      timeSaved: timeSavedHours > 0
        ? `~${timeSavedHours}h ${timeSavedMinutes}m`
        : `~${timeSavedMinutes}m`,
      successRate: workspaces.length > 0
        ? Math.round((workspacesByStatus['awarded'] || 0) / workspaces.length * 100)
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
        savedSearches: savedSearchCount,
        fundingPotential,
        unreadNotifications: unreadNotificationCount,
        totalGrantsAvailable: totalGrantCount,
      },
      applicationStages,
      upcomingDeadlines,
      topCategories,
      aiStats,
      vaultCompleteness,
      recentActivity: {
        lastSavedGrant: savedGrants[0]?.createdAt || null,
        lastWorkspaceUpdate: workspaces[0]?.updatedAt || null,
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
