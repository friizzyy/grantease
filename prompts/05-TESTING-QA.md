# GrantEase Testing & QA Audit

**Audit Purpose:** Ensure comprehensive test coverage for core grant discovery logic, UI components, API routes, and integration workflows using Jest 30 + Testing Library (NOT Vitest).

**Scope:** Unit tests, component tests, API route tests, integration tests, E2E strategy, mock patterns, test data seeding.

---

## STEP 1: Jest Configuration & Setup Audit

### 1.1 jest.config.js Review
Verify Jest configuration matches GrantEase tech stack:

```javascript
// jest.config.js (REQUIRED CHECKS)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // for API tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './src/lib/grant-matching.ts': {
      statements: 90,
      branches: 85,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
```

### 1.2 jest.setup.js Configuration
```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }) => children,
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/grantease_test';
```

### 1.3 Checklist
- [ ] jest.config.js preset = 'ts-jest'
- [ ] ts-jest configured with tsconfig.jest.json
- [ ] Module name mapper aliases match tsconfig
- [ ] setupFilesAfterEnv includes jest.setup.js
- [ ] testMatch patterns cover __tests__ and .test.ts files
- [ ] collectCoverageFrom excludes node_modules, d.ts files
- [ ] Coverage thresholds set (70% statements, 60% branches)
- [ ] testEnvironment = 'jsdom' for component tests

---

## STEP 2: Unit Test Strategy

### 2.1 Grant Search & Filter Logic Tests

**File:** `src/lib/grant-search.test.ts`

```typescript
import { parseGrantFilters, calculateGrantRelevance, filterGrants } from '@/lib/grant-search';
import { Grant } from '@prisma/client';

describe('Grant Search & Filter Logic', () => {
  // Test data
  const mockGrant: Grant = {
    id: 'grant-1',
    title: 'STEM Education Grant 2024',
    description: 'Funding for STEM education initiatives',
    category: 'EDUCATION',
    fundingAmount: 50000,
    eligibility: '501c3,StateOrg',
    deadline: new Date('2024-12-31'),
    source: 'grants.gov',
    sourceUrl: 'https://grants.gov/grant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('parseGrantFilters', () => {
    it('should parse URL search params into filter object', () => {
      const params = new URLSearchParams({
        category: 'EDUCATION',
        amountMin: '10000',
        amountMax: '100000',
        eligibility: '501c3',
        status: 'OPEN',
      });

      const filters = parseGrantFilters(params);

      expect(filters).toEqual({
        category: 'EDUCATION',
        amountMin: 10000,
        amountMax: 100000,
        eligibility: ['501c3'],
        status: 'OPEN',
      });
    });

    it('should handle missing optional filters', () => {
      const params = new URLSearchParams({ category: 'RESEARCH' });
      const filters = parseGrantFilters(params);

      expect(filters.amountMin).toBeUndefined();
      expect(filters.amountMax).toBeUndefined();
      expect(filters.category).toBe('RESEARCH');
    });

    it('should validate amount range', () => {
      const params = new URLSearchParams({
        amountMin: '100000',
        amountMax: '10000', // invalid: min > max
      });

      expect(() => parseGrantFilters(params)).toThrow('Invalid amount range');
    });

    it('should parse comma-separated eligibility values', () => {
      const params = new URLSearchParams({
        eligibility: '501c3,StateOrg,Individual',
      });

      const filters = parseGrantFilters(params);

      expect(filters.eligibility).toEqual(['501c3', 'StateOrg', 'Individual']);
    });
  });

  describe('calculateGrantRelevance', () => {
    it('should return high score for perfect match', () => {
      const filters = {
        category: 'EDUCATION',
        amountMin: 40000,
        amountMax: 60000,
      };

      const score = calculateGrantRelevance(mockGrant, filters);

      expect(score).toBeGreaterThan(0.8);
    });

    it('should return low score for no matching criteria', () => {
      const filters = {
        category: 'HEALTHCARE',
        amountMin: 100000,
        amountMax: 200000,
      };

      const score = calculateGrantRelevance(mockGrant, filters);

      expect(score).toBeLessThan(0.3);
    });

    it('should weight category match highest', () => {
      const categoryMatch = calculateGrantRelevance(mockGrant, { category: 'EDUCATION' });
      const amountMatch = calculateGrantRelevance(mockGrant, { amountMin: 40000, amountMax: 60000 });

      expect(categoryMatch).toBeGreaterThan(amountMatch);
    });
  });

  describe('filterGrants', () => {
    const grants = [mockGrant, { ...mockGrant, id: 'grant-2', category: 'RESEARCH' }];

    it('should filter grants by category', () => {
      const result = filterGrants(grants, { category: 'EDUCATION' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('EDUCATION');
    });

    it('should filter grants by funding amount range', () => {
      const result = filterGrants(grants, { amountMin: 40000, amountMax: 60000 });

      expect(result).toHaveLength(2);
    });

    it('should filter grants by multiple criteria', () => {
      const result = filterGrants(grants, {
        category: 'EDUCATION',
        amountMin: 40000,
        amountMax: 60000,
      });

      expect(result).toHaveLength(1);
    });
  });
});
```

