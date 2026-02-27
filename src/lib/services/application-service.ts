/**
 * GRANT APPLICATION SERVICE
 * -------------------------
 * Service for managing grant applications and tracking progress.
 */

import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'
import type {
  GrantApplicationDB,
  ParsedApplication,
  ApplicationWithDetails,
  ApplicationStatus,
  ApplicationSection,
  ApplicationFormData,
  ApplicationDocument,
  ApplicationTimelineEntry,
  ApplicationStats,
  TimelineEntryType,
} from '@/lib/types/application'
import { getVaultWithData } from './vault-service'

// ============= APPLICATION CRUD =============

/**
 * Start a new application for a grant
 */
export async function startApplication(
  userId: string,
  grantId: string
): Promise<ParsedApplication> {
  // Check if application already exists
  const existing = await prisma.grantApplication.findUnique({
    where: {
      userId_grantId: { userId, grantId },
    },
  })

  if (existing) {
    return parseApplication(existing)
  }

  // Create new application
  const application = await prisma.grantApplication.create({
    data: {
      userId,
      grantId,
      status: 'draft',
      progressPercent: 0,
      completedSections: '[]',
      formData: '{}',
    },
  })

  // Add timeline entry
  await addTimelineEntry(application.id, {
    type: 'status_change',
    title: 'Application started',
    description: 'Started working on this application',
  })

  return parseApplication(application)
}

/**
 * Get application by ID
 */
export async function getApplication(applicationId: string): Promise<ParsedApplication | null> {
  const application = await prisma.grantApplication.findUnique({
    where: { id: applicationId },
  })

  if (!application) return null
  return parseApplication(application)
}

/**
 * Get application with full details
 */
