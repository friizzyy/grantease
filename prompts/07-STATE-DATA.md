# GrantEase State & Data Flow Audit

**Audit Purpose:** Verify proper URL state management, data synchronization across components, cache invalidation strategies, and elimination of unnecessary global state libraries.

**Scope:** URL state patterns, Prisma client caching, server actions, data mutations, cache strategies, no Zustand/Redux.

---

## STEP 1: URL State for Grant Filters

### 1.1 Search Params Schema

Grant discovery page filter state should be entirely captured in URL search parameters.

**Supported URL Parameters:**

| Parameter | Type | Example | Validation |
|-----------|------|---------|-----------|
| `category` | string | `EDUCATION` | Enum: EDUCATION, RESEARCH, HEALTHCARE, TECHNOLOGY, ARTS, ENVIRONMENTAL, SOCIAL_SERVICES |
| `eligibility` | string[] | `501c3,StateOrg` | Comma-separated values |
| `location` | string[] | `CA,NY` | State codes |
| `amountMin` | number | `50000` | Integer >= 0 |
| `amountMax` | number | `100000` | Integer >= 0, > amountMin |
| `deadline` | string | `30,90` | Days from now (30, 60, 90, 180, 365) |
| `status` | string | `OPEN` | Enum: OPEN, CLOSING_SOON, CLOSED |
| `sortBy` | string | `deadline` | Enum: deadline, amount, relevance, recent |
| `page` | number | `2` | Integer >= 1 |
| `q` | string | `STEM` | Search text (max 100 chars) |

### 1.2 URL State Hook Implementation

```typescript
// src/hooks/useGrantFilters.ts
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

// Schema validation for filters
const filterSchema = z.object({
  category: z.enum(['EDUCATION', 'RESEARCH', 'HEALTHCARE', 'TECHNOLOGY', 'ARTS', 'ENVIRONMENTAL', 'SOCIAL_SERVICES']).optional(),
  eligibility: z.string().optional(),
  location: z.string().optional(),
  amountMin: z.coerce.number().int().nonnegative().optional(),
  amountMax: z.coerce.number().int().nonnegative().optional(),
  deadline: z.enum(['30', '60', '90', '180', '365']).optional(),
  status: z.enum(['OPEN', 'CLOSING_SOON', 'CLOSED']).optional(),
  sortBy: z.enum(['deadline', 'amount', 'relevance', 'recent']).default('deadline'),
  page: z.coerce.number().int().positive().default(1),
  q: z.string().max(100).optional(),
});

type Filters = z.infer<typeof filterSchema>;

export const useGrantFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse and validate filters from URL
  const filters = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());

    try {
      return filterSchema.parse(raw);
    } catch (error) {
      console.error('Invalid filters:', error);
      return filterSchema.parse({}); // Return defaults
    }
  }, [searchParams]);

  // Update URL when filters change
  const setFilters = useCallback(
    (newFilters: Partial<Filters>) => {
      const updated = { ...filters, ...newFilters, page: 1 }; // Reset pagination
      const params = new URLSearchParams();

      // Only include non-default values
      Object.entries(updated).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'deadline') {
          params.set(key, String(value));
        }
      });

      // Use shallow routing to avoid re-render
      router.push(`?${params.toString()}`, { shallow: true });
    },
    [filters, router]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push('/app/search', { shallow: true });
  }, [router]);

  // Parse comma-separated values
  const eligibilityArray = useMemo(() => {
    return filters.eligibility?.split(',') || [];
  }, [filters.eligibility]);

  const locationArray = useMemo(() => {
    return filters.location?.split(',') || [];
  }, [filters.location]);

  return {
    filters: {
      ...filters,
      eligibility: eligibilityArray,
      location: locationArray,
    },
    setFilters,
    clearFilters,
  };
};
```

### 1.3 GrantFilter Component Integration

