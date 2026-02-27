# GrantEase Navigation & UX Audit

## Overview
This audit evaluates the navigation structure, user experience flows, and interface consistency across the GrantEase application. Focus areas include route organization, sidebar navigation, onboarding flows, grant discovery UX, workspace management, responsive design, and error recovery patterns.

---

## STEP 1: Route Group Organization Audit

### 1.1 Verify Route Structure
Review the `/app` directory structure to confirm proper Next.js App Router organization with route groups:

```
/app
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/[token]/page.tsx
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx (home)
│   ├── pricing/page.tsx
│   ├── how-it-works/page.tsx
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   └── about/page.tsx
├── app/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── discover/page.tsx
│   ├── grants/[id]/page.tsx
│   ├── saved/page.tsx
│   ├── searches/page.tsx
│   ├── workspace/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── settings/page.tsx
├── onboarding/
│   ├── layout.tsx
│   ├── page.tsx
│   └── [step]/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   └── [section]/page.tsx
└── layout.tsx (root)
```

**Checklist:**
- [ ] Route groups use parentheses syntax: `(auth)`, `(marketing)`
- [ ] Auth routes protected from sidebar in authenticated state
- [ ] Marketing routes accessible without authentication
- [ ] App routes require authentication (middleware in `middleware.ts`)
- [ ] Onboarding redirects after completion to `/app`
- [ ] Admin routes restricted to admin users via middleware
- [ ] No duplicate route patterns across groups
- [ ] Dynamic routes use proper bracket notation: `[id]`, `[token]`, `[step]`

### 1.2 Middleware Protection
Check `middleware.ts` for proper route protection:

```typescript
// Example middleware pattern
export function middleware(request: NextRequest) {
  const session = getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protect /app routes
  if (pathname.startsWith('/app') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin') && (!session || session.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Redirect authenticated users away from auth pages
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && session) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Handle onboarding flow
  if (pathname.startsWith('/app') && session && !session.onboardingComplete) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/login', '/register', '/onboarding/:path*'],
};
```

**Checklist:**
- [ ] Middleware exists and is properly configured
- [ ] Authentication check uses `getToken()` from NextAuth
- [ ] Admin route protection validates role
- [ ] Onboarding redirect for incomplete profiles
- [ ] Redirect loops prevented
- [ ] Matcher pattern covers all protected routes
- [ ] Public routes not unnecessarily protected

---

## STEP 2: Sidebar Navigation Audit

### 2.1 Authenticated App Sidebar
Review `/app` layout sidebar component for:

```typescript
// Expected sidebar structure
const navigationItems = [
  {
    label: 'Dashboard',
    href: '/app',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Discover Grants',
    href: '/app/discover',
    icon: 'Search',
  },
  {
    label: 'Saved Grants',
    href: '/app/saved',
    icon: 'Heart',
    badge: savedCount,
  },
  {
    label: 'My Searches',
    href: '/app/searches',
    icon: 'Filter',
  },
  {
    label: 'Workspaces',
    href: '/app/workspace',
    icon: 'Briefcase',
    badge: workspaceCount,
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: 'Settings',
  },
];
```

