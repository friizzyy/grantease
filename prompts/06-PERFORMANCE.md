# GrantEase Performance & Core Web Vitals Audit

**Audit Purpose:** Ensure grant discovery, detail pages, and dashboard meet Core Web Vitals targets and optimize for large grant datasets, AI response latency, and image loading.

**Scope:** LCP, INP, CLS measurement, query optimization, bundle analysis, image optimization, code splitting, Gemini API streaming.

---

## STEP 1: Core Web Vitals Baselines & Targets

### 1.1 Target Metrics for GrantEase

| Metric | Target | GrantEase Priority | Measurement |
|--------|--------|-------------------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Critical | Hero section load, grant list visibility |
| **INP** (Interaction to Next Paint) | < 200ms | High | Filter apply, grant save, pagination |
| **CLS** (Cumulative Layout Shift) | < 0.1 | High | Ad/notification injection prevention |
| **FCP** (First Contentful Paint) | < 1.8s | Medium | Initial page paint speed |
| **TTFB** (Time To First Byte) | < 600ms | Medium | Server response time |

### 1.2 Performance Budget

```javascript
// next.config.js - Performance Budget Configuration
module.exports = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui',
      'framer-motion',
    ],
  },
  webpack: (config, { isServer }) => {
    config.performance = {
      maxEntrypointSize: 250000,
      maxAssetSize: 250000,
    };
    return config;
  },
};
```

**Bundle Size Targets:**
- Main bundle (app code): < 200KB (gzipped)
- Grant search page: < 150KB (gzipped)
- Grant detail page: < 120KB (gzipped)
- Admin/dashboard: < 180KB (gzipped)

### 1.3 Monitoring & Alerts

**Web Vitals Library Integration:**

```typescript
// src/lib/web-vitals.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export const trackWebVitals = () => {
  getCLS(metric => {
    console.log('CLS:', metric.value);
    if (metric.value > 0.1) {
      reportToAnalytics('CLS_WARNING', metric);
    }
  });

  getLCP(metric => {
    console.log('LCP:', metric.value);
    if (metric.value > 2500) {
      reportToAnalytics('LCP_WARNING', metric);
    }
  });

  getFCP(metric => {
    console.log('FCP:', metric.value);
  });

  getFID(metric => {
    console.log('FID:', metric.value);
  });

  getTTFB(metric => {
    console.log('TTFB:', metric.value);
  });
};

const reportToAnalytics = (metric: string, data: any) => {
  // Send to analytics service (e.g., Sentry, DataDog)
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ metric, data }),
  }).catch(() => {});
};
```

**Root Layout Integration:**

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/web-vitals';

