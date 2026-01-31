import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/auth/sessions
 *
 * Get all active sessions for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() }, // Only active sessions
      },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
      },
      orderBy: { expires: 'desc' },
    })

    // Get current session token from cookies (to mark current session)
    // Note: In a real implementation, you'd want to track more session metadata
    // like device info, IP address, last activity, etc.

    return NextResponse.json({
      sessions: sessions.map((s, index) => ({
        id: s.id,
        // Mask the token for security
        tokenPreview: s.sessionToken.slice(0, 8) + '...',
        expires: s.expires,
        // First session is typically the current one
        isCurrent: index === 0,
      })),
      count: sessions.length,
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/sessions
 *
 * Sign out from all sessions (except current) or all sessions
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    const sessionId = searchParams.get('id')

    if (sessionId) {
      // Delete specific session
      const targetSession = await prisma.session.findFirst({
        where: { id: sessionId, userId },
      })

      if (!targetSession) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      await prisma.session.delete({
        where: { id: sessionId },
      })

      return NextResponse.json({
        success: true,
        message: 'Session revoked',
      })
    }

    if (all) {
      // Delete all sessions for this user
      const result = await prisma.session.deleteMany({
        where: { userId },
      })

      return NextResponse.json({
        success: true,
        message: `Signed out from ${result.count} sessions`,
        count: result.count,
      })
    }

    return NextResponse.json(
      { error: 'Specify session id or all=true' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Delete sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sessions' },
      { status: 500 }
    )
  }
}
