import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendNotification } from '@/lib/services/notification-sender'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * GET /api/cron/send-deadline-reminders
 *
 * Daily cron job that sends deadline reminder notifications to users.
 *
 * For each user with deadlineReminders enabled:
 *   1. Finds saved grants with deadlines within their deadlineReminderDays window
 *   2. Finds active workspaces/applications with upcoming deadlines
 *   3. Deduplicates against reminders already sent today
 *   4. Sends in-app + email notifications via sendNotification
 *
 * Security: Validates CRON_SECRET header
 * Vercel Cron: "0 9 * * *" (Daily at 9 AM UTC)
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[CRON:deadline-reminders] CRON_SECRET not configured')
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
    usersProcessed: 0,
    remindersCreated: 0,
    emailsSent: 0,
    skippedAlreadyNotified: 0,
    errors: [] as string[],
    duration: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    // Find all users with deadline reminders enabled
    const prefsWithReminders = await prisma.notificationPreferences.findMany({
      where: {
        deadlineReminders: true,
        emailEnabled: true,
      },
      select: {
        userId: true,
        deadlineReminderDays: true,
      },
    })

    if (prefsWithReminders.length === 0) {
      results.duration = Date.now() - startTime
      return NextResponse.json(results)
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Process users in batches of 10 to avoid timeouts
    const BATCH_SIZE = 10
    for (let i = 0; i < prefsWithReminders.length; i += BATCH_SIZE) {
      const batch = prefsWithReminders.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (pref) => {
          try {
            await processUserDeadlines(pref.userId, pref.deadlineReminderDays, todayStart, now, results)
            results.usersProcessed++
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error'
            results.errors.push(`User ${pref.userId}: ${msg}`)
            console.error(`[CRON:deadline-reminders] Error for user ${pref.userId}:`, msg)
          }
        })
      )
    }

    results.duration = Date.now() - startTime

    console.log(
      `[CRON:deadline-reminders] Complete: ${results.usersProcessed} users, ` +
      `${results.remindersCreated} reminders, ${results.emailsSent} emails, ` +
      `${results.skippedAlreadyNotified} skipped`
    )

    return NextResponse.json(results)
  } catch (error) {
    results.success = false
    results.duration = Date.now() - startTime
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')

    console.error('[CRON:deadline-reminders] Failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}

/**
 * Process deadline reminders for a single user.
 * Finds upcoming deadlines from saved grants and workspaces,
 * skips grants already notified today, and sends consolidated reminder.
 */
async function processUserDeadlines(
  userId: string,
  deadlineReminderDays: number,
  todayStart: Date,
  now: Date,
  results: {
    remindersCreated: number
    emailsSent: number
    skippedAlreadyNotified: number
    errors: string[]
  }
): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://grantsbyai.com'

  // Calculate the deadline window
  const windowEnd = new Date(now)
  windowEnd.setDate(windowEnd.getDate() + deadlineReminderDays)

  // Find grants that the user has saved with upcoming deadlines
  const savedGrants = await prisma.savedGrant.findMany({
    where: {
      userId,
      grant: {
        status: 'open',
        deadlineDate: {
          gte: now,
          lte: windowEnd,
        },
      },
    },
    select: {
      grantId: true,
      grant: {
        select: {
          id: true,
          title: true,
          sponsor: true,
          deadlineDate: true,
        },
      },
    },
  })

  // Find workspaces with upcoming deadlines (via their linked grants or workspace dueDate)
  const workspaces = await prisma.workspace.findMany({
    where: {
      userId,
      status: { in: ['not_started', 'in_progress'] },
      OR: [
        {
          dueDate: {
            gte: now,
            lte: windowEnd,
          },
        },
        {
          grant: {
            status: 'open',
            deadlineDate: {
              gte: now,
              lte: windowEnd,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      grantId: true,
      dueDate: true,
      grant: {
        select: {
          id: true,
          title: true,
          sponsor: true,
          deadlineDate: true,
        },
      },
    },
  })

  // Merge grants from saved and workspaces, deduplicating by grantId
  const grantDeadlinesMap = new Map<
    string,
    {
      grantId: string
      title: string
      sponsor: string
      deadline: Date
      workspaceId?: string
    }
  >()

  for (const sg of savedGrants) {
    if (sg.grant.deadlineDate) {
      grantDeadlinesMap.set(sg.grantId, {
        grantId: sg.grantId,
        title: sg.grant.title,
        sponsor: sg.grant.sponsor,
        deadline: sg.grant.deadlineDate,
      })
    }
  }

  for (const ws of workspaces) {
    // Use workspace dueDate if set, otherwise fall back to grant deadline
    const deadline = ws.dueDate || ws.grant.deadlineDate
    if (deadline) {
      const existing = grantDeadlinesMap.get(ws.grantId)
      grantDeadlinesMap.set(ws.grantId, {
        grantId: ws.grantId,
        title: ws.grant.title,
        sponsor: ws.grant.sponsor,
        deadline,
        workspaceId: ws.id,
        // Keep existing entry if it has an earlier deadline
        ...(existing && existing.deadline < deadline ? { deadline: existing.deadline } : {}),
      })
    }
  }

  if (grantDeadlinesMap.size === 0) {
    return
  }

  // Check which grants already had a reminder sent today
  const grantIds = Array.from(grantDeadlinesMap.keys())
  const existingReminders = await prisma.notification.findMany({
    where: {
      userId,
      type: 'deadline_reminder',
      createdAt: { gte: todayStart },
      // Check metadata for grantId to avoid duplicate reminders
      OR: grantIds.map((grantId) => ({
        metadata: { contains: grantId },
      })),
    },
    select: {
      metadata: true,
    },
  })

  // Parse already-notified grant IDs from metadata
  const alreadyNotifiedGrantIds = new Set<string>()
  for (const reminder of existingReminders) {
    if (reminder.metadata) {
      try {
        const meta = JSON.parse(reminder.metadata) as Record<string, unknown>
        if (typeof meta.grantId === 'string') {
          alreadyNotifiedGrantIds.add(meta.grantId)
        }
        if (Array.isArray(meta.grantIds)) {
          for (const id of meta.grantIds) {
            if (typeof id === 'string') alreadyNotifiedGrantIds.add(id)
          }
        }
      } catch {
        // Invalid metadata JSON, skip
      }
    }
  }

  // Filter out already-notified grants
  const grantsToNotify: Array<{
    grantId: string
    title: string
    sponsor: string
    deadline: Date
    daysLeft: number
    workspaceId?: string
  }> = []

  for (const [grantId, grant] of grantDeadlinesMap) {
    if (alreadyNotifiedGrantIds.has(grantId)) {
      results.skippedAlreadyNotified++
      continue
    }

    const daysLeft = Math.ceil(
      (grant.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    grantsToNotify.push({
      ...grant,
      daysLeft: Math.max(0, daysLeft),
    })
  }

  if (grantsToNotify.length === 0) {
    return
  }

  // Sort by urgency (fewest days left first)
  grantsToNotify.sort((a, b) => a.daysLeft - b.daysLeft)

  // Build notification content
  const urgentCount = grantsToNotify.filter((g) => g.daysLeft <= 3).length
  const title =
    urgentCount > 0
      ? `Urgent: ${urgentCount} grant deadline${urgentCount === 1 ? '' : 's'} approaching`
      : `${grantsToNotify.length} grant deadline${grantsToNotify.length === 1 ? '' : 's'} coming up`

  const message = grantsToNotify
    .slice(0, 3)
    .map((g) => {
      const daysLabel = g.daysLeft === 0 ? 'today' : g.daysLeft === 1 ? 'tomorrow' : `in ${g.daysLeft} days`
      return `${g.title} (${daysLabel})`
    })
    .join('; ')
    + (grantsToNotify.length > 3 ? ` and ${grantsToNotify.length - 3} more` : '')

  // Format deadline data for email template
  const deadlinesForEmail = grantsToNotify.map((g) => ({
    title: g.title,
    sponsor: g.sponsor,
    deadline: g.deadline.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    daysLeft: g.daysLeft,
    workspaceUrl: g.workspaceId ? `${appUrl}/app/workspace/${g.workspaceId}` : undefined,
  }))

  // Send the notification
  const result = await sendNotification({
    userId,
    type: 'deadline_reminder',
    title,
    message,
    link: '/app/workspace',
    metadata: {
      grantIds: grantsToNotify.map((g) => g.grantId),
      grantsCount: grantsToNotify.length,
      urgentCount,
    },
    emailData: {
      deadlines: deadlinesForEmail,
    },
  })

  results.remindersCreated++
  if (result.emailSent) {
    results.emailsSent++
  }
}