```typescript
// src/components/GrantFilter.tsx
'use client';

import React, { useCallback } from 'react';
import { useGrantFilters } from '@/hooks/useGrantFilters';
import { Select, MultiSelect, RangeSlider, Button } from '@/components/ui';

export const GrantFilter = () => {
  const { filters, setFilters, clearFilters } = useGrantFilters();

  const handleCategoryChange = useCallback(
    (category: string) => {
      setFilters({ category, page: 1 });
    },
    [setFilters]
  );

  const handleEligibilityChange = useCallback(
    (eligibility: string[]) => {
      setFilters({
        eligibility: eligibility.join(','),
        page: 1,
      });
    },
    [setFilters]
  );

  const handleAmountRangeChange = useCallback(
    (min: number, max: number) => {
      setFilters({ amountMin: min, amountMax: max, page: 1 });
    },
    [setFilters]
  );

  const handleDeadlineChange = useCallback(
    (days: string) => {
      setFilters({ deadline: days, page: 1 });
    },
    [setFilters]
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      setFilters({ sortBy });
    },
    [setFilters]
  );

  return (
    <div className="space-y-6 p-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-semibold">Filters</h3>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Select
          value={filters.category || ''}
          onChange={e => handleCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="EDUCATION">Education</option>
          <option value="RESEARCH">Research</option>
          <option value="HEALTHCARE">Healthcare</option>
          <option value="TECHNOLOGY">Technology</option>
          <option value="ARTS">Arts</option>
          <option value="ENVIRONMENTAL">Environmental</option>
          <option value="SOCIAL_SERVICES">Social Services</option>
        </Select>
      </div>

      {/* Eligibility Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Eligibility</label>
        <MultiSelect
          value={filters.eligibility}
          onChange={handleEligibilityChange}
          options={[
            { value: '501c3', label: 'Nonprofit (501c3)' },
            { value: 'StateOrg', label: 'State Organization' },
            { value: 'University', label: 'University' },
            { value: 'Individual', label: 'Individual' },
          ]}
        />
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <MultiSelect
          value={filters.location}
          onChange={(locs) => setFilters({ location: locs.join(','), page: 1 })}
          options={US_STATES.map(state => ({ value: state, label: state }))}
        />
      </div>

      {/* Amount Range */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Funding Amount: ${filters.amountMin || 0} - ${filters.amountMax || 5000000}
        </label>
        <RangeSlider
          min={0}
          max={5000000}
          step={10000}
          value={[filters.amountMin || 0, filters.amountMax || 5000000]}
          onChange={([min, max]) => handleAmountRangeChange(min, max)}
        />
      </div>

      {/* Deadline Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Deadline</label>
        <Select
          value={filters.deadline || ''}
          onChange={e => handleDeadlineChange(e.target.value)}
        >
          <option value="">All Deadlines</option>
          <option value="30">Within 30 days</option>
          <option value="60">Within 60 days</option>
          <option value="90">Within 90 days</option>
          <option value="180">Within 6 months</option>
          <option value="365">Within 1 year</option>
        </Select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <Select
          value={filters.status || ''}
          onChange={e => setFilters({ status: e.target.value, page: 1 })}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSING_SOON">Closing Soon</option>
        </Select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <Select
          value={filters.sortBy}
          onChange={e => handleSortChange(e.target.value)}
        >
          <option value="deadline">Deadline (Soonest)</option>
          <option value="amount">Funding Amount (Highest)</option>
          <option value="relevance">Relevance Score</option>
          <option value="recent">Recently Added</option>
        </Select>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="secondary"
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );
};
```

### 1.4 API Route with Filter Parsing