### 2.2 Grant Matching Scoring Tests

**File:** `src/lib/grant-matching.test.ts`

```typescript
import { calculateMatchScore, rankGrantsByMatch } from '@/lib/grant-matching';
import { UserProfile } from '@prisma/client';

describe('Grant Matching Scoring', () => {
  const mockProfile: Partial<UserProfile> = {
    organizationType: '501c3',
    yearsFounded: 5,
    annualBudget: 500000,
    focusAreas: ['EDUCATION', 'STEM'],
    geographicFocus: ['CA', 'NY'],
  };

  describe('calculateMatchScore', () => {
    it('should return 1.0 for perfect match', () => {
      const grant = {
        category: 'EDUCATION',
        eligibility: '501c3,StateOrg',
        fundingAmount: 100000,
      };

      const score = calculateMatchScore(grant, mockProfile);

      expect(score).toBe(1.0);
    });

    it('should factor in eligibility requirements', () => {
      const perfectEligibility = calculateMatchScore(
        { eligibility: '501c3' },
        mockProfile
      );
      const partialEligibility = calculateMatchScore(
        { eligibility: 'UniversityOnly' },
        mockProfile
      );

      expect(perfectEligibility).toBeGreaterThan(partialEligibility);
    });

    it('should factor in funding amount', () => {
      const largeFunding = calculateMatchScore(
        { fundingAmount: 500000 },
        { ...mockProfile, annualBudget: 100000 }
      );
      const tinyFunding = calculateMatchScore(
        { fundingAmount: 5000 },
        { ...mockProfile, annualBudget: 100000 }
      );

      expect(largeFunding).toBeGreaterThan(tinyFunding);
    });
  });

  describe('rankGrantsByMatch', () => {
    it('should rank grants by match score descending', () => {
      const grants = [
        { id: '1', category: 'RESEARCH' },
        { id: '2', category: 'EDUCATION' },
        { id: '3', category: 'HEALTHCARE' },
      ];

      const ranked = rankGrantsByMatch(grants, { ...mockProfile, focusAreas: ['EDUCATION'] });

      expect(ranked[0].id).toBe('2');
    });
  });
});
```

### 2.3 Date & Amount Formatting Tests

**File:** `src/lib/format.test.ts`

```typescript
import { formatDeadline, formatFundingAmount, calculateDaysUntilDeadline } from '@/lib/format';

describe('Formatting Utilities', () => {
  describe('formatDeadline', () => {
    it('should format date as short format', () => {
      const date = new Date('2024-12-25');
      expect(formatDeadline(date)).toBe('Dec 25, 2024');
    });

    it('should indicate urgency for dates < 7 days away', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 3);
      expect(formatDeadline(soon)).toContain('3 days');
    });

    it('should indicate past deadlines', () => {
      const past = new Date('2020-01-01');
      expect(formatDeadline(past)).toContain('Closed');
    });
  });

  describe('formatFundingAmount', () => {
    it('should format amounts in thousands', () => {
      expect(formatFundingAmount(50000)).toBe('$50K');
      expect(formatFundingAmount(1000000)).toBe('$1M');
      expect(formatFundingAmount(1500000)).toBe('$1.5M');
    });

    it('should handle amounts < $1000', () => {
      expect(formatFundingAmount(500)).toBe('$500');
    });
  });

  describe('calculateDaysUntilDeadline', () => {
    it('should calculate correct days until deadline', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);

      const days = calculateDaysUntilDeadline(future);

      expect(days).toBeCloseTo(30, 1);
    });

    it('should return 0 for past deadlines', () => {
      const past = new Date('2020-01-01');
      expect(calculateDaysUntilDeadline(past)).toBe(0);
    });
  });
});
```

### 2.4 Checklist
- [ ] Unit tests for grant-search.ts (parseGrantFilters, filterGrants, sorting)
- [ ] Unit tests for grant-matching.ts (calculateMatchScore, scoring algorithm)
- [ ] Unit tests for format.ts (date formatting, amount formatting, calculations)
- [ ] Unit tests for validation (Zod schema validators)
- [ ] Unit tests for auth utilities (session parsing, role checking)
- [ ] Mocks for Prisma client in lib tests
- [ ] Test coverage > 85% for lib/ directory

