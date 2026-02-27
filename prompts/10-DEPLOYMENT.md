# GrantEase Deployment & CI/CD Audit

## Overview
This audit covers deployment infrastructure, continuous integration/deployment pipelines, database configuration, environment management, and production monitoring for the GrantEase application. Focus areas include Vercel configuration, Next.js build setup, PostgreSQL/Neon connectivity, Prisma migrations, and health checks.

---

## STEP 1: Vercel Deployment Configuration

### 1.1 Vercel Project Setup
Verify Vercel project configuration:

**Checklist:**
- [ ] Project created in Vercel dashboard
- [ ] Git repository connected (GitHub/GitLab/Bitbucket)
- [ ] Automatic deployments enabled for main branch
- [ ] Preview deployments enabled for pull requests
- [ ] Project name and URL configured correctly
- [ ] Production domain properly configured (custom domain if applicable)
- [ ] Root directory set correctly if monorepo (should be "." for single repo)
- [ ] Node.js version specified: 18.x or 20.x LTS recommended
- [ ] Install command: `npm install` or `pnpm install`
- [ ] Build command: verified in next section
- [ ] Output directory: `.next` (default for Next.js)

### 1.2 Vercel Configuration File
Verify `/vercel.json` exists with proper configuration:

```json
{
  "buildCommand": "prisma generate && prisma db push && next build",
  "installCommand": "npm install",
  "env": {
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "DATABASE_URL": "@database_url",
    "GEMINI_API_KEY": "@gemini_api_key",
    "GOOGLE_ID": "@google_id",
    "GOOGLE_SECRET": "@google_secret",
    "ADMIN_API_KEY": "@admin_api_key",
    "CRON_SECRET": "@cron_secret"
  },
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/cron/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

**Checklist:**
- [ ] File exists at root: `/vercel.json`
- [ ] buildCommand includes Prisma generation and migrations
- [ ] installCommand specified
- [ ] Environment variables mapped to secrets (using @variable syntax)
- [ ] Regions configured (iad1 for US-East default)
- [ ] API function timeout extended (30-60 seconds for long operations)
- [ ] Cron routes have no-cache headers
- [ ] File valid JSON (no trailing commas)

### 1.3 Environment Variables on Vercel
Verify all environment variables configured in Vercel dashboard:

**Required Environment Variables:**
```
NEXTAUTH_URL: https://grantease.com (production domain)
NEXTAUTH_SECRET: (securely generated, min 32 characters)
DATABASE_URL: postgresql://user:pass@host/database (from Neon)
GEMINI_API_KEY: (from Google AI Studio)
GOOGLE_ID: (from Google OAuth console)
GOOGLE_SECRET: (from Google OAuth console)
ADMIN_API_KEY: (securely generated)
CRON_SECRET: (securely generated, for cron job auth)
```

**Checklist:**
- [ ] All variables set in Vercel project settings
- [ ] Environment variables match environment (dev, preview, production)
- [ ] Secrets not committed to Git (use .env.local, not .env)
- [ ] NEXTAUTH_SECRET is cryptographically random
- [ ] DATABASE_URL includes SSL parameter: `?sslmode=require`
- [ ] API keys from Google and Gemini stored securely
- [ ] Admin and Cron secrets are strong and unique
- [ ] No sensitive data in vercel.json file itself
- [ ] Environment variables rotated periodically for security

---

## STEP 2: Next.js Build Configuration

### 2.1 next.config.js
Verify Next.js configuration file:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode catches common React issues in development
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.example.com', // For grant logos
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],

  // Redirects for old routes
  redirects: async () => [
    {
      source: '/app-v2/:path*',
      destination: '/app/:path*',
      permanent: true,
    },
  ],

  // Environment variables
  env: {
    NEXT_PUBLIC_GEMINI_MODEL: 'gemini-1.5-flash',
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },

  // TypeScript and ESLint
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  eslint: {
    dirs: ['app', 'lib', 'components'],
  },

  // Experimental features (use with caution)
  experimental: {
    // Enable if using dynamic imports heavily
    // dynamicIO: true,
  },
};

module.exports = nextConfig;
```

