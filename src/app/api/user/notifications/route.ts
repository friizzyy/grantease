import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { safeJsonParse } from '@/lib/api-utils'
import { z } from 'zod'

const createNotificationSchema = z.object({
  type: z.string().min(1, 'Type is required').max(100),
  title: z.string().min(1, 'Title is required').max(500),
  message: z.string().min(1, 'Message is required').max(5000),
  link: z.string().max(2000).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

const bulkUpdateNotificationsSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('mark_all_read'),
  }),
  z.object({
    action: z.literal('mark_read'),
    ids: z.array(z.string().min(1)).min(1).max(200),
  }),
])

/**
 * GET /api/user/notifications
 *
 * Get all notifications for the current user
 * Query params:
 *   - unread: boolean - filter for unread only
 *   - type: string - filter by notification type
 *   - limit: number - max results (default 50)
 *   - offset: number - pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const where: Record<string, unknown> = { userId }
    if (unreadOnly) {
      where.read = false
    }
    if (type) {
      where.type = type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ])

    // Parse metadata JSON safely
    const parsed = notifications.map(n => ({
      ...n,
      metadata: safeJsonParse<Record<string, unknown> | null>(n.metadata, null),
    }))

    return NextResponse.json({
      notifications: parsed,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/notifications
 *
 * Create a new notification (mainly for internal/system use)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const validated = createNotificationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { type, title, message, link, metadata } = validated.data

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json({
      notification: {
        ...notification,
        metadata: safeJsonParse<Record<string, unknown> | null>(notification.metadata, null),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/notifications
 *
 * Bulk update notifications (mark all as read)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const validated = bulkUpdateNotificationsSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    if (validated.data.action === 'mark_all_read') {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() },
      })
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    // action === 'mark_read'
    const { ids } = validated.data
    await prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { read: true, readAt: new Date() },
    })
    return NextResponse.json({ success: true, message: `${ids.length} notifications marked as read` })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/notifications
 *
 * Delete notifications (bulk or all read)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const deleteRead = searchParams.get('deleteRead') === 'true'
    const ids = searchParams.get('ids')?.split(',').filter(Boolean)

    if (deleteRead) {
      const result = await prisma.notification.deleteMany({
        where: { userId, read: true },
      })
      return NextResponse.json({ success: true, deleted: result.count })
    }

    if (ids && ids.length > 0) {
      const result = await prisma.notification.deleteMany({
        where: { userId, id: { in: ids } },
      })
      return NextResponse.json({ success: true, deleted: result.count })
    }

    return NextResponse.json(
      { error: 'Specify deleteRead=true or ids parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Delete notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}