---

## STEP 3: Component Tests

### 3.1 GrantCard Component Test

**File:** `src/components/__tests__/GrantCard.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GrantCard } from '@/components/GrantCard';
import { SessionProvider } from 'next-auth/react';

const mockGrant = {
  id: 'grant-1',
  title: 'STEM Education Grant',
  description: 'Funding for STEM initiatives',
  category: 'EDUCATION',
  fundingAmount: 50000,
  eligibility: '501c3',
  deadline: new Date('2024-12-31'),
  source: 'grants.gov',
  sourceUrl: 'https://grants.gov/grant-1',
  matchScore: 0.85,
};

describe('GrantCard Component', () => {
  const renderComponent = (props = {}) => {
    return render(
      <SessionProvider session={null}>
        <GrantCard grant={mockGrant} {...props} />
      </SessionProvider>
    );
  };

  it('should render grant title', () => {
    renderComponent();
    expect(screen.getByText('STEM Education Grant')).toBeInTheDocument();
  });

  it('should display funding amount formatted', () => {
    renderComponent();
    expect(screen.getByText('$50K')).toBeInTheDocument();
  });

  it('should show category badge', () => {
    renderComponent();
    expect(screen.getByText('EDUCATION')).toBeInTheDocument();
  });

  it('should show deadline with days remaining', () => {
    renderComponent();
    const deadlineText = screen.getByText(/Dec 31/);
    expect(deadlineText).toBeInTheDocument();
  });

  it('should display match score as percentage', () => {
    renderComponent();
    expect(screen.getByText('85% Match')).toBeInTheDocument();
  });

  it('should call onSave when save button clicked', async () => {
    const onSave = jest.fn();
    const user = userEvent.setup();
    renderComponent({ onSave });

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(mockGrant.id);
  });

  it('should show saved state when isSaved prop is true', () => {
    renderComponent({ isSaved: true });
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument();
  });

  it('should open grant detail on title click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const titleLink = screen.getByText('STEM Education Grant');
    await user.click(titleLink);

    expect(window.location.pathname).toContain('grant-1');
  });

  it('should render source link', () => {
    renderComponent();
    const sourceLink = screen.getByRole('link', { name: /grants\.gov/i });
    expect(sourceLink).toHaveAttribute('href', 'https://grants.gov/grant-1');
  });

  it('should highlight if match score > 0.8', () => {
    const { container } = renderComponent();
    const card = container.querySelector('[data-testid="grant-card"]');
    expect(card).toHaveClass('border-accent', 'border-2');
  });
});
```

### 3.2 GrantFilter Component Test

**File:** `src/components/__tests__/GrantFilter.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GrantFilter } from '@/components/GrantFilter';

describe('GrantFilter Component', () => {
  const mockOnChange = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <GrantFilter
        onFilterChange={mockOnChange}
        {...props}
      />
    );
  };

  it('should render category filter', () => {
    renderComponent();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('should render amount range sliders', () => {
    renderComponent();
    expect(screen.getByLabelText(/minimum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum/i)).toBeInTheDocument();
  });

  it('should render eligibility checkboxes', () => {
    renderComponent();
    expect(screen.getByLabelText(/nonprofit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/university/i)).toBeInTheDocument();
  });

  it('should call onFilterChange when category selected', async () => {
    const user = userEvent.setup();
    renderComponent();

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOption(categorySelect, 'EDUCATION');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'EDUCATION' })
    );
  });

  it('should call onFilterChange when amount range changed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const minInput = screen.getByLabelText(/minimum/i);
    await user.clear(minInput);
    await user.type(minInput, '50000');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ amountMin: 50000 })
    );
  });

  it('should update multiple eligibility selections', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nonprofitCheck = screen.getByLabelText(/nonprofit/i);
    const universityCheck = screen.getByLabelText(/university/i);

    await user.click(nonprofitCheck);
    await user.click(universityCheck);

    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        eligibility: expect.arrayContaining(['501c3', 'University']),
      })
    );
  });

  it('should have reset button to clear all filters', async () => {
    const user = userEvent.setup();
    renderComponent();

    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith({});
  });
});
```

### 3.3 SavedSearchCard Component Test

