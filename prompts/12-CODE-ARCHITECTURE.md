# GrantEase Code Architecture Audit

## Overview
This audit evaluates the codebase structure, organization, and architecture patterns. Focus areas include folder structure adherence, server vs client components, service layer organization, type definitions, dead code, dependencies, and TypeScript strictness.

---

## STEP 1: Folder Structure Validation

### 1.1 Expected Directory Structure
Verify project adheres to CONVENTIONS.md and follows this structure:

```
grantease/
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Auth route group
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── (marketing)/                # Marketing route group
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Home page
│   │   ├── pricing/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── about/page.tsx
│   ├── app/                        # Application routes
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Dashboard
│   │   ├── discover/page.tsx
│   │   ├── grants/
│   │   │   └── [id]/page.tsx
│   │   ├── saved/page.tsx
│   │   ├── searches/page.tsx
│   │   ├── workspace/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   ├── onboarding/                 # Onboarding route group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [step]/page.tsx
│   ├── admin/                      # Admin route group
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [section]/page.tsx
│   ├── api/                        # API routes
│   │   ├── auth/
│   │   │   ├── [nextauth]/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── logout/route.ts
│   │   ├── grants/
│   │   │   ├── route.ts            # GET all, POST new
│   │   │   ├── [id]/route.ts       # GET, PATCH, DELETE
│   │   │   └── search/route.ts
│   │   ├── workspace/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── cron/                  # Cron jobs
│   │   │   ├── update-grants/route.ts
│   │   │   ├── send-digest/route.ts
│   │   │   └── cleanup-sessions/route.ts
│   │   ├── health/route.ts
│   │   └── ready/route.ts
│   ├── layout.tsx                  # Root layout
│   ├── loading.tsx                 # Root loading
│   ├── error.tsx                   # Root error boundary
│   ├── not-found.tsx              # 404 page
│   └── globals.css
├── components/                     # Reusable components
│   ├── ui/                         # Radix UI wrapper components
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Toast.tsx
│   │   ├── Dropdown.tsx
│   │   └── ...
│   ├── layout/                     # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── SkipLink.tsx
│   ├── grants/                     # Grant-related components
│   │   ├── GrantCard.tsx
│   │   ├── GrantGrid.tsx
│   │   ├── GrantDetail.tsx
│   │   ├── GrantFilter.tsx
│   │   └── GrantSearch.tsx
│   ├── onboarding/                 # Onboarding components
│   │   ├── StepIndicator.tsx
│   │   ├── EntityTypeStep.tsx
│   │   ├── IndustryStep.tsx
│   │   ├── SizeStageStep.tsx
│   │   ├── AttributesStep.tsx
│   │   └── PreferencesStep.tsx
│   ├── workspace/                  # Workspace components
│   │   ├── WorkspaceList.tsx
│   │   ├── WorkspaceDetail.tsx
│   │   ├── GrantChecklist.tsx
│   │   ├── DocumentUpload.tsx
│   │   └── WorkspaceNotes.tsx
│   ├── marketing/                  # Marketing page components
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   └── FAQ.tsx
│   ├── pulse-grid/                 # Pulse Grid design system
│   │   ├── Skeleton.tsx
│   │   ├── PulseAnimation.tsx
│   │   └── ...
│   └── icons/                      # Custom icon components (if not using lucide)
│       └── ...
├── lib/                            # Utility functions and services
│   ├── db.ts                       # Prisma client singleton
│   ├── auth.ts                     # NextAuth configuration
│   ├── utils.ts                    # General utilities
│   ├── validators.ts               # Zod schemas
│   ├── services/                   # Business logic services
│   │   ├── grants.service.ts
│   │   ├── workspace.service.ts
│   │   ├── users.service.ts
│   │   ├── onboarding.service.ts
│   │   └── ai.service.ts
│   ├── middleware/                 # API middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   └── hooks/                      # React hooks (if using custom hooks)
│       ├── useAuth.ts
│       ├── useGrants.ts
│       └── useWorkspace.ts
├── types/                          # TypeScript type definitions
│   ├── next-auth.d.ts
│   ├── api.ts                      # API request/response types
│   ├── domain.ts                   # Domain entity types
│   ├── forms.ts                    # Form types
│   └── index.ts                    # Type exports
├── prisma/                         # Prisma ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                         # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicons/
├── tests/                          # Test files
│   ├── unit/
│   ├── integration/
│   └── __fixtures__/
├── .github/
│   └── workflows/                  # GitHub Actions
│       ├── ci.yml
│       └── deploy.yml
├── config/                         # Configuration files
│   ├── tailwind.config.ts
│   ├── jest.config.js
│   └── next.config.js
├── .env.example                    # Environment variable template
├── .env.local                      # Local env vars (not in Git)
├── .gitignore
├── .eslintrc.json                 # ESLint config
├── tsconfig.json                   # TypeScript config
├── package.json
├── package-lock.json
├── vercel.json                     # Vercel config
├── CONVENTIONS.md                  # Project conventions
├── README.md
└── .prettierrc                     # Code formatter config
```

