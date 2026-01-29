import type { Grant, User, Workspace, SavedSearch, SavedGrant, IngestionRun, IngestionSource } from '@prisma/client'

// Re-export Prisma types
export type { Grant, User, Workspace, SavedSearch, SavedGrant, IngestionRun, IngestionSource }

// Extended types with relations
export type GrantWithRelations = Grant & {
  savedBy?: SavedGrant[]
  workspaces?: Workspace[]
}

export type WorkspaceWithGrant = Workspace & {
  grant: Grant
}

export type SavedGrantWithGrant = SavedGrant & {
  grant: Grant
}

export type IngestionRunWithSource = IngestionRun & {
  source?: IngestionSource | null
}

// Parsed JSON types
export interface GrantEligibility {
  types: string[]
  raw?: string
}

export interface GrantLocation {
  country?: string
  state?: string
  county?: string
}

export interface GrantContact {
  name?: string
  email?: string
  phone?: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

// Search types
export interface SearchFilters {
  categories?: string[]
  locations?: string[]
  eligibility?: string[]
  status?: 'open' | 'closed' | 'all'
  amountMin?: number
  amountMax?: number
  deadlineFrom?: string
  deadlineTo?: string
}

export interface SearchResult {
  grants: Grant[]
  total: number
  page: number
  totalPages: number
}

// Ingestion types
export interface IngestionAdapter {
  name: string
  displayName: string
  type: 'api' | 'feed' | 'bulk'
  fetch: () => Promise<RawGrantData[]>
  normalize: (data: RawGrantData) => NormalizedGrantData
}

export interface RawGrantData {
  [key: string]: unknown
}

export interface NormalizedGrantData {
  sourceId: string
  sourceName: string
  title: string
  sponsor: string
  summary: string
  description?: string
  categories: string[]
  eligibility: GrantEligibility
  locations: GrantLocation[]
  amountMin?: number | null
  amountMax?: number | null
  amountText?: string
  deadlineType: 'fixed' | 'rolling' | 'unknown'
  deadlineDate?: Date | null
  postedDate?: Date | null
  url: string
  contact?: GrantContact
  requirements?: string[]
  status: 'open' | 'closed' | 'unknown'
}

export interface IngestionLog {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  data?: unknown
}

export interface IngestionResult {
  sourceName: string
  status: 'success' | 'failed' | 'partial'
  grantsFound: number
  grantsNew: number
  grantsUpdated: number
  grantsDupes: number
  errors: string[]
  logs: IngestionLog[]
}

// UI types
export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface PricingTier {
  name: string
  price: number | 'Custom'
  period: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}

export interface FAQItem {
  question: string
  answer: string
}

export interface Stat {
  label: string
  value: string
  suffix?: string
}
