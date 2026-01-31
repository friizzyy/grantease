import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/user/notification-preferences
 *
 * Get the user's notification preferences
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId },
      })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/notification-preferences
 *
 * Update the user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const {
      emailEnabled,
      grantAlerts,
      deadlineReminders,
      weeklyDigest,
      applicationUpdates,
      aiRecommendations,
      deadlineReminderDays,
      digestDay,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      timezone,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (emailEnabled !== undefined) updateData.emailEnabled = emailEnabled
    if (grantAlerts !== undefined) updateData.grantAlerts = grantAlerts
    if (deadlineReminders !== undefined) updateData.deadlineReminders = deadlineReminders
    if (weeklyDigest !== undefined) updateData.weeklyDigest = weeklyDigest
    if (applicationUpdates !== undefined) updateData.applicationUpdates = applicationUpdates
    if (aiRecommendations !== undefined) updateData.aiRecommendations = aiRecommendations

    if (deadlineReminderDays !== undefined) {
      const days = parseInt(deadlineReminderDays)
      if (days >= 1 && days <= 30) {
        updateData.deadlineReminderDays = days
      }
    }

    if (digestDay !== undefined) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      if (validDays.includes(digestDay.toLowerCase())) {
        updateData.digestDay = digestDay.toLowerCase()
      }
    }

    if (quietHoursEnabled !== undefined) updateData.quietHoursEnabled = quietHoursEnabled
    if (quietHoursStart !== undefined) updateData.quietHoursStart = quietHoursStart
    if (quietHoursEnd !== undefined) updateData.quietHoursEnd = quietHoursEnd
    if (timezone !== undefined) updateData.timezone = timezone

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