**Checklist:**
- [ ] Directory structure matches expected layout
- [ ] No extraneous directories at root
- [ ] Route groups use parentheses: `(auth)`, `(marketing)`
- [ ] API routes properly organized by feature
- [ ] Components organized by feature/type
- [ ] Library code in `/lib` with subdirectories
- [ ] Types in `/types` directory
- [ ] Migrations in `/prisma/migrations`
- [ ] Tests colocated with features or in `/tests`
- [ ] Config files at root or `/config`

### 1.2 Deprecated Directories Cleanup
Check for and remove deprecated directories:

**Directories to Remove:**
```
app-v2/           # Old app version
onboarding-v2/    # Old onboarding version
lib-old/          # Old lib folder
components-old/   # Old components
legacy/           # Legacy code
```

**Checklist:**
- [ ] No `app-v2`, `onboarding-v2`, `lib-old` directories
- [ ] No `legacy` or `old` directories
- [ ] No `components-old` or similar
- [ ] Git history preserved (migrations recorded, not deleted)
- [ ] Redirects configured for deprecated routes
- [ ] Documentation updated for changes

---

## STEP 2: Server vs Client Component Boundaries

### 2.1 Page Components (Server by Default)
Verify pages are server components:

```typescript
// app/app/page.tsx - Server component
import { getDashboardData } from '@/lib/services/dashboard.service';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard - GrantEase',
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main>
      <DashboardClient initialData={data} />
    </main>
  );
}
```

**Checklist:**
- [ ] All `/app/*/page.tsx` are server components (no `'use client'`)
- [ ] Pages fetch data on server with async/await
- [ ] Pages generate metadata
- [ ] Pages pass initial data to client components
- [ ] Database queries only on server
- [ ] API calls to external services on server
- [ ] No useState/useEffect in pages

### 2.2 Layout Components (Server by Default)
Verify layouts are server components:

```typescript
// app/layout.tsx - Server layout
import { ReactNode } from 'react';
import { getSession } from '@/lib/auth';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <html>
      <body>
        <Header session={session} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**Checklist:**
- [ ] All layouts are server components
- [ ] No `'use client'` in layout.tsx
- [ ] Layouts can fetch data and pass to children
- [ ] Sidebar/Header can use server-side data
- [ ] Client-only interactive features delegated to child components

### 2.3 Client Components (Interactivity)
Verify client components marked correctly:

```typescript
// components/grants/GrantGrid.tsx - Client component
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GrantCard } from './GrantCard';

