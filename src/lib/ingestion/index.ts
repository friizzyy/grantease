/**
 * Ingestion Pipeline
 * 
 * Main exports for the grant ingestion system.
 */

// Types
export type {
  IngestionSourceType,
  RawGrant,
  NormalizedGrant,
  IngestionResult,
  IngestionError,
  AdapterConfig,
  IngestionAdapter,
  IngestionLogger,
  DedupeResult,
} from './types'

// Adapters
export {
  getAllAdapters,
  getEnabledAdapters,
  getAdapterById,
  getAdaptersByType,
  registerAdapter,
  setAdapterEnabled,
  grantsGovAdapter,
  samGovAdapter,
  californiaAdapter,
  newYorkAdapter,
  fordFoundationAdapter,
  gatesFoundationAdapter,
} from './adapters'

// Run functions
export {
  runAdapter,
  runAllAdapters,
  runAdapterById,
} from './run'

// Utilities
export {
  cleanText,
  parseDate,
  parseAmount,
  parseAmountRange,
  normalizeCategories,
  normalizeEligibility,
  normalizeLocations,
  determineStatus,
  extractRequirements,
} from './utils/normalize'

export {
  generateFingerprint,
  calculateSimilarity,
  checkDuplicate,
  batchDeduplicate,
} from './utils/dedupe'