**Checklist:**
- [ ] File exists at root: `/next.config.js`
- [ ] React strict mode enabled: `reactStrictMode: true`
- [ ] Image remote patterns configured for external sources
- [ ] Image formats optimized (AVIF, WebP)
- [ ] Security headers configured (X-Content-Type-Options, X-Frame-Options, etc.)
- [ ] Redirects for deprecated routes (v2 directories, old URLs)
- [ ] NEXT_PUBLIC_GEMINI_MODEL matches API version
- [ ] TypeScript and ESLint paths correct
- [ ] Webpack optimizations for code splitting
- [ ] No experimental features that risk stability
- [ ] Configuration tested locally with `npm run build`

### 2.2 TypeScript Configuration
Verify `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skip": false,
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "preserve",
    "jsxImportSource": "react",
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next", "dist"]
}
```

**Checklist:**
- [ ] Strict mode enabled: `strict: true`
- [ ] No implicit any: `noImplicitAny: true`
- [ ] Unused locals/parameters caught: `noUnusedLocals: true`, `noUnusedParameters: true`
- [ ] Path aliases configured for `@/` imports
- [ ] Proper include/exclude patterns
- [ ] Source maps enabled for debugging: `sourceMap: true`
- [ ] Module resolution set to "node"
- [ ] ES2020 target for modern JavaScript
- [ ] JSX preserved for Next.js processing

---

## STEP 3: PostgreSQL and Neon Configuration

### 3.1 Neon Connection Setup
Verify Neon database connectivity:

**Checklist:**
- [ ] Neon project created at https://console.neon.tech
- [ ] Database created with UTF8 encoding
- [ ] Connection string copied: `postgresql://user:password@host/database`
- [ ] Connection string includes SSL: `?sslmode=require`
- [ ] Full connection string: `postgresql://user:pass@host/database?sslmode=require`
- [ ] Connection pooling configured in Neon dashboard (recommended for Vercel)
- [ ] Pooler min/max connections appropriate (min 5, max 100 for typical apps)
- [ ] Connection timeout set (30-60 seconds)
- [ ] Database backup enabled in Neon settings
- [ ] Read replicas configured if needed for scaling

### 3.2 Connection Pooling
Verify pooling configuration for serverless environment:

```typescript
// lib/db.ts - Prisma Client with connection pooling
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Checklist:**
- [ ] Prisma singleton pattern implemented to prevent connection leaks
- [ ] Connection pooling enabled in .env.local with pool URL if needed
- [ ] Neon connection pool URL used if available (separate from direct connection)
- [ ] Prisma CLI configured properly
- [ ] Error format set to 'pretty' for development
- [ ] No multiple PrismaClient instances created

### 3.3 SSL/TLS Configuration
Verify secure database connections:

**Checklist:**
- [ ] DATABASE_URL includes `?sslmode=require`
- [ ] SSL certificate validation enabled
- [ ] No `sslmode=disable` in production
- [ ] Node.js TLS version 1.2 or higher
- [ ] Certificate pinning considered for high-security scenarios
- [ ] Connection string not logged or exposed

---

## STEP 4: Prisma Migrations Strategy

### 4.1 Prisma Schema Configuration
Verify `/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "queryEngine"
  // Disable previewFeatures unless intentional
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Tables defined here
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// Additional models...
```

**Checklist:**
- [ ] Schema.prisma file exists and is valid
- [ ] All tables have lowercase snake_case in database (@@map)
- [ ] IDs use CUID or UUID primary keys (not auto-increment for distributed systems)
- [ ] Timestamps: createdAt, updatedAt defined with @default(now()) and @updatedAt
- [ ] Relations properly defined with foreign keys
- [ ] Cascade deletes configured where appropriate
- [ ] Unique constraints defined for email, usernames, etc.
- [ ] Indexes defined for frequently queried fields
- [ ] No deprecated Prisma syntax
- [ ] Preview features only enabled if intentional

### 4.2 Migration Strategy
Verify migration approach:

**Development Migration Commands:**
```bash
# Generate migration after schema change
npx prisma migrate dev --name add_field_name

# Reset local database (dev only)
npx prisma migrate reset