export function GrantGrid({ grants }) {
  const [saved, setSaved] = useState<string[]>([]);
  const router = useRouter();

  const handleSaveGrant = async (grantId: string) => {
    setSaved((prev) => [...prev, grantId]);
    // Call API to persist
    await fetch('/api/grants/save', { method: 'POST', body: JSON.stringify({ grantId }) });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {grants.map((grant) => (
        <GrantCard
          key={grant.id}
          grant={grant}
          isSaved={saved.includes(grant.id)}
          onToggleSave={handleSaveGrant}
        />
      ))}
    </div>
  );
}
```

**Checklist:**
- [ ] Components using hooks have `'use client'` directive
- [ ] Components using event handlers have `'use client'`
- [ ] Components using context have `'use client'`
- [ ] No unnecessary `'use client'` directives
- [ ] Server/Client boundary clear and documented
- [ ] Data passing from server to client via props
- [ ] No circular dependencies between server/client

---

## STEP 3: Service Layer Organization

### 3.1 Service Files Structure
Verify services organized by feature:

```typescript
// lib/services/grants.service.ts
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const grantsService = {
  /**
   * Get all grants with optional filtering
   */
  async getAll(options?: {
    filter?: Prisma.GrantFindManyArgs['where'];
    skip?: number;
    take?: number;
    orderBy?: Prisma.GrantOrderByWithRelationInput;
  }) {
    return prisma.grant.findMany({
      where: options?.filter,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
      include: {
        organization: true,
      },
    });
  },

  /**
   * Get single grant by ID
   */
  async getById(id: string) {
    return prisma.grant.findUniqueOrThrow({
      where: { id },
      include: {
        organization: true,
        eligibility: true,
        requirements: true,
      },
    });
  },

  /**
   * Search grants by keyword and filters
   */
  async search(query: string, filters?: {
    minAmount?: number;
    maxAmount?: number;
    categories?: string[];
  }) {
    return prisma.grant.findMany({
      where: {
        AND: [
          query ? { title: { search: query } } : {},
          filters?.minAmount ? { amount: { gte: filters.minAmount } } : {},
          filters?.maxAmount ? { amount: { lte: filters.maxAmount } } : {},
          filters?.categories ? { categories: { hasSome: filters.categories } } : {},
        ],
      },
      include: {
        organization: true,
      },
      take: 50,
    });
  },

  /**
   * Save grant to workspace
   */
  async addToWorkspace(userId: string, grantId: string, workspaceId: string) {
    return prisma.workspaceGrant.create({
      data: {
        grantId,
        workspaceId,
        status: 'INTERESTED',
      },
    });
  },
};
```

**Checklist:**
- [ ] Service files in `/lib/services/` directory
- [ ] One service file per feature: `grants.service.ts`, `workspace.service.ts`, etc.
- [ ] Services export object with named functions
- [ ] Services handle database queries
- [ ] Services implement business logic
- [ ] Services don't depend on HTTP/Request objects
- [ ] Error handling consistent
- [ ] Type definitions exported
- [ ] JSDoc comments for public functions

### 3.2 Service Imports in Pages/API Routes
Verify services used correctly:

```typescript
// app/api/grants/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { grantsService } from '@/lib/services/grants.service';
import { searchGrantsSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const minAmount = searchParams.get('minAmount') ? parseInt(searchParams.get('minAmount')!) : undefined;
    const maxAmount = searchParams.get('maxAmount') ? parseInt(searchParams.get('maxAmount')!) : undefined;

    // Validate input
    const validated = searchGrantsSchema.parse({
      query,
      filters: { minAmount, maxAmount },
    });

    // Use service
    const results = await grantsService.search(validated.query, validated.filters);

    return NextResponse.json({ grants: results, count: results.length });
  } catch (error) {
    console.error('Search grants error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

**Checklist:**
- [ ] API routes import and use services
- [ ] Services handle database access
- [ ] API routes handle HTTP/request logic only
- [ ] Validation happens before service calls
- [ ] Error handling in API routes
- [ ] Services not aware of HTTP details

---

## STEP 4: Prisma Client Singleton Pattern

### 4.1 Prisma Client Initialization
Verify singleton pattern in `/lib/db.ts`:

```typescript
// lib/db.ts
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
- [ ] File exists at `/lib/db.ts`
- [ ] Singleton pattern prevents multiple connections
- [ ] Global reference used in development
- [ ] Error format set to 'pretty'
- [ ] No multiple PrismaClient instances
- [ ] Imported as `import { prisma } from '@/lib/db'`

### 4.2 Prisma Usage
Verify consistent usage throughout codebase:

**Checklist:**
- [ ] Services import prisma: `import { prisma } from '@/lib/db'`
- [ ] No direct PrismaClient instantiation in other files
- [ ] Prisma queries use proper patterns
- [ ] Error handling for database errors
- [ ] Connection pooling configured (Neon)
- [ ] No N+1 query problems (use `include`)
- [ ] Transactions used for multi-step operations

---

## STEP 5: Auth Configuration

### 5.1 NextAuth Configuration
Verify `/lib/auth.ts` setup:

```typescript
// lib/auth.ts
import { type NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        // Verify password (use bcrypt)
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboardingComplete = user.onboardingComplete;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);
```

**Checklist:**
- [ ] File exists at `/lib/auth.ts`
- [ ] NextAuth options configured
- [ ] Google OAuth provider configured
- [ ] Credentials provider for email/password auth
- [ ] PrismaAdapter used
- [ ] JWT session strategy
- [ ] Custom pages defined (signIn, error)
- [ ] Callbacks extend token and session with user data
- [ ] Role and onboarding status in session
- [ ] Environment variables used (GOOGLE_ID, GOOGLE_SECRET)
- [ ] getSession exported for server use

### 5.2 NextAuth Type Extension
Verify type definitions in `/types/next-auth.d.ts`:

```typescript
// types/next-auth.d.ts
import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'USER' | 'ADMIN';
    onboardingComplete: boolean;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      onboardingComplete: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'USER' | 'ADMIN';
    onboardingComplete?: boolean;
  }
}
```

**Checklist:**
- [ ] File exists at `/types/next-auth.d.ts`
- [ ] User type extended with custom fields
- [ ] Session type extended with custom fields
- [ ] JWT type extended with custom fields
- [ ] Types match `/lib/auth.ts` callbacks
- [ ] Properly typed in page/route components

---

## STEP 6: Utility Function Organization

### 6.1 General Utilities
Verify `/lib/utils.ts` contains common functions:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: format === 'short' ? '2-digit' : 'long',
    day: '2-digit',
  }).format(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Sleep/delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

**Checklist:**
- [ ] File exists at `/lib/utils.ts`
- [ ] Common formatting functions (currency, date)
- [ ] Tailwind merge function (`cn()`)
- [ ] Text truncation utility
- [ ] ID generation utility
- [ ] Debounce/throttle functions
- [ ] No business logic in utils
- [ ] Well-documented with JSDoc
- [ ] Exported and used throughout app

### 6.2 Custom Hooks (Optional)
If using custom hooks, organize in `/lib/hooks`:

```typescript
// lib/hooks/useAuth.ts
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}

