import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNotification } from '@/lib/services/notification-sender'
import { generateText } from '@/lib/services/gemini-client'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * GET /api/cron/weekly-digest
 *
 * Weekly cron job that sends digest emails to subscribed users.
 *
 * For each user with weeklyDigest enabled and whose digestDay matches today:
 *   1. Aggregates new grant matches from the past week
 *   2. Collects upcoming deadlines (next 14 days)
 *   3. Gathers application status changes from the past week
 *   4. Generates an AI-powered personalized insight via Gemini
 *   5. Sends a consolidated weekly digest notification + email
 *
 * Security: Validates CRON_SECRET header
 * Vercel Cron: "0 10 * * *" (Daily at 10 AM UTC, but only runs for matching digestDay)
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[CRON:weekly-digest] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }

  const isVercelCron = authHeader === `Bearer ${cronSecret}`
  const isManualCron = request.headers.get('x-cron-secret') === cronSecret

  if (!isVercelCron && !isManualCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    success: true,
    digestDay: getTodayDayName(),
    usersEligible: 0,
    usersProcessed: 0,
    digestsSent: 0,
    emailsSent: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    const todayDay = getTodayDayName()

    // Find users with weekly digest enabled whose digest day matches today
    const eligibleUsers = await prisma.notificationPreferences.findMany({
      where: {
        weeklyDigest: true,
        emailEnabled: true,
        digestDay: todayDay,
      },
      select: {
        userId: true,
      },
    })

    results.usersEligible = eligibleUsers.length

    if (eligibleUsers.length === 0) {
      results.duration = Date.now() - startTime
      return NextResponse.json(results)
    }

    // Process users in batches of 10 to avoid serverless timeouts
    const BATCH_SIZE = 10
    for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
      const batch = eligibleUsers.slice(i, i + BATCH_SIZE)

      // Process batch sequentially to avoid overwhelming the DB and AI API
      for (const userPref of batch) {
        try {
          const digestResult = await processUserDigest(userPref.userId)
          results.usersProcessed++

          if (digestResult.sent) {
            results.digestsSent++
          }
          if (digestResult.emailSent) {
            results.emailsSent++
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`User ${userPref.userId}: ${msg}`)
          console.error(`[CRON:weekly-digest] Error for user ${userPref.userId}:`, msg)
        }
      }
    }

    results.duration = Date.now() - startTime

    console.log(
      `[CRON:weekly-digest] Complete: ${results.usersProcessed}/${results.usersEligible} users, ` +
      `${results.digestsSent} digests, ${results.emailsSent} emails`
    )

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON:weekly-digest] Failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}

// ============= INTERNAL HELPERS =============

/**
 * Get the current day name in lowercase (matching NotificationPreferences.digestDay values)
 */
function getTodayDayName(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

/**
 * Process and send weekly digest for a single user.
 * Aggregates activity data, generates AI insight, and sends notification.
 */
async function processUserDigest(
  userId: string
): Promise<{ sent: boolean; emailSent: boolean }> {
  const now = new Date()
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const fourteenDaysFromNow = new Date(now)
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14)

  // Fetch user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  if (!user?.email) {
    console.warn(`[CRON:weekly-digest] User ${userId} has no email, skipping`)
    return { sent: false, emailSent: false }
  }

  const userName = user.name || 'there'

  // Gather all digest data in parallel
  const [
    newMatchCount,
    upcomingDeadlines,
    applicationUpdates,
    userProfile,
  ] = await Promise.all([
    getNewMatchCount(userId, oneWeekAgo),
    getUpcomingDeadlines(userId, now, fourteenDaysFromNow),
    getApplicationUpdates(userId, oneWeekAgo),
    getUserProfileSummary(userId),
  ])

  // Skip digest if there is nothing to report
  if (newMatchCount === 0 && upcomingDeadlines.length === 0 && applicationUpdates.length === 0) {
    return { sent: false, emailSent: false }
  }

  // Generate AI insight (non-blocking - falls back to empty string on failure)
  const aiInsight = await generateAiInsight(userName, userProfile, newMatchCount, upcomingDeadlines, applicationUpdates)

  // Build the notification
  const title = `Weekly Digest: ${newMatchCount} new match${newMatchCount === 1 ? '' : 'es'}`
  const messageParts: string[] = []
  if (newMatchCount > 0) messageParts.push(`${newMatchCount} new grant match${newMatchCount === 1 ? '' : 'es'}`)
  if (upcomingDeadlines.length > 0) messageParts.push(`${upcomingDeadlines.length} upcoming deadline${upcomingDeadlines.length === 1 ? '' : 's'}`)
  if (applicationUpdates.length > 0) messageParts.push(`${applicationUpdates.length} application update${applicationUpdates.length === 1 ? '' : 's'}`)
  const message = `This week: ${messageParts.join(', ')}.`

  // Send via notification sender (handles in-app + email)
  const result = await sendNotification({
    userId,
    type: 'system',
    title,
    message,
    link: '/app',
    metadata: {
      digestType: 'weekly',
      newMatches: newMatchCount,
      deadlinesCount: upcomingDeadlines.length,
      updatesCount: applicationUpdates.length,
    },
    emailData: {
      weeklyDigest: {
        userName,
        newMatches: newMatchCount,
        upcomingDeadlines,
        applicationUpdates,
        aiInsight,
      },
    },
  })

  return { sent: true, emailSent: result.emailSent }
}

/**
 * Count new grant matches for a user in the past week.
 * Uses GrantMatchCache entries created since lastWeek.
 */
