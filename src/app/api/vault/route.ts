import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getVaultWithData,
  updateVault,
  calculateVaultCompleteness,
  initializeVaultFromProfile,
} from '@/lib/services/vault-service'

/**
 * GET /api/vault
 * Get user's vault with all related data
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await getVaultWithData(session.user.id)
    const completeness = await calculateVaultCompleteness(session.user.id)

    return NextResponse.json({
      ...data,
      completeness,
    })
  } catch (error) {
    console.error('Error fetching vault:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vault' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/vault
 * Update vault data
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const vault = await updateVault(session.user.id, body)
    const completeness = await calculateVaultCompleteness(session.user.id)

    return NextResponse.json({ vault, completeness })
  } catch (error) {
    console.error('Error updating vault:', error)
    return NextResponse.json(
      { error: 'Failed to update vault' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vault
 * Initialize vault from profile (one-time setup)
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vault = await initializeVaultFromProfile(session.user.id)
    const completeness = await calculateVaultCompleteness(session.user.id)

    return NextResponse.json({ vault, completeness })
  } catch (error) {
    console.error('Error initializing vault:', error)
    return NextResponse.json(
      { error: 'Failed to initialize vault' },
      { status: 500 }
    )
  }
}