// lib/hooks/useGrants.ts
import { useState, useCallback } from 'react';

export function useGrants() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGrants = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grants/search?q=${query}`);
      const data = await res.json();
      setGrants(data.grants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
    } finally {
      setLoading(false);
    }
  }, []);

  return { grants, loading, error, searchGrants };
}
```

**Checklist:**
- [ ] Custom hooks in `/lib/hooks/` if used
- [ ] Hooks export logic without hardcoding
- [ ] Hooks properly typed
- [ ] useCallback for memoized callbacks
- [ ] useState properly initialized
- [ ] Error handling included

---

## STEP 7: Type Definitions Organization

### 7.1 Type Files Structure
Verify types organized by domain:

```typescript
// types/index.ts
export * from './api';
export * from './domain';
export * from './forms';

// types/api.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string>;
  statusCode: number;
}

export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
}

// types/domain.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: Date;
  organizationId: string;
  categories: string[];
  eligibility: string[];
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  grants: WorkspaceGrant[];
  checklist: ChecklistItem[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

// types/forms.ts
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface CreateWorkspaceFormData {
  name: string;
  description?: string;
}
```

**Checklist:**
- [ ] Types organized in `/types/` directory
- [ ] Separate files for API, domain, forms
- [ ] Types exported from `types/index.ts`
- [ ] No circular dependencies between type files
- [ ] Generic types properly defined (`PaginatedResponse<T>`)
- [ ] Union types for status/role fields
- [ ] NextAuth types extended in separate file
- [ ] Used consistently throughout app