async function getNewMatchCount(userId: string, since: Date): Promise<number> {
  try {
    return await prisma.grantMatchCache.count({
      where: {
        userId,
        createdAt: { gte: since },
      },
    })
  } catch (error) {
    console.error(`[CRON:weekly-digest] Error fetching match count for ${userId}:`, error)
    return 0
  }
}

/**
 * Get upcoming deadlines for a user's saved grants and workspaces.
 */
async function getUpcomingDeadlines(
  userId: string,
  now: Date,
  until: Date
): Promise<Array<{ title: string; deadline: string; daysLeft: number }>> {
  try {
    // Get deadlines from saved grants
    const savedGrants = await prisma.savedGrant.findMany({
      where: {
        userId,
        grant: {
          status: 'open',
          deadlineDate: {
            gte: now,
            lte: until,
          },
        },
      },
      select: {
        grant: {
          select: {
            id: true,
            title: true,
            deadlineDate: true,
          },
        },
      },
      take: 10,
    })

    // Get deadlines from workspaces
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId,
        status: { in: ['not_started', 'in_progress'] },
        OR: [
          {
            dueDate: { gte: now, lte: until },
          },
          {
            grant: {
              status: 'open',
              deadlineDate: { gte: now, lte: until },
            },
          },
        ],
      },
      select: {
        grantId: true,
        dueDate: true,
        grant: {
          select: {
            id: true,
            title: true,
            deadlineDate: true,
          },
        },
      },
      take: 10,
    })

    // Merge and deduplicate by grant ID
    const deadlineMap = new Map<string, { title: string; deadline: Date }>()

    for (const sg of savedGrants) {
      if (sg.grant.deadlineDate) {
        deadlineMap.set(sg.grant.id, {
          title: sg.grant.title,
          deadline: sg.grant.deadlineDate,
        })
      }
    }

    for (const ws of workspaces) {
      const deadline = ws.dueDate || ws.grant.deadlineDate
      if (deadline && !deadlineMap.has(ws.grantId)) {
        deadlineMap.set(ws.grantId, {
          title: ws.grant.title,
          deadline,
        })
      }
    }

    // Convert to output format, sorted by deadline
    return Array.from(deadlineMap.values())
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 10)
      .map((d) => ({
        title: d.title,
        deadline: d.deadline.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        daysLeft: Math.max(
          0,
          Math.ceil((d.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        ),
      }))
  } catch (error) {
    console.error(`[CRON:weekly-digest] Error fetching deadlines for ${userId}:`, error)
    return []
  }
}

/**
 * Get application status changes from the past week.
 */
async function getApplicationUpdates(
  userId: string,
  since: Date
): Promise<Array<{ title: string; status: string }>> {
  try {
    const applications = await prisma.grantApplication.findMany({
      where: {
        userId,
        updatedAt: { gte: since },
      },
      select: {
        status: true,
        grant: {
          select: { title: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    return applications.map((app) => ({
      title: app.grant.title,
      status: formatApplicationStatus(app.status),
    }))
  } catch (error) {
    console.error(`[CRON:weekly-digest] Error fetching app updates for ${userId}:`, error)
    return []
  }
}

/**
 * Get a brief summary of the user's profile for AI insight generation.
 */
async function getUserProfileSummary(userId: string): Promise<string> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        entityType: true,
        industryTags: true,
        state: true,
      },
    })

    if (!profile) return 'No profile available'

    let tags: string[] = []
    try {
      const parsed: unknown = JSON.parse(profile.industryTags || '[]')
      tags = Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      tags = []
    }

    const parts: string[] = []
    if (profile.entityType) parts.push(profile.entityType)
    if (tags.length > 0) parts.push(`industries: ${tags.join(', ')}`)
    if (profile.state) parts.push(`based in ${profile.state}`)

    return parts.join(', ') || 'No profile details'
  } catch {
    return 'No profile available'
  }
}

/**
 * Generate a personalized AI insight for the weekly digest.
 * Falls back gracefully to an empty string if Gemini is unavailable.
 */
async function generateAiInsight(
  userName: string,
  profileSummary: string,
  newMatches: number,
  deadlines: Array<{ title: string; daysLeft: number }>,
  updates: Array<{ title: string; status: string }>
): Promise<string> {
  try {
    const urgentDeadlines = deadlines.filter((d) => d.daysLeft <= 7)
    const prompt = `You are a helpful grant advisor. Generate a brief, personalized weekly tip (1-2 sentences max) for a grant seeker.

User profile: ${profileSummary}
This week: ${newMatches} new grant matches found.
${urgentDeadlines.length > 0 ? `Urgent deadlines: ${urgentDeadlines.map((d) => `${d.title} (${d.daysLeft} days)`).join(', ')}` : 'No urgent deadlines.'}
${updates.length > 0 ? `Recent activity: ${updates.map((u) => `${u.title} - ${u.status}`).join(', ')}` : 'No recent application activity.'}

Give a concise, actionable tip. Be encouraging but practical. Do not use greetings or sign-offs. Do not mention the user's name.`

    const result = await generateText(prompt)
    return result?.trim() || ''
  } catch (error) {
    console.warn('[CRON:weekly-digest] AI insight generation failed:', error)
    return ''
  }
}

/**
 * Format application status for display in digest
 */
function formatApplicationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    in_progress: 'In Progress',
    ready_to_submit: 'Ready to Submit',
    submitted: 'Submitted',
    awarded: 'Awarded',
    rejected: 'Not Selected',
  }
  return statusMap[status] || status
}
