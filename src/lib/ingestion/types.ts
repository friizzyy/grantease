/**
 * Grant Ingestion System - Type Definitions
 *
 * This module defines all types for the automated grant ingestion pipeline.
 * The system scrapes known grant sources, extracts structured data, and
 * persists grants to the database for the matching pipeline.
 */

// ==================== SOURCE CONFIGURATION ====================

export interface IngestionSourceConfig {
  id: string;
  name: string;
  displayName: string;
  type: 'api' | 'rss' | 'scrape' | 'bulk';
  enabled: boolean;
  priority: number; // 1-10, higher = more important

  // Scraping configuration
  baseUrl: string;
  listingUrls?: string[]; // Multiple listing pages to crawl
  paginationPattern?: string; // e.g., "?page={page}"
  maxPages?: number;

  // Rate limiting
  requestDelayMs: number;
  maxConcurrent: number;

  // Selectors for scraping (CSS selectors)
  selectors?: {
    grantList?: string;
    grantLink?: string;
    title?: string;
    sponsor?: string;
    description?: string;
    deadline?: string;
    amount?: string;
    eligibility?: string;
    applyUrl?: string;
    nextPage?: string;
  };

  // API configuration (for API-based sources)
  apiConfig?: {
    endpoint: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    authType?: 'none' | 'api_key' | 'oauth';
    apiKeyParam?: string;
    responseFormat: 'json' | 'xml';
    grantsPath?: string; // JSON path to grants array
    paginationParam?: string;
    pageSizeParam?: string;
    pageSize?: number;
  };

  // RSS/Feed configuration
  feedConfig?: {
    feedUrl: string;
    itemSelector?: string;
  };

  // Extraction hints for LLM
  extractionHints?: {
    dateFormat?: string;
    amountFormat?: string;
    entityTypeMapping?: Record<string, string>;
    categoryMapping?: Record<string, string>;
  };

  // Scheduling
  scheduleIntervalHours: number;
  lastRunAt?: Date;

  // Legal/compliance
  respectsRobotsTxt: boolean;
  requiresAttribution: boolean;
  attributionText?: string;
}

// ==================== RAW SCRAPED DATA ====================

export interface RawGrantPage {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  pageUrl: string;

  // Raw content
  rawHtml?: string;
  rawText: string;

  // Basic extracted data (pre-LLM)
  preExtracted?: {
    title?: string;
    sponsor?: string;
    deadlineText?: string;
    amountText?: string;
  };

  // Metadata
  scrapedAt: Date;
  httpStatus: number;
  contentHash: string;
}

// ==================== EXTRACTED GRANT DATA ====================

export interface ExtractedGrant {
  // Identity
  sourceId: string;
  sourceName: string;
  sourceUrl: string;

  // Core fields (required)
  title: string;
  sponsor: string;
  description: string;
  applyUrl: string;

  // Summary (cleaned for display)
  summary: string;

  // Funding
  funding: {
    min?: number;
    max?: number;
    text?: string;
    type: 'grant' | 'loan' | 'rebate' | 'tax_credit' | 'forgivable_loan' | 'unknown';
  };

  // Timeline
  deadline: {
    type: 'fixed' | 'rolling' | 'unknown';
    date?: Date;
    text?: string;
  };
  postedDate?: Date;

  // Geography
  geography: {
    isNational: boolean;
    states?: string[];
    isLocalOnly?: boolean;
    serviceAreaText?: string;
  };

  // Eligibility
  eligibility: {
    entityTypes: string[]; // nonprofit, small_business, individual, for_profit, educational, government, tribal
    industries?: string[];
    restrictions?: string[];
    requirements?: string[];
    budgetMin?: number;
    budgetMax?: number;
    citizenshipRequired?: boolean;
    samRequired?: boolean;
    ruralOnly?: boolean;
    urbanOnly?: boolean;
  };

  // Categories & purpose
  categories: string[];
  purposeTags: string[];

  // Requirements
  requirements?: {
    documents?: string[];
    certifications?: string[];
    registrations?: string[];
    other?: string[];
  };

  // Contact
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    agency?: string;
  };

  // Extraction metadata
  extractionConfidence: number; // 0-100
  extractionWarnings?: string[];
  rawTextSnapshot?: string;
}

