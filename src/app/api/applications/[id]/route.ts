import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  getApplicationWithDetails,
  updateApplicationFormData,
  updateApplicationStatus,
  updateApplicationNotes,
  prepopulateFromVault,
} from '@/lib/services/application-service'
import type { ApplicationStatus, ApplicationFormData } from '@/lib/types/application'
import { z } from 'zod'

const updateApplicationSchema = z.object({
  action: z.enum(['update_form', 'update_status', 'update_notes', 'prepopulate']).optional(),
  formData: z.record(z.unknown()).optional(),
  status: z.enum(['draft', 'in_progress', 'review', 'submitted', 'awarded', 'rejected', 'withdrawn']).optional(),
  metadata: z.record(z.unknown()).optional(),
  notes: z.string().max(50000).optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/applications/[id]
 * Get a specific application with full details
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership
    const exists = await prisma.grantApplication.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const application = await getApplicationWithDetails(id)
    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/applications/[id]
 * Update an application (form data, status, or notes)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership
    const exists = await prisma.grantApplication.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = updateApplicationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { action, formData, status: newStatus, metadata, notes } = validated.data

    let application

    switch (action) {
      case 'update_form':
        application = await updateApplicationFormData(
          id,
          formData as Partial<ApplicationFormData>
        )
        break

      case 'update_status':
        application = await updateApplicationStatus(
          id,
          newStatus as ApplicationStatus,
          metadata
        )
        break

      case 'update_notes':
        application = await updateApplicationNotes(id, notes || '')
        break

      case 'prepopulate':
        application = await prepopulateFromVault(session.user.id, id)
        break

      default:
        // Default to updating form data
        if (formData) {
          application = await updateApplicationFormData(id, formData)
        } else {
          return NextResponse.json(
            { error: 'Invalid action or missing data' },
            { status: 400 }
          )
        }
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application (only if draft or withdrawn)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership and check status
    const application = await prisma.grantApplication.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of draft or withdrawn applications
    if (!['draft', 'withdrawn'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot delete an application that has been submitted' },
        { status: 400 }
      )
    }

    // Delete related records first (cascade should handle this, but being explicit)
    await prisma.applicationTimelineEntry.deleteMany({
      where: { applicationId: id },
    })
    await prisma.applicationDocument.deleteMany({
      where: { applicationId: id },
    })
    await prisma.grantApplication.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
