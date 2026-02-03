import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'

/**
 * DELETE /api/user/account
 *
 * Permanently delete the user's account and all associated data
 * Requires password confirmation for security
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Rate limiting for account deletion - use stricter limit tied to userId
    // This prevents brute force password guessing attacks on deletion
    const rateLimit = rateLimiters.accountDeletion(userId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    const body = await request.json()
    const { password, confirmation } = body

    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      )
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // For password-based accounts, verify password
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required to delete account' },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Delete all user data in order (respecting foreign key constraints)
    // Note: Most cascades should handle this, but being explicit for safety

    await prisma.$transaction(async (tx) => {
      // Delete workspace documents
      await tx.workspaceDocument.deleteMany({
        where: { workspace: { userId } },
      })

      // Delete workspaces
      await tx.workspace.deleteMany({
        where: { userId },
      })

      // Delete saved grants
      await tx.savedGrant.deleteMany({
        where: { userId },
      })

      // Delete saved searches
      await tx.savedSearch.deleteMany({
        where: { userId },
      })

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId },
      })

      // Delete user profile
      await tx.userProfile.deleteMany({
        where: { userId },
      })

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId },
      })

      // Delete accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId },
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/account
 *
 * Get account information and data summary for GDPR/data export
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const [
      user,
      accounts,
      savedGrantsCount,
      savedSearchesCount,
      workspacesCount,
      notificationsCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          organization: true,
          createdAt: true,
        },
      }),
      prisma.account.findMany({
        where: { userId },
        select: { provider: true },
      }),
      prisma.savedGrant.count({ where: { userId } }),
      prisma.savedSearch.count({ where: { userId } }),
      prisma.workspace.count({ where: { userId } }),
      prisma.notification.count({ where: { userId } }),
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      account: {
        id: user.id,
        email: user.email,
        name: user.name,
        organization: user.organization,
        createdAt: user.createdAt,
        connectedProviders: accounts.map(a => a.provider),
      },
      dataSummary: {
        savedGrants: savedGrantsCount,
        savedSearches: savedSearchesCount,
        workspaces: workspacesCount,
        notifications: notificationsCount,
      },
    })
  } catch (error) {
    console.error('Get account info error:', error)
    return NextResponse.json(
      { error: 'Failed to get account information' },
      { status: 500 }
    )
  }
}
