import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getVaultWithData,
  updateVault,
  calculateVaultCompleteness,
  initializeVaultFromProfile,
} from '@/lib/services/vault-service'
import { z } from 'zod'

const updateVaultSchema = z.object({
  organizationName: z.string().max(500).optional(),
  primaryContactName: z.string().max(500).optional(),
  primaryContactEmail: z.string().email().max(500).optional().or(z.literal('')),
  primaryContactPhone: z.string().max(50).optional(),
  primaryContactTitle: z.string().max(200).optional(),
  missionStatement: z.string().max(10000).optional(),
  organizationHistory: z.string().max(10000).optional(),
  ein: z.string().max(50).optional(),
  dunsNumber: z.string().max(50).optional(),
  samUei: z.string().max(50).optional(),
  yearFounded: z.number().int().min(1800).max(2100).nullable().optional(),
  website: z.string().max(2000).optional(),
  address: z.string().max(1000).optional(),
  city: z.string().max(200).optional(),
  state: z.string().max(10).optional(),
  zipCode: z.string().max(20).optional(),
  annualBudget: z.string().max(50).optional(),
  numberOfEmployees: z.number().int().min(0).nullable().optional(),
}).passthrough()

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
    const validated = updateVaultSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const vault = await updateVault(session.user.id, validated.data)
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