**File:** `src/components/__tests__/SavedSearchCard.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SavedSearchCard } from '@/components/SavedSearchCard';

describe('SavedSearchCard Component', () => {
  const mockSearch = {
    id: 'search-1',
    name: 'Small Tech Grants',
    filters: {
      category: 'TECHNOLOGY',
      amountMin: 10000,
      amountMax: 100000,
    },
    grantCount: 42,
    lastRun: new Date('2024-02-20'),
  };

  const mockOnDelete = jest.fn();
  const mockOnRun = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <SavedSearchCard
        search={mockSearch}
        onDelete={mockOnDelete}
        onRun={mockOnRun}
        {...props}
      />
    );
  };

  it('should display search name', () => {
    renderComponent();
    expect(screen.getByText('Small Tech Grants')).toBeInTheDocument();
  });

  it('should display grant count', () => {
    renderComponent();
    expect(screen.getByText('42 grants')).toBeInTheDocument();
  });

  it('should display last run date', () => {
    renderComponent();
    expect(screen.getByText(/Feb 20/)).toBeInTheDocument();
  });

  it('should display filter summary', () => {
    renderComponent();
    expect(screen.getByText(/TECHNOLOGY/)).toBeInTheDocument();
    expect(screen.getByText(/\$10K - \$100K/)).toBeInTheDocument();
  });

  it('should call onRun when run button clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const runButton = screen.getByRole('button', { name: /run/i });
    await user.click(runButton);

    expect(mockOnRun).toHaveBeenCalledWith('search-1');
  });

  it('should call onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('search-1');
  });

  it('should show confirmation before deleting', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    renderComponent();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
  });
});
```

### 3.4 WorkspaceCard Component Test

**File:** `src/components/__tests__/WorkspaceCard.test.tsx`

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceCard } from '@/components/WorkspaceCard';