export async function getApplicationWithDetails(
  applicationId: string
): Promise<ApplicationWithDetails | null> {
  const application = await prisma.grantApplication.findUnique({
    where: { id: applicationId },
    include: {
      grant: {
        select: {
          id: true,
          title: true,
          sponsor: true,
          deadlineDate: true,
          amountMin: true,
          amountMax: true,
          url: true,
        },
      },
      documents: true,
      timeline: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!application) return null

  const parsed = parseApplication(application)
  return {
    ...parsed,
    grant: application.grant,
    documents: application.documents as ApplicationDocument[],
    timeline: application.timeline as ApplicationTimelineEntry[],
  }
}

/**
 * Get all applications for a user
 */
export async function getUserApplications(
  userId: string,
  options?: {
    status?: ApplicationStatus | ApplicationStatus[]
    limit?: number
    offset?: number
  }
): Promise<{
  applications: ApplicationWithDetails[]
  total: number
}> {
  const where: Record<string, unknown> = { userId }

  if (options?.status) {
    where.status = Array.isArray(options.status)
      ? { in: options.status }
      : options.status
  }

  const [applications, total] = await Promise.all([
    prisma.grantApplication.findMany({
      where,
      include: {
        grant: {
          select: {
            id: true,
            title: true,
            sponsor: true,
            deadlineDate: true,
            amountMin: true,
            amountMax: true,
            url: true,
          },
        },
        documents: true,
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { lastActivityAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.grantApplication.count({ where }),
  ])

  return {
    applications: applications.map(app => ({
      ...parseApplication(app),
      grant: app.grant,
      documents: app.documents as ApplicationDocument[],
      timeline: app.timeline as ApplicationTimelineEntry[],
    })),
    total,
  }
}

/**
 * Update application form data
 */
export async function updateApplicationFormData(
  applicationId: string,
  formData: Partial<ApplicationFormData>
): Promise<ParsedApplication> {
  const existing = await prisma.grantApplication.findUnique({
    where: { id: applicationId },
  })

  if (!existing) {
    throw new Error(`Application not found (applicationId: ${applicationId}) when attempting to update form data`)
  }

  // Merge with existing form data
  const existingFormData = safeJsonParse<ApplicationFormData>(existing.formData, {})
  const mergedFormData = { ...existingFormData, ...formData }

  // Calculate progress
  const { progressPercent, completedSections } = calculateProgress(mergedFormData)

  const updated = await prisma.grantApplication.update({
    where: { id: applicationId },
    data: {
      formData: JSON.stringify(mergedFormData),
      progressPercent,
      completedSections: JSON.stringify(completedSections),
      lastActivityAt: new Date(),
      // Update status if making progress
      status: existing.status === 'draft' && progressPercent > 10 ? 'in_progress' : existing.status,
    },
  })

  return parseApplication(updated)
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  metadata?: {
    confirmationNumber?: string
    submissionMethod?: string
    decisionDate?: Date
    notes?: string
  }
): Promise<ParsedApplication> {
  const updateData: Record<string, unknown> = {
    status,
    lastActivityAt: new Date(),
  }

  if (status === 'submitted') {
    updateData.submittedAt = new Date()
    if (metadata?.confirmationNumber) {
      updateData.confirmationNumber = metadata.confirmationNumber
    }
    if (metadata?.submissionMethod) {
      updateData.submissionMethod = metadata.submissionMethod
    }
  }

  if (metadata?.decisionDate) {
    updateData.decisionDate = metadata.decisionDate
  }

  const updated = await prisma.grantApplication.update({
    where: { id: applicationId },
    data: updateData,
  })

  // Add timeline entry
  await addTimelineEntry(applicationId, {
    type: 'status_change',
    title: `Status changed to ${status.replace('_', ' ')}`,
    description: metadata?.notes || undefined,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  })

  return parseApplication(updated)
}

/**
 * Update application notes
 */
export async function updateApplicationNotes(
  applicationId: string,
  notes: string
): Promise<ParsedApplication> {
  const updated = await prisma.grantApplication.update({
    where: { id: applicationId },
    data: {
      notes,
      lastActivityAt: new Date(),
    },
  })

  return parseApplication(updated)
}

// ============= TIMELINE =============

/**
 * Add a timeline entry
 */
export async function addTimelineEntry(
  applicationId: string,
  entry: {
    type: TimelineEntryType
    title: string
    description?: string
    metadata?: string
  }
): Promise<ApplicationTimelineEntry> {
  const timelineEntry = await prisma.applicationTimelineEntry.create({
    data: {
      applicationId,
      ...entry,
    },
  })

  return timelineEntry as ApplicationTimelineEntry
}

// ============= DOCUMENTS =============

/**
 * Add a document to an application
 */
export async function addApplicationDocument(
  applicationId: string,
  document: {
    name: string
    type: 'narrative' | 'budget' | 'attachment' | 'support_letter' | 'other'
    fileName: string
    fileUrl: string
    fileSize: number
    mimeType: string
    vaultDocumentId?: string
  }
): Promise<ApplicationDocument> {
  const doc = await prisma.applicationDocument.create({
    data: {
      applicationId,
      ...document,
      status: 'draft',
    },
  })

  // Add timeline entry
  await addTimelineEntry(applicationId, {
    type: 'document_upload',
    title: `Uploaded ${document.name}`,
    metadata: JSON.stringify({ documentId: doc.id, type: document.type }),
  })

  return doc as ApplicationDocument
}

// ============= PRE-POPULATE FROM VAULT =============

/**
 * Pre-populate application form data from user's vault
 */
export async function prepopulateFromVault(
  userId: string,
  applicationId: string
): Promise<ParsedApplication> {
  const { vault, textBlocks } = await getVaultWithData(userId)

  // Build form data from vault
  const formData: Partial<ApplicationFormData> = {}

  // Contact info
  if (vault.primaryContactName) formData.contactName = vault.primaryContactName
  if (vault.primaryContactTitle) formData.contactTitle = vault.primaryContactTitle
  if (vault.primaryContactEmail) formData.contactEmail = vault.primaryContactEmail
  if (vault.primaryContactPhone) formData.contactPhone = vault.primaryContactPhone

  // Organization info
  if (vault.organizationName) formData.organizationName = vault.organizationName
  if (vault.streetAddress) formData.organizationAddress = vault.streetAddress
  if (vault.city) formData.organizationCity = vault.city
  if (vault.state) formData.organizationState = vault.state
  if (vault.zipCode) formData.organizationZip = vault.zipCode
  if (vault.ein) formData.ein = vault.ein
  if (vault.dunsNumber) formData.dunsNumber = vault.dunsNumber
  if (vault.ueiNumber) formData.ueiNumber = vault.ueiNumber

  // Text blocks for narratives
  const missionBlock = textBlocks.find(b => b.category === 'mission_statement')
  const needBlock = textBlocks.find(b => b.category === 'need_statement')
  const capacityBlock = textBlocks.find(b => b.category === 'organizational_capacity')

  if (missionBlock) {
    // Could be used in project summary or org description
  }
  if (needBlock) {
    formData.needStatement = needBlock.content
  }
  if (capacityBlock) {
    formData.organizationalCapacity = capacityBlock.content
  }

  // Update the application
  return updateApplicationFormData(applicationId, formData)
}

// ============= STATISTICS =============

/**
 * Get application statistics for a user
 */
export async function getUserApplicationStats(userId: string): Promise<ApplicationStats> {
  const applications = await prisma.grantApplication.findMany({
    where: { userId },
    select: {
      status: true,
      requestedAmount: true,
      startedAt: true,
      submittedAt: true,
    },
  })

  const byStatus: Record<ApplicationStatus, number> = {
    draft: 0,
    in_progress: 0,
    ready_to_submit: 0,
    submitted: 0,
    under_review: 0,
    awarded: 0,
    rejected: 0,
    withdrawn: 0,
  }

  let totalAwarded = 0
  let completionTimes: number[] = []

  for (const app of applications) {
    byStatus[app.status as ApplicationStatus]++

    if (app.status === 'awarded' && app.requestedAmount) {
      totalAwarded += app.requestedAmount
    }

    if (app.submittedAt && app.startedAt) {
      const days = Math.ceil(
        (app.submittedAt.getTime() - app.startedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      completionTimes.push(days)
    }
  }

  const awarded = byStatus.awarded
  const rejected = byStatus.rejected
  const successRate = awarded + rejected > 0 ? (awarded / (awarded + rejected)) * 100 : 0

  const averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : 0

  return {
    total: applications.length,
    byStatus,
    inProgress: byStatus.draft + byStatus.in_progress + byStatus.ready_to_submit,
    submitted: byStatus.submitted + byStatus.under_review + byStatus.awarded + byStatus.rejected,
    successRate: Math.round(successRate),
    totalAwarded,
    averageCompletionTime: Math.round(averageCompletionTime),
  }
}

// ============= HELPER FUNCTIONS =============

function parseApplication(app: GrantApplicationDB): ParsedApplication {
  return {
    ...app,
    status: app.status as ApplicationStatus,
    submissionMethod: app.submissionMethod as 'online' | 'email' | 'mail' | null,
    completedSections: safeJsonParse<ApplicationSection[]>(app.completedSections, []),
    formData: safeJsonParse<ApplicationFormData>(app.formData, {}),
    aiDraftContent: app.aiDraftContent
      ? safeJsonParse(app.aiDraftContent, null)
      : null,
    aiSuggestions: app.aiSuggestions
      ? safeJsonParse(app.aiSuggestions, null)
      : null,
  } as ParsedApplication
}

function calculateProgress(formData: ApplicationFormData): {
  progressPercent: number
  completedSections: ApplicationSection[]
} {
  const completedSections: ApplicationSection[] = []

  // Check each section
  if (formData.contactName && formData.contactEmail) {
    completedSections.push('contact_info')
  }
  if (formData.organizationName) {
    completedSections.push('organization_info')
  }
  if (formData.projectTitle && formData.projectSummary) {
    completedSections.push('project_summary')
  }
  if (formData.projectDescription && formData.projectDescription.length > 200) {
    completedSections.push('project_narrative')
  }
  if (formData.goalsAndObjectives) {
    completedSections.push('goals_objectives')
  }
  if (formData.milestones && formData.milestones.length > 0) {
    completedSections.push('timeline')
  }
  if (formData.budgetItems && formData.budgetItems.length > 0) {
    completedSections.push('budget')
  }
  if (formData.budgetNarrative) {
    completedSections.push('budget_narrative')
  }
  if (formData.evaluationPlan) {
    completedSections.push('evaluation')
  }
  if (formData.sustainabilityPlan) {
    completedSections.push('sustainability')
  }

  // Calculate percentage (12 sections total)
  const totalSections = 12
  const progressPercent = Math.round((completedSections.length / totalSections) * 100)

  return { progressPercent, completedSections }
}