```typescript
// src/app/api/grants/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Extract and parse filter parameters
  const category = searchParams.get('category');
  const eligibility = searchParams.get('eligibility')?.split(',');
  const location = searchParams.get('location')?.split(',');
  const amountMin = searchParams.get('amountMin');
  const amountMax = searchParams.get('amountMax');
  const deadline = searchParams.get('deadline');
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy') || 'deadline';
  const page = parseInt(searchParams.get('page') || '1');
  const q = searchParams.get('q');

  const limit = 20;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: any = {};

  if (category) where.category = category;

  if (eligibility?.length) {
    where.OR = eligibility.map(elig => ({
      eligibility: { contains: elig },
    }));
  }

  if (amountMin || amountMax) {
    where.fundingAmount = {};
    if (amountMin) where.fundingAmount.gte = parseInt(amountMin);
    if (amountMax) where.fundingAmount.lte = parseInt(amountMax);
  }

  if (deadline) {
    const daysFromNow = parseInt(deadline);
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + daysFromNow);
    where.deadline = { lte: deadlineDate };
  }

  if (status === 'CLOSING_SOON') {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    where.deadline = { lte: sevenDaysFromNow };
  }

  if (q) {
    where.OR = [
      { title: { search: q } },
      { description: { search: q } },
    ];
  }

  // Build order clause
  const orderBy: any = {};
  switch (sortBy) {
    case 'deadline':
      orderBy.deadline = 'asc';
      break;
    case 'amount':
      orderBy.fundingAmount = 'desc';
      break;
    case 'recent':
      orderBy.createdAt = 'desc';
      break;
    default:
      orderBy.deadline = 'asc';
  }

  try {
    const [grants, total] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.grant.count({ where }),
    ]);

    return NextResponse.json({
      grants,
      total,
      page,
      pageSize: limit,
      pageCount: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
};
```

### 1.5 Checklist
- [ ] URL params validated with Zod schema
- [ ] useGrantFilters hook centralizes filter logic
- [ ] Category, eligibility, location, amount, deadline, status, sortBy all in URL
- [ ] Page parameter in URL for pagination
- [ ] Search query (q) parameter supported
- [ ] Clear filters button resets URL
- [ ] API endpoint parses all URL parameters
- [ ] Invalid filter values default gracefully

---

## STEP 2: Saved Search State Persistence

### 2.1 SavedSearch Data Model

```prisma
// prisma/schema.prisma
model SavedSearch {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name      String   // "Small STEM Grants"
  filters   Json     // { category: "EDUCATION", amountMin: 50000, ... }

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@unique([userId, name])
}
```

### 2.2 Save Search Hook

```typescript
// src/hooks/useSavedSearches.ts
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useGrantFilters } from '@/hooks/useGrantFilters';

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: Date;
}

export const useSavedSearches = () => {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { filters } = useGrantFilters();

  // Load saved searches on mount
  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/saved-searches');
      const data = await res.json();
      setSearches(data.searches);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save current filter state as search
  const saveSearch = useCallback(
    async (name: string) => {
      try {
        const res = await fetch('/api/user/saved-searches', {
          method: 'POST',
          body: JSON.stringify({
            name,
            filters,
          }),
        });

        if (!res.ok) throw new Error('Save failed');

        const data = await res.json();
        setSearches([...searches, data.search]);

        return data.search;
      } catch (error) {
        console.error('Failed to save search:', error);
        throw error;
      }
    },
    [filters, searches]
  );

  // Load a saved search and apply filters
  const loadSearch = useCallback(
    async (searchId: string) => {
      const search = searches.find(s => s.id === searchId);
      if (!search) return;

      // Navigate with filters
      const params = new URLSearchParams(search.filters);
      window.history.pushState(null, '', `?${params.toString()}`);
    },
    [searches]
  );

  // Delete a saved search
  const deleteSearch = useCallback(
    async (searchId: string) => {
      try {
        await fetch(`/api/user/saved-searches/${searchId}`, {
          method: 'DELETE',
        });

        setSearches(searches.filter(s => s.id !== searchId));
      } catch (error) {
        console.error('Failed to delete search:', error);
        throw error;
      }
    },
    [searches]
  );

  // Check if current filters match a saved search
  const currentSavedSearch = searches.find(
    s => JSON.stringify(s.filters) === JSON.stringify(filters)
  );

  return {
    searches,
    isLoading,
    currentSavedSearch,
    saveSearch,
    loadSearch,
    deleteSearch,
  };
};
```

### 2.3 SavedSearch API Routes