### 7.2 Type Imports
Verify consistent type import patterns:

**Checklist:**
- [ ] Import types with `import type { ... }`
- [ ] All types used in file imported
- [ ] No unused type imports (ESLint catches)
- [ ] API route handlers type request/response
- [ ] Component props properly typed
- [ ] Function parameters/returns typed
- [ ] No `any` types (TypeScript strict mode)

---

## STEP 8: Component Organization

### 8.1 UI Components
Verify Radix UI wrapper components:

```typescript
// components/ui/Button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, disabled, ...props }, ref) => (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-slate-900 rounded disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-[#40ffaa] text-slate-950 hover:bg-[#3ae699]': variant === 'default',
          'bg-slate-800 text-white hover:bg-slate-700': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
          'text-white hover:bg-slate-800': variant === 'ghost',
        },
        {
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button };
```

**Checklist:**
- [ ] UI components in `/components/ui/`
- [ ] Components wrap Radix UI primitives
- [ ] Props interface properly typed
- [ ] Variants (default, secondary, destructive)
- [ ] Sizes (sm, md, lg)
- [ ] Forwards ref for composition
- [ ] Display name set for debugging
- [ ] Uses `cn()` utility for class merging
- [ ] Accessible (focus, aria-labels)

### 8.2 Feature Components
Verify components organized by feature:

```
components/
├── grants/
│   ├── GrantCard.tsx         # Single card component
│   ├── GrantGrid.tsx         # Grid of cards (client)
│   ├── GrantDetail.tsx       # Detail view
│   ├── GrantFilter.tsx       # Filter panel (client)
│   └── GrantSearch.tsx       # Search input (client)
├── workspace/
│   ├── WorkspaceList.tsx
│   ├── WorkspaceDetail.tsx   # Client component
│   ├── GrantChecklist.tsx    # Client component
│   ├── DocumentUpload.tsx    # Client component
│   └── WorkspaceNotes.tsx    # Client component
└── onboarding/
    ├── StepIndicator.tsx
    ├── EntityTypeStep.tsx    # Form step (client)
    ├── IndustryStep.tsx      # Form step (client)
    └── ...
```

**Checklist:**
- [ ] Components organized by feature
- [ ] Component naming descriptive
- [ ] Client components marked with `'use client'`
- [ ] Container/presenter pattern used where appropriate
- [ ] Props properly typed
- [ ] JSDoc comments for complex components

---

## STEP 9: Dead Code Cleanup

### 9.1 Find and Remove Deprecated Directories
Scan for unused code:

**Search patterns:**
```bash
# Find v2 directories
find . -type d -name "*-v2" -o -name "*-old" -o -name "legacy"

# Find dead imports (using unused-imports ESLint rule)
npm run lint -- --fix

# Analyze bundle size
npm run build -- --analyze
```

**Checklist:**
- [ ] No `app-v2/` directory
- [ ] No `onboarding-v2/` directory
- [ ] No `lib-old/` or similar
- [ ] No `.old`, `.backup`, `.unused` files
- [ ] All imports used (no unused imports)
- [ ] Dead code removed or archived
- [ ] v1/v2/legacy routes not in codebase

### 9.2 Unused Files
Find unused TypeScript/JSX files:

**Tools:**
```bash
# Check for unused exports (requires configuration)
npm install --save-dev knip
npx knip

# Check bundle impact
npm run build && du -sh .next/
```

**Checklist:**
- [ ] No unused page files
- [ ] No unused component files
- [ ] No unused utility files
- [ ] Barrel exports (index.ts) used correctly
- [ ] No circular dependencies
- [ ] Import paths consistent (@/ aliases)

---

## STEP 10: Unused Dependencies Audit

### 10.1 Package.json Review
Verify only necessary dependencies installed:

```json
{
  "dependencies": {
    // Core
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",

    // Database
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",

    // Authentication
    "next-auth": "^4.24.0",
    "@next-auth/prisma-adapter": "^1.0.0",

    // UI/Styling
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.263.0",

    // Forms & Validation
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",

    // AI
    "@google/generative-ai": "^0.1.0",

    // Utilities
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^2.30.0",

    // API
    "axios": "^1.6.0" // or use native fetch
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
```

