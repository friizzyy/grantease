/**
 * FIELD-LEVEL ENCRYPTION (AES-256-GCM)
 * ------------------------------------
 * Symmetric encryption for sensitive vault fields (EIN, SSN, bank account).
 *
 * Storage format: `enc:v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>`
 * - Self-describing: can detect encrypted vs plaintext values and migrate lazily.
 * - IV is random per-encryption (12 bytes recommended for GCM).
 * - Auth tag prevents tampering.
 *
 * Key sourcing (in order of preference):
 *   1. process.env.FIELD_ENCRYPTION_KEY — 32-byte hex string (generate: openssl rand -hex 32)
 *   2. Derived from process.env.NEXTAUTH_SECRET via HKDF for dev/fallback
 *
 * If no key is available the functions are no-ops — they return the value unchanged
 * and log a warning. This keeps the app functional in dev without setup but means
 * production deployments MUST set FIELD_ENCRYPTION_KEY.
 */

import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_BYTES = 12
const KEY_BYTES = 32
const PREFIX = 'enc:v1:'

let cachedKey: Buffer | null = null
let warnedMissingKey = false

function getKey(): Buffer | null {
  if (cachedKey) return cachedKey

  const raw = process.env.FIELD_ENCRYPTION_KEY
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) {
    cachedKey = Buffer.from(raw, 'hex')
    return cachedKey
  }

  // Dev fallback: derive from NEXTAUTH_SECRET via HKDF-SHA256
  const fallback = process.env.NEXTAUTH_SECRET
  if (fallback && fallback.length >= 16) {
    const derived = crypto.hkdfSync(
      'sha256',
      Buffer.from(fallback, 'utf8'),
      Buffer.alloc(0),
      Buffer.from('grants-field-enc-v1', 'utf8'),
      KEY_BYTES
    )
    cachedKey = Buffer.from(derived)
    return cachedKey
  }

  if (!warnedMissingKey) {
    warnedMissingKey = true
    console.warn('[field-encryption] No FIELD_ENCRYPTION_KEY or NEXTAUTH_SECRET set — sensitive fields will be stored as plaintext.')
  }
  return null
}

/**
 * Encrypt a string value. Pass-through for null/undefined/empty.
 * If already encrypted (prefix detected) returns as-is to avoid double-encrypt.
 */
export function encryptField(value: string | null | undefined): string | null | undefined {
  if (value == null || value === '') return value
  if (value.startsWith(PREFIX)) return value // already encrypted

  const key = getKey()
  if (!key) return value // graceful no-op

  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`
}

/**
 * Decrypt a field. Returns plaintext as-is if not encrypted (legacy data).
 * Returns null for null input; returns original string on decryption failure
 * (with a logged warning) so the app doesn't crash on corrupt data.
 */
export function decryptField(value: string | null | undefined): string | null | undefined {
  if (value == null || value === '') return value
  if (!value.startsWith(PREFIX)) return value // plaintext (legacy)

  const key = getKey()
  if (!key) return value

  try {
    const body = value.slice(PREFIX.length)
    const [ivB64, tagB64, dataB64] = body.split(':')
    if (!ivB64 || !tagB64 || !dataB64) return value
    const iv = Buffer.from(ivB64, 'base64')
    const authTag = Buffer.from(tagB64, 'base64')
    const ciphertext = Buffer.from(dataB64, 'base64')
    const decipher = crypto.createDecipheriv(ALGO, key, iv)
    decipher.setAuthTag(authTag)
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return plain.toString('utf8')
  } catch (err) {
    console.warn('[field-encryption] Decryption failed for a field — returning raw value:', err instanceof Error ? err.message : err)
    return value
  }
}

/** Apply encryption to any values present in the record. */
export function encryptFields<T extends Record<string, unknown>>(record: T, keys: readonly (keyof T)[]): T {
  const out = { ...record }
  for (const k of keys) {
    const v = out[k]
    if (typeof v === 'string') {
      out[k] = encryptField(v) as T[keyof T]
    }
  }
  return out
}

/** Apply decryption to any string values present in the record. */
export function decryptFields<T extends Record<string, unknown>>(record: T, keys: readonly (keyof T)[]): T {
  const out = { ...record }
  for (const k of keys) {
    const v = out[k]
    if (typeof v === 'string') {
      out[k] = decryptField(v) as T[keyof T]
    }
  }
  return out
}

/**
 * Fields on UserVault that contain PII or financial data and should be
 * encrypted at rest. Keep this list in sync with `vault-service.ts`.
 */
export const VAULT_SENSITIVE_FIELDS = [
  'ein',
  'routingNumber',
  'accountNumber',
] as const
