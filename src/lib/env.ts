/**
 * CENTRALIZED ENVIRONMENT CONFIGURATION
 * --------------------------------------
 * Validates all environment variables at import time using Zod.
 * Import this module early (e.g., in instrumentation.ts or API routes)
 * to fail fast on missing configuration.
 */

import { z } from 'zod'

const envSchema = z.object({
  // ── Database ──
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // ── NextAuth ──
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),

  // ── OAuth Providers (optional — only enabled if both ID and SECRET are set) ──
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // ── AI (Google Gemini) ──
  GEMINI_API_KEY: z.string().optional(),

  // ── Email (optional — Resend primary, SMTP fallback) ──
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // ── External APIs ──
  CANDID_API_KEY: z.string().optional(),

  // ── Security & Infrastructure ──
  ADMIN_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ── Application ──
  NEXT_PUBLIC_APP_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    console.error(
      '\n' +
      '╔══════════════════════════════════════════╗\n' +
      '║   MISSING ENVIRONMENT VARIABLES          ║\n' +
      '╚══════════════════════════════════════════╝\n' +
      '\n' +
      formatted +
      '\n\n' +
      'Copy .env.example to .env and fill in the required values.\n'
    )

    throw new Error(`Environment validation failed:\n${formatted}`)
  }

  return result.data
}

/**
 * Validated environment variables.
 * Access these instead of process.env directly for type safety.
 */
export const env = validateEnv()

/**
 * Helper checks for optional service availability
 */
export const services = {
  get geminiConfigured() {
    return !!env.GEMINI_API_KEY
  },
  get googleOAuthConfigured() {
    return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  },
  get githubOAuthConfigured() {
    return !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
  },
  get emailConfigured() {
    return !!(env.RESEND_API_KEY || env.SMTP_HOST)
  },
  get cronSecured() {
    return !!env.CRON_SECRET
  },
  get adminSecured() {
    return !!env.ADMIN_API_KEY
  },
} as const