**Checklist:**
- [ ] No unused dependencies in package.json
- [ ] Version pinning reasonable (use ^ or ~ not *)
- [ ] Peer dependencies satisfied
- [ ] Duplicate packages removed
- [ ] Major versions compatible
- [ ] Security patches applied (npm audit)
- [ ] Yearly dependency updates planned

### 10.2 Import Analysis
Verify all imports are used:

**Checklist:**
- [ ] No unused imports in files
- [ ] ESLint rule enabled: `unused-imports/no-unused-imports`
- [ ] No circular imports
- [ ] @/ alias paths used consistently
- [ ] Relative imports minimized
- [ ] Third-party imports not duplicated

---

## STEP 11: Import Path Consistency

### 11.1 Path Alias Configuration
Verify `tsconfig.json` and `next.config.js` have matching paths:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./lib/hooks/*"],
      "@/services/*": ["./lib/services/*"]
    }
  }
}
```

**Checklist:**
- [ ] `@/` alias points to root
- [ ] `@/components/*` points to components directory
- [ ] `@/lib/*` points to lib directory
- [ ] `@/types/*` points to types directory
- [ ] Aliases configured in both `tsconfig.json` and `next.config.js`
- [ ] No relative imports from different feature dirs
- [ ] Consistent import style throughout codebase

### 11.2 Import Verification
Scan for inconsistent imports:

**Checklist:**
- [ ] All imports use @/ aliases (not relative paths)
- [ ] No `import { component } from '../../../components/Button'`
- [ ] Components import from `@/components`
- [ ] Services import from `@/lib/services`
- [ ] Types import from `@/types`
- [ ] Utils import from `@/lib/utils`
- [ ] No `.js` extensions on imports (TypeScript)

---

## STEP 12: TypeScript Strictness

### 12.1 Strict Mode Configuration
Verify `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false
  }
}
```

**Checklist:**
- [ ] `strict: true` enabled
- [ ] `noImplicitAny: true` enforced
- [ ] `noUnusedLocals: true` enforced
- [ ] `noUnusedParameters: true` enforced
- [ ] `noImplicitReturns: true` enforced
- [ ] Build fails on TypeScript errors
- [ ] No `any` types without justification
- [ ] No `// @ts-ignore` or `// @ts-expect-error` without comment

### 12.2 Code Compliance
Verify code follows TypeScript restrictions:

**Checklist:**
- [ ] All variables properly typed
- [ ] Function parameters have types
- [ ] Function return types explicit
- [ ] No implicit `any` types
- [ ] Union types used for multiple possibilities
- [ ] Generics used appropriately
- [ ] No type casting without reason (`as` used sparingly)
- [ ] Null/undefined handled explicitly
- [ ] Non-null assertions minimized (`!` used sparingly)

---

## STEP 13: API Route Handler Patterns

### 13.1 Consistent Error Handling
Verify API routes handle errors consistently:

```typescript
// app/api/grants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { grantsService } from '@/lib/services/grants.service';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate input
    if (!params.id) {
      return NextResponse.json(
        { error: 'Grant ID required' },
        { status: 400 }
      );
    }

    // Get grant
    const grant = await grantsService.getById(params.id);

    return NextResponse.json({ grant }, { status: 200 });
  } catch (error) {
    console.error('Get grant error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch grant' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();

    // Validate input (using Zod)
    const validated = updateGrantSchema.parse(body);

    // Update grant
    const grant = await prisma.grant.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ grant }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update grant error:', error);
    return NextResponse.json(
      { error: 'Failed to update grant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin
    const session = await getSession();
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete grant
    await prisma.grant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error('Delete grant error:', error);
    return NextResponse.json(
      { error: 'Failed to delete grant' },
      { status: 500 }
    );
  }
}
```

**Checklist:**
- [ ] All API routes handle errors with try/catch
- [ ] 400 errors for validation failures
- [ ] 401 errors for unauthenticated requests
- [ ] 403 errors for unauthorized (no permission) requests
- [ ] 404 errors for not found
- [ ] 500 errors for server errors
- [ ] Error messages non-technical and safe
- [ ] No sensitive data in error responses
- [ ] Logging for debugging (not exposed to client)
- [ ] Request body validated (Zod or similar)
- [ ] Response typed and documented

### 13.2 Auth Checks
Verify consistent auth pattern:

**Checklist:**
- [ ] Protected routes check session
- [ ] Admin routes check role
- [ ] Middleware validates auth early
- [ ] Sessions refreshed periodically
- [ ] Token expiration handled
- [ ] Logout clears session properly

---

## STEP 14: Barrel Exports Review

### 14.1 Index.ts Files
Verify appropriate use of barrel exports:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Dialog } from './Dialog';
export { Toast } from './Toast';
export type { ButtonProps } from './Button';

// lib/services/index.ts
export { grantsService } from './grants.service';
export { workspaceService } from './workspace.service';
export { usersService } from './users.service';

// types/index.ts
export type { User, Grant, Workspace } from './domain';
export type { LoginFormData, RegisterFormData } from './forms';
export type { PaginatedResponse, ApiError } from './api';
```

**Checklist:**
- [ ] Barrel exports at feature level
- [ ] No re-exports of re-exports (avoid deep chains)
- [ ] Only public APIs exported
- [ ] Type exports separate from value exports
- [ ] Import from barrel, not individual files (preferred)
- [ ] Circular dependencies avoided

---

## STEP 15: Configuration Organization

### 15.1 Config Files at Root
Verify config files properly placed:

**Checklist:**
- [ ] `tailwind.config.ts` at root
- [ ] `next.config.js` at root
- [ ] `jest.config.js` at root
- [ ] `tsconfig.json` at root
- [ ] `.eslintrc.json` at root
- [ ] `.prettierrc` at root (or in package.json)
- [ ] `vercel.json` at root
- [ ] `prisma/schema.prisma` in prisma directory
- [ ] Environment config in .env.* files

### 15.2 Tailwind Configuration
Verify `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#030712',
        },
        accent: '#40ffaa',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Checklist:**
- [ ] Content paths include all component directories
- [ ] Accent color (#40ffaa) configured
- [ ] Dark slate colors configured
- [ ] Custom animations defined (pulse)
- [ ] Plugins included if needed
- [ ] SafeList for dynamic classes (if necessary)

---

## STEP 16: Architecture Testing Checklist

### 16.1 Server vs Client Boundaries
- [ ] Run `npm run build` - no client/server confusion errors
- [ ] Test page data loading (server)
- [ ] Test component interactivity (client)
- [ ] Test form submissions (client → server)
- [ ] Verify data flow from server → client

### 16.2 Type Safety
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npx tsc --noEmit` - strict checking passes
- [ ] No `any` types in codebase
- [ ] All imports properly typed
- [ ] API responses properly typed
- [ ] Props interfaces complete

### 16.3 Dependencies
- [ ] Run `npm audit` - no critical vulnerabilities
- [ ] Run `npm outdated` - check for updates
- [ ] No circular dependencies
- [ ] All imports resolved correctly
- [ ] Tree-shaking working (check bundle)

### 16.4 Code Quality
- [ ] Run `npm run lint` - no ESLint errors
- [ ] Run `npm run format` - Prettier applied
- [ ] Run `npm run test` - tests pass
- [ ] Run `npm run build` - production build succeeds
- [ ] No console errors or warnings in browser

---

## Summary

This architecture audit covers:
1. Folder structure organization
2. Server vs client component boundaries
3. Service layer organization
4. Prisma client and database patterns
5. Authentication configuration
6. Utility functions and hooks
7. Type definitions and organization
8. Component organization
9. Dead code removal
10. Dependency management
11. Import path consistency
12. TypeScript strictness
13. API route patterns
14. Barrel exports
15. Configuration files

All items should be verified before committing code or deploying to production. Maintain this audit as part of your code review process.
