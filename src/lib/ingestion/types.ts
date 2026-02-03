/**
 * Ingestion Pipeline Types
 * 
 * Defines the contract for all grant source adapters and the
 * normalized grant format used across the platform.
 */

export type IngestionSourceType = 'federal' | 'state' | 'foundation' | 'other'

export interface RawGrant {
  // Source identification
  sourceId: string
  sourceName: string
  
  // Raw data from source (varies by adapter)
  rawData: Record<string, unknown>
}

export interface NormalizedGrant {
  // Source tracking
  sourceId: string
  sourceName: string
  
  // Core fields
  title: string
  sponsor: string
  summary: string
  description: string | null
  
  // Categorization
  categories: string[]
  eligibility: string[]
  locations: string[]
  
  // Funding details
  amountMin: number | null
  amountMax: number | null
  
  // Deadlines
  deadlineDate: Date | null
  openDate: Date | null
  
  // Links and contact
  url: string
  contactEmail: string | null
  contactPhone: string | null
  contactName: string | null
  
  // Requirements
  requirements: string[]
  
  // Status
  status: 'forecasted' | 'open' | 'closed'
}

export interface IngestionResult {
  success: boolean
  grantsProcessed: number
  grantsNew: number
  grantsUpdated: number
  grantsDuplicate: number
  errors: IngestionError[]
  duration: number // milliseconds
  timestamp: Date
}

export interface IngestionError {
  sourceId: string | null
  message: string
  stack?: string
  recoverable: boolean
}

export interface AdapterConfig {
  id: string
  name: string
  type: IngestionSourceType
  description: string
  enabled: boolean
  schedule?: string // cron expression
  rateLimit?: {
    requests: number
    windowMs: number
  }
  retryConfig?: {
    maxRetries: number
    backoffMs: number
  }
}

/**
 * Base interface for all ingestion adapters.
 * Each source (Grants.gov, SAM.gov, state portals, etc.)
 * implements this interface.
 */
export interface IngestionAdapter {
  config: AdapterConfig
  
  /**
   * Fetch grants from the source.
   * Should handle pagination internally.
   */
  fetch(): Promise<RawGrant[]>
  
  /**
   * Normalize a raw grant to the standard format.
   */
  normalize(raw: RawGrant): NormalizedGrant
  
  /**
   * Optional: Test connectivity to the source.
   */
  testConnection?(): Promise<boolean>
}

/**
 * Logger interface for ingestion runs
 */
export interface IngestionLogger {
  info(message: string, metadata?: Record<string, unknown>): void
  warn(message: string, metadata?: Record<string, unknown>): void
  error(message: string, metadata?: Record<string, unknown>): void
  success(message: string, metadata?: Record<string, unknown>): void
}

/**
 * Deduplication result
 */
export interface DedupeResult {
  isDuplicate: boolean
  existingId?: string
  matchType?: 'exact' | 'fingerprint' | 'fuzzy'
  confidence?: number
}