```typescript
// src/app/api/user/saved-searches/route.ts
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET saved searches
export const GET = async (req: NextRequest) => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ searches });
};

// POST new saved search
export const POST = async (req: NextRequest) => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, filters } = await req.json();

  // Validate
  if (!name || !filters) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const search = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        filters,
      },
    });

    return NextResponse.json({ search }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Search with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    );
  }
};

// DELETE saved search
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.savedSearch.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete search' },
      { status: 500 }
    );
  }
};
```

### 2.4 Checklist
- [ ] SavedSearch model includes userId, name, filters (JSON)
- [ ] useSavedSearches hook manages saved searches
- [ ] Save current filters to named search
- [ ] Load search and apply filters to URL
- [ ] Delete saved search
- [ ] API routes for CRUD operations
- [ ] Duplicate name prevention
- [ ] Searches ordered by creation date

---

## STEP 3: Workspace & Document State

### 3.1 Workspace Data Model

```prisma
model Workspace {
  id                String               @id @default(cuid())
  userId            String
  user              User                 @relation(fields: [userId], references: [id], onDelete: Cascade)

  name              String
  description       String?

  grantCollections  GrantCollection[]
  workspaceDocuments WorkspaceDocument[]

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  @@index([userId])
}

model GrantCollection {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  name        String
  grants      Grant[] @relation("GrantToCollection", "m2m")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([workspaceId])
}

model WorkspaceDocument {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  title       String
  content     String   @db.Text
  type        String   // "note", "application", "research"

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([workspaceId])
}
```

### 3.2 Workspace State Hook

```typescript
// src/hooks/useWorkspace.ts
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  grantCollections: GrantCollection[];
  workspaceDocuments: WorkspaceDocument[];
}

interface GrantCollection {
  id: string;
  name: string;
  grants: any[];
}

interface WorkspaceDocument {
  id: string;
  title: string;
  content: string;
  type: string;
}

export const useWorkspace = () => {
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspace data
  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`);

      if (!res.ok) throw new Error('Failed to load workspace');

      const data = await res.json();
      setWorkspace(data.workspace);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  // Update workspace name/description
  const updateWorkspace = useCallback(
    async (updates: Partial<Workspace>) => {
      if (!workspace) return;

      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });

        if (!res.ok) throw new Error('Failed to update workspace');

        const data = await res.json();
        setWorkspace(data.workspace);

        return data.workspace;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        throw err;
      }
    },
    [workspace, workspaceId]
  );

  // Create new collection
  const createCollection = useCallback(
    async (name: string) => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/collections`, {
          method: 'POST',
          body: JSON.stringify({ name }),
        });

        if (!res.ok) throw new Error('Failed to create collection');

        const data = await res.json();

        // Update local state
        setWorkspace(ws => ({
          ...ws!,
          grantCollections: [...ws!.grantCollections, data.collection],
        }));

        return data.collection;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Create failed');
        throw err;
      }
    },
    [workspaceId]
  );

  // Delete collection
  const deleteCollection = useCallback(
    async (collectionId: string) => {
      try {
        await fetch(
          `/api/workspaces/${workspaceId}/collections/${collectionId}`,
          { method: 'DELETE' }
        );

        setWorkspace(ws => ({
          ...ws!,
          grantCollections: ws!.grantCollections.filter(
            c => c.id !== collectionId
          ),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
        throw err;
      }
    },
    [workspaceId]
  );

  // Add grant to collection
  const addGrantToCollection = useCallback(
    async (collectionId: string, grantId: string) => {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/collections/${collectionId}/grants`,
          {
            method: 'POST',
            body: JSON.stringify({ grantId }),
          }
        );

        if (!res.ok) throw new Error('Failed to add grant');

        // Update local state
        setWorkspace(ws => ({
          ...ws!,
          grantCollections: ws!.grantCollections.map(c => {
            if (c.id === collectionId) {
              return { ...c, grants: [...c.grants, { id: grantId }] };
            }
            return c;
          }),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Add grant failed');
        throw err;
      }
    },
    [workspaceId]
  );

  // Create document
  const createDocument = useCallback(
    async (title: string, content: string, type: string = 'note') => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/documents`, {
          method: 'POST',
          body: JSON.stringify({ title, content, type }),
        });

        if (!res.ok) throw new Error('Failed to create document');

        const data = await res.json();

        setWorkspace(ws => ({
          ...ws!,
          workspaceDocuments: [...ws!.workspaceDocuments, data.document],
        }));

        return data.document;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Create failed');
        throw err;
      }
    },
    [workspaceId]
  );

  // Update document
  const updateDocument = useCallback(
    async (docId: string, title: string, content: string) => {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/documents/${docId}`,
          {
            method: 'PUT',
            body: JSON.stringify({ title, content }),
          }
        );

        if (!res.ok) throw new Error('Failed to update document');

        const data = await res.json();

        setWorkspace(ws => ({
          ...ws!,
          workspaceDocuments: ws!.workspaceDocuments.map(d =>
            d.id === docId ? data.document : d
          ),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        throw err;
      }
    },
    [workspaceId]
  );

  return {
    workspace,
    isLoading,
    error,
    updateWorkspace,
    createCollection,
    deleteCollection,
    addGrantToCollection,
    createDocument,
    updateDocument,
  };
};
```

### 3.3 Checklist
- [ ] Workspace, GrantCollection, WorkspaceDocument models defined
- [ ] useWorkspace hook manages workspace state
- [ ] CRUD operations for collections and documents
- [ ] Local state updates optimistic (before server response)
- [ ] Error handling with user feedback
- [ ] API routes for workspace CRUD

---

## STEP 4: Onboarding Flow State

### 4.1 Onboarding Step Schema

```typescript
// src/lib/onboarding.ts
import { z } from 'zod';