**Checklist:**
- [ ] All navigation items have icons from consistent icon library (lucide-react recommended)
- [ ] Active route highlighted with accent color (#40ffaa)
- [ ] Badge counts accurate and updated
- [ ] Icons semantic and recognizable
- [ ] Sidebar collapsible on medium screens
- [ ] Hover states provide visual feedback
- [ ] Navigation items ordered by user workflow priority
- [ ] Logout button/user menu at sidebar bottom
- [ ] Mobile hamburger menu collapses sidebar

### 2.2 Header Navigation
Verify header component includes:

```typescript
// Expected header structure
<header className="border-b border-slate-800 bg-slate-950">
  <div className="flex items-center justify-between px-4 py-3">
    {/* Hamburger on mobile */}
    <button aria-label="Toggle sidebar" className="md:hidden">
      <Menu />
    </button>

    {/* Logo/Branding */}
    <Link href="/app" className="flex items-center gap-2">
      <LogoIcon />
      <span className="font-bold text-white">GrantEase</span>
    </Link>

    {/* Right side: Notifications + User Menu */}
    <div className="flex items-center gap-4">
      {/* Notifications Bell */}
      <button aria-label="Notifications" className="relative">
        <Bell className="text-slate-400 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* User Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2">
            <Avatar>{user.name}</Avatar>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>{user.email}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/app/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>
```

**Checklist:**
- [ ] Header fixed at top with z-index management
- [ ] Logo clickable, returns to dashboard
- [ ] Hamburger menu hidden on desktop (md breakpoint)
- [ ] Notifications bell displays unread count badge
- [ ] User menu dropdown aligned to right
- [ ] Logout accessible from user menu
- [ ] Settings link accessible from user menu
- [ ] Header background consistent with dark theme
- [ ] Text contrast meets accessibility standards

---

## STEP 3: Onboarding Flow Audit

### 3.1 Five-Step Wizard Structure
Verify onboarding follows this flow with persistence:

```
Step 1: Entity Type Selection
  └─ Options: Individual, Startup, SMB, Non-profit, Government, Academic

Step 2: Industry Selection
  └─ Multi-select categories: Tech, Healthcare, Agriculture, Manufacturing, etc.

Step 3: Size/Stage
  └─ Employees/Revenue ranges, Funding stage if applicable

Step 4: Business Attributes
  └─ Women/Minority/Veteran-owned, Location(s), Certifications

Step 5: Grant Preferences
  └─ Preferred grant amounts, funding types, submission timeline
```

**Checklist:**
- [ ] Each step saves to database or session immediately (optimistic save)
- [ ] Progress bar shows current step (5/5 format)
- [ ] "Back" button enabled from step 2 onwards
- [ ] "Next" button validates required fields before proceeding
- [ ] Step skipping prevented (linear flow)
- [ ] Form state preserved if user navigates away and returns
- [ ] Completion redirects to `/app`
- [ ] Skip option available for advanced users (optional)
- [ ] Error messages clear and specific

### 3.2 Step-by-Step Validation

```typescript
// Example validation for Step 1
const entityTypeSchema = z.enum([
  'INDIVIDUAL',
  'STARTUP',
  'SMB',
  'NONPROFIT',
  'GOVERNMENT',
  'ACADEMIC',
]);

// Example validation for Step 2
const industrySchema = z.array(
  z.enum(['TECH', 'HEALTHCARE', 'AGRICULTURE', 'MANUFACTURING', 'OTHER'])
).min(1, 'Select at least one industry');

// Example validation for Step 3
const stageSchema = z.object({
  employeeCount: z.enum(['1-10', '11-50', '51-200', '200+']),
  fundingStage: z.enum(['BOOTSTRAPPED', 'SEED', 'SERIES_A', 'SERIES_B', 'LATER']).optional(),
});
```

**Checklist:**
- [ ] All inputs use Zod schemas for validation
- [ ] Real-time validation feedback provided
- [ ] Required fields clearly marked
- [ ] Error messages appear below fields with red text
- [ ] Successful validation enables "Next" button
- [ ] No spam of error messages on blur
- [ ] Multi-select properly handles add/remove

### 3.3 Onboarding UI/UX
Review visual design and interactions:

**Checklist:**
- [ ] Centered layout, max-width 600px
- [ ] Pulse Grid background animations during load
- [ ] Progress indicator at top (visual + text)
- [ ] Step title and description clear
- [ ] Form spacing and alignment consistent
- [ ] Button sizing matches Tailwind standards
- [ ] Loading state shown during submission
- [ ] Success animation or transition to next step
- [ ] Mobile layout remains readable (vertical stacking)

---

## STEP 4: Grant Discovery UX Audit

### 4.1 Filter Panel
Verify filter sidebar component for proper UX:

```typescript
// Expected filter structure
<aside className="w-64 border-r border-slate-800 bg-slate-950 p-4">
  {/* Filter Title */}
  <h2 className="text-lg font-semibold mb-4">Filters</h2>

  {/* Search Filter */}
  <div className="mb-6">
    <label className="text-sm font-medium mb-2 block">Search Grants</label>
    <input
      type="text"
      placeholder="Keyword..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
    />
  </div>

  {/* Grant Amount Range */}
  <FilterSection title="Grant Amount">
    <RangeSlider min={0} max={500000} step={10000} />
  </FilterSection>

  {/* Category Filter */}
  <FilterSection title="Category">
    {categories.map(cat => (
      <label key={cat.id} className="flex items-center gap-2 mb-2">
        <input type="checkbox" checked={selected.includes(cat.id)} />
        <span>{cat.name}</span>
      </label>
    ))}
  </FilterSection>

  {/* Funding Type */}
  <FilterSection title="Funding Type">
    {fundingTypes.map(type => (
      <label key={type}>
        <input type="radio" name="funding" value={type} />
        {type}
      </label>
    ))}
  </FilterSection>

  {/* Reset Button */}
  <button
    onClick={resetFilters}
    className="w-full mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded"
  >
    Reset Filters
  </button>
</aside>
```

**Checklist:**
- [ ] All filters have clear labels
- [ ] Radio buttons for single-select filters (funding type)
- [ ] Checkboxes for multi-select filters (categories, industries)
- [ ] Range sliders for numeric filters with input fields
- [ ] "Reset Filters" button clears all selections
- [ ] Selected filters persist in URL query params (`?categories=tech&amount_min=10000`)
- [ ] Filter changes trigger results refresh immediately
- [ ] Active filter count displayed (e.g., "3 filters applied")
- [ ] Mobile: filters collapse into drawer/modal below results

### 4.2 Results Grid
Verify grant card layout and display:

```typescript
// Expected grant card
<article className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-[#40ffaa] transition-colors">
  {/* Card Header */}
  <div className="flex items-start justify-between mb-2">
    <h3 className="font-semibold text-white text-lg line-clamp-2">
      {grant.title}
    </h3>
    <button
      aria-label="Save grant"
      className="text-slate-400 hover:text-[#40ffaa]"
      onClick={toggleSave}
    >
      {isSaved ? <Heart className="fill-[#40ffaa]" /> : <Heart />}
    </button>
  </div>

  {/* Organization */}
  <p className="text-sm text-slate-400 mb-3">{grant.organization}</p>

  {/* Grant Amount */}
  <div className="mb-3">
    <span className="text-[#40ffaa] font-bold text-lg">
      ${formatCurrency(grant.amount)}
    </span>
    <span className="text-slate-400 text-sm ml-2">Available</span>
  </div>

  {/* Description */}
  <p className="text-sm text-slate-300 mb-4 line-clamp-3">
    {grant.description}
  </p>

  {/* Tags */}
  <div className="flex flex-wrap gap-2 mb-4">
    {grant.categories.map(cat => (
      <span key={cat} className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded">
        {cat}
      </span>
    ))}
  </div>

  {/* Deadline */}
  <div className="flex items-center gap-2 text-sm mb-4">
    <Calendar className="w-4 h-4 text-slate-400" />
    <span className="text-slate-400">
      Deadline: {formatDate(grant.deadline)}
    </span>
  </div>

  {/* CTA Buttons */}
  <div className="flex gap-2">
    <Link
      href={`/app/grants/${grant.id}`}
      className="flex-1 px-4 py-2 bg-[#40ffaa] text-slate-950 font-semibold rounded hover:bg-[#3ae699] transition-colors"
    >
      View Details
    </Link>
    <button
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded"
      onClick={addToWorkspace}
    >
      Add to Workspace
    </button>
  </div>
</article>
```

**Checklist:**
- [ ] Cards display in responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
- [ ] Grant title truncated with ellipsis
- [ ] Organization name displayed below title
- [ ] Grant amount highlighted in accent color (#40ffaa)
- [ ] Description limited to 3 lines with ellipsis
- [ ] Category tags styled as pills
- [ ] Deadline clearly displayed with calendar icon
- [ ] Save button (heart icon) toggles fill color
- [ ] "View Details" button leads to grant detail page
- [ ] "Add to Workspace" button accessible without navigation
- [ ] Card hover state highlights border with accent color
- [ ] No layout shift when save button toggles

### 4.3 Sort Controls
Verify sort functionality:

```typescript
// Expected sort options
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'amount_desc', label: 'Highest Amount' },
  { value: 'amount_asc', label: 'Lowest Amount' },
  { value: 'deadline_asc', label: 'Deadline: Soonest' },
  { value: 'deadline_desc', label: 'Deadline: Latest' },
  { value: 'newest', label: 'Recently Added' },
];
```

**Checklist:**
- [ ] Sort dropdown prominently placed above results
- [ ] Default sort is "Most Relevant" (if search results) or "Newest"
- [ ] Sort selection persists in URL (`?sort=amount_desc`)
- [ ] Sort changes refresh results immediately
- [ ] Selected sort option highlighted in dropdown
- [ ] Sort combined with filters correctly (filter + sort)

### 4.4 Pagination
Verify pagination controls:

**Checklist:**
- [ ] Results grouped in pages of 12-20 items
- [ ] Pagination controls at bottom of results
- [ ] "Previous" and "Next" buttons
- [ ] Page numbers displayed with current page highlighted
- [ ] Jump to page input available
- [ ] Result count shown ("Showing 1-20 of 287 results")
- [ ] Pagination persists in URL (`?page=2`)
- [ ] Page reset when filters/sort changes
- [ ] Loading state shown while fetching next page

---

## STEP 5: Grant Detail Page Flow

### 5.1 Detail Page Layout
Review grant detail page structure:

```typescript
// Expected layout
<main>
  {/* Breadcrumb */}
  <Breadcrumb items={[
    { label: 'Grants', href: '/app/discover' },
    { label: grant.title }
  ]} />

  <div className="grid grid-cols-3 gap-6">
    {/* Left Column: Main Content */}
    <div className="col-span-2">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{grant.title}</h1>
        <p className="text-slate-400">{grant.organization}</p>
      </header>

      {/* Amount Section */}
      <section className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Grant Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Amount Available</p>
            <p className="text-[#40ffaa] text-2xl font-bold">${formatCurrency(grant.amount)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Application Deadline</p>
            <p className="text-white text-lg font-semibold">{formatDate(grant.deadline)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Category</p>
            <p className="text-white">{grant.category}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Eligibility</p>
            <p className="text-white">{grant.eligibilityText}</p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">About This Grant</h2>
        <p className="text-slate-300 whitespace-pre-wrap">{grant.description}</p>
      </section>

      {/* Eligibility Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Eligibility Requirements</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300">
          {grant.eligibility.map(req => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      </section>

      {/* Application Requirements */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">What You'll Need</h2>
        <ul className="space-y-2">
          {grant.requirements.map(req => (
            <div key={req.id} className="flex items-start gap-2 p-3 bg-slate-900 rounded">
              <CheckCircle className="w-5 h-5 text-[#40ffaa] mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{req.name}</span>
            </div>
          ))}
        </ul>
      </section>
    </div>

    {/* Right Column: Sidebar */}
    <aside className="col-span-1">
      {/* Save Button */}
      <button
        onClick={toggleSave}
        className="w-full mb-4 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        <Heart className={isSaved ? 'fill-[#40ffaa] text-[#40ffaa]' : ''} />
        {isSaved ? 'Saved' : 'Save Grant'}
      </button>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full mb-4 px-4 py-3 bg-[#40ffaa] hover:bg-[#3ae699] text-slate-950 rounded-lg font-semibold"
      >
        Apply Now
      </button>

      {/* Add to Workspace */}
      <WorkspaceSelector grantId={grant.id} />

      {/* Share Button */}
      <button
        className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
        onClick={handleShare}
      >
        Share
      </button>
    </aside>
  </div>
</main>
```

**Checklist:**
- [ ] Breadcrumb navigation shows path: Grants > [Grant Title]
- [ ] Back button or breadcrumb clickable to return to discover
- [ ] Grant title prominent and readable
- [ ] Organization name displayed below title
- [ ] Amount prominently displayed in accent color
- [ ] Deadline clearly visible with countdown if applicable
- [ ] Full description and eligibility requirements visible
- [ ] Save button togglable and persists state
- [ ] "Apply Now" button leads to external application or workspace flow
- [ ] "Add to Workspace" dropdown shows user's workspaces
- [ ] Share button provides copy link or social options
- [ ] Right sidebar sticky on scroll
- [ ] Mobile: layout stacks to single column
- [ ] All images/logos load properly

---

## STEP 6: Workspace UX Audit

### 6.1 Workspace List View
Review `/app/workspace` page:

**Checklist:**
- [ ] List or grid view of user's workspaces
- [ ] Each workspace card shows: title, grant count, last updated, status
- [ ] "Create New Workspace" button prominent at top
- [ ] Quick actions available (edit name, delete, share)
- [ ] Filter/sort workspaces by name, date, status
- [ ] Empty state message if no workspaces created
- [ ] Click on workspace navigates to detail view
- [ ] Delete workspace requires confirmation dialog
- [ ] Workspace count displayed in sidebar badge

### 6.2 Workspace Detail View
Review `/app/workspace/[id]` page structure:

```typescript
// Expected workspace detail layout
<main>
  {/* Header */}
  <header className="mb-6">
    <h1 className="text-2xl font-bold mb-2">{workspace.name}</h1>
    <p className="text-slate-400">Grants collected for: {workspace.description}</p>
  </header>

  {/* Tabs */}
  <div className="border-b border-slate-700 mb-6">
    <nav className="flex gap-6">
      <button className="py-2 border-b-2 border-[#40ffaa] text-white">
        Grants ({workspace.grants.length})
      </button>
      <button className="py-2 border-b-2 border-transparent text-slate-400 hover:text-white">
        Checklist
      </button>
      <button className="py-2 border-b-2 border-transparent text-slate-400 hover:text-white">
        Documents
      </button>
      <button className="py-2 border-b-2 border-transparent text-slate-400 hover:text-white">
        Notes
      </button>
    </nav>
  </div>

  <div className="grid grid-cols-3 gap-6">
    {/* Main Content */}
    <div className="col-span-2">
      {/* Grants List */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tracked Grants</h2>
        <div className="space-y-3">
          {workspace.grants.map(grant => (
            <div key={grant.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{grant.title}</h3>
                  <p className="text-sm text-slate-400">{grant.organization}</p>
                </div>
                <select
                  value={grant.status}
                  onChange={(e) => updateGrantStatus(grant.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded text-white px-3 py-1"
                >
                  <option value="INTERESTED">Interested</option>
                  <option value="APPLYING">Applying</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-[#40ffaa]">${formatCurrency(grant.amount)}</span>
                <span className="text-slate-400">Due: {formatDate(grant.deadline)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Application Checklist</h2>
        <div className="space-y-2">
          {workspace.checklist.map(item => (
            <label key={item.id} className="flex items-center gap-3 p-3 bg-slate-900 rounded cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => updateChecklistItem(item.id)}
                className="w-4 h-4"
              />
              <span className={item.completed ? 'line-through text-slate-500' : 'text-white'}>
                {item.name}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Document Upload */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <UploadZone onUpload={handleDocumentUpload} />
        <div className="mt-4 space-y-2">
          {workspace.documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-900 rounded">
              <span className="text-white">{doc.name}</span>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        <textarea
          value={workspace.notes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder="Add notes about your application..."
          className="w-full p-4 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500"
          rows={6}
        />
      </section>
    </div>

    {/* Sidebar */}
    <aside>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Progress</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Checklist</span>
            <span className="text-[#40ffaa]">{completedItems}/{totalItems}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-[#40ffaa] h-2 rounded-full transition-all"
              style={{ width: `${(completedItems / totalItems) * 100}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          {completedItems} of {totalItems} items completed
        </p>
      </div>
    </aside>
  </div>
</main>
```

**Checklist:**
- [ ] Tabs for Grants, Checklist, Documents, Notes
- [ ] Grant status dropdown (Interested, Applying, Submitted, Accepted, Rejected)
- [ ] Checklist items toggleable and persistent
- [ ] Document upload drag-and-drop zone
- [ ] Document list with delete option
- [ ] Notes textarea auto-saves or save button visible
- [ ] Progress bar shows checklist completion
- [ ] Grant count updated when items added/removed
- [ ] Last updated timestamp visible
- [ ] Share workspace button available
- [ ] Delete workspace with confirmation
- [ ] Mobile: tabs collapse or scroll horizontally

---

## STEP 7: Mobile Responsive Navigation

### 7.1 Hamburger Menu
Verify mobile navigation implementation:

**Checklist:**
- [ ] Hamburger menu icon visible on screens < md breakpoint
- [ ] Menu opens as slide-out drawer from left
- [ ] Menu overlays content with semi-transparent backdrop
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Sidebar items remain accessible in hamburger menu
- [ ] Hamburger icon animated (cross icon on open)
- [ ] Close button or backdrop click closes menu
- [ ] Menu closes on navigation

### 7.2 Bottom Navigation (Mobile)
Verify if bottom nav implemented for mobile:

**Checklist:**
- [ ] (If implemented) Bottom nav sticky at bottom on mobile
- [ ] Primary navigation items in bottom nav: Dashboard, Discover, Saved, Workspaces
- [ ] Icons and labels clear and touch-friendly
- [ ] Active tab highlighted
- [ ] Doesn't hide content when scrolling

---

## STEP 8: Breadcrumb Navigation

### 8.1 Breadcrumb Implementation
Check all nested routes have breadcrumbs:

**Routes requiring breadcrumbs:**
- [ ] `/app/grants/[id]` - Grants > [Grant Title]
- [ ] `/app/workspace` - Workspaces
- [ ] `/app/workspace/[id]` - Workspaces > [Workspace Name]
- [ ] `/app/settings` - Settings (optional if not nested)

**Checklist:**
- [ ] Breadcrumbs displayed above page title
- [ ] All segments clickable (except current page)
- [ ] Separators between segments (/)
- [ ] Current segment not clickable, bold or different color
- [ ] Breadcrumbs respect route hierarchy
- [ ] Mobile: breadcrumbs abbreviated or hidden if space-constrained

---

## STEP 9: Empty States Audit

### 9.1 No Grants Found
Review empty state on `/app/discover` with no results:

```typescript
// Expected empty state
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Search className="w-16 h-16 text-slate-600 mb-4" />
  <h3 className="text-lg font-semibold text-white mb-2">No grants found</h3>
  <p className="text-slate-400 mb-6">
    Try adjusting your filters or search terms to find more grants.
  </p>
  <button
    onClick={resetFilters}
    className="px-4 py-2 bg-[#40ffaa] hover:bg-[#3ae699] text-slate-950 rounded-lg font-semibold"
  >
    Reset Filters
  </button>
</div>
```

**Checklist:**
- [ ] Relevant icon displayed (search, grant, etc.)
- [ ] Clear message explaining why empty
- [ ] Suggested action (reset filters, adjust search, browse all)
- [ ] Actionable button provided
- [ ] Centered on page with adequate spacing

### 9.2 No Saved Grants
Review empty state on `/app/saved`:

**Checklist:**
- [ ] Heart icon displayed
- [ ] Message: "No saved grants yet"
- [ ] CTA: "Browse grants" button linked to discover
- [ ] Encouraging copy about saving process

### 9.3 No Workspaces
Review empty state on `/app/workspace`:

**Checklist:**
- [ ] Briefcase/workspace icon displayed
- [ ] Message: "No workspaces created yet"
- [ ] CTA: "Create Your First Workspace" button
- [ ] Explanation of workspace benefits

### 9.4 No Notifications
Review empty state in notifications menu:

**Checklist:**
- [ ] Bell icon displayed
- [ ] Message: "No notifications"
- [ ] Clearing copy about when notifications appear

---

## STEP 10: Loading States and Skeleton Screens

### 10.1 Pulse Grid Skeleton Animations
Verify Pulse Grid component usage:

**Checklist:**
- [ ] Grant card skeletons display while fetching list
- [ ] Workspace list skeletons
- [ ] Grant detail page skeleton (header, description sections)
- [ ] Skeleton animations use Framer Motion Pulse
- [ ] Appropriate number of skeleton cards based on grid layout
- [ ] Loading state persists until data received
- [ ] No loading flash (debounce for <200ms requests)

### 10.2 Page-Level Loading
Verify loading indicators:

**Checklist:**
- [ ] Loading spinner or skeleton for full page loads
- [ ] Skeleton loader for `/app/discover` results
- [ ] Skeleton loader for `/app/grants/[id]` detail
- [ ] Skeleton loader for workspace detail

---

## STEP 11: Error Recovery Patterns

### 11.1 Failed Data Loads
Verify error state displays:

```typescript
// Expected error state
<div className="flex flex-col items-center justify-center py-16 text-center">
  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
  <h3 className="text-lg font-semibold text-white mb-2">Failed to load grants</h3>
  <p className="text-slate-400 mb-6">
    Something went wrong. Please try again.
  </p>
  <button
    onClick={retryFetch}
    className="px-4 py-2 bg-[#40ffaa] hover:bg-[#3ae699] text-slate-950 rounded-lg font-semibold"
  >
    Try Again
  </button>
</div>
```

**Checklist:**
- [ ] Error icon displayed
- [ ] Clear error message (not technical)
- [ ] Retry button functional and obvious
- [ ] Contact support link if persistent error
- [ ] Error state accessible and readable

### 11.2 Validation Error Messages
Verify form validation feedback:

**Checklist:**
- [ ] Error messages appear below field with red text
- [ ] error messages use `aria-describedby` for accessibility
- [ ] Invalid fields have red border or background
- [ ] Error persists until field corrected
- [ ] Multiple errors shown (not just first)
- [ ] Clear, non-technical error copy ("Email must be valid" not "Invalid email format")

### 11.3 Network Error Handling
Verify network error recovery:

**Checklist:**
- [ ] Timeout errors shown with retry option
- [ ] 404 errors with helpful message
- [ ] 500 errors with contact support option
- [ ] Offline state detected and displayed
- [ ] Retry logic with exponential backoff
- [ ] Toast notifications for temporary errors

---

## STEP 12: Dead Link Audit

### 12.1 Internal Links
Scan for broken internal links:

**Checklist:**
- [ ] All navigation items link to existing routes
- [ ] Breadcrumb links resolve correctly
- [ ] Grant card "View Details" links valid
- [ ] Workspace links functional
- [ ] User menu links (Settings, etc.) working
- [ ] All CTA buttons link to correct destinations
- [ ] No hardcoded `/app/nonexistent` routes

### 12.2 External Links
Verify external link handling:

**Checklist:**
- [ ] External links open in new tab (`target="_blank" rel="noopener noreferrer"`)
- [ ] Grant application URLs valid
- [ ] Policy links (/privacy, /terms) accessible
- [ ] Contact form working
- [ ] Social media links in footer (if applicable)

---

## STEP 13: Back Button Behavior

### 13.1 Navigation Back Patterns
Verify back button consistency:

**Checklist:**
- [ ] Onboarding: Previous button on each step, Back button disabled on step 1
- [ ] Workspace detail: Back button returns to workspace list
- [ ] Grant detail: Back button returns to discover with filters preserved
- [ ] Browser back button works intuitively
- [ ] Back button doesn't break state (filters/sort retained)
- [ ] Mobile nav doesn't prevent back button

### 13.2 History Management
Verify browser history handling:

**Checklist:**
- [ ] Navigation doesn't create excessive history entries
- [ ] Filter changes use `replace: true` for cleaner history
- [ ] Back button predictable and tested
- [ ] Multiple back button presses work correctly

---

## STEP 14: Navigation Testing Checklist

- [ ] Test all navigation paths on desktop
- [ ] Test all navigation paths on tablet (md breakpoint)
- [ ] Test all navigation paths on mobile (sm breakpoint)
- [ ] Test hamburger menu open/close
- [ ] Test breadcrumb navigation and clicks
- [ ] Test all empty states display correctly
- [ ] Test all loading states display correctly
- [ ] Test error states and recovery flows
- [ ] Test back button on all major flows
- [ ] Test filter persistence in URLs
- [ ] Test grant card interactions (save, workspace add)
- [ ] Test workspace navigation and CRUD
- [ ] Test sidebar active state highlighting
- [ ] Test user menu dropdown
- [ ] Test notifications bell functionality
- [ ] Test pagination controls
- [ ] Test sort functionality
- [ ] Test responsive breakpoints (320px, 640px, 1024px, 1280px)
- [ ] Test keyboard navigation (Tab through nav items)
- [ ] Test touch interactions on mobile devices

---

## Summary
This audit covers comprehensive navigation and UX review for the GrantEase application. Address all failing checklist items and test thoroughly across devices and browsers before deployment.
