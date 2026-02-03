import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  addVaultTextBlock,
  updateVaultTextBlock,
  deleteVaultTextBlock,
  getOrCreateVault,
} from '@/lib/services/vault-service'
import type { TextBlockCategory } from '@/lib/types/vault'

/**
 * GET /api/vault/text-blocks
 * Get all text blocks in the vault
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vault = await getOrCreateVault(session.user.id)
    const textBlocks = await prisma.vaultTextBlock.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ textBlocks })
  } catch (error) {
    console.error('Error fetching text blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch text blocks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vault/text-blocks
 * Add a new text block to the vault
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      category,
      content,
      shortVersion,
      longVersion,
      aiGenerated,
    } = body

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: 'Title, category, and content are required' },
        { status: 400 }
      )
    }

    const vault = await getOrCreateVault(session.user.id)
    const textBlock = await addVaultTextBlock(vault.id, {
      title,
      category: category as TextBlockCategory,
      content,
      shortVersion,
      longVersion,
      aiGenerated,
    })

    return NextResponse.json({ textBlock })
  } catch (error) {
    console.error('Error adding text block:', error)
    return NextResponse.json(
      { error: 'Failed to add text block' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/vault/text-blocks
 * Update a text block
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { blockId, ...updateData } = body

    if (!blockId) {
      return NextResponse.json(
        { error: 'Block ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingBlock = await prisma.vaultTextBlock.findFirst({
      where: { id: blockId, vaultId: vault.id },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Text block not found' },
        { status: 404 }
      )
    }

    const textBlock = await updateVaultTextBlock(blockId, updateData)
    return NextResponse.json({ textBlock })
  } catch (error) {
    console.error('Error updating text block:', error)
    return NextResponse.json(
      { error: 'Failed to update text block' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vault/text-blocks
 * Delete a text block
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockId = searchParams.get('id')

    if (!blockId) {
      return NextResponse.json(
        { error: 'Block ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingBlock = await prisma.vaultTextBlock.findFirst({
      where: { id: blockId, vaultId: vault.id },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Text block not found' },
        { status: 404 }
      )
    }

    await deleteVaultTextBlock(blockId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting text block:', error)
    return NextResponse.json(
      { error: 'Failed to delete text block' },
      { status: 500 }
    )
  }
}
