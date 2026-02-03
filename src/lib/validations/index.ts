import { z } from 'zod'

// ==================== AUTH ====================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ==================== SEARCH ====================

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  categories: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  eligibility: z.array(z.string()).optional(),
  status: z.enum(['open', 'closed', 'all']).optional().default('open'),
  amountMin: z.coerce.number().optional(),
  amountMax: z.coerce.number().optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
  sort: z.enum(['relevance', 'deadline', 'newest', 'amount']).optional().default('relevance'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
})

export type SearchParams = z.infer<typeof searchParamsSchema>

// ==================== SAVED SEARCH ====================

export const savedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  query: z.string().optional(),
  filters: z.object({
    categories: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    eligibility: z.array(z.string()).optional(),
    status: z.string().optional(),
    amountMin: z.number().optional(),
    amountMax: z.number().optional(),
    deadlineFrom: z.string().optional(),
    deadlineTo: z.string().optional(),
  }),
  alertEnabled: z.boolean().optional().default(false),
  alertFreq: z.enum(['daily', 'weekly']).optional().default('daily'),
})

export type SavedSearchInput = z.infer<typeof savedSearchSchema>

// ==================== WORKSPACE ====================

export const createWorkspaceSchema = z.object({
  grantId: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(200),
})

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['not_started', 'in_progress', 'submitted', 'awarded', 'rejected']).optional(),
  notes: z.string().optional(),
  checklist: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })).optional(),
  dueDate: z.string().optional().nullable(),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>

// ==================== CONTACT ====================

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactInput = z.infer<typeof contactSchema>

// ==================== GRANT (for ingestion) ====================

export const normalizedGrantSchema = z.object({
  sourceId: z.string(),
  sourceName: z.string(),
  title: z.string(),
  sponsor: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  categories: z.array(z.string()),
  eligibility: z.object({
    types: z.array(z.string()),
    raw: z.string().optional(),
  }),
  locations: z.array(z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    county: z.string().optional(),
  })),
  amountMin: z.number().nullable().optional(),
  amountMax: z.number().nullable().optional(),
  amountText: z.string().optional(),
  deadlineType: z.enum(['fixed', 'rolling', 'unknown']),
  deadlineDate: z.date().nullable().optional(),
  postedDate: z.date().nullable().optional(),
  url: z.string().url(),
  contact: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(['open', 'closed', 'unknown']),
})

export type NormalizedGrant = z.infer<typeof normalizedGrantSchema>
