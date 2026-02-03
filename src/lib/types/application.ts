/**
 * GRANT APPLICATION TYPES
 * -----------------------
 * Type definitions for tracking grant applications
 */

// ============= APPLICATION STATUS =============

export type ApplicationStatus =
  | 'draft' // Just started, minimal info
  | 'in_progress' // Actively working on it
  | 'ready_to_submit' // Complete, pending submission
  | 'submitted' // Sent to funder
  | 'under_review' // Funder is reviewing
  | 'awarded' // Got the grant!
  | 'rejected' // Not selected
  | 'withdrawn' // User cancelled

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  ready_to_submit: 'Ready to Submit',
  submitted: 'Submitted',
  under_review: 'Under Review',
  awarded: 'Awarded',
  rejected: 'Not Selected',
  withdrawn: 'Withdrawn',
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'gray',
  in_progress: 'blue',
  ready_to_submit: 'yellow',
  submitted: 'purple',
  under_review: 'indigo',
  awarded: 'green',
  rejected: 'red',
  withdrawn: 'gray',
}

// ============= APPLICATION SECTIONS =============

export type ApplicationSection =
  | 'contact_info'
  | 'organization_info'
  | 'project_summary'
  | 'project_narrative'
  | 'goals_objectives'
  | 'timeline'
  | 'budget'
  | 'budget_narrative'
  | 'evaluation'
  | 'sustainability'
  | 'attachments'
  | 'certifications'

export const APPLICATION_SECTIONS: { id: ApplicationSection; label: string; description: string }[] = [
  { id: 'contact_info', label: 'Contact Information', description: 'Your contact details' },
  { id: 'organization_info', label: 'Organization Info', description: 'About your organization' },
  { id: 'project_summary', label: 'Project Summary', description: 'Brief overview of your project' },
  { id: 'project_narrative', label: 'Project Narrative', description: 'Detailed project description' },
  { id: 'goals_objectives', label: 'Goals & Objectives', description: 'What you aim to achieve' },
  { id: 'timeline', label: 'Project Timeline', description: 'Key milestones and dates' },
  { id: 'budget', label: 'Budget', description: 'Detailed budget breakdown' },
  { id: 'budget_narrative', label: 'Budget Narrative', description: 'Budget justification' },
  { id: 'evaluation', label: 'Evaluation Plan', description: 'How you\'ll measure success' },
  { id: 'sustainability', label: 'Sustainability', description: 'Long-term funding plans' },
  { id: 'attachments', label: 'Attachments', description: 'Required documents' },
  { id: 'certifications', label: 'Certifications', description: 'Required certifications' },
]

// ============= APPLICATION =============

// Raw database model (status is string from Prisma)
export interface GrantApplicationDB {
  id: string
  userId: string
  grantId: string

  // Status
  status: string // Prisma returns string
  startedAt: Date
  lastActivityAt: Date
  submittedAt: Date | null
  decisionDate: Date | null

  // Project details
  projectTitle: string | null
  projectSummary: string | null
  requestedAmount: number | null

  // Progress
  completedSections: string // JSON array
  currentSection: string | null
  progressPercent: number

  // Form data (all responses)
  formData: string // JSON object

  // AI assistance
  aiDraftContent: string | null // JSON
  aiSuggestions: string | null // JSON

  // Notes
  notes: string | null
  internalDeadline: Date | null

  // Submission
  confirmationNumber: string | null
  submissionMethod: string | null

  createdAt: Date
  updatedAt: Date
}

// Typed version with proper status type
export interface GrantApplication extends Omit<GrantApplicationDB, 'status' | 'submissionMethod'> {
  status: ApplicationStatus
  submissionMethod: 'online' | 'email' | 'mail' | null
}

// Parsed application with JSON fields resolved
export interface ParsedApplication extends Omit<GrantApplication, 'completedSections' | 'formData' | 'aiDraftContent' | 'aiSuggestions'> {
  completedSections: ApplicationSection[]
  formData: ApplicationFormData
  aiDraftContent?: AIDraftContent | null
  aiSuggestions?: AISuggestion[] | null
}

// ============= FORM DATA =============

export interface ApplicationFormData {
  // Contact Info
  contactName?: string
  contactTitle?: string
  contactEmail?: string
  contactPhone?: string

  // Organization Info
  organizationName?: string
  organizationAddress?: string
  organizationCity?: string
  organizationState?: string
  organizationZip?: string
  ein?: string
  dunsNumber?: string
  ueiNumber?: string

  // Project Summary
  projectTitle?: string
  projectSummary?: string
  totalProjectCost?: number
  amountRequested?: number
  projectStartDate?: string
  projectEndDate?: string

  // Narratives
  needStatement?: string
  projectDescription?: string
  goalsAndObjectives?: string
  methodology?: string
  evaluationPlan?: string
  sustainabilityPlan?: string
  organizationalCapacity?: string

  // Budget
  budgetItems?: BudgetLineItem[]
  budgetNarrative?: string

  // Timeline
  milestones?: ProjectMilestone[]

  // Custom fields (grant-specific)
  customFields?: Record<string, string | number | boolean | string[]>
}

export interface BudgetLineItem {
  id: string
  category: string
  description: string
  amount: number
  justification?: string
  fromVault?: boolean // True if pulled from vault
  vaultItemId?: string
}

export interface ProjectMilestone {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  deliverables?: string[]
}

// ============= AI ASSISTANCE =============

export interface AIDraftContent {
  sections: {
    [key in ApplicationSection]?: {
      content: string
      confidence: number
      sources: string[] // What data it was based on
      generatedAt: string
    }
  }
}

export interface AISuggestion {
  id: string
  section: ApplicationSection
  type: 'improvement' | 'missing' | 'tip' | 'warning'
  title: string
  description: string
  suggestedContent?: string
  dismissed: boolean
  createdAt: string
}

// ============= APPLICATION DOCUMENT =============

export type ApplicationDocumentType =
  | 'narrative'
  | 'budget'
  | 'attachment'
  | 'support_letter'
  | 'other'

export interface ApplicationDocument {
  id: string
  applicationId: string
  name: string
  type: ApplicationDocumentType
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  vaultDocumentId?: string | null // If reused from vault
  status: 'draft' | 'final' | 'submitted'
  createdAt: Date
  updatedAt: Date
}

// ============= TIMELINE ENTRY =============

export type TimelineEntryType =
  | 'status_change'
  | 'document_upload'
  | 'note_added'
  | 'ai_assist'
  | 'submission'
  | 'section_complete'
  | 'feedback'

export interface ApplicationTimelineEntry {
  id: string
  applicationId: string
  type: TimelineEntryType
  title: string
  description?: string | null
  metadata?: string | null // JSON
  createdAt: Date
}

// ============= APPLICATION WITH RELATIONS =============

export interface ApplicationWithDetails extends ParsedApplication {
  grant: {
    id: string
    title: string
    sponsor: string
    deadlineDate?: Date | null
    amountMin?: number | null
    amountMax?: number | null
    url: string
  }
  documents: ApplicationDocument[]
  timeline: ApplicationTimelineEntry[]
}

// ============= APPLICATION STATS =============

export interface ApplicationStats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  inProgress: number
  submitted: number
  successRate: number // Awarded / (Awarded + Rejected)
  totalAwarded: number // Dollar amount
  averageCompletionTime: number // Days from start to submit
}
