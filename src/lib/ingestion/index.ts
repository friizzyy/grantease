/**
 * Grant Ingestion System
 *
 * This module provides automated grant ingestion from multiple sources.
 * It scrapes, extracts, validates, and persists grants to the database.
 *
 * Key components:
 * - sources.ts: Source configuration (what to scrape)
 * - scraper.ts: Web scraping engine (how to fetch)
 * - extractor.ts: LLM-assisted extraction (how to parse)
 * - validator.ts: Validation & deduplication (quality control)
 * - pipeline.ts: Orchestration (putting it all together)
 */

// Types
export type {
  IngestionSourceConfig,
  RawGrantPage,
  ExtractedGrant,
  ValidationResult,
  NormalizedGrant,
  IngestionRunStats,
  IngestionError,
  PipelineProgress,
  IngestionHealthStatus,
  LLMExtractionRequest,
  LLMExtractionResponse,
} from './types';

// Source configuration
export {
  GRANT_SOURCES,
  getEnabledSources,
  getSourceById,
  getSourceByName,
  ENTITY_TYPE_MAP,
  CATEGORY_MAP,
  STATE_CODES,
} from './sources';

// Scraper functions
export {
  scrapeGrantPage,
  scrapeListingPage,
  fetchFromApi,
  verifyUrl,
  batchVerifyUrls,
} from './scraper';

// Extractor functions
export {
  extractWithLLM,
  batchExtract,
  extractFromApiResponse,
} from './extractor';

// Validator functions
export {
  validateGrant,
  normalizeGrant,
  generateFingerprint,
  calculateSimilarity,
  isGrantExpired,
  findExpiredGrants,
  processBatch,
  deduplicateAgainstExisting,
} from './validator';

// Pipeline functions
export {
  runSourceIngestion,
  runDailyIngestion,
  expireOldGrants,
  verifyGrantLinks,
  getIngestionHealth,
  getRecentRuns,
} from './pipeline';
