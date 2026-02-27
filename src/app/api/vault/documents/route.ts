import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  addVaultDocument,
  updateVaultDocument,
  deleteVaultDocument,
  getOrCreateVault,
} from '@/lib/services/vault-service'
import type { DocumentType } from '@/lib/types/vault'
import { z } from 'zod'

const addDocumentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  type: z.string().min(1, 'Type is required').max(100),
  description: z.string().max(2000).optional(),
  fileName: z.string().min(1, 'File name is required').max(500),
  fileUrl: z.string().min(1, 'File URL is required').max(2000),
  fileSize: z.number().min(1, 'File size is required').max(100_000_000),
  mimeType: z.string().min(1, 'MIME type is required').max(200),
  documentDate: z.string().optional(),
  expiresAt: z.string().optional(),
})

const updateDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID required').max(200),
  name: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  documentDate: z.string().optional(),
  expiresAt: z.string().optional(),
  isPublic: z.boolean().optional(),
})

/**
 * GET /api/vault/documents
 * Get all documents in the vault
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vault = await getOrCreateVault(session.user.id)
    const documents = await prisma.vaultDocument.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vault/documents
 * Add a new document to the vault
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = addDocumentSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const {
      name,
      type,
      description,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      documentDate,
      expiresAt,
    } = validated.data

    const vault = await getOrCreateVault(session.user.id)
    const document = await addVaultDocument(vault.id, {
      name,
      type: type as DocumentType,
      description,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      documentDate: documentDate ? new Date(documentDate) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error adding document:', error)
    return NextResponse.json(
      { error: 'Failed to add document' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/vault/documents
 * Update a document
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateDocumentSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { documentId, documentDate, expiresAt, ...rest } = validated.data

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingDoc = await prisma.vaultDocument.findFirst({
      where: { id: documentId, vaultId: vault.id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Convert string dates to Date objects for the service layer
    const serviceData: Record<string, unknown> = { ...rest }
    if (documentDate !== undefined) serviceData.documentDate = new Date(documentDate)
    if (expiresAt !== undefined) serviceData.expiresAt = new Date(expiresAt)

    const document = await updateVaultDocument(documentId, serviceData as Parameters<typeof updateVaultDocument>[1])
    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vault/documents
 * Delete a document
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingDoc = await prisma.vaultDocument.findFirst({
      where: { id: documentId, vaultId: vault.id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    await deleteVaultDocument(documentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
