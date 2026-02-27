# GrantEase Development Conventions

A comprehensive style guide for the Grants By AI (GrantEase) project — a grant discovery and application management platform.

**Last Updated:** February 2026
**Framework:** Next.js 14+ (App Router) | **Language:** TypeScript 5.3+ | **Database:** PostgreSQL/SQLite via Prisma 5

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Rules](#typescript-rules)
4. [Component Patterns](#component-patterns)
5. [Server vs Client Components](#server-vs-client-components)
6. [Styling Rules](#styling-rules)
7. [State Management](#state-management)
8. [Data Fetching](#data-fetching)
9. [API Route Patterns](#api-route-patterns)
10. [Error Handling](#error-handling)
11. [Forbidden Patterns](#forbidden-patterns)
12. [Import Order](#import-order)
13. [Git Conventions](#git-conventions)
14. [Testing Conventions](#testing-conventions)
15. [SEO Conventions](#seo-conventions)
16. [Performance Targets](#performance-targets)
17. [Accessibility Standards](#accessibility-standards)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                           # Authentication pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (marketing)/                      # Public marketing pages
│   │   ├── page.tsx                      # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── about/page.tsx
│   │
│   ├── api/
│   │   ├── ai/                           # AI-powered endpoints
│   │   │   ├── chat/route.ts             # Grant discussion AI
│   │   │   └── writing-assistant/route.ts # Application writing helper
│   │   │
│   │   ├── auth/                         # NextAuth + registration
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   │
│   │   ├── grants/                       # Grant operations
│   │   │   ├── search/route.ts           # Full-text grant search
│   │   │   ├── match/route.ts            # AI grant matching
│   │   │   ├── sync/route.ts             # Grant source sync
│   │   │   └── sources/route.ts          # Manage data sources
│   │   │
│   │   ├── opportunities/
│   │   │   ├── route.ts                  # CRUD operations
│   │   │   └── [id]/route.ts
│   │   │
│   │   ├── dashboard/
│   │   │   └── stats/route.ts            # User dashboard metrics
│   │   │
│   │   ├── user/                         # User account operations
│   │   │   ├── profile/route.ts
│   │   │   ├── saved-grants/route.ts
│   │   │   ├── saved-searches/route.ts
│   │   │   ├── workspaces/route.ts
│   │   │   ├── collections/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── password/route.ts
│   │   │   └── account/route.ts
│   │   │
│   │   ├── vault/                        # Vault operations
│   │   │   └── route.ts
│   │   │
│   │   ├── contracts/
│   │   │   └── route.ts
│   │   │
│   │   ├── cron/                         # Background jobs
│   │   │   ├── sync-grants/route.ts
│   │   │   └── match-users/route.ts
│   │   │
│   │   └── health/
│   │       └── route.ts                  # Health checks
│   │
│   ├── app/                              # Protected application pages
│   │   ├── dashboard/page.tsx
│   │   ├── discover/page.tsx
│   │   ├── grants/[id]/page.tsx
│   │   ├── saved/page.tsx
│   │   ├── searches/page.tsx
│   │   ├── workspace/page.tsx
│   │   ├── workspace/[id]/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── admin/                            # Admin dashboard
│   │   ├── page.tsx
│   │   ├── grants/page.tsx
│   │   └── users/page.tsx
│   │
│   ├── onboarding/                       # 5-step user onboarding
│   │   ├── page.tsx
│   │   ├── step-1/page.tsx               # Profile setup
│   │   ├── step-2/page.tsx               # Grant preferences
│   │   ├── step-3/page.tsx               # Organization info
│   │   ├── step-4/page.tsx               # Integration setup
│   │   └── step-5/page.tsx               # Complete
│   │
│   └── layout.tsx
│
├── components/
│   ├── grants/                           # Grant-specific components
│   │   ├── GrantCard.tsx
│   │   ├── GrantDetailHeader.tsx
│   │   ├── GrantsList.tsx
│   │   ├── GrantFilter.tsx
│   │   ├── GrantMatchScore.tsx
│   │   └── GrantApplicationForm.tsx
│   │
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Testimonials.tsx
│   │   └── CTA.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   │
│   ├── marketing/
│   │   ├── PricingCard.tsx
│   │   ├── ComparisonTable.tsx
│   │   └── FAQ.tsx
│   │
│   ├── motion/                           # Framer Motion components
│   │   ├── AnimatedCard.tsx
│   │   ├── FadeInUp.tsx
│   │   └── ScaleOnHover.tsx
│   │
│   ├── onboarding/
│   │   ├── StepIndicator.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── PreferencesForm.tsx
│   │   └── CompletionScreen.tsx
│   │
│   ├── providers/
│   │   ├── SessionProvider.tsx
│   │   ├── ToastProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── pulse-grid/                       # Design system components
│   │   ├── PulseBackground.tsx
│   │   ├── PulseCard.tsx
│   │   └── PulseButton.tsx
│   │
│   └── ui/                               # Radix UI + Tailwind primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Dialog.tsx
│       ├── Dropdown.tsx
│       ├── Tabs.tsx
│       ├── Toast.tsx
│       ├── Badge.tsx
│       └── Spinner.tsx
│
├── lib/
│   ├── services/                         # Business logic
│   │   ├── grantService.ts               # Grant operations
│   │   ├── matchingService.ts            # AI matching logic
│   │   ├── authService.ts                # Auth helpers
│   │   ├── aiService.ts                  # Gemini integration
│   │   └── syncService.ts                # Grant source syncing
│   │
│   ├── motion/
│   │   ├── variants.ts                   # Framer Motion variants
│   │   └── transitions.ts
│   │
│   ├── auth.ts                           # NextAuth config
│   ├── db.ts                             # Prisma client
│   ├── utils.ts                          # Helper functions
│   ├── constants.ts                      # App constants
│   ├── validators.ts                     # Zod schemas
│   └── env.ts                            # Environment validation
│
├── styles/
│   ├── globals.css                       # Tailwind + Pulse Grid tokens
│   ├── animations.css
│   └── fonts.css
│
├── types/
│   ├── next-auth.d.ts                    # NextAuth type extensions
│   ├── grants.ts                         # Grant-related types
│   ├── api.ts                            # API response types
│   └── ui.ts                             # Component prop types
│
├── hooks/                                # Custom React hooks
│   ├── useGrantSearch.ts
│   ├── useGrantFilter.ts
│   ├── useGrantMatch.ts
│   ├── useAuth.ts
│   └── useToast.ts
│
├── middleware.ts                         # NextAuth middleware
├── instrumentation.ts                    # Observability
└── .env.local                            # Environment variables (gitignored)
```

### Directory Principles

- **Colocation:** Keep related files close together (e.g., `GrantCard.tsx` + `GrantCard.test.tsx` in the same directory)
- **API Routes:** Group by domain (grants, user, ai, etc.) with clear responsibility separation
- **Components:** Organize by feature domain, not by type
- **Services:** Business logic should live in `lib/services/`, not in components or route handlers
- **Types:** Co-locate types with their usage or keep in `src/types/`

---

## Naming Conventions

### File Names

| Type | Pattern | Example |
|------|---------|---------|
| Components | `PascalCase.tsx` | `GrantCard.tsx`, `GrantDetailHeader.tsx` |
| Hooks | `camelCase.ts` with `use` prefix | `useGrantSearch.ts`, `useGrantFilter.ts` |
| Services | `camelCase.ts` | `grantService.ts`, `matchingService.ts` |
| Utils/Helpers | `camelCase.ts` | `formatGrantAmount.ts`, `calculateMatch.ts` |
| Types | `camelCase.ts` | `grants.ts`, `api.ts` |
| Tests | `[filename].test.ts(x)` | `GrantCard.test.tsx` |
| API Routes | `route.ts` | All route handlers use standard Next.js pattern |
| Constants | `UPPER_SNAKE_CASE` in files or `constants.ts` | `GRANT_CATEGORIES`, `DEFAULT_MATCH_THRESHOLD` |

### Component Names

- **Container components:** `[Feature]Container` or `[Feature]Page` (e.g., `GrantDetailPage`, `DiscoverContainer`)
- **Presentational:** `[Feature][Type]` (e.g., `GrantCard`, `GrantMatchScore`, `GrantsList`)
- **Form components:** `[Feature]Form` (e.g., `GrantFilterForm`, `GrantApplicationForm`)
- **Dialog/Modal:** `[Feature]Dialog` or `[Feature]Modal` (e.g., `SaveGrantDialog`, `FilterModal`)

### Function Names

- **Query handlers:** `fetchGrants`, `getGrantById`, `searchGrants`
- **Mutations:** `createGrant`, `updateGrant`, `saveGrant`, `deleteGrant`
- **Event handlers:** `handleGrantSearch`, `handleFilterChange`, `handleApplicationSubmit`
- **Helpers:** `calculateMatchScore`, `formatGrantAmount`, `slugifyGrantTitle`
- **Formatters:** `formatDate`, `formatCurrency`, `formatDeadline`

### Type Names

```typescript
// Props interfaces
type GrantCardProps = { ... }
type GrantDetailProps = { ... }

// Domain types
type Grant = { ... }
type GrantMatch = { ... }
type GrantFilter = { ... }

// API response types
type GetGrantsResponse = { grants: Grant[]; total: number }
type MatchGrantsResponse = { matches: GrantMatch[] }

// Enums for grant categories
enum GrantCategory {
  RESEARCH = 'RESEARCH',
  EDUCATION = 'EDUCATION',
  NONPROFIT = 'NONPROFIT',
  BUSINESS = 'BUSINESS',
}

// Filter state
type GrantFilterState = {
  category?: GrantCategory
  minAmount?: number
  maxAmount?: number
  deadline?: Date
  location?: string
}
```

### API Endpoint Naming

- **Search:** `/api/grants/search?query=renewable+energy`
- **Match:** `/api/grants/match` (POST with user profile)
- **Fetch Single:** `/api/opportunities/[id]` (GET)
- **Create/Update:** `/api/opportunities` (POST/PATCH)
- **User operations:** `/api/user/saved-grants`, `/api/user/profile`
- **AI endpoints:** `/api/ai/chat`, `/api/ai/writing-assistant`

---

## TypeScript Rules

### Strict Mode

All files must compile with strict TypeScript settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Type Annotations

```typescript
// GOOD: Explicit return types
async function fetchGrantById(id: string): Promise<Grant> {
  const grant = await db.grant.findUnique({ where: { id } })
  return grant ?? null
}

// GOOD: Function parameter types
function calculateMatchPercentage(grant: Grant, userProfile: UserProfile): number {
  return Math.round((grant.matchScore / 100) * 100)
}

// AVOID: Implicit any
function processGrant(grant) { } // ❌

// GOOD: Use satisfies for literal type narrowing
const grantCategories = ['RESEARCH', 'EDUCATION', 'NONPROFIT'] satisfies GrantCategory[]
```

### Null/Undefined Handling

```typescript
// GOOD: Optional chaining
const deadline = grant?.deadline

// GOOD: Nullish coalescing
const amount = grant?.fundingAmount ?? 0

// GOOD: Type guard
if (grant && grant.id) {
  processGrant(grant)
}

// GOOD: Use null as explicit empty
function getOptionalGrant(): Grant | null {
  return db.grant.findUnique(...) || null
}
```

### Union Types & Discriminated Unions

```typescript
// GOOD: Discriminated union for grant status
type GrantState =
  | { status: 'loading' }
  | { status: 'success'; data: Grant[] }
  | { status: 'error'; error: Error }

// GOOD: Use discriminant for safe narrowing
function renderGrantList(state: GrantState) {
  if (state.status === 'success') {
    return state.data.map(g => <GrantCard key={g.id} grant={g} />)
  }
}
```

### Generic Types

```typescript
// GOOD: Generic service for reusability
interface ApiResponse<T> {
  data: T
  status: number
  timestamp: Date
}

async function fetchGrants(): Promise<ApiResponse<Grant[]>> {
  const response = await fetch('/api/grants/search')
  return response.json()
}

// GOOD: Generic hooks
function useFetch<T>(url: string): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null)
  // ...
}
```

### Const Assertions

```typescript
// GOOD: Const assertion for literal types
const GRANT_CATEGORIES = ['RESEARCH', 'EDUCATION', 'NONPROFIT'] as const
type GrantCategory = typeof GRANT_CATEGORIES[number]

// GOOD: Object const assertion
const defaultFilter = {
  minAmount: 0,
  maxAmount: 1000000,
  sortBy: 'deadline' as const,
}
```

---

## Component Patterns

### Functional Component Structure

```typescript
import { FC } from 'react'
import { GrantCardProps } from '@/types/grants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PulseCard } from '@/components/pulse-grid/PulseCard'
import { Badge } from '@/components/ui/Badge'

export const GrantCard: FC<GrantCardProps> = ({ grant, onSave, isLoading }) => {
  const matchPercentage = Math.round(grant.matchScore * 100)

  return (
    <PulseCard className="group cursor-pointer transition-all hover:shadow-lg">
      <div className="space-y-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-pulse-text line-clamp-2">
            {grant.title}
          </h3>
          {matchPercentage > 80 && (
            <Badge variant="success">
              {matchPercentage}% Match
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-sm text-pulse-text-secondary">
          <span>{grant.organization}</span>
          <span>•</span>
          <span>{formatCurrency(grant.fundingAmount)}</span>
          <span>•</span>
          <span>Deadline: {formatDate(grant.deadline)}</span>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-pulse-text-secondary">
          {grant.description}
        </p>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {grant.categories.map(cat => (
            <Badge key={cat} variant="outline" size="sm">
              {cat}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onSave}
          disabled={isLoading}
          className="w-full rounded-lg bg-pulse-accent px-3 py-2 font-medium text-pulse-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Grant'}
        </button>
      </div>
    </PulseCard>
  )
}
```

### Hook Patterns

```typescript
import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { grantService } from '@/lib/services/grantService'
import { GrantFilter } from '@/types/grants'

export function useGrantSearch() {
  const searchParams = useSearchParams()
  const [grants, setGrants] = useState<Grant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(
    async (query: string, filters?: GrantFilter) => {
      setIsLoading(true)
      setError(null)
      try {
        const results = await grantService.search(query, filters)
        setGrants(results)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'))
        setGrants([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { grants, isLoading, error, search }
}
```

### HOC Pattern (if needed)

```typescript
import { ComponentType } from 'react'
import { useSession } from 'next-auth/react'
import { Unauthorized } from '@/components/errors/Unauthorized'

export function withAuth<P extends object>(
  Component: ComponentType<P>
): ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { data: session, status } = useSession()

    if (status === 'loading') {
      return <div>Loading...</div>
    }

    if (!session) {
      return <Unauthorized />
    }

    return <Component {...props} />
  }
}
```

---

## Server vs Client Components

### Server Component Guidelines

Use Server Components by default for:
- Data fetching from databases or APIs
- Keeping secrets (API keys, database credentials)
- Large dependencies that would increase client bundle size
- Direct access to databases
- Complex authorization logic

```typescript
// app/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next'
import { db } from '@/lib/db'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch data server-side
  const grants = await db.grant.findMany({
    where: { userId: session.user.id },
    orderBy: { deadline: 'asc' },
  })

  const stats = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: { savedGrants: true },
      },
    },
  })

  return <DashboardClient initialGrants={grants} stats={stats} />
}
```

### Client Component Guidelines

Use Client Components for:
- Interactivity (clicks, form inputs, scrolling)
- State management with hooks
- Event listeners and browser APIs
- Real-time features
- URL parameter manipulation

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { GrantFilter } from '@/components/grants/GrantFilter'
import { GrantsList } from '@/components/grants/GrantsList'
import { Grant, GrantFilterState } from '@/types/grants'

export type DashboardClientProps = {
  initialGrants: Grant[]
  stats: { _count: { savedGrants: number } }
}

export function DashboardClient({ initialGrants, stats }: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [grants, setGrants] = useState(initialGrants)
  const [isFiltering, setIsFiltering] = useState(false)

  const handleFilterChange = useCallback(async (filters: GrantFilterState) => {
    setIsFiltering(true)
    try {
      // Update URL for bookmark-ability
      const params = new URLSearchParams(searchParams)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value))
        }
      })
      router.push(`?${params.toString()}`)

      // Fetch filtered grants
      const response = await fetch('/api/grants/search', {
        method: 'POST',
        body: JSON.stringify(filters),
      })
      const { grants: filtered } = await response.json()
      setGrants(filtered)
    } finally {
      setIsFiltering(false)
    }
  }, [searchParams, router])

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <GrantFilter onFilterChange={handleFilterChange} isLoading={isFiltering} />
      <div className="lg:col-span-3">
        <GrantsList grants={grants} loading={isFiltering} />
      </div>
    </div>
  )
}
```

### Boundary Pattern

```typescript
// Server Component boundary
import { GrantsSuspense } from '@/components/grants/GrantsSuspense'
import { GrantsErrorBoundary } from '@/components/grants/GrantsErrorBoundary'

export default async function GrantsPage() {
  return (
    <GrantsErrorBoundary>
      <GrantsSuspense>
        <GrantsServerFetch />
      </GrantsSuspense>
    </GrantsErrorBoundary>
  )
}

// Client Component with Suspense fallback
import { Suspense } from 'react'

function GrantsSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded bg-pulse-surface" />
          ))}
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
```

---

## Styling Rules

### Tailwind CSS + Pulse Grid Design System

All styling uses Tailwind CSS 3 with Pulse Grid design tokens for a dark-first, mint accent theme.

#### Pulse Grid Color Tokens

```css
/* Define in globals.css or extend tailwind.config.js */
@layer theme {
  --pulse-bg: #0a0a0b;
  --pulse-surface: #111113;
  --pulse-elevated: #1a1a1d;
  --pulse-border: rgba(255, 255, 255, 0.06);
  --pulse-accent: #40ffaa;
  --pulse-text: #fafafa;
  --pulse-text-secondary: rgba(250, 250, 250, 0.6);
  --pulse-success: #40ffaa;
  --pulse-warning: #ffb340;
  --pulse-error: #ff4040;
}

/* Custom color extension in tailwind.config.ts */
extend: {
  colors: {
    pulse: {
      bg: 'var(--pulse-bg)',
      surface: 'var(--pulse-surface)',
      elevated: 'var(--pulse-elevated)',
      border: 'var(--pulse-border)',
      accent: 'var(--pulse-accent)',
      text: 'var(--pulse-text)',
      'text-secondary': 'var(--pulse-text-secondary)',
      success: 'var(--pulse-success)',
      warning: 'var(--pulse-warning)',
      error: 'var(--pulse-error)',
    },
  },
}
```

#### Component Styling Example

```typescript
export const GrantCard: FC<GrantCardProps> = ({ grant }) => {
  return (
    <div className="rounded-lg border border-pulse-border bg-pulse-surface p-4 shadow-sm transition-all duration-200 hover:border-pulse-accent hover:shadow-lg">
      {/* Title */}
      <h3 className="text-lg font-semibold text-pulse-text">
        {grant.title}
      </h3>

      {/* Secondary text */}
      <p className="mt-2 text-sm text-pulse-text-secondary">
        {grant.organization}
      </p>

      {/* Accent highlight */}
      <div className="mt-3 inline-block rounded-full bg-pulse-accent/10 px-3 py-1">
        <span className="text-sm font-medium text-pulse-accent">
          {grant.matchScore}% Match
        </span>
      </div>

      {/* Button with accent */}
      <button className="mt-4 w-full rounded-lg bg-pulse-accent px-4 py-2 font-medium text-pulse-bg transition-opacity hover:opacity-90">
        View Grant
      </button>
    </div>
  )
}
```

#### Typography

Pulse Grid uses three font families:

```css
/* Instrument Serif for display headings */
@font-face {
  font-family: 'Instrument Serif';
  src: url('/fonts/instrument-serif.woff2') format('woff2');
}

/* Inter for body text (default in Tailwind) */
/* Already available via Tailwind */

/* Geist Mono for code/labels */
@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/geist-mono.woff2') format('woff2');
}

/* Tailwind config */
extend: {
  fontFamily: {
    display: ['Instrument Serif', 'serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['Geist Mono', 'monospace'],
  },
}
```

#### Layout Utilities

```typescript
// Page wrapper with max-width container
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  {/* Content */}
</div>

// Flex utilities
<div className="flex items-center justify-between gap-4">
  {/* Content */}
</div>

// Grid for grant lists
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {grants.map(grant => <GrantCard key={grant.id} grant={grant} />)}
</div>
```

### Animation Classes

```typescript
// Using Framer Motion with Tailwind
import { motion } from 'framer-motion'

export const AnimatedGrantCard = ({ grant }: { grant: Grant }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <GrantCard grant={grant} />
    </motion.div>
  )
}
```

### Dark Mode

All components are dark-first. Do NOT add light mode utilities unless explicitly needed.

```typescript
// GOOD: Dark-first styling
<div className="bg-pulse-surface text-pulse-text">

// AVOID: Light mode utilities
<div className="bg-white dark:bg-pulse-surface">

// AVOID: Hardcoded colors
<div className="bg-gray-800 text-gray-100">
```

---

## State Management

### URL-Based State (Primary)

Use `useSearchParams` and `useRouter` for shareable, bookmarkable filter state:

```typescript
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useGrantFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse current filters from URL
  const filters = useMemo(() => ({
    category: searchParams.get('category') || undefined,
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
    location: searchParams.get('location') || undefined,
    deadline: searchParams.get('deadline') || undefined,
    sortBy: (searchParams.get('sortBy') as 'deadline' | 'amount' | 'relevance') || 'deadline',
    page: Number(searchParams.get('page') || '1'),
  }), [searchParams])

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams)

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    // Reset to page 1 on filter change
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  return { filters, updateFilters }
}
```

### Local React State (Secondary)

Use React hooks for local UI state that doesn't need to persist:

```typescript
'use client'

import { useState } from 'react'

export function GrantFilterForm() {
  const { filters, updateFilters } = useGrantFilters()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Hide' : 'Show'} Filters
      </button>

      {isExpanded && (
        <form onSubmit={(e) => {
          e.preventDefault()
          // Update URL-based state on submit
        }}>
          {/* Filter inputs */}
        </form>
      )}
    </>
  )
}
```

### React Context (for deeply nested shared state)

Only use Context for truly global state that would cause prop-drilling:

```typescript
// lib/context/GrantContext.tsx
import { createContext, useContext, PropsWithChildren } from 'react'

type GrantContextType = {
  selectedGrants: string[]
  toggleGrant: (id: string) => void
}

const GrantContext = createContext<GrantContextType | undefined>(undefined)

export function GrantProvider({ children }: PropsWithChildren) {
  const [selectedGrants, setSelectedGrants] = useState<string[]>([])

  const toggleGrant = (id: string) => {
    setSelectedGrants(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  return (
    <GrantContext.Provider value={{ selectedGrants, toggleGrant }}>
      {children}
    </GrantContext.Provider>
  )
}

export function useGrantContext() {
  const context = useContext(GrantContext)
  if (!context) {
    throw new Error('useGrantContext must be used within GrantProvider')
  }
  return context
}
```

### NO Zustand/Redux

Do not use Zustand, Redux, or other global state libraries in this project. URL state + React hooks are sufficient.

---

## Data Fetching

### Server-Side Data Fetching

```typescript
// app/app/grants/[id]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { GrantDetail } from '@/components/grants/GrantDetail'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const grant = await db.grant.findUnique({ where: { id: params.id } })
  if (!grant) return { title: 'Grant not found' }
  return { title: grant.title, description: grant.description }
}

export default async function GrantPage({ params }: { params: { id: string } }) {
  const grant = await db.grant.findUnique({
    where: { id: params.id },
    include: { source: true, eligibility: true },
  })

  if (!grant) {
    notFound()
  }

  return <GrantDetail grant={grant} />
}
```

### Client-Side Data Fetching

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useGrantFilters } from '@/hooks/useGrantSearch'

export function GrantsSearchClient() {
  const { filters } = useGrantFilters()
  const [grants, setGrants] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchGrants = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/grants/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        })

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`)
        }

        const data = await response.json()
        setGrants(data.grants)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setGrants([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrants()
  }, [filters])

  if (error) {
    return <ErrorMessage error={error} />
  }

  return <GrantsList grants={grants} isLoading={isLoading} />
}
```

### Custom Fetch Hook

```typescript
// hooks/useFetch.ts
import { useEffect, useState, useCallback } from 'react'

type UseFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  skip?: boolean
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [url, options])

  useEffect(() => {
    if (!options.skip) {
      refetch()
    }
  }, [url, refetch, options.skip])

  return { data, isLoading, error, refetch }
}
```

---

## API Route Patterns

### Validation with Zod

```typescript
// lib/validators.ts
import { z } from 'zod'

export const searchGrantsSchema = z.object({
  query: z.string().min(1).max(200),
  category: z.enum(['RESEARCH', 'EDUCATION', 'NONPROFIT', 'BUSINESS']).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  location: z.string().optional(),
  deadline: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export type SearchGrantsInput = z.infer<typeof searchGrantsSchema>
```

### GET Route

```typescript
// app/api/opportunities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const grant = await db.grant.findUnique({
      where: { id: params.id },
      include: { source: true, eligibility: true },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(grant)
  } catch (error) {
    console.error('Error fetching grant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### POST Route with Validation

```typescript
// app/api/grants/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchGrantsSchema } from '@/lib/validators'
import { grantService } from '@/lib/services/grantService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = searchGrantsSchema.parse(body)

    const { grants, total } = await grantService.search(input)

    return NextResponse.json({
      grants,
      total,
      page: input.page,
      limit: input.limit,
      hasMore: input.page * input.limit < total,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### PATCH Route

```typescript
// app/api/opportunities/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateSchema = z.object({
      status: z.enum(['SAVED', 'APPLIED', 'DISMISSED']).optional(),
      notes: z.string().optional(),
    })

    const updates = updateSchema.parse(body)

    const grant = await db.grant.update({
      where: { id: params.id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(grant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### DELETE Route

```typescript
// app/api/opportunities/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.grant.delete({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only delete their own
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### AI Route Example

```typescript
// app/api/ai/writing-assistant/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServerSession } from 'next-auth/next'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { grantId, prompt } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const message = `Help me write a grant application response for this grant: ${grantId}.\n\nPrompt: ${prompt}`

    const result = await model.generateContent(message)
    const generatedText = result.response.text()

    return NextResponse.json({ content: generatedText })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
```

---

## Error Handling

### Server-Side Error Handling

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401, 'UNAUTHORIZED')
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}
```

### Error Boundary

```typescript
// components/errors/ErrorBoundary.tsx
'use client'

import { ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <ErrorFallback
        error={new Error('Something went wrong')}
        reset={() => location.reload()}
      />
    </div>
  )
}

export function ErrorFallback({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="rounded-lg border border-pulse-error bg-pulse-error/5 p-4">
      <h2 className="font-semibold text-pulse-error">Something went wrong</h2>
      <p className="mt-2 text-sm text-pulse-text-secondary">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-pulse-accent px-4 py-2 text-sm font-medium text-pulse-bg hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}
```

### Try-Catch Pattern in Route Handlers

```typescript
// Always wrap API logic in try-catch
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json()
    const input = mySchema.parse(body)

    // Execute business logic
    const result = await grantService.process(input)

    // Return success
    return NextResponse.json(result)
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    // Handle app errors
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    // Log unexpected errors
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Toast Notifications for Client Errors

```typescript
'use client'

import { useCallback } from 'react'
import { useToast } from '@/hooks/useToast'

export function GrantActionForm({ grantId }: { grantId: string }) {
  const { toast } = useToast()

  const handleSave = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/saved-grants`, {
        method: 'POST',
        body: JSON.stringify({ grantId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast({
        title: 'Saved',
        description: 'Grant added to your saved list',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save grant',
        variant: 'error',
      })
    }
  }, [grantId, toast])

  return (
    <button onClick={handleSave} className="...">
      Save Grant
    </button>
  )
}
```

---

## Forbidden Patterns

### 1. Avoid `any` Type

```typescript
// ❌ FORBIDDEN
function processGrant(grant: any) {}

// ✅ GOOD
function processGrant(grant: Grant) {}
```

### 2. Don't Use `var`

```typescript
// ❌ FORBIDDEN
var grants: Grant[] = []

// ✅ GOOD
const grants: Grant[] = []
let index = 0
```

### 3. Avoid Client-Side Secret Handling

```typescript
// ❌ FORBIDDEN: API keys in client components
'use client'
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY // Don't use for secrets
const genAI = new GoogleGenerativeAI(API_KEY)

// ✅ GOOD: Secrets only in server routes
// app/api/ai/chat/route.ts
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
```

### 4. Don't Mutate Props

```typescript
// ❌ FORBIDDEN
export function GrantCard({ grant }: { grant: Grant }) {
  grant.viewed = true // Mutating prop!
}

// ✅ GOOD
export function GrantCard({ grant }: { grant: Grant }) {
  const [isViewed, setIsViewed] = useState(false)
}
```

### 5. No Inline Styles

```typescript
// ❌ FORBIDDEN
<div style={{ backgroundColor: '#40ffaa', padding: '16px' }}>

// ✅ GOOD
<div className="bg-pulse-accent p-4">
```

### 6. Don't Use Index as Key

```typescript
// ❌ FORBIDDEN
{grants.map((g, i) => <GrantCard key={i} grant={g} />)}

// ✅ GOOD
{grants.map((g) => <GrantCard key={g.id} grant={g} />)}
```

### 7. Avoid Empty Dependencies Array in useEffect

```typescript
// ❌ FORBIDDEN (unless truly one-time setup)
useEffect(() => {
  fetchGrants() // Will never re-fetch!
}, [])

// ✅ GOOD: Include dependencies
useEffect(() => {
  fetchGrants()
}, [grantId, filters]) // Re-fetch when deps change
```

### 8. Don't Mix Server & Client Logic

```typescript
// ❌ FORBIDDEN
'use client'
import { db } from '@/lib/db' // Server-only import in client component

// ✅ GOOD: Separate concerns
// Server component:
const data = await db.grant.findMany()
// Client component:
'use client'
const [data, setData] = useState(...)
```

### 9. No Global State (Zustand/Redux)

```typescript
// ❌ FORBIDDEN
import { useGrantStore } from '@/store/grants' // No global stores!

// ✅ GOOD: URL state + React hooks
const { filters } = useGrantFilters() // From URL
const [isOpen, setIsOpen] = useState(false) // Local state
```

### 10. Don't Hardcode Values

```typescript
// ❌ FORBIDDEN
const deadline = new Date('2024-12-31')
const maxAmount = 1000000

// ✅ GOOD: Use constants
import { DEFAULT_MAX_GRANT_AMOUNT } from '@/lib/constants'
```

### 11. Avoid Prop Drilling (Use Context if needed)

```typescript
// ❌ FORBIDDEN (if passed through 5+ levels)
<Level1 user={user}>
  <Level2 user={user}>
    <Level3 user={user}>
      <Level4 user={user}>
        <Level5 user={user} /> {/* Too many levels! */}
      </Level4>
    </Level3>
  </Level2>
</Level1>

// ✅ GOOD: Use Context
<UserProvider>
  <Level1>
    <Level2>
      <Level3>
        <Level4>
          <Level5 /> {/* Access via hook */}
        </Level4>
      </Level3>
    </Level2>
  </Level1>
</UserProvider>
```

### 12. No Unhandled Promise Rejections

```typescript
// ❌ FORBIDDEN
fetchGrants().then(setGrants) // No error handling

// ✅ GOOD
fetchGrants()
  .then(setGrants)
  .catch(err => setError(err))
  // Or use async/await with try-catch
```

### 13. Don't Use `setTimeout` for State Updates

```typescript
// ❌ FORBIDDEN
setTimeout(() => setIsOpen(false), 2000)

// ✅ GOOD: Use transition API or framer-motion
const [, startTransition] = useTransition()
startTransition(() => setIsOpen(false))
```

---

## Import Order

Organize imports in the following order, separated by blank lines:

```typescript
// 1. React & Next.js core
import { FC, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getServerSession } from 'next-auth/next'

// 2. External libraries
import { motion } from 'framer-motion'
import { z } from 'zod'

// 3. Internal absolute imports (lib)
import { grantService } from '@/lib/services/grantService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { db } from '@/lib/db'

// 4. Internal components
import { GrantCard } from '@/components/grants/GrantCard'
import { PulseCard } from '@/components/pulse-grid/PulseCard'
import { Button } from '@/components/ui/Button'

// 5. Types
import type { Grant, GrantFilter } from '@/types/grants'
import type { NextRequest, NextResponse } from 'next/server'

// 6. Styles (if component-scoped)
import styles from './GrantList.module.css'
```

---

## Git Conventions

### Commit Message Format

Use the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring without feature changes
- `docs`: Documentation updates
- `style`: Code style (whitespace, formatting)
- `test`: Test additions/updates
- `perf`: Performance improvements
- `chore`: Build, dependencies, CI/CD
- `ci`: CI/CD configuration

#### Scopes (Grant-specific)

- `grants`: Grant search, display, filtering
- `matching`: AI grant matching logic
- `auth`: Authentication & authorization
- `user`: User profile & account
- `ui`: UI components & styling
- `db`: Database & Prisma
- `api`: API route handlers
- `ai`: AI integration (Gemini)

#### Examples

```bash
# Feature: New grant matching algorithm
git commit -m "feat(matching): implement ai-powered grant matching

- Uses Gemini API to analyze user profile
- Calculates match scores based on eligibility criteria
- Caches matching results for performance
- Closes #42"

# Bug fix: Grant search pagination
git commit -m "fix(grants): correct pagination offset calculation

The offset was incorrectly calculated causing duplicate results
on page 2+. Now uses (page - 1) * limit as offset.

Fixes #89"

# Refactoring
git commit -m "refactor(grants): extract grant filtering logic

Move filter logic from component to useGrantFilter hook for reusability.
No functional changes."

# UI improvements
git commit -m "style(ui): update grant card hover states

- Improve contrast of pulse-accent highlight
- Add smooth transition animations
- Align with Pulse Grid design system"

# Tests
git commit -m "test(matching): add tests for grant match score calculation

- Test with various user profiles
- Verify edge cases (0% match, 100% match)
- Ensure reproducible results"
```

### Branch Naming

```bash
# Feature branches
git checkout -b feature/grant-matching
git checkout -b feature/user-onboarding

# Bug fixes
git checkout -b fix/pagination-offset
git checkout -b fix/auth-session-expiry

# Refactoring
git checkout -b refactor/extract-grant-filters

# Documentation
git checkout -b docs/api-endpoints
```

### Pull Request Template

```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to verify the changes work as expected

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] TypeScript compiles with no errors
- [ ] Documentation updated
- [ ] No console errors/warnings
```

---

## Testing Conventions

### Jest Setup

Tests use **Jest 30** with **Testing Library** (not Vitest).

```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "testMatch": [
      "**/__tests__/**/*.test.ts?(x)",
      "**/?(*.)+(spec|test).ts?(x)"
    ],
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/index.ts"
    ]
  }
}
```

### Component Tests

```typescript
// components/grants/GrantCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GrantCard } from './GrantCard'
import { Grant } from '@/types/grants'

const mockGrant: Grant = {
  id: '1',
  title: 'Environmental Research Grant',
  organization: 'Green Foundation',
  fundingAmount: 50000,
  deadline: new Date('2024-12-31'),
  description: 'Grant for renewable energy research',
  categories: ['RESEARCH', 'ENVIRONMENT'],
  matchScore: 0.85,
}

describe('GrantCard', () => {
  it('renders grant information correctly', () => {
    render(
      <GrantCard
        grant={mockGrant}
        onSave={jest.fn()}
        isLoading={false}
      />
    )

    expect(screen.getByText('Environmental Research Grant')).toBeInTheDocument()
    expect(screen.getByText('Green Foundation')).toBeInTheDocument()
    expect(screen.getByText(/50,000/)).toBeInTheDocument()
  })

  it('displays match score badge when > 80%', () => {
    render(
      <GrantCard
        grant={mockGrant}
        onSave={jest.fn()}
        isLoading={false}
      />
    )

    expect(screen.getByText(/85% Match/)).toBeInTheDocument()
  })

  it('calls onSave when save button clicked', async () => {
    const mockSave = jest.fn()
    render(
      <GrantCard
        grant={mockGrant}
        onSave={mockSave}
        isLoading={false}
      />
    )

    const saveButton = screen.getByRole('button', { name: /Save Grant/ })
    await userEvent.click(saveButton)

    expect(mockSave).toHaveBeenCalled()
  })

  it('disables save button while loading', () => {
    render(
      <GrantCard
        grant={mockGrant}
        onSave={jest.fn()}
        isLoading={true}
      />
    )

    const saveButton = screen.getByRole('button', { name: /Saving/ })
    expect(saveButton).toBeDisabled()
  })
})
```

### Hook Tests

```typescript
// hooks/useGrantFilter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useGrantFilter } from './useGrantFilter'

describe('useGrantFilter', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => useGrantFilter())

    expect(result.current.filters).toEqual({
      category: undefined,
      minAmount: 0,
      maxAmount: undefined,
      location: undefined,
    })
  })

  it('updates filter state', () => {
    const { result } = renderHook(() => useGrantFilter())

    act(() => {
      result.current.setFilter('category', 'RESEARCH')
    })

    expect(result.current.filters.category).toBe('RESEARCH')
  })

  it('resets filters to default', () => {
    const { result } = renderHook(() => useGrantFilter())

    act(() => {
      result.current.setFilter('minAmount', 10000)
    })

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters.minAmount).toBe(0)
  })
})
```

### API Route Tests

```typescript
// app/api/grants/search/route.test.ts
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/grants/search', () => {
  it('returns grants matching search query', async () => {
    const request = new NextRequest('http://localhost:3000/api/grants/search', {
      method: 'POST',
      body: JSON.stringify({
        query: 'renewable energy',
        category: 'RESEARCH',
        limit: 20,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.grants)).toBe(true)
    expect(data.total).toBeGreaterThanOrEqual(0)
  })

  it('returns 400 for invalid input', async () => {
    const request = new NextRequest('http://localhost:3000/api/grants/search', {
      method: 'POST',
      body: JSON.stringify({ query: '' }), // Empty query
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
```

### Snapshot Testing (Use Sparingly)

```typescript
it('renders grant list snapshot', () => {
  const { container } = render(
    <GrantsList grants={mockGrants} isLoading={false} />
  )

  expect(container.firstChild).toMatchSnapshot()
})
```

### Coverage Targets

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

```bash
npm run test -- --coverage
```

---

## SEO Conventions

### Metadata for Grant Pages

```typescript
// app/app/grants/[id]/page.tsx
import { Metadata } from 'next'
import { db } from '@/lib/db'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const grant = await db.grant.findUnique({
    where: { id: params.id },
  })

  if (!grant) {
    return { title: 'Grant not found' }
  }

  return {
    title: `${grant.title} - GrantEase`,
    description: grant.description.slice(0, 160),
    keywords: [
      grant.title,
      ...grant.categories,
      grant.organization,
      'grant',
      'funding',
    ],
    openGraph: {
      type: 'website',
      title: grant.title,
      description: grant.description,
      siteName: 'GrantEase',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(grant.title)}`,
          width: 1200,
          height: 630,
          alt: grant.title,
        },
      ],
    },
  }
}
```

### Structured Data for Grants

```typescript
// components/grants/GrantStructuredData.tsx
import { Grant } from '@/types/grants'

export function GrantStructuredData({ grant }: { grant: Grant }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Grant',
    name: grant.title,
    description: grant.description,
    funder: {
      '@type': 'Organization',
      name: grant.organization,
    },
    fundingAmount: {
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      price: grant.fundingAmount,
    },
    applicationDeadline: grant.deadline.toISOString().split('T')[0],
    keywords: grant.categories.join(', '),
    url: `https://grantease.com/grants/${grant.id}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
```

### Sitemap & Robots

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const grants = await db.grant.findMany({
    select: { id: true, updatedAt: true },
    take: 50000,
  })

  return [
    {
      url: 'https://grantease.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://grantease.com/discover',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...grants.map(grant => ({
      url: `https://grantease.com/grants/${grant.id}`,
      lastModified: grant.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
```

### OpenGraph Images

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'GrantEase - Find Your Grant'

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-pulse-bg">
        <div tw="flex flex-col w-5/6 h-5/6 items-center justify-center bg-pulse-surface rounded-2xl border-2 border-pulse-accent p-12">
          <h1 tw="text-6xl font-bold text-pulse-accent text-center mb-6">
            {title}
          </h1>
          <p tw="text-3xl text-pulse-text-secondary text-center">
            Discover grants tailored to your organization
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

## Performance Targets

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms (or INP < 200ms)
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Strategies

#### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const GrantDetailModal = dynamic(
  () => import('@/components/grants/GrantDetailModal'),
  {
    loading: () => <div className="animate-pulse">Loading...</div>,
  }
)
```

#### Image Optimization

```typescript
// Always use Next.js Image component
import Image from 'next/image'

export function GrantOrgLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      priority={false}
      sizes="(max-width: 768px) 100px, 150px"
    />
  )
}
```

#### Bundle Analysis

```bash
# Check bundle size
npm run build
npm run analyze

# Target: Main bundle < 250kb gzipped
# API routes: < 100kb each
```

#### Database Query Optimization

```typescript
// Use Prisma select to fetch only needed fields
const grants = await db.grant.findMany({
  select: {
    id: true,
    title: true,
    fundingAmount: true,
    matchScore: true,
    // Don't select large text fields unless needed
  },
  take: 20,
})

// Use include for relations
const grant = await db.grant.findUnique({
  where: { id: grantId },
  include: {
    source: true,
    eligibility: true,
  },
})
```

#### Caching Strategy

```typescript
// Cache static grant data
export const revalidate = 3600 // 1 hour

export default async function GrantPage({ params }: { params: { id: string } }) {
  const grant = await db.grant.findUnique({
    where: { id: params.id },
  })
  // ...
}

// Cache API responses
export async function GET(request: NextRequest) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

All components must be accessible to users with disabilities.

#### Semantic HTML

```typescript
// GOOD: Use semantic elements
<article>
  <header>
    <h1>Grant Title</h1>
  </header>
  <section>
    <p>Grant description</p>
  </section>
  <footer>
    <button>Save Grant</button>
  </footer>
</article>

// AVOID: Divs for everything
<div>
  <div>Grant Title</div>
  <div>Grant description</div>
</div>
```

#### Keyboard Navigation

```typescript
// All interactive elements must be keyboard accessible
export function GrantCard({ grant, onSave }: GrantCardProps) {
  return (
    <div
      role="article"
      className="rounded-lg border bg-pulse-surface p-4"
      tabIndex={0} // Make focusable if not a link
    >
      {/* Content */}
      <button
        onClick={onSave}
        className="..."
      >
        Save Grant
      </button>
    </div>
  )
}
```

#### ARIA Labels & Roles

```typescript
// Label form fields
<label htmlFor="grant-search">Search Grants</label>
<input
  id="grant-search"
  type="text"
  aria-label="Search grants by title or organization"
  placeholder="e.g., renewable energy"
/>

// Use aria-live for dynamic updates
<div aria-live="polite" aria-atomic="true">
  Found {grantCount} grants
</div>

// Button purposes
<button aria-label="Filter grants by category">
  <Icon name="filter" />
</button>
```

#### Color Contrast

- Text on background: 4.5:1 ratio (normal text)
- Large text: 3:1 ratio
- **Pulse Grid accent (#40ffaa) on dark bg:** Meets 4.5:1 ✓

#### Focus Indicators

```css
/* Always maintain visible focus states */
button:focus,
a:focus,
input:focus {
  outline: 2px solid var(--pulse-accent);
  outline-offset: 2px;
}

/* Avoid outline: none without replacement */
/* ❌ AVOID */
button:focus {
  outline: none;
}
```

#### Form Labels & Error Messages

```typescript
import { useState } from 'react'

export function GrantFilterForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <form>
      <div className="space-y-4">
        {/* Amount Range */}
        <fieldset>
          <legend className="font-semibold text-pulse-text">
            Funding Amount Range
          </legend>

          <label htmlFor="min-amount">
            Minimum Amount ($)
            {errors.minAmount && (
              <span className="text-pulse-error" role="alert">
                {errors.minAmount}
              </span>
            )}
          </label>
          <input
            id="min-amount"
            type="number"
            aria-invalid={!!errors.minAmount}
            aria-describedby={errors.minAmount ? 'min-amount-error' : undefined}
          />

          <label htmlFor="max-amount">Maximum Amount ($)</label>
          <input id="max-amount" type="number" />
        </fieldset>

        {/* Category */}
        <fieldset>
          <legend className="font-semibold text-pulse-text">
            Grant Category
          </legend>
          <div role="group">
            <label>
              <input type="checkbox" value="RESEARCH" />
              Research
            </label>
            <label>
              <input type="checkbox" value="EDUCATION" />
              Education
            </label>
          </div>
        </fieldset>
      </div>
    </form>
  )
}
```

#### Skip Links

```typescript
// pages/app/layout.tsx
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="absolute -top-8 left-0 bg-pulse-accent px-4 py-2 text-pulse-bg focus:top-0"
      >
        Skip to main content
      </a>

      <Sidebar />

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  )
}
```

#### Testing Accessibility

```bash
# Use axe DevTools or jest-axe
npm install --save-dev jest-axe

# In tests
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<GrantCard grant={mockGrant} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Final Checklist

Before committing code, verify:

- [ ] TypeScript compiles with no errors (`npm run type-check`)
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows naming conventions
- [ ] Components use Pulse Grid colors (not hardcoded colors)
- [ ] No `any` types
- [ ] Error handling implemented
- [ ] Accessibility standards met (keyboard nav, ARIA labels, contrast)
- [ ] Core Web Vitals optimizations applied
- [ ] SEO metadata included (for public pages)
- [ ] Git commit message follows conventions
- [ ] No secrets committed
- [ ] Imports ordered correctly

---

**Questions or updates?** Discuss in engineering standup or create an issue with the `docs` scope.
