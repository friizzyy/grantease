#!/usr/bin/env tsx
/**
 * Environment Validation Script
 * ─────────────────────────────
 * Run: npx tsx scripts/validate-env.ts
 *
 * Validates all environment variables are set correctly
 * before starting the application or deploying.
 */

import { z } from 'zod'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env file if it exists (for local dev)
const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex)
    let value = trimmed.slice(eqIndex + 1)
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // Don't override existing env vars
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const requiredSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
})

const optionalSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  ADMIN_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  CANDID_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

console.log('\n🔍 Validating environment variables...\n')

// Check required vars
const requiredResult = requiredSchema.safeParse(process.env)
if (!requiredResult.success) {
  console.error('❌ REQUIRED variables missing:\n')
  for (const issue of requiredResult.error.issues) {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error('\n   Copy .env.example to .env and fill in required values.\n')
  process.exit(1)
}
console.log('✅ Required variables: All set')

// Check optional vars and report status
const optionalResult = optionalSchema.safeParse(process.env)
const optionalData = optionalResult.success ? optionalResult.data : {}

const services = [
  { name: 'Gemini AI', vars: ['GEMINI_API_KEY'], configured: !!process.env.GEMINI_API_KEY },
  { name: 'Google OAuth', vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'], configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) },
  { name: 'GitHub OAuth', vars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'], configured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) },
  { name: 'Email (Resend)', vars: ['RESEND_API_KEY'], configured: !!process.env.RESEND_API_KEY },
  { name: 'Email (SMTP)', vars: ['SMTP_HOST'], configured: !!process.env.SMTP_HOST },
  { name: 'Admin API', vars: ['ADMIN_API_KEY'], configured: !!process.env.ADMIN_API_KEY },
  { name: 'Cron Jobs', vars: ['CRON_SECRET'], configured: !!process.env.CRON_SECRET },
  { name: 'Candid API', vars: ['CANDID_API_KEY'], configured: !!process.env.CANDID_API_KEY },
]

console.log('\n📋 Optional services:\n')
for (const service of services) {
  const status = service.configured ? '✅' : '⬚ '
  console.log(`   ${status} ${service.name}`)
}

// Warn about OAuth half-configuration
if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('\n⚠️  GOOGLE_CLIENT_ID is set but GOOGLE_CLIENT_SECRET is missing')
}
if (process.env.GITHUB_CLIENT_ID && !process.env.GITHUB_CLIENT_SECRET) {
  console.warn('\n⚠️  GITHUB_CLIENT_ID is set but GITHUB_CLIENT_SECRET is missing')
}

// Database connection check
console.log('\n📦 Database:')
const dbUrl = process.env.DATABASE_URL!
if (dbUrl.startsWith('file:')) {
  console.log(`   SQLite: ${dbUrl}`)
} else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  const host = dbUrl.match(/@([^/]+)/)?.[1] || 'unknown'
  console.log(`   PostgreSQL: ${host}`)
} else {
  console.warn(`   ⚠️  Unknown database provider: ${dbUrl.slice(0, 20)}...`)
}

console.log('\n✅ Environment validation complete!\n')