describe('WorkspaceCard Component', () => {
  const mockWorkspace = {
    id: 'ws-1',
    name: 'Q1 2024 Grants',
    description: 'Spring funding cycle applications',
    grantCount: 8,
    documentCount: 3,
    lastUpdated: new Date('2024-02-20'),
  };

  const renderComponent = (props = {}) => {
    return render(<WorkspaceCard workspace={mockWorkspace} {...props} />);
  };

  it('should render workspace name', () => {
    renderComponent();
    expect(screen.getByText('Q1 2024 Grants')).toBeInTheDocument();
  });

  it('should display grant count', () => {
    renderComponent();
    expect(screen.getByText('8 grants')).toBeInTheDocument();
  });

  it('should display document count', () => {
    renderComponent();
    expect(screen.getByText('3 documents')).toBeInTheDocument();
  });

  it('should show description', () => {
    renderComponent();
    expect(screen.getByText('Spring funding cycle applications')).toBeInTheDocument();
  });

  it('should navigate to workspace on click', async () => {
    const user = userEvent.setup();
    renderComponent();

    const card = screen.getByRole('link');
    await user.click(card);

    expect(window.location.pathname).toContain('ws-1');
  });
});
```

### 3.5 Checklist
- [ ] Component tests for GrantCard (render, save, display match score)
- [ ] Component tests for GrantFilter (multiple filter types, reset)
- [ ] Component tests for SavedSearchCard (run, delete, display)
- [ ] Component tests for WorkspaceCard (navigation, display stats)
- [ ] Component tests for OnboardingStep (form submission, navigation)
- [ ] Component tests for NotificationItem (read/unread, dismiss)
- [ ] Accessibility tests (role, aria-labels)
- [ ] Snapshot tests for critical components

---

## STEP 4: API Route Tests

### 4.1 Grant Search API Route Test

**File:** `src/app/api/grants/__tests__/search.test.ts`

```typescript
import { GET } from '@/app/api/grants/search/route';
import { prismaMock } from '@/lib/test-utils/prisma-mock';

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('GET /api/grants/search', () => {
  it('should return grants matching filters', async () => {
    const mockGrants = [
      {
        id: '1',
        title: 'Grant A',
        category: 'EDUCATION',
        fundingAmount: 50000,
      },
    ];

    prismaMock.grant.findMany.mockResolvedValue(mockGrants);

    const request = new Request(
      'http://localhost:3000/api/grants/search?category=EDUCATION&page=1'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.grants).toHaveLength(1);
    expect(data.grants[0].category).toBe('EDUCATION');
  });

  it('should paginate results with limit and offset', async () => {
    prismaMock.grant.findMany.mockResolvedValue([]);

    const request = new Request(
      'http://localhost:3000/api/grants/search?page=2&limit=20'
    );

    await GET(request);

    expect(prismaMock.grant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 20,
      })
    );
  });

  it('should validate category filter', async () => {
    const request = new Request(
      'http://localhost:3000/api/grants/search?category=INVALID'
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should handle amount range filtering', async () => {
    prismaMock.grant.findMany.mockResolvedValue([]);

    const request = new Request(
      'http://localhost:3000/api/grants/search?amountMin=50000&amountMax=100000'
    );

    await GET(request);

    expect(prismaMock.grant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fundingAmount: expect.objectContaining({
            gte: 50000,
            lte: 100000,
          }),
        }),
      })
    );
  });

  it('should count total results', async () => {
    prismaMock.grant.count.mockResolvedValue(100);
    prismaMock.grant.findMany.mockResolvedValue([]);

    const request = new Request(
      'http://localhost:3000/api/grants/search?page=1'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(data.total).toBe(100);
  });

  it('should handle database errors gracefully', async () => {
    prismaMock.grant.findMany.mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new Request('http://localhost:3000/api/grants/search');

    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
```

### 4.2 User API Route Test

**File:** `src/app/api/user/__tests__/profile.test.ts`

```typescript
import { GET, PUT } from '@/app/api/user/profile/route';
import { getServerSession } from 'next-auth/next';
import { prismaMock } from '@/lib/test-utils/prisma-mock';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('GET /api/user/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user profile for authenticated user', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const mockProfile = {
      id: 'profile-1',
      userId: 'user-1',
      organizationType: '501c3',
      organizationName: 'Test Org',
    };

    prismaMock.userProfile.findUnique.mockResolvedValue(mockProfile);

    const request = new Request('http://localhost:3000/api/user/profile');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile.organizationType).toBe('501c3');
  });

  it('should return 401 if not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/user/profile');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe('PUT /api/user/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user profile', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    prismaMock.userProfile.update.mockResolvedValue({
      id: 'profile-1',
      organizationType: '501c3Updated',
    });

    const request = new Request('http://localhost:3000/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ organizationType: '501c3Updated' }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(prismaMock.userProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationType: '501c3Updated',
        }),
      })
    );
  });

  it('should validate profile data before update', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
    };

    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = new Request('http://localhost:3000/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ invalidField: 'value' }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});
```

### 4.3 AI API Route Test

**File:** `src/app/api/ai/__tests__/analyze-grant.test.ts`

```typescript
import { POST } from '@/app/api/ai/analyze-grant/route';
import { geminiMock } from '@/lib/test-utils/gemini-mock';
import { getServerSession } from 'next-auth/next';

jest.mock('@/lib/gemini', () => ({
  geminiClient: geminiMock,
}));
jest.mock('next-auth/next');

describe('POST /api/ai/analyze-grant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze grant and return insights', async () => {
    const mockSession = { user: { id: 'user-1' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    geminiMock.generateContent.mockResolvedValue({
      response: {
        text: () => 'This grant is highly relevant for your organization.',
      },
    });

    const request = new Request('http://localhost:3000/api/ai/analyze-grant', {
      method: 'POST',
      body: JSON.stringify({
        grantId: 'grant-1',
        userContext: 'nonprofit focused on education',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.analysis).toContain('highly relevant');
  });

  it('should handle Gemini API errors gracefully', async () => {
    const mockSession = { user: { id: 'user-1' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    geminiMock.generateContent.mockRejectedValue(
      new Error('API rate limit exceeded')
    );

    const request = new Request('http://localhost:3000/api/ai/analyze-grant', {
      method: 'POST',
      body: JSON.stringify({ grantId: 'grant-1' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
  });

  it('should validate grant exists before analysis', async () => {
    const mockSession = { user: { id: 'user-1' } };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const request = new Request('http://localhost:3000/api/ai/analyze-grant', {
      method: 'POST',
      body: JSON.stringify({ grantId: 'nonexistent' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
  });
});
```

### 4.4 Checklist
- [ ] API tests for GET /api/grants/search (filtering, pagination, validation)
- [ ] API tests for GET /api/user/profile (authentication, authorization)
- [ ] API tests for PUT /api/user/profile (validation, update)
- [ ] API tests for POST /api/ai/analyze-grant (Gemini mocking, error handling)
- [ ] API tests for grant save/unsave (CRUD operations)
- [ ] API tests for saved searches (CRUD)
- [ ] API tests for workspaces (CRUD, access control)
- [ ] Error handling tests (401, 404, 500, validation errors)

---

## STEP 5: Integration & E2E Tests

### 5.1 Onboarding Flow Integration Test

**File:** `src/app/onboard/__tests__/onboarding-flow.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '@/app/onboard/OnboardingFlow';
import { SessionProvider } from 'next-auth/react';
import { prismaMock } from '@/lib/test-utils/prisma-mock';

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('Onboarding Flow Integration', () => {
  const mockSession = {
    user: { id: 'user-1', email: 'test@example.com' },
  };

  const renderFlow = () => {
    return render(
      <SessionProvider session={mockSession}>
        <OnboardingFlow />
      </SessionProvider>
    );
  };

  it('should complete full onboarding flow', async () => {
    const user = userEvent.setup();
    prismaMock.userProfile.create.mockResolvedValue({
      id: 'profile-1',
      userId: 'user-1',
      organizationType: '501c3',
      organizationName: 'Test Nonprofit',
      yearsFounded: 5,
      focusAreas: ['EDUCATION', 'STEM'],
      geographicFocus: ['CA'],
    });

    renderFlow();

    // Step 1: Organization type
    const nonprofitOption = screen.getByLabelText(/nonprofit/i);
    await user.click(nonprofitOption);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Step 2: Organization details
    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'Test Nonprofit');

    const yearsInput = screen.getByLabelText(/years founded/i);
    await user.type(yearsInput, '5');

    await user.click(nextButton);

    // Step 3: Focus areas
    const educationCheck = screen.getByLabelText(/education/i);
    const stemCheck = screen.getByLabelText(/stem/i);
    await user.click(educationCheck);
    await user.click(stemCheck);

    // Step 4: Complete
    const completeButton = screen.getByRole('button', { name: /complete/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(prismaMock.userProfile.create).toHaveBeenCalled();
    });
  });

  it('should save progress between steps', async () => {
    const user = userEvent.setup();
    renderFlow();

    const nameInput = screen.getByLabelText(/organization name/i);
    await user.type(nameInput, 'Test Org');

    // Navigate away and back
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    await user.click(backButton);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Name should still be there
    expect(screen.getByDisplayValue('Test Org')).toBeInTheDocument();
  });
});
```

### 5.2 Grant Save/Unsave Flow Test

**File:** `src/app/search/__tests__/grant-save-flow.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GrantSearchPage } from '@/app/search/page';
import { prismaMock } from '@/lib/test-utils/prisma-mock';

describe('Grant Save/Unsave Flow', () => {
  const mockGrants = [
    {
      id: 'grant-1',
      title: 'Grant A',
      description: 'Description',
      category: 'EDUCATION',
      fundingAmount: 50000,
      deadline: new Date('2024-12-31'),
      sourceUrl: 'https://grants.gov/1',
      source: 'grants.gov',
    },
  ];

  beforeEach(() => {
    prismaMock.grant.findMany.mockResolvedValue(mockGrants);
    prismaMock.savedGrant.findUnique.mockResolvedValue(null);
    prismaMock.savedGrant.create.mockResolvedValue({
      id: 'saved-1',
      grantId: 'grant-1',
      userId: 'user-1',
    });
  });

  it('should save grant when save button clicked', async () => {
    const user = userEvent.setup();
    render(<GrantSearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Grant A')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(prismaMock.savedGrant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            grantId: 'grant-1',
          }),
        })
      );
    });
  });

  it('should toggle save state on button click', async () => {
    const user = userEvent.setup();
    render(<GrantSearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Grant A')).toBeInTheDocument();
    });

    let saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      saveButton = screen.getByRole('button', { name: /saved/i });
      expect(saveButton).toBeInTheDocument();
    });
  });
});
```

### 5.3 Workspace Management Flow Test

**File:** `src/app/workspaces/__tests__/workspace-flow.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspacePage } from '@/app/workspaces/[id]/page';
import { prismaMock } from '@/lib/test-utils/prisma-mock';

describe('Workspace Management Flow', () => {
  const mockWorkspace = {
    id: 'ws-1',
    name: 'Q1 Grants',
    userId: 'user-1',
    grantCollections: [],
    workspaceDocuments: [],
  };

  beforeEach(() => {
    prismaMock.workspace.findUnique.mockResolvedValue(mockWorkspace);
  });

  it('should create new grant collection in workspace', async () => {
    const user = userEvent.setup();
    render(<WorkspacePage params={{ id: 'ws-1' }} />);

    await waitFor(() => {
      expect(screen.getByText('Q1 Grants')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add collection/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/collection name/i);
    await user.type(nameInput, 'Priority Grants');

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(prismaMock.grantCollection.create).toHaveBeenCalled();
    });
  });

  it('should add grant to workspace collection', async () => {
    const user = userEvent.setup();
    render(<WorkspacePage params={{ id: 'ws-1' }} />);

    const addGrantButton = screen.getByRole('button', { name: /add grant/i });
    await user.click(addGrantButton);

    // Search and select grant
    const grantInput = screen.getByPlaceholderText(/search grants/i);
    await user.type(grantInput, 'STEM');

    const grantOption = await screen.findByText('STEM Education Grant');
    await user.click(grantOption);

    await waitFor(() => {
      expect(prismaMock.grantCollection.update).toHaveBeenCalled();
    });
  });
});
```

### 5.4 E2E Test Strategy (Playwright)

**File:** `e2e/grant-discovery.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Grant Discovery E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Login with test user
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('http://localhost:3000/app/search');
  });

  test('should search and filter grants end-to-end', async ({ page }) => {
    // Navigate to search
    await page.goto('http://localhost:3000/app/search');

    // Apply filter
    await page.selectOption('select[name="category"]', 'EDUCATION');
    await page.fill('input[name="amountMin"]', '50000');
    await page.fill('input[name="amountMax"]', '100000');

    // Wait for results
    await page.waitForSelector('[data-testid="grant-card"]');

    // Verify results
    const grants = await page.locator('[data-testid="grant-card"]').count();
    expect(grants).toBeGreaterThan(0);

    // Click first grant
    await page.click('[data-testid="grant-card"]:first-child');

    // Verify detail page loaded
    await page.waitForURL(/\/grants\/\w+/);
    const title = await page.locator('h1').first();
    expect(title).toBeTruthy();
  });

  test('should save grant to workspace', async ({ page }) => {
    await page.goto('http://localhost:3000/app/search');

    // Find and save grant
    const saveButton = page.locator('button:has-text("Save"):first');
    await saveButton.click();

    // Verify saved state
    await expect(saveButton).toContainText('Saved');

    // Navigate to saved grants
    await page.click('a:has-text("Saved")');

    // Verify grant appears in saved list
    const savedGrant = await page.locator('[data-testid="saved-grant-card"]').count();
    expect(savedGrant).toBeGreaterThan(0);
  });
});
```

### 5.5 Checklist
- [ ] Integration tests for full onboarding flow
- [ ] Integration tests for grant save/unsave lifecycle
- [ ] Integration tests for workspace CRUD operations
- [ ] E2E tests using Playwright for grant discovery
- [ ] E2E tests for user authentication flow
- [ ] E2E tests for application submission workflow
- [ ] E2E test coverage for critical user journeys

---

## STEP 6: Mock Strategies & Test Utilities

### 6.1 Prisma Mock Utility

**File:** `src/lib/test-utils/prisma-mock.ts`

```typescript
export const prismaMock = {
  grant: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    search: jest.fn(),
  },
  userProfile: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  savedGrant: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  savedSearch: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspace: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  grantCollection: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspaceDocument: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  aIUsageLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
};
```

### 6.2 Gemini API Mock

**File:** `src/lib/test-utils/gemini-mock.ts`

```typescript
export const geminiMock = {
  generateContent: jest.fn(),
  startChat: jest.fn(() => ({
    sendMessage: jest.fn().mockResolvedValue({
      response: {
        text: () => 'Mock AI response',
      },
    }),
  })),
  countTokens: jest.fn().mockResolvedValue({
    totalTokens: 100,
  }),
};