export default function RootLayout({ children }) {
  useEffect(() => {
    trackWebVitals();
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 1.4 Checklist
- [ ] LCP target < 2.5s for grant discovery page
- [ ] INP target < 200ms for interactions
- [ ] CLS target < 0.1 for visual stability
- [ ] Web Vitals tracking implemented
- [ ] Analytics integration for metrics
- [ ] Lighthouse CI configured
- [ ] Performance budgets defined in next.config.js

---

## STEP 2: Grant Discovery Page Performance

### 2.1 Large Grant List Rendering Optimization

**Problem:** Loading 1000+ grants causes performance issues

**Solution: Virtual Scrolling with React Virtualized**

```typescript
// src/components/GrantList/VirtualizedGrantList.tsx
'use client';

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { GrantCard } from './GrantCard';
import { Grant } from '@prisma/client';

interface VirtualizedGrantListProps {
  grants: Grant[];
  itemHeight: number;
  isLoading?: boolean;
  onEndReached?: () => void;
}

export const VirtualizedGrantList = React.memo(
  ({ grants, itemHeight = 280, isLoading, onEndReached }: VirtualizedGrantListProps) => {
    const itemCount = grants.length;

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      return (
        <div style={style}>
          <GrantCard grant={grants[index]} />
        </div>
      );
    };

    const handleScroll = (scrollOffset: number, clientHeight: number) => {
      const scrollPercentage = (scrollOffset + clientHeight) / (itemHeight * itemCount);
      if (scrollPercentage > 0.8 && onEndReached) {
        onEndReached();
      }
    };

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={itemCount}
            itemSize={itemHeight}
            width={width}
            onScroll={({ scrollOffset, clientHeight }) =>
              handleScroll(scrollOffset, clientHeight)
            }
            overscanCount={5}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    );
  }
);

VirtualizedGrantList.displayName = 'VirtualizedGrantList';
```

### 2.2 Infinite Scroll vs. Pagination Strategy

**Recommended: Pagination with Cursor-based Pagination**

```typescript
// src/app/api/grants/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const cursor = searchParams.get('cursor');
  const category = searchParams.get('category');

  try {
    const grants = await prisma.grant.findMany({
      take: limit + 1, // Fetch one extra to determine if there are more
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        fundingAmount: true,
        category: true,
        deadline: true,
        source: true,
      },
    });

    const hasNextPage = grants.length > limit;
    const nextCursor = hasNextPage ? grants[limit].id : null;

    return NextResponse.json({
      grants: grants.slice(0, limit),
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    console.error('Grant search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
};
```

### 2.3 Client-side Pagination Hook

```typescript
// src/hooks/useGrantPagination.ts
'use client';

import { useState, useCallback } from 'react';
import { Grant } from '@prisma/client';

interface PaginationState {
  grants: Grant[];
  cursor: string | null;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useGrantPagination = (initialFilters = {}) => {
  const [state, setState] = useState<PaginationState>({
    grants: [],
    cursor: null,
    hasNextPage: true,
    isLoading: false,
    error: null,
  });

  const fetchGrants = useCallback(
    async (resetCursor = true) => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        const params = new URLSearchParams({
          limit: '20',
          ...(resetCursor ? {} : { cursor: state.cursor || '' }),
          ...initialFilters,
        });

        const res = await fetch(`/api/grants/search?${params}`);
        const data = await res.json();

        setState(prev => ({
          ...prev,
          grants: resetCursor ? data.grants : [...prev.grants, ...data.grants],
          cursor: data.nextCursor,
          hasNextPage: data.hasNextPage,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load grants',
          isLoading: false,
        }));
      }
    },
    [state.cursor, initialFilters]
  );

  const loadMore = useCallback(() => {
    if (!state.isLoading && state.hasNextPage) {
      fetchGrants(false);
    }
  }, [state.isLoading, state.hasNextPage, fetchGrants]);

  return {
    ...state,
    fetchGrants,
    loadMore,
  };
};
```

### 2.4 Grant Search Page Component

```typescript
// src/app/search/page.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { VirtualizedGrantList } from '@/components/GrantList/VirtualizedGrantList';
import { GrantFilter } from '@/components/GrantFilter';
import { useGrantPagination } from '@/hooks/useGrantPagination';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(searchParams.entries());

  const { grants, isLoading, hasNextPage, fetchGrants, loadMore } =
    useGrantPagination(filters);

  useEffect(() => {
    fetchGrants(true);
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    const params = new URLSearchParams(newFilters);
    window.history.pushState(null, '', `?${params.toString()}`);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      <aside className="lg:col-span-1">
        <GrantFilter onFilterChange={handleFilterChange} />
      </aside>

      <main className="lg:col-span-3">
        {isLoading && grants.length === 0 ? (
          <div className="text-center py-12">Loading grants...</div>
        ) : (
          <VirtualizedGrantList
            grants={grants}
            itemHeight={280}
            isLoading={isLoading}
            onEndReached={loadMore}
          />
        )}

        {!hasNextPage && grants.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No more grants to load
          </div>
        )}
      </main>
    </div>
  );
}
```

### 2.5 Checklist
- [ ] Virtual scrolling for grant lists > 100 items
- [ ] Cursor-based pagination API route
- [ ] Infinite scroll hook with load-more strategy
- [ ] Search params preserved in URL
- [ ] Overscan count set to 5 items
- [ ] Item rendering memoized
- [ ] LCP measured for list and filters

---

## STEP 3: Grant Detail Page Optimization

### 3.1 LCP Hero Section Optimization

**Hero Section Strategy: Optimize Hero Image**

```typescript
// src/app/grants/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface GrantDetailPageProps {
  params: { id: string };
}

export const generateMetadata = async ({ params }: GrantDetailPageProps) => {
  const grant = await prisma.grant.findUnique({
    where: { id: params.id },
  });

  if (!grant) notFound();

  return {
    title: grant.title,
    description: grant.description.slice(0, 160),
    openGraph: {
      title: grant.title,
      description: grant.description,
      images: [`/api/og?grantId=${grant.id}`],
    },
  };
};

export default async function GrantDetailPage({ params }: GrantDetailPageProps) {
  const grant = await prisma.grant.findUnique({
    where: { id: params.id },
    include: {
      eligibilityRequirements: true,
    },
  });

  if (!grant) notFound();

  return (
    <article className="max-w-4xl mx-auto p-6">
      {/* Hero Section - LCP Element */}
      <div className="mb-8">
        {/* Optimized Hero Image */}
        <div className="relative h-[400px] mb-6 bg-gradient-to-br from-accent/10 to-slate-900/50">
          <Image
            src={`/api/grants/${grant.id}/hero`}
            alt={grant.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%2340ffaa' width='900' height='400'/%3E%3C/svg%3E"
          />
        </div>

        {/* Quick Stats Above Fold */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-accent font-bold text-2xl">
              ${(grant.fundingAmount / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-400">Funding Amount</div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-accent font-bold text-2xl">
              {Math.ceil((grant.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
            </div>
            <div className="text-sm text-gray-400">Until Deadline</div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="text-accent font-bold text-2xl">{grant.category}</div>
            <div className="text-sm text-gray-400">Category</div>
          </div>
        </div>
      </div>

      {/* Main Content - Deferred below fold */}
      <GrantDetailContent grant={grant} />
    </article>
  );
}

function GrantDetailContent({ grant }: any) {
  return (
    <>
      <h1 className="text-4xl font-bold mb-4">{grant.title}</h1>
      <p className="text-gray-300 text-lg mb-8">{grant.description}</p>

      {/* Lazy-load detailed sections */}
      <GrantEligibilitySection grant={grant} />
      <GrantDetailedDescriptionSection grant={grant} />
      <RelatedGrantsSection grantId={grant.id} />
    </>
  );
}
```

### 3.2 Image Optimization for Logo & Source Images

```typescript
// src/components/GrantSourceLogo.tsx
import Image from 'next/image';

interface GrantSourceLogoProps {
  source: string;
  title: string;
}

export const GrantSourceLogo = ({ source, title }: GrantSourceLogoProps) => {
  // Map sources to optimized logos
  const logoMap: Record<string, string> = {
    'grants.gov': '/logos/grants-gov.svg',
    'nsf.gov': '/logos/nsf.svg',
    'nih.gov': '/logos/nih.svg',
    'dot.gov': '/logos/dot.svg',
  };

  const logo = logoMap[source];

  return (
    <div className="flex items-center gap-2">
      {logo && (
        <Image
          src={logo}
          alt={`${source} logo`}
          width={24}
          height={24}
          className="rounded"
        />
      )}
      <span className="text-sm font-medium">{source}</span>
    </div>
  );
};
```

### 3.3 Code Splitting for Heavy Components

```typescript
// src/app/grants/[id]/page.tsx
import dynamic from 'next/dynamic';

const GrantAIAnalysis = dynamic(
  () => import('@/components/GrantAIAnalysis'),
  {
    loading: () => <div className="bg-slate-800 h-64 animate-pulse rounded" />,
    ssr: false, // Load only on client
  }
);

const GrantApplicationForm = dynamic(
  () => import('@/components/GrantApplicationForm'),
  {
    loading: () => <div className="bg-slate-800 h-96 animate-pulse rounded" />,
  }
);

export default async function GrantDetailPage({ params }: any) {
  return (
    <>
      {/* Above fold - Critical */}
      <GrantHeroSection grant={grant} />

      {/* Below fold - Lazy loaded */}
      <Suspense fallback={<LoadingFallback />}>
        <GrantAIAnalysis grantId={params.id} />
      </Suspense>

      <Suspense fallback={<LoadingFallback />}>
        <GrantApplicationForm grantId={params.id} />
      </Suspense>
    </>
  );
}
```

### 3.4 Checklist
- [ ] Hero image optimized with next/image
- [ ] LCP candidate (hero + quick stats) above fold
- [ ] Placeholder blur image (LQIP) for hero
- [ ] Logo images optimized (SVG format)
- [ ] Grant detail content server-rendered
- [ ] AI analysis section lazy-loaded
- [ ] Application form lazy-loaded
- [ ] LCP < 2.5s measured with Lighthouse

---

## STEP 4: Dashboard & Aggregation Query Optimization

### 4.1 Dashboard Query Strategy

**Problem:** Dashboard loads user data, saved grants, workspaces, recent activity

**Solution: Parallel queries with Promise.all**

```typescript
// src/app/app/page.tsx (Dashboard)
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';

async function getDashboardData(userId: string) {
  // Run all queries in parallel
  const [
    profile,
    savedGrants,
    workspaces,
    recentActivity,
    notifications,
  ] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.savedGrant.findMany({
      where: { userId },
      include: { grant: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workspace.findMany({
      where: { userId },
      include: {
        grantCollections: { take: 3 },
      },
      take: 3,
    }),
    prisma.aIUsageLog.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      take: 5,
    }),
  ]);

  return {
    profile,
    savedGrants,
    workspaces,
    recentActivity,
    notifications,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    notFound();
  }

  const dashboardData = await getDashboardData(session.user.id);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<ProfileCardSkeleton />}>
            <ProfileCard profile={dashboardData.profile} />
          </Suspense>

          <Suspense fallback={<NotificationsSkeleton />}>
            <NotificationsList notifications={dashboardData.notifications} />
          </Suspense>
        </aside>

        {/* Right Column - Saved Grants & Workspaces */}
        <main className="lg:col-span-2">
          <Suspense fallback={<SavedGrantsSkeleton />}>
            <SavedGrantsSection grants={dashboardData.savedGrants} />
          </Suspense>

          <Suspense fallback={<WorkspacesSkeleton />}>
            <WorkspacesSection workspaces={dashboardData.workspaces} />
          </Suspense>

          <Suspense fallback={<RecentActivitySkeleton />}>
            <RecentActivitySection activity={dashboardData.recentActivity} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

### 4.2 Prisma Query Optimization with Select

```typescript
// Avoid N+1 queries - use select to fetch only needed fields
async function getCompactSavedGrants(userId: string) {
  return prisma.savedGrant.findMany({
    where: { userId },
    select: {
      id: true,
      grant: {
        select: {
          id: true,
          title: true,
          fundingAmount: true,
          deadline: true,
          category: true,
        },
      },
    },
    take: 10,
  });
}

// For display purposes, paginate instead of loading all
async function getPaginatedSavedGrants(userId: string, page: number = 1) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [grants, total] = await Promise.all([
    prisma.savedGrant.findMany({
      where: { userId },
      skip,
      take: pageSize,
      include: { grant: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.savedGrant.count({ where: { userId } }),
  ]);

  return {
    grants,
    total,
    pageCount: Math.ceil(total / pageSize),
    currentPage: page,
  };
}
```

### 4.3 Database Indexing for Performance

**File:** `prisma/schema.prisma`

```prisma
model Grant {
  id                    String   @id @default(cuid())
  title                 String
  description           String   @db.Text
  category              String
  fundingAmount         Int
  deadline              DateTime
  source                String
  sourceUrl             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Indexes for common queries
  @@index([category])
  @@index([deadline])
  @@index([createdAt])
  @@fulltext([title, description])  // Full-text search
}

model SavedGrant {
  id        String   @id @default(cuid())
  grantId   String
  grant     Grant    @relation(fields: [grantId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([grantId, userId])  // Prevent duplicate saves
  @@index([userId, createdAt])  // Dashboard queries
  @@index([grantId])
}

model SavedSearch {
  id        String   @id @default(cuid())
  name      String
  userId    String
  filters   Json
  createdAt DateTime @default(now())

  @@index([userId])
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  userId    String
  createdAt DateTime @default(now())

  @@index([userId])
}
```

### 4.4 Checklist
- [ ] Dashboard queries parallelized with Promise.all
- [ ] Prisma select used to fetch only needed fields
- [ ] Pagination implemented for large result sets
- [ ] Database indexes on frequently queried fields
- [ ] Full-text search index on grant title/description
- [ ] N+1 query problem avoided
- [ ] Dashboard TTFB < 800ms

---

## STEP 5: Bundle Size Analysis & Tree-Shaking

### 5.1 Bundle Analysis Setup

**File:** `next.config.js`

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'framer-motion',
      'lodash-es',
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        radixui: {
          test: /@radix-ui/,
          name: 'radix-ui',
          priority: 10,
          reuseExistingChunk: true,
        },
        framermotion: {
          test: /framer-motion/,
          name: 'framer-motion',
          priority: 10,
          reuseExistingChunk: true,
        },
      };
    }
    return config;
  },
});
```

**Analysis Command:**

```bash
ANALYZE=true npm run build
```

### 5.2 Code Splitting for Routes

```typescript
// src/app/layout.tsx
import dynamic from 'next/dynamic';

// Dynamic imports for lazy-loaded features
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  loading: () => <div className="w-64 bg-slate-800 animate-pulse" />,
});

const AIChat = dynamic(() => import('@/components/AIChat'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-800 animate-pulse rounded" />,
});

// Route-specific code splitting
const SearchPage = dynamic(() => import('@/app/search'), {
  loading: () => <SearchPageSkeleton />,
});

const WorkspacePage = dynamic(() => import('@/app/workspaces/[id]'), {
  loading: () => <WorkspacePageSkeleton />,
});
```

### 5.3 Framer Motion Tree-Shaking

```typescript
// DON'T import entire Framer Motion
import * as motion from 'framer-motion';

// DO import only needed components
import { motion } from 'framer-motion';

// For specific features, import from submodules if available
import { AnimatePresence } from 'framer-motion';
```

### 5.4 Radix UI Tree-Shaking

```typescript
// Each Radix component is tree-shakeable
// Only import the specific components needed

import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';

// Use auto-import optimization in next.config.js
```

### 5.5 Bundle Size Targets Summary

| Bundle | Target | Strategy |
|--------|--------|----------|
| Next.js core | 50KB | Tree-shake Next.js features |
| React + deps | 40KB | Use Production build |
| Radix UI | 30KB | Tree-shake unused components |
| Framer Motion | 35KB | Tree-shake animation features |
| App code | 40KB | Code split routes |
| **Total** | **200KB** | Optimize imports, lazy-load |

### 5.6 Checklist
- [ ] Bundle analyzer configured and run regularly
- [ ] optimizePackageImports configured for major deps
- [ ] Route-based code splitting implemented
- [ ] Dynamic imports for non-critical routes
- [ ] Webpack splitChunks configured for vendor bundles
- [ ] Tree-shaking verified (only needed code included)
- [ ] Main bundle < 200KB gzipped
- [ ] Grant search page < 150KB gzipped

---

## STEP 6: Gemini API Response Time & Streaming

### 6.1 AI Analysis Streaming

```typescript
// src/app/api/ai/analyze-grant/route.ts
import { geminiClient } from '@/lib/gemini';
import { getServerSession } from 'next-auth/next';

export const POST = async (req: Request) => {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { grantId, userContext } = await req.json();

  // Stream response back to client
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const prompt = `Analyze this grant for relevance:
        Grant ID: ${grantId}
        User Context: ${userContext}

        Provide: 1) Match score, 2) Key requirements, 3) Next steps`;

        const response = await geminiClient.generateContent(prompt);
        const text = await response.response.text();

        // Stream text in chunks
        const encoder = new TextEncoder();
        const chunks = text.split(' ');

        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk + ' '));
          // Add delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
};
```

### 6.2 Client-side Streaming Consumer

```typescript
// src/hooks/useGrantAnalysis.ts
'use client';

import { useState, useCallback } from 'react';

export const useGrantAnalysis = () => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeGrant = useCallback(async (grantId: string, context: string) => {
    setIsLoading(true);
    setAnalysis('');
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-grant', {
        method: 'POST',
        body: JSON.stringify({ grantId, userContext: context }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        setAnalysis(prev => prev + text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analysis,
    isLoading,
    error,
    analyzeGrant,
  };
};
```

### 6.3 AI Response Caching

```typescript
// src/lib/ai-cache.ts
import { prisma } from '@/lib/prisma';

interface CachedAnalysis {
  grantId: string;
  userId: string;
  analysis: string;
  expiresAt: Date;
}

export const getCachedAnalysis = async (
  grantId: string,
  userId: string
): Promise<string | null> => {
  const cache = await prisma.aIUsageLog.findFirst({
    where: {
      grantId,
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hour cache
      },
    },
  });

  return cache?.response || null;
};

export const cacheAnalysis = async (
  grantId: string,
  userId: string,
  analysis: string
) => {
  await prisma.aIUsageLog.create({
    data: {
      grantId,
      userId,
      response: analysis,
      tokenCount: Math.ceil(analysis.length / 4), // Rough estimate
    },
  });
};
```

### 6.4 API Response Time Monitoring

```typescript
// src/middleware/performance.ts
import { NextRequest, NextResponse } from 'next/server';

export const middleware = async (req: NextRequest) => {
  const startTime = Date.now();

  // Call next middleware
  const response = NextResponse.next();

  const duration = Date.now() - startTime;

  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow API: ${req.nextUrl.pathname} took ${duration}ms`);
  }

  // Add response header for monitoring
  response.headers.set('X-Response-Time', `${duration}ms`);

  return response;
};

export const config = {
  matcher: ['/api/:path*'],
};
```

### 6.5 Checklist
- [ ] Gemini API responses streamed to client
- [ ] Analysis responses cached for 24 hours
- [ ] Token counting for Gemini API usage
- [ ] Slow request logging (> 1s)
- [ ] API response times < 2s target
- [ ] Streaming UI shows live updates
- [ ] Error handling for API failures
- [ ] Rate limiting configured

---

## STEP 7: Server Component vs Client Component Split

### 7.1 Optimization Pattern

```typescript
// src/app/search/page.tsx (Server Component)
// - Initial data fetching
// - Static rendering when possible
// - No JavaScript needed for initial render

export default async function SearchPage() {
  const grants = await fetchGrants();

  return (
    <>
      {/* Server-rendered filter bar - static HTML */}
      <GrantFilterServer initialGrants={grants} />

      {/* Client island for interactivity */}
      <GrantSearchClient initialGrants={grants} />
    </>
  );
}

// src/components/GrantSearchClient.tsx (Client Component)
// - Filter change handling
// - Pagination
// - Dynamic sorting

'use client';

export const GrantSearchClient = ({ initialGrants }) => {
  const [grants, setGrants] = useState(initialGrants);
  const [filters, setFilters] = useState({});

  // Client-side interactivity
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Fetch updated grants
  };

  return (
    <VirtualizedGrantList grants={grants} onFilterChange={handleFilterChange} />
  );
};
```

### 7.2 Server Components Performance Benefits
- Zero JavaScript for initial render
- Access to databases/secrets server-side
- Larger dependencies stay on server
- Streaming Server Components for progressive enhancement

### 7.3 Checklist
- [ ] Grant listing pages use Server Components
- [ ] Filter/sorting UI is Client Component
- [ ] Detail pages Server-rendered
- [ ] Dashboard Server-rendered with Suspense
- [ ] AI chat Client Component only
- [ ] Form submissions via Server Actions
- [ ] No prop drilling with 'use client' boundary

---

## STEP 8: Lighthouse & Performance Testing

### 8.1 Lighthouse CI Configuration

**File:** `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/app/search",
        "http://localhost:3000/grants/sample-grant-id",
        "http://localhost:3000/app/dashboard"
      ],
      "numberOfRuns": 3,
      "settings": {
        "configPath": "./lighthouse-config.js"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "interaction-to-next-paint": ["error", { "maxNumericValue": 200 }]
      }
    }
  }
}
```

### 8.2 Performance Testing Script

**File:** `scripts/perf-test.js`

```javascript
const lighthouse = require('lighthouse');
const chrome = require('chrome-launcher');