// ==================== VALIDATION RESULTS ====================

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number; // 0-100

  // Individual checks
  checks: {
    hasTitle: boolean;
    hasSponsor: boolean;
    hasDescription: boolean;
    hasApplyUrl: boolean;
    applyUrlValid: boolean;
    applyUrlStatus?: number;
    hasDeadlineOrRolling: boolean;
    deadlineNotExpired: boolean;
    hasFundingInfo: boolean;
    hasEligibilityInfo: boolean;
    hasGeographyInfo: boolean;
  };

  // Issues found
  warnings: string[];
  errors: string[];

  // Deduplication
  isDuplicate: boolean;
  duplicateOf?: string;
  similarityScore?: number;
}

// ==================== NORMALIZED GRANT (FOR DB) ====================

export interface NormalizedGrant {
  // Source identification
  sourceId: string;
  sourceName: string;

  // Core content
  title: string;
  sponsor: string;
  summary: string;
  description: string;

  // Structured fields (JSON strings for Prisma)
  categories: string; // JSON array
  eligibility: string; // JSON object
  locations: string; // JSON array

  // Amounts
  amountMin: number | null;
  amountMax: number | null;
  amountText: string | null;

  // Timeline
  deadlineType: 'fixed' | 'rolling' | 'unknown';
  deadlineDate: Date | null;
  postedDate: Date | null;

  // URLs & contact
  url: string;
  contact: string | null; // JSON

  // Requirements
  requirements: string | null; // JSON array
  requirementsStructured: string | null; // JSON array

  // Status
  status: 'open' | 'closed' | 'unknown';

  // Deduplication
  hashFingerprint: string;
  duplicateOf: string | null;

  // Classification
  fundingType: string | null;
  purposeTags: string; // JSON array

  // Structured eligibility
  eligibleEntityTypes: string; // JSON array
  eligibleStates: string; // JSON array
  eligibleIndustries: string; // JSON array
  minBudgetRequirement: number | null;
  maxBudgetRequirement: number | null;
  restrictedToRural: boolean;
  restrictedToUrban: boolean;
  citizenshipRequired: boolean;
  samRegistrationRequired: boolean;

  // Geography
  isNational: boolean;
  isStateSpecific: boolean;
  isLocalOnly: boolean;
  serviceAreaText: string | null;

  // Quality
  qualityScore: number;
  linkStatus: 'active' | 'broken' | 'unknown';
  lastVerifiedAt: Date;
  contentHash: string;
}

// ==================== INGESTION RUN ====================

export interface IngestionRunStats {
  runId: string;
  sourceName: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'success' | 'failed' | 'partial';

  // Counts
  pagesScraped: number;
  grantsFound: number;
  grantsNew: number;
  grantsUpdated: number;
  grantsDuplicates: number;
  grantsExpired: number;
  grantsFailed: number;

  // Errors
  errors: IngestionError[];

  // Performance
  durationMs?: number;
  avgExtractionTimeMs?: number;
}

export interface IngestionError {
  timestamp: Date;
  stage: 'scrape' | 'extract' | 'validate' | 'persist' | 'expire_old' | 'verify_links';
  url?: string;
  message: string;
  stack?: string;
  recoverable: boolean;
}

// ==================== PIPELINE STAGES ====================

export type PipelineStage =
  | 'scrape'
  | 'extract'
  | 'validate'
  | 'deduplicate'
  | 'normalize'
  | 'persist'
  | 'verify_links'
  | 'expire_old';

export interface PipelineProgress {
  stage: PipelineStage;
  progress: number; // 0-100
  message: string;
  itemsProcessed: number;
  itemsTotal: number;
}

// ==================== SYSTEM HEALTH ====================

export interface IngestionHealthStatus {
  healthy: boolean;
  lastSuccessfulRun?: Date;
  activeGrantsCount: number;
  expiredGrantsToday: number;
  failedSourcesCount: number;

  sources: {
    name: string;
    lastRun?: Date;
    status: 'healthy' | 'degraded' | 'failed' | 'never_run';
    grantsCount: number;
    lastError?: string;
  }[];

  alerts: {
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }[];
}

// ==================== LLM EXTRACTION ====================

export interface LLMExtractionRequest {
  rawText: string;
  sourceUrl: string;
  sourceName: string;
  preExtracted?: {
    title?: string;
    sponsor?: string;
    deadlineText?: string;
    amountText?: string;
  };
  extractionHints?: Record<string, string>;
}

export interface LLMExtractionResponse {
  success: boolean;
  grant?: ExtractedGrant;
  confidence: number;
  warnings?: string[];
  error?: string;
}