# Show migration history
npx prisma migrate status
```

**Production Migration Approach:**
```bash
# Option 1: Using prisma db push (for simple cases, no version control)
prisma db push

# Option 2: Using migrations (recommended for prod)
prisma migrate deploy
```

**Build Script (vercel.json):**
```
"buildCommand": "prisma generate && prisma db push && next build"
```

**Checklist:**
- [ ] Migrations directory `/prisma/migrations/` versioned in Git
- [ ] Migration history tracked for audit trail
- [ ] Decision made: `db push` vs `migrate deploy`
- [ ] For production: `prisma migrate deploy` recommended (safer, versioned)
- [ ] Build script includes Prisma generation and migrations
- [ ] Test migrations locally before deploying
- [ ] Backup database before running migrations in production
- [ ] Rollback plan documented for each migration
- [ ] Schema changes tested against production data volume
- [ ] No migrations that break existing clients

### 4.3 Prisma Generate
Verify client generation:

**Checklist:**
- [ ] `prisma generate` runs during build (in vercel.json)
- [ ] Client type definitions updated after schema changes
- [ ] Generated client commited (if not in .gitignore)
- [ ] Environment variable DATABASE_URL set before generation
- [ ] No stale client types cached

---

## STEP 5: Environment Variables Management

### 5.1 Environment Variable Strategy
Verify separation of environments:

**Local Development:**
```bash
# .env.local (never committed)
DATABASE_URL="postgresql://user:pass@localhost/grantease"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-min-32-characters"
GEMINI_API_KEY="dev-key"
GOOGLE_ID="dev-id"
GOOGLE_SECRET="dev-secret"
ADMIN_API_KEY="dev-admin-key"
CRON_SECRET="dev-cron-secret"
```

**Preview (Staging) Environment:**
```
DATABASE_URL: postgresql://user:pass@staging-host/db?sslmode=require
NEXTAUTH_URL: https://staging.grantease.com
NEXTAUTH_SECRET: (staging secret)
GEMINI_API_KEY: (staging API key)
GOOGLE_ID: (staging OAuth ID)
GOOGLE_SECRET: (staging OAuth secret)
ADMIN_API_KEY: (staging admin key)
CRON_SECRET: (staging cron secret)
```

**Production Environment:**
```
DATABASE_URL: postgresql://user:pass@prod-host/db?sslmode=require
NEXTAUTH_URL: https://grantease.com
NEXTAUTH_SECRET: (prod secret)
GEMINI_API_KEY: (prod API key)
GOOGLE_ID: (prod OAuth ID)
GOOGLE_SECRET: (prod OAuth secret)
ADMIN_API_KEY: (prod admin key)
CRON_SECRET: (prod cron secret)
```

**Checklist:**
- [ ] `.env.local` in .gitignore (not committed)
- [ ] `.env.example` in Git (template without secrets)
- [ ] Environment variables not hardcoded in code
- [ ] Next.js public variables prefixed: `NEXT_PUBLIC_*`
- [ ] Sensitive variables not prefixed (server-side only)
- [ ] Vercel environment variables configured for each deployment
- [ ] Preview deployments have separate env vars from production
- [ ] Secrets stored in Vercel dashboard, not in code
- [ ] Environment variables rotated periodically
- [ ] No logging of sensitive environment variables

### 5.2 Public vs Private Environment Variables
Verify correct prefixing:

**Public (safe to expose in client):**
```
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_APP_NAME=GrantEase
NEXT_PUBLIC_API_URL=https://api.grantease.com
```

**Private (server-side only):**
```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GEMINI_API_KEY
GOOGLE_ID
GOOGLE_SECRET
ADMIN_API_KEY
CRON_SECRET
```

**Checklist:**
- [ ] Only truly public data uses NEXT_PUBLIC prefix
- [ ] API keys and secrets never use NEXT_PUBLIC
- [ ] Environment variables access checked in code review
- [ ] No client-side access to NEXTAUTH_SECRET, DATABASE_URL, API keys

---

## STEP 6: Cron Job Configuration

### 6.1 Vercel Cron Jobs
Verify cron configuration for scheduled tasks:

**vercel.json cron configuration:**
```json
{
  "crons": [
    {
      "path": "/api/cron/update-grants",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/send-digest",
      "schedule": "0 8 * * 1"
    },
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

**Schedule syntax (cron expression):**
```
Minute Hour Day Month DayOfWeek
  0     2    *    *      *         (Daily at 2 AM)
  0     8    *    *      1         (Monday at 8 AM)
  0     3    *    *      0         (Sunday at 3 AM)
  */15  *    *    *      *         (Every 15 minutes)
  0     */6  *    *      *         (Every 6 hours)
```

**Checklist:**
- [ ] Cron jobs defined in vercel.json
- [ ] Each cron has `/api/cron/` endpoint
- [ ] Schedule in cron expression format
- [ ] Cron secret required in request authorization
- [ ] Cron routes have `Cache-Control: no-cache` headers
- [ ] Cron jobs idempotent (safe to run multiple times)
- [ ] Timeout extended for long-running jobs (vercel.json functions config)
- [ ] Cron jobs tested locally with manual API calls
- [ ] Error handling and logging in cron endpoints
- [ ] Alert on cron job failure

### 6.2 Cron Endpoint Example
Verify cron API routes:

```typescript
// /app/api/cron/update-grants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Perform cron job task (update grants from external API, etc.)
    const result = await updateGrantsFromExternalAPI();

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${result.count} grants`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed', message: error.message },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] Cron endpoints at `/api/cron/[job-name]/route.ts`
- [ ] Secret verification on every cron call
- [ ] Runtime set to 'nodejs' for long operations
- [ ] Max duration extended (30-60 seconds)
- [ ] Error handling and logging
- [ ] No database credential exposure in error messages
- [ ] Return success/failure status
- [ ] Timestamp included in response
- [ ] Cron job is idempotent (repeatable without side effects)

---

## STEP 7: Preview Deployments

### 7.1 Preview Deployment Configuration
Verify PR preview setup:

**Checklist:**
- [ ] Vercel PR integration enabled
- [ ] Preview deployments automatic for all PRs
- [ ] Preview deployment URL unique per PR
- [ ] Preview environment uses separate database (staging)
- [ ] Preview deployments expire after PR closed
- [ ] GitHub comments with preview URL on PRs
- [ ] Preview deployments don't use production API keys
- [ ] Preview deployments can be cleared manually if needed

### 7.2 Preview Environment Variables
Verify preview env vars configured:

**Checklist:**
- [ ] Preview uses staging DATABASE_URL
- [ ] Preview uses preview NEXTAUTH_URL
- [ ] Preview NEXTAUTH_SECRET different from production
- [ ] Preview API keys (Gemini, Google OAuth) configured
- [ ] Preview deployments isolated from production data
- [ ] Preview deployments expire automatically

---

## STEP 8: Build Script Verification

### 8.1 Build Command Execution
Verify build process works locally:

```bash
# Test build command locally
npm run build

# Expected output:
# - Prisma generation completes
# - Database migrations applied
# - Next.js build succeeds
# - No TypeScript errors
# - No ESLint errors
# - .next/ directory created
```

**Checklist:**
- [ ] Build command: `prisma generate && prisma db push && next build` succeeds
- [ ] No TypeScript errors during build
- [ ] No ESLint warnings treated as errors
- [ ] Build time under 5 minutes (optimize if slower)
- [ ] Bundle size analyzed (npm run build -- --analyze)
- [ ] Database migrations applied without errors
- [ ] Prisma client generated successfully
- [ ] Next.js static analysis passes
- [ ] .next directory created with optimized output

### 8.2 Build Optimization
Verify bundle size and performance:

**Checklist:**
- [ ] Code splitting configured for large pages
- [ ] Unused dependencies removed
- [ ] Dead code eliminated
- [ ] Image optimization enabled
- [ ] CSS minification enabled (Tailwind)
- [ ] JavaScript minification enabled
- [ ] Source maps generated for debugging
- [ ] Bundle analysis run regularly

---

## STEP 9: Monitoring and Error Tracking

### 9.1 Sentry Integration (Recommended)
Verify error tracking setup:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaySessionSampleRate: 0.1,
  replayOnErrorSampleRate: 1.0,
});
```

**Checklist:**
- [ ] Sentry project created and configured
- [ ] Sentry DSN added to environment variables (NEXT_PUBLIC_SENTRY_DSN)
- [ ] Error tracking enabled for client and server
- [ ] Performance monitoring enabled
- [ ] Session replay enabled for debugging (with privacy)
- [ ] Source maps uploaded for error line accuracy
- [ ] Environment properly set (development, staging, production)
- [ ] Alerts configured for error thresholds
- [ ] Team members have Sentry access

### 9.2 Application Logging
Verify logging strategy:

**Checklist:**
- [ ] API route errors logged with context
- [ ] Database errors logged (not credentials)
- [ ] Authentication errors tracked
- [ ] Cron job executions logged
- [ ] No sensitive data in logs (passwords, tokens, emails)
- [ ] Log aggregation service used (Vercel logs, Datadog, or similar)
- [ ] Logs retained for audit trail (30 days minimum)
- [ ] Log levels used correctly (debug, info, warn, error)

### 9.3 Application Performance Monitoring
Verify APM setup:

**Checklist:**
- [ ] Performance metrics tracked (Core Web Vitals)
- [ ] Slow API endpoints identified and optimized
- [ ] Database query performance monitored
- [ ] Memory usage tracked
- [ ] CPU usage tracked
- [ ] Response times monitored
- [ ] Database connection pool health monitored
- [ ] Alert thresholds set for anomalies

---

## STEP 10: SSL/HTTPS Enforcement

### 10.1 HTTPS Configuration
Verify secure communication:

**Checklist:**
- [ ] Production domain has SSL certificate (free with Vercel)
- [ ] All traffic redirected to HTTPS
- [ ] HTTPS enforced in next.config.js headers
- [ ] Mixed content warnings absent
- [ ] Secure cookies configured (Secure, HttpOnly flags)
- [ ] HSTS header configured (max-age: 31536000)
- [ ] Certificate auto-renewal enabled (Vercel handles)
- [ ] No hardcoded http:// URLs in code
- [ ] External resources loaded over HTTPS

### 10.2 Security Headers
Verify security headers in next.config.js:

**Checklist:**
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY (or SAMEORIGIN if frames needed)
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Content-Security-Policy configured (if strict)
- [ ] Permissions-Policy configured

---

## STEP 11: Edge Functions vs Serverless Functions

### 11.1 Function Type Selection
Verify appropriate function type usage:

**Serverless Functions (default):**
- [ ] Traditional API routes: `/api/grants`
- [ ] Database queries: `/api/grants/search`
- [ ] Authentication endpoints: `/api/auth/[nextauth]`
- [ ] Cron jobs: `/api/cron/*`
- [ ] Long-running operations: migrations, batch jobs

**Edge Functions (if used):**
- [ ] Authentication checks (redirect logic)
- [ ] Middleware for request modification
- [ ] A/B testing logic
- [ ] Simple redirects or rewrites
- (Note: Edge functions have limited Node.js APIs; use sparingly)

**Checklist:**
- [ ] Most routes use serverless functions
- [ ] Edge functions only for lightweight operations
- [ ] Database queries not in Edge functions
- [ ] File operations not in Edge functions
- [ ] Long-running operations not in Edge functions
- [ ] Function selection documented

---

## STEP 12: Database Backup Strategy

### 12.1 Neon Backup Configuration
Verify backup setup:

**Checklist:**
- [ ] Neon backups enabled (automatic daily)
- [ ] Backup retention set (minimum 7 days)
- [ ] Point-in-time recovery configured
- [ ] Backup location (Neon manages)
- [ ] Backup encryption enabled (Neon default)
- [ ] Test restore from backup periodically
- [ ] Recovery time objective (RTO) documented
- [ ] Recovery point objective (RPO) documented

### 12.2 Data Export and Archival
Verify data protection:

**Checklist:**
- [ ] Database exports scheduled (weekly)
- [ ] Exports stored securely (encrypted storage)
- [ ] Export retention policy documented
- [ ] GDPR compliance: data deletion procedures in place
- [ ] Data minimization: unnecessary data not stored
- [ ] User data export capability implemented (GDPR/CCPA)

---

## STEP 13: Rollback Procedures

### 13.1 Rollback Strategy
Document rollback plan:

**Checklist:**
- [ ] Rollback plan documented for each deployment
- [ ] Previous version buildable from Git tags
- [ ] Database migrations reversible
- [ ] Breaking API changes avoided or versioned
- [ ] Feature flags for new features (easy disable)
- [ ] Deployment monitoring for errors (first 15 minutes critical)
- [ ] Rollback testing done pre-deployment
- [ ] Team trained on rollback procedures

### 13.2 Emergency Rollback
Verify emergency deployment process:

**Checklist:**
- [ ] Vercel rollback available (revert to previous build)
- [ ] Database rollback possible (backup available)
- [ ] Communication plan for incidents
- [ ] Status page update procedures
- [ ] Hotfix branch process documented
- [ ] Emergency deployment approval process

---

## STEP 14: Health Check Endpoints

### 14.1 Health Check Endpoint
Implement `/api/health` endpoint:

```typescript
// /app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 0; // Always fresh

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

**Checklist:**
- [ ] Endpoint at `/api/health` (standard location)
- [ ] No authentication required
- [ ] Returns JSON with status: 'ok' or 'error'
- [ ] HTTP 200 on success, 503 on failure
- [ ] Database connection tested
- [ ] Response includes timestamp and environment
- [ ] Cache disabled (revalidate: 0)
- [ ] Used by uptime monitors

### 14.2 Readiness Endpoint
Implement `/api/ready` for deployment readiness:

```typescript
// /app/api/ready/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check critical systems
    await Promise.all([
      prisma.$queryRaw`SELECT 1`, // Database
      // Add other critical system checks
    ]);

    return NextResponse.json(
      { ready: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { ready: false, error: error.message },
      { status: 503 }
    );
  }
}
```

**Checklist:**
- [ ] Endpoint at `/api/ready`
- [ ] Returns { ready: true } or { ready: false }
- [ ] HTTP 200 on ready, 503 on not ready
- [ ] All critical systems checked
- [ ] Used by load balancers for health checks
- [ ] Used by deployment pipelines pre/post deployment

---

## STEP 15: Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] Tests passing locally and in CI
- [ ] TypeScript type checking passes
- [ ] ESLint passes without errors
- [ ] Database migrations tested on staging
- [ ] Environment variables verified
- [ ] Feature flags configured if needed
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Git tags for version control

### During Deployment
- [ ] Build process monitored
- [ ] Health checks passing
- [ ] Error tracking (Sentry) monitoring
- [ ] Application logs monitored
- [ ] Database migrations completing successfully
- [ ] No error spikes in first 15 minutes
- [ ] Basic smoke tests passing
- [ ] Critical user flows tested

### Post-Deployment
- [ ] All endpoints responding
- [ ] Database connections healthy
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] Deployment confirmed successful
- [ ] Stakeholders notified
- [ ] Monitoring alerts active
- [ ] Rollback plan ready

---

## STEP 16: Continuous Integration Setup

### 16.1 GitHub Actions (if not using Vercel Auto-Deploy)
Example CI pipeline:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm install
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

**Checklist:**
- [ ] CI workflow configured for pushes and PRs
- [ ] Node.js version matches production (20.x)
- [ ] Tests run automatically
- [ ] Lint and type checking run
- [ ] Build tested before merge
- [ ] Coverage reports generated (optional)
- [ ] Failed checks block merging
- [ ] Notifications sent on failure

---

## Summary

This deployment audit covers:
1. Vercel project configuration and CI/CD
2. Next.js build and optimization
3. PostgreSQL/Neon database setup
4. Prisma migrations and schema
5. Environment variable management
6. Cron job scheduling
7. Preview deployments
8. Error tracking and monitoring
9. SSL/HTTPS security
10. Backup and rollback strategies
11. Health check endpoints
12. Complete deployment checklists

All items should be verified before production deployment. Maintain this audit regularly as part of your deployment process.
