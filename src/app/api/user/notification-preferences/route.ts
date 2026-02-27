import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const notificationPreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  grantAlerts: z.boolean().optional(),
  deadlineReminders: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  applicationUpdates: z.boolean().optional(),
  aiRecommendations: z.boolean().optional(),
  deadlineReminderDays: z.coerce.number().int().min(1).max(30).optional(),
  digestDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().max(10).optional(),
  quietHoursEnd: z.string().max(10).optional(),
  timezone: z.string().max(100).optional(),
})

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
    const validated = notificationPreferencesSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Build update data from validated fields
    const updateData: Record<string, unknown> = {}
    const data = validated.data

    if (data.emailEnabled !== undefined) updateData.emailEnabled = data.emailEnabled
    if (data.grantAlerts !== undefined) updateData.grantAlerts = data.grantAlerts
    if (data.deadlineReminders !== undefined) updateData.deadlineReminders = data.deadlineReminders
    if (data.weeklyDigest !== undefined) updateData.weeklyDigest = data.weeklyDigest
    if (data.applicationUpdates !== undefined) updateData.applicationUpdates = data.applicationUpdates
    if (data.aiRecommendations !== undefined) updateData.aiRecommendations = data.aiRecommendations
    if (data.deadlineReminderDays !== undefined) updateData.deadlineReminderDays = data.deadlineReminderDays
    if (data.digestDay !== undefined) updateData.digestDay = data.digestDay
    if (data.quietHoursEnabled !== undefined) updateData.quietHoursEnabled = data.quietHoursEnabled
    if (data.quietHoursStart !== undefined) updateData.quietHoursStart = data.quietHoursStart
    if (data.quietHoursEnd !== undefined) updateData.quietHoursEnd = data.quietHoursEnd
    if (data.timezone !== undefined) updateData.timezone = data.timezone

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