async function runPerformanceTest(url) {
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
  };

  const runnerResult = await lighthouse(url, options);

  const scores = runnerResult.lhr.categories;
  console.log(`Performance Score for ${url}: ${scores.performance.score * 100}`);

  return scores.performance.score;
}

async function main() {
  const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/app/search',
    'http://localhost:3000/app/dashboard',
  ];

  for (const url of urls) {
    await runPerformanceTest(url);
  }
}

main().catch(console.error);
```

### 8.3 GitHub Actions Performance Workflow

**File:** `.github/workflows/performance.yml`

```yaml
name: Performance Audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          temporaryPublicStorage: true

      - name: Upload Performance Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: ./.lighthouseci/
```

### 8.4 Checklist
- [ ] Lighthouse CI configured and running
- [ ] Performance score > 90 on key pages
- [ ] LCP < 2.5s on all pages
- [ ] INP < 200ms for all interactions
- [ ] CLS < 0.1 on all pages
- [ ] Lighthouse CI enforces targets
- [ ] Performance reports uploaded to PR
- [ ] Monthly performance review scheduled

---

## Summary Checklist

- [ ] **Metrics:** LCP < 2.5s, INP < 200ms, CLS < 0.1 target
- [ ] **Web Vitals:** Tracking implemented and reported
- [ ] **Grant List:** Virtual scrolling for large lists
- [ ] **Pagination:** Cursor-based pagination API
- [ ] **Detail Page:** LCP optimized, hero image priority
- [ ] **Dashboard:** Parallel queries, Suspense boundaries
- [ ] **Database:** Indexes on frequently queried fields
- [ ] **Bundle:** < 200KB gzipped, tree-shaking verified
- [ ] **Images:** Optimized logos, next/image used
- [ ] **Code Splitting:** Routes and heavy components lazy-loaded
- [ ] **Gemini API:** Responses streamed, caching implemented
- [ ] **Server/Client:** Proper split for performance
- [ ] **Lighthouse:** CI configured, > 90 target
- [ ] **Monitoring:** Response times logged, alerts configured