export const onboardingSteps = [
  'organization-type',
  'organization-details',
  'focus-areas',
  'preferences',
] as const;

export const organizationTypeSchema = z.object({
  organizationType: z.enum(['501c3', 'University', 'StateOrg', 'Individual', 'Other']),
});

export const organizationDetailsSchema = z.object({
  organizationName: z.string().min(2).max(200),
  yearsFounded: z.number().int().min(1).max(200),
  annualBudget: z.number().int().positive(),
  websiteUrl: z.string().url().optional(),
});

export const focusAreasSchema = z.object({
  focusAreas: z.array(z.string()).min(1).max(5),
  geographicFocus: z.array(z.string()).min(1),
});

export const preferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  autoSaveSearches: z.boolean().default(true),
  aiAssistance: z.boolean().default(true),
});

export type OnboardingData = {
  organizationType?: string;
  organizationName?: string;
  yearsFounded?: number;
  annualBudget?: number;
  websiteUrl?: string;
  focusAreas?: string[];
  geographicFocus?: string[];
  emailNotifications?: boolean;
  autoSaveSearches?: boolean;
  aiAssistance?: boolean;
};
```

### 4.2 Onboarding State Hook

```typescript
// src/hooks/useOnboarding.ts
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingSteps, OnboardingData } from '@/lib/onboarding';

export const useOnboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved onboarding progress from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data);
        setCurrentStep(parsed.step);
      } catch (err) {
        console.error('Failed to load onboarding progress:', err);
      }
    }
  }, []);

  // Save progress on data change
  useEffect(() => {
    sessionStorage.setItem(
      'onboarding-progress',
      JSON.stringify({ step: currentStep, data })
    );
  }, [currentStep, data]);

  const updateStep = useCallback(
    (stepData: Partial<OnboardingData>) => {
      setData(prev => ({ ...prev, ...stepData }));
    },
    []
  );

  const nextStep = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(s => s + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  const submitOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Onboarding submission failed');
      }

      // Clear progress
      sessionStorage.removeItem('onboarding-progress');

      // Redirect to dashboard
      router.push('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  }, [data, router]);

  const skipOnboarding = useCallback(async () => {
    try {
      await fetch('/api/user/onboarding/skip', { method: 'POST' });
      sessionStorage.removeItem('onboarding-progress');
      router.push('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Skip failed');
    }
  }, [router]);

  return {
    currentStep,
    stepName: onboardingSteps[currentStep],
    data,
    isSubmitting,
    error,
    updateStep,
    nextStep,
    prevStep,
    submitOnboarding,
    skipOnboarding,
    progress: ((currentStep + 1) / onboardingSteps.length) * 100,
  };
};
```

### 4.3 Onboarding Page Component

```typescript
// src/app/onboard/page.tsx
'use client';

