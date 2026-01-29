/**
 * Ingestion Adapter Registry
 * 
 * Central registry for all grant source adapters.
 * Provides methods to get adapters by ID, type, or all enabled adapters.
 */

import type { IngestionAdapter, IngestionSourceType } from '../types'

import { grantsGovAdapter } from './grants-gov'
import { samGovAdapter } from './sam-gov'
import { californiaAdapter, newYorkAdapter } from './state-portals'
import { fordFoundationAdapter, gatesFoundationAdapter } from './foundation-feeds'

// All available adapters
const adapters: IngestionAdapter[] = [
  // Federal
  grantsGovAdapter,
  samGovAdapter,
  
  // State
  californiaAdapter,
  newYorkAdapter,
  
  // Foundation
  fordFoundationAdapter,
  gatesFoundationAdapter,
]

/**
 * Get all registered adapters
 */
export function getAllAdapters(): IngestionAdapter[] {
  return adapters
}

/**
 * Get only enabled adapters
 */
export function getEnabledAdapters(): IngestionAdapter[] {
  return adapters.filter(a => a.config.enabled)
}

/**
 * Get adapter by ID
 */
export function getAdapterById(id: string): IngestionAdapter | undefined {
  return adapters.find(a => a.config.id === id)
}

/**
 * Get adapters by source type
 */
export function getAdaptersByType(type: IngestionSourceType): IngestionAdapter[] {
  return adapters.filter(a => a.config.type === type)
}

/**
 * Register a new adapter dynamically
 */
export function registerAdapter(adapter: IngestionAdapter): void {
  const existing = adapters.findIndex(a => a.config.id === adapter.config.id)
  if (existing >= 0) {
    adapters[existing] = adapter
  } else {
    adapters.push(adapter)
  }
}

/**
 * Enable or disable an adapter
 */
export function setAdapterEnabled(id: string, enabled: boolean): boolean {
  const adapter = getAdapterById(id)
  if (adapter) {
    adapter.config.enabled = enabled
    return true
  }
  return false
}

// Re-export adapters for direct access
export {
  grantsGovAdapter,
  samGovAdapter,
  californiaAdapter,
  newYorkAdapter,
  fordFoundationAdapter,
  gatesFoundationAdapter,
}
