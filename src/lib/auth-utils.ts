import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

/**
 * Get the current authenticated session on the server
 * Returns null if not authenticated
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/**
 * Require authentication for an API route
 * Returns the user ID if authenticated, or a 401 response
 */
export async function requireAuth(): Promise<
  | { userId: string; error: null }
  | { userId: null; error: NextResponse }
> {
  const session = await getSession()

  if (!session?.user?.id) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  return {
    userId: session.user.id,
    error: null,
  }
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  // You can extend this to check the user's role from the database
  return !!session?.user?.id
}