import { useOnboarding } from '@/hooks/useOnboarding';
import { OrganizationTypeStep } from '@/components/onboarding/OrganizationTypeStep';
import { OrganizationDetailsStep } from '@/components/onboarding/OrganizationDetailsStep';
import { FocusAreasStep } from '@/components/onboarding/FocusAreasStep';
import { PreferencesStep } from '@/components/onboarding/PreferencesStep';

const steps = [
  OrganizationTypeStep,
  OrganizationDetailsStep,
  FocusAreasStep,
  PreferencesStep,
];

export default function OnboardingPage() {
  const {
    currentStep,
    data,
    isSubmitting,
    error,
    updateStep,
    nextStep,
    prevStep,
    submitOnboarding,
    skipOnboarding,
    progress,
  } = useOnboarding();

  const CurrentStep = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-accent">
              Welcome to GrantEase
            </h1>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current step component */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          <CurrentStep data={data} onChange={updateStep} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-slate-700"
            >
              Back
            </button>
          ) : (
            <button
              onClick={skipOnboarding}
              className="px-6 py-2 text-gray-400 hover:text-gray-300"
            >
              Skip for now
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitOnboarding}
              disabled={isSubmitting}
              className="px-6 py-2 bg-accent text-slate-900 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4.4 Checklist
- [ ] Onboarding steps stored in sessionStorage
- [ ] useOnboarding hook manages step navigation
- [ ] Form validation before next step
- [ ] Back button to review previous answers
- [ ] Skip onboarding option
- [ ] Submit saves to database and clears session
- [ ] Progress bar shows completion percentage

---

## STEP 5: Data Flow & Cache Invalidation

### 5.1 Data Flow Architecture

**Pattern: Server Components → API Routes → Client Islands**

```
┌─────────────────────────────────────────┐
│   Server Component (page.tsx)           │
│   - Fetch initial data from Prisma     │
│   - Server-side rendering              │
└────────────┬────────────────────────────┘
             │
             ├─► Render Static HTML
             │
             └─► Hydrate with Client Component
                 ┌──────────────────────────────┐
                 │ Client Component (interactive)│
                 │ - Click handlers             │
                 │ - Filter changes             │
                 │ - Fetch from /api/*         │
                 └──────────────────────────────┘
```

### 5.2 Revalidation Strategies

```typescript
// src/app/grants/[id]/page.tsx
import { revalidatePath, revalidateTag } from 'next/cache';

// ISR - revalidate every 1 hour
export const revalidate = 3600;

// Or use tag-based revalidation
export const generateStaticParams = async () => {
  const grants = await prisma.grant.findMany({
    take: 100,
    select: { id: true },
  });

  return grants.map(grant => ({ id: grant.id }));
};

export default async function GrantPage({ params }: { params: { id: string } }) {
  const grant = await prisma.grant.findUnique({
    where: { id: params.id },
  });

  return <GrantDetail grant={grant} />;
}
```

### 5.3 Server Actions for Mutations