export const mockGeminiResponse = (text: string) => {
  return {
    response: {
      text: () => text,
    },
  };
};
```

### 6.3 NextAuth Session Mock

**File:** `src/lib/test-utils/auth-mock.ts`

```typescript
export const mockAuthSession = {
  user: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockUserWithProfile = {
  ...mockAuthSession,
  profile: {
    organizationType: '501c3',
    organizationName: 'Test Nonprofit',
    yearsFounded: 5,
    focusAreas: ['EDUCATION'],
  },
};
```

### 6.4 Test Data Factory

**File:** `src/lib/test-utils/factories.ts`

```typescript
import { faker } from '@faker-js/faker';

export const grantFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    title: faker.company.name() + ' Grant',
    description: faker.lorem.paragraph(),
    category: 'EDUCATION',
    fundingAmount: faker.number.int({ min: 10000, max: 1000000 }),
    eligibility: '501c3',
    deadline: faker.date.future(),
    source: 'grants.gov',
    sourceUrl: faker.internet.url(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMany: (count = 5, overrides = {}) => {
    return Array.from({ length: count }, () => grantFactory.create(overrides));
  },
};

export const userProfileFactory = {
  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    organizationType: '501c3',
    organizationName: faker.company.name(),
    yearsFounded: faker.number.int({ min: 1, max: 50 }),
    annualBudget: faker.number.int({ min: 10000, max: 5000000 }),
    focusAreas: ['EDUCATION', 'STEM'],
    geographicFocus: ['CA', 'NY'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};
```

### 6.5 Checklist
- [ ] Prisma mock with all data models
- [ ] Gemini API mock for content generation
- [ ] NextAuth session mock for authentication tests
- [ ] Test data factories using @faker-js/faker
- [ ] Custom render function with providers
- [ ] Test utilities for date/time manipulation
- [ ] Test utilities for URL/query string handling

---

## STEP 7: Test Data Seeding & Coverage

### 7.1 Prisma Seed File

**File:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data...');

  // Clear existing data
  await prisma.savedGrant.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.workspaceDocument.deleteMany({});
  await prisma.grantCollection.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.grant.deleteMany({});

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // Create user profile
  const profile = await prisma.userProfile.create({
    data: {
      userId: user.id,
      organizationType: '501c3',
      organizationName: 'Test Nonprofit',
      yearsFounded: 5,
      annualBudget: 500000,
      focusAreas: ['EDUCATION', 'STEM'],
      geographicFocus: ['CA', 'NY'],
    },
  });

  // Create sample grants
  const grants = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      prisma.grant.create({
        data: {
          title: `Grant ${i + 1}`,
          description: `Description for grant ${i + 1}`,
          category: ['EDUCATION', 'RESEARCH', 'HEALTHCARE'][i % 3],
          fundingAmount: Math.floor(Math.random() * 1000000) + 10000,
          eligibility: '501c3,StateOrg',
          deadline: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
          source: 'grants.gov',
          sourceUrl: `https://grants.gov/grant-${i}`,
        },
      })
    )
  );

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
      userId: user.id,
    },
  });

  // Create grant collection
  const collection = await prisma.grantCollection.create({
    data: {
      name: 'Priority Grants',
      workspaceId: workspace.id,
    },
  });

  // Add grants to collection
  await prisma.grantCollection.update({
    where: { id: collection.id },
    data: {
      grants: {
        connect: grants.slice(0, 5).map(g => ({ id: g.id })),
      },
    },
  });

  console.log('Seed complete!');
  console.log(`Created: 1 user, 1 profile, 20 grants, 1 workspace, 1 collection`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 7.2 Coverage Report Configuration

**File:** `jest.coverage.js`

```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './src/lib/': {
      statements: 85,
      branches: 75,
    },
    './src/components/': {
      statements: 75,
      branches: 65,
    },
    './src/app/api/': {
      statements: 80,
      branches: 70,
    },
  },
};
```

### 7.3 Coverage Targets Summary
- Global target: 70% statements, 60% branches
- `/src/lib/`: 85% statements, 75% branches (high-risk business logic)
- `/src/components/`: 75% statements, 65% branches (critical UI)
- `/src/app/api/`: 80% statements, 70% branches (API routes)
- `/src/app/`: 65% statements, 55% branches (pages/layout)

### 7.4 Checklist
- [ ] prisma/seed.ts creates test data for all models
- [ ] Seed script includes 20+ test grants with varied categories
- [ ] Coverage thresholds set in jest.config.js
- [ ] Coverage reports generated and reviewed monthly
- [ ] Target: 70% statements, 60% branches globally
- [ ] CI pipeline enforces coverage thresholds

---

## STEP 8: Test Execution & CI/CD Integration

### 8.1 Package.json Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest src/lib src/utils",
    "test:components": "jest src/components",
    "test:api": "jest src/app/api",
    "test:integration": "jest src/app/__tests__",
    "test:e2e": "playwright test",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

### 8.2 GitHub Actions CI Configuration

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

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
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - run: npm run test:coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - run: npm run test:e2e

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
```

### 8.3 Checklist
- [ ] npm test runs all unit + component tests
- [ ] npm run test:coverage generates coverage reports
- [ ] npm run test:e2e runs Playwright tests
- [ ] GitHub Actions runs tests on push + PR
- [ ] Coverage reports uploaded to codecov.io
- [ ] Tests must pass before merge to main
- [ ] Coverage thresholds enforced in CI

---

## Summary Checklist

- [ ] **Jest Setup:** jest.config.js, ts-jest, jest.setup.js configured
- [ ] **Unit Tests:** 70%+ coverage of lib/ directory
- [ ] **Component Tests:** GrantCard, GrantFilter, SavedSearchCard, WorkspaceCard, OnboardingStep
- [ ] **API Tests:** /api/grants, /api/user/*, /api/ai/* routes tested
- [ ] **Integration Tests:** Onboarding, save/unsave, workspace management flows
- [ ] **E2E Tests:** Playwright tests for critical user journeys
- [ ] **Mocks:** Prisma, NextAuth, Gemini API properly mocked
- [ ] **Test Data:** prisma/seed.ts creates realistic test data
- [ ] **Coverage Reports:** Generated and tracked via codecov.io
- [ ] **CI/CD:** GitHub Actions runs tests on every push/PR