```typescript
// src/app/actions/grant-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export const saveGrant = async (grantId: string) => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const saved = await prisma.savedGrant.create({
      data: {
        grantId,
        userId: session.user.id,
      },
    });

    // Invalidate saved grants cache
    revalidatePath('/app/saved');
    revalidateTag(`user-${session.user.id}-saved-grants`);

    return { success: true, saved };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Already saved' };
    }
    throw error;
  }
};

export const unsaveGrant = async (grantId: string) => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await prisma.savedGrant.delete({
    where: {
      grantId_userId: {
        grantId,
        userId: session.user.id,
      },
    },
  });

  // Invalidate cache
  revalidatePath('/app/saved');
  revalidateTag(`user-${session.user.id}-saved-grants`);

  return { success: true };
};

export const createWorkspace = async (name: string, description: string) => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const workspace = await prisma.workspace.create({
    data: {
      userId: session.user.id,
      name,
      description,
    },
  });

  // Invalidate workspaces list
  revalidatePath('/app/workspaces');
  revalidateTag(`user-${session.user.id}-workspaces`);

  return workspace;
};
```

### 5.4 Client-side Data Mutation

```typescript
// src/components/SaveGrantButton.tsx
'use client';

import { useCallback, useState } from 'react';
import { saveGrant, unsaveGrant } from '@/app/actions/grant-actions';
import { useRouter } from 'next/navigation';

interface SaveGrantButtonProps {
  grantId: string;
  isSaved: boolean;
}

export const SaveGrantButton = ({ grantId, isSaved: initialSaved }: SaveGrantButtonProps) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = useCallback(async () => {
    setIsLoading(true);

    try {
      if (isSaved) {
        await unsaveGrant(grantId);
        setIsSaved(false);
      } else {
        await saveGrant(grantId);
        setIsSaved(true);
      }

      // Revalidate UI
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle save:', error);
      // Revert optimistic update
      setIsSaved(!isSaved);
    } finally {
      setIsLoading(false);
    }
  }, [grantId, isSaved, router]);

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`px-4 py-2 rounded ${
        isSaved
          ? 'bg-accent text-slate-900'
          : 'bg-slate-700 text-white hover:bg-slate-600'
      }`}
    >
      {isSaved ? '✓ Saved' : 'Save Grant'}
    </button>
  );
};
```

### 5.5 Checklist
- [ ] Server Components fetch data, Client Components handle interactivity
- [ ] ISR configured for grant detail pages
- [ ] Tag-based revalidation for user-specific data
- [ ] Server Actions for mutations
- [ ] Optimistic updates on client
- [ ] Cache invalidation on create/update/delete
- [ ] Router.refresh() called after mutations
- [ ] No unnecessary refetching

---

## STEP 6: Verification - No Zustand/Redux

### 6.1 State Library Audit

```bash
# Check for unnecessary state libraries
grep -r "zustand\|redux\|@reduxjs" src/ package.json

# Should return: No results (or only in node_modules)
```

### 6.2 Acceptable State Management Patterns

✅ **DO USE:**
- URL search params (via useSearchParams)
- React useState for component state
- React Context for non-performance-critical state
- Next.js Server Components + Server Actions
- sessionStorage/localStorage for temporary data

❌ **DON'T USE:**
- Zustand
- Redux / Redux Toolkit
- MobX
- Recoil
- Jotai
- Any global state library

### 6.3 Checklist
- [ ] No Zustand in package.json
- [ ] No Redux in package.json
- [ ] All state in URL or React hooks
- [ ] Server Components for data fetching
- [ ] Server Actions for mutations
- [ ] useContext only for theme/auth (not data)

---

## Summary Checklist

- [ ] **URL State:** Grant filters fully captured in URL params
- [ ] **Validation:** Zod schema validates all URL parameters
- [ ] **Saved Searches:** Persisted to DB with filter snapshots
- [ ] **Workspaces:** CRUD operations with optimistic updates
- [ ] **Onboarding:** Step state in sessionStorage
- [ ] **Cache Invalidation:** ISR and tag-based revalidation
- [ ] **Server Actions:** Used for all mutations
- [ ] **No Global State:** Zero Zustand/Redux usage
- [ ] **Data Flow:** Server Components + Client islands pattern
- [ ] **Hooks:** useGrantFilters, useWorkspace, useOnboarding, useSavedSearches
