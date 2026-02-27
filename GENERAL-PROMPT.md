# GrantEase Prompt Enhancement Engine

A sophisticated multi-stage prompt transformation pipeline that intelligently enriches user requests with domain-specific context, technical specifications, and implementation patterns for the GrantEase grant discovery and application management platform.

## Overview

GrantEase is a Next.js 14+ grant discovery and application management platform powered by TypeScript, Prisma ORM, NextAuth authentication, Google Gemini AI, and a modern design system (Tailwind CSS + Pulse Grid tokens + Radix UI + Framer Motion). Users discover grants through advanced filtering (category, eligibility, location, amount, deadline), receive AI-powered personalized matching, manage applications in collaborative workspaces, and leverage AI writing and chat assistants to strengthen submissions.

This prompt enhancement system transforms high-level user requests into comprehensive, context-aware development specifications tailored to GrantEase's architecture, feature set, and business logic.

---

## Stage 1: Intent Recognition & Clarification

**Purpose:** Detect the true user intent beneath surface-level requests and identify gaps that require clarification.

### Recognition Patterns

#### 1.1 Grant Discovery & Search Requests
**Signal indicators:**
- User mentions: "search grants", "find grants", "browse", "filter", "discover"
- References to search attributes: category, eligibility, location, deadline, funding amount
- Questions about filtering behavior or search UX

**Clarification questions to ask:**
- Should this search integrate with existing saved searches and email alert functionality?
- Does the search result set need pagination, infinite scroll, or result virtualization for large datasets?
- Should search state persist to URL parameters for shareable filter combinations?
- Which grant data sources (federal, state, private foundation, nonprofit) should be included?
- How should expired grants or deadlines be handled in results?

**Example dialogue:**
```
User: "Add search to the grants page"
Assistant: I see you want to enhance grant search capabilities. A few clarifications:
1. Should users be able to save searches and receive email alerts for new matching grants?
2. What filters are most critical: category, eligibility status, location, funding range, deadline type?
3. Should search results be sortable (deadline, amount, relevance)?
4. For large result sets, should we implement infinite scroll or pagination?
5. Should the search support text search on grant titles/descriptions using Gemini embeddings?
```

#### 1.2 Application Management & Workspace Requests
**Signal indicators:**
- User mentions: "application", "workspace", "tracking", "documents", "checklist", "submission"
- References to collaborative features or multi-step workflows
- Questions about application state management or document organization

**Clarification questions to ask:**
- Is this for a single grant application or managing multiple simultaneous applications?
- Should the workspace support team collaboration with multiple users on one application?
- How should application progress/status be visualized (step indicators, progress bars)?
- Which document types need to be stored: essays, financial statements, letters of recommendation, supporting files?
- Should document versioning or audit trails be tracked?

**Example dialogue:**
```
User: "Users need to organize their applications"
Assistant: I understand you want to improve application organization. Let me clarify:
1. Should users manage applications in isolated workspaces or a unified dashboard?
2. Should workspaces support team collaboration (assigning tasks, commenting)?
3. What's the application workflow: grant selection → requirements checklist → document collection → submission prep → tracking?
4. Should we track application status (draft, in-progress, submitted, accepted, rejected)?
5. Do applications need version history for submitted documents?
```

#### 1.3 AI Feature Requests
**Signal indicators:**
- User mentions: "AI", "intelligent", "recommendation", "matching", "writing", "chat", "gemini"
- References to personalization or automation
- Questions about grant-specific insights or content generation

**Clarification questions to ask:**
- Is this an AI-powered feature (Gemini integration) or a display/UX enhancement?
- What user data should inform AI features: profile, eligibility answers, previous applications, grant history?
- Should AI features degrade gracefully if Gemini API fails (rate limits, timeouts)?
- Is the AI feature generating content (writing suggestions) or providing analysis (matching scores)?
- What's the fallback behavior if AI processing exceeds token limits?

**Example dialogue:**
```
User: "Add AI matching to help users find relevant grants"
Assistant: Excellent idea. I need to understand the matching requirements:
1. What factors determine grant relevance: user eligibility, funding amount, deadline, geographic focus?
2. Should matching scores be real-time or pre-computed and cached?
3. How should we collect/infer user data (onboarding profile, eligibility questionnaire)?
4. Should the matching UI show reasoning (why this grant matched)?
5. What happens if Gemini API is unavailable—show cached matches or disable feature?
```

#### 1.4 Onboarding & User Flow Requests
**Signal indicators:**
- User mentions: "onboarding", "signup", "setup", "getting started", "initial flow", "welcome"
- References to user profile or eligibility collection
- Questions about progressive disclosure or step-by-step setup

**Clarification questions to ask:**
- How many steps in the onboarding flow? (GrantEase currently has 5)
- Which user attributes are critical to collect upfront: profile info, eligibility criteria, grant preferences?
- Should onboarding be required or optional/skippable?
- Should onboarding data inform subsequent features (matching, recommendations, search filters)?
- What happens if user abandons onboarding partway through?

**Example dialogue:**
```
User: "Users are confused during signup"
Assistant: Let me clarify the onboarding experience:
1. Are we addressing the 5-step onboarding flow or adding new steps?
2. Which steps cause confusion: profile creation, eligibility questions, organization type, grant preferences, vault setup?
3. Should we add inline help, tooltips, or contextual examples?
4. Can users skip steps or must all be completed?
5. Should incomplete onboarding block access to core features or allow partial access?
```

#### 1.5 Admin & Data Management Requests
**Signal indicators:**
- User mentions: "admin", "dashboard", "analytics", "reporting", "bulk", "import", "export"
- References to data quality, synchronization, or bulk operations
- Questions about system health or monitoring

**Clarification questions to ask:**
- Is this for internal admin use or user-facing functionality?
- What data needs to be managed: grants, users, applications, content, integrations?
- Should bulk operations support dry-run/preview before execution?
- What reporting/analytics are most valuable: user metrics, grant coverage, application success rates?
- How should data consistency be ensured between multiple grant sources?

**Example dialogue:**
```
User: "Admins need to manage the grant database"
Assistant: I understand admin data management is a priority. Clarifications:
1. What's the primary admin workflow: viewing grants, updating grant data, importing new sources, detecting duplicates, archiving expired?
2. Should admins see quality metrics (missing fields, outdated deadlines, data conflicts)?
3. For grant imports, how should we detect and merge duplicates across sources?
4. Should there be audit trails for admin actions?
5. What's the approval/publishing flow for new grants before they're searchable?
```

---

## Stage 2: Context Injection

**Purpose:** Inject comprehensive GrantEase domain knowledge, technical architecture details, and established patterns into the user request.

### 2.1 Grant Domain Knowledge

**Core Concepts:**
- **Grant Types:** Federal grants, state grants, private foundation grants, nonprofit grants, emergency/disaster relief grants
- **Eligibility Factors:** Organization type (for-profit, nonprofit, education, government), location, budget size, sector/industry, prior grant experience, tax-exempt status, minority-owned/woman-owned business status
- **Grant Lifecycle:** Discovery → Application → Submission → Waiting → Result (Awarded/Rejected)
- **Key Grant Attributes:** Title, description, funder, eligibility criteria, funding amount (min/max), deadline, award amount, application requirements, documents needed
- **Common Grant Challenges:** Deadlines are imminent (hours/days), eligibility requirements are complex and interdependent, application requirements are custom per funder, grant sources are unreliable/outdated, matching users to grants at scale requires personalization

**Incorporation strategy:**
- When user requests grant search features, reference the multi-dimensional filtering model (category, eligibility, location, amount range, deadline type)
- When discussing application workflows, reference the complexity of grant-specific document types and requirement variations
- When discussing data quality, reference source reliability issues and deadline automation
- When discussing AI features, reference the personalization challenge of matching diverse user profiles to diverse grant opportunities

### 2.2 GrantEase Architecture

**Core Stack:**
- **Framework:** Next.js 14+ (App Router, server components, API routes)
- **Language:** TypeScript
- **Database:** Prisma ORM with PostgreSQL
- **Authentication:** NextAuth.js (social + credentials)
- **AI Engine:** Google Gemini API (embeddings, text generation, analysis)
- **UI Components:** Radix UI (headless, accessible primitives)
- **Styling:** Tailwind CSS + Pulse Grid design system (tokens, spacing, colors)
- **Animation:** Framer Motion (transitions, springs, choreography)
- **Validation:** Zod (schema validation, runtime type safety)
- **State Management:** React Context + URL params (search, filters, pagination)

**Key Patterns:**
- Server-side filtering and search (leverage Prisma query capabilities)
- Optimistic UI updates with React transitions
- Email-based alerts using background jobs
- Streaming responses for long-running AI operations
- Caching strategies for grant data (ISR, on-demand revalidation)
- Error boundaries for graceful AI feature degradation

**Incorporation strategy:**
- Recommend Next.js App Router for new routes (server-side filtering, streaming)
- Use Prisma for complex queries (grant filtering, saved search queries)
- Leverage Gemini for personalization without creating new database models
- Reference Pulse Grid tokens for consistent spacing/sizing
- Use Radix UI for accessible form inputs and interactive components
- Employ Framer Motion for result animations and state transitions

### 2.3 Feature Integration Points

**Core Features to Consider:**
1. **Grant Search/Discovery** → URL params, saved searches, email alerts, filter presets
2. **AI Grant Matching** → User profile data, eligibility answers, Gemini embeddings/scoring
3. **Application Workspaces** → Document management, requirement checklists, team collaboration
4. **Admin Dashboard** → Grant CRUD, data quality metrics, user analytics, bulk operations
5. **5-Step Onboarding** → Profile, eligibility, org type, preferences, vault setup
6. **AI Chat Assistant** → Grant navigation, application guidance, FAQ automation
7. **AI Writing Assistant** → Essay feedback, requirement mapping, content generation
8. **Grant Collections** → User-curated groups of related grants, sharing, tracking
9. **User Vault** → Saved documents, credentials, reusable answers
10. **Notification System** → Deadline alerts, grant matches, application milestones

**Incorporation strategy:**
- When discussing features, reference how they integrate with the broader GrantEase ecosystem
- For search, mention saved searches and alerts
- For applications, mention workspace collaboration and document vault
- For AI, mention user data sources and fallback strategies
- For onboarding, mention the 5-step structure and subsequent feature access

### 2.4 User & Data Models

**Core User Model:**
```
User {
  id, email, name, role (user/admin/super_admin)
  organization (nonprofit/for_profit/education/government)
  location (state), size (revenue/staff)
  eligibilityAnswers (cached), preferences
  createdAt, updatedAt, onboardingCompletedAt
}

Grant {
  id, title, description, category, funder
  eligibilityRequirements [], fundingAmount {min, max}
  deadline, awardAmount, applicationUrl
  source (federal/state/foundation/nonprofit), sourceId
  dataQuality {completeness, lastVerified}
  createdAt, updatedAt
}

SavedSearch {
  id, userId, name, filters {category[], eligibility[], location[], amountRange, deadline}
  alertsEnabled, alertEmail, lastRunAt
  createdAt
}

Application {
  id, userId, grantId, workspaceId, status (draft/in_progress/submitted/accepted/rejected)
  requirements [], documents [], checklist []
  collaborators [], notes, submittedAt
  createdAt, updatedAt
}

Workspace {
  id, userId, name, applications [], members []
  createdAt, updatedAt
}
```

**Incorporation strategy:**
- Reference relevant data models when discussing features
- For search, mention filters that map to Grant and SavedSearch models
- For applications, mention the Workspace and Application models
- For AI, mention how user eligibilityAnswers inform matching

---

## Stage 3: Requirement Expansion

**Purpose:** Transform the enhanced request into comprehensive, multi-dimensional requirements covering technical, UX, business, and edge case dimensions.

### 3.1 Standard Expansion Template

Each user request is expanded across these dimensions:

#### 3.1.1 Feature Requirements
**What needs to be built?**
- Core functionality: what is the primary feature or change?
- User interactions: what are the key user actions and flows?
- Data operations: what data is created, read, updated, deleted?
- Integration points: which existing features does this connect to?
- Success metrics: how do we measure if this works well?

#### 3.1.2 Technical Requirements
**How should it be implemented?**
- Architecture: server-side rendering, client-side, hybrid streaming?
- Database: new tables/fields, migrations, query patterns?
- API routes: new endpoints or modifications to existing ones?
- Validation: Zod schemas for request/response validation?
- Performance: caching, pagination, query optimization?
- Error handling: edge cases, fallback states, error messages?

#### 3.1.3 UX/Design Requirements
**How should it look and feel?**
- Page layout: component hierarchy, Pulse Grid spacing, responsive behavior?
- Interaction design: transitions, loading states, confirmation patterns?
- Accessibility: WCAG compliance, keyboard navigation, screen reader support?
- Mobile considerations: touch targets, responsive grids, landscape orientation?
- Design tokens: colors, typography, spacing from Pulse Grid system?
- Component library: which Radix UI and custom components to use?

#### 3.1.4 Business Logic Requirements
**What grant-specific logic applies?**
- Grant discovery: filter combinations, search ranking, relevance scoring?
- Eligibility: how to determine if a grant matches a user's profile?
- Deadlines: timezone handling, deadline approaching notifications, expired grant handling?
- Applications: status workflow, collaborative workflows, submission tracking?
- Data quality: handling incomplete grant data, outdated sources, duplicate detection?
- Compliance: user consent, data privacy, audit trails for sensitive operations?

#### 3.1.5 Edge Cases & Error States
**What can go wrong?**
- No results: empty states, suggestions, search refinement help
- Timeout/failure: API failures (Gemini, grant sources), graceful degradation
- Data inconsistency: duplicate grants, conflicting eligibility info, missing fields
- Large datasets: performance with thousands of results, pagination strategies
- Permission issues: unauthorized access, workspace access control, admin operations
- State conflicts: concurrent edits, application status races, stale cached data

### 3.2 Grant Search & Discovery Expansion

**User request:** "Add a search bar"

**Expanded requirements:**

**3.2.1 Feature Requirements**
- Full-text search on grant titles and descriptions
- Advanced filtering: category (federal/state/foundation/nonprofit), eligibility (auto-detected or user-provided), location (state), funding amount (range slider), deadline type (days until due)
- Filter presets for common combinations (e.g., "small nonprofits in CA", "women-owned businesses")
- Search result ranking: deadline proximity, funding amount, user eligibility match score
- Save search functionality with optional email alerts
- Search state persistence to URL parameters for shareable filter combinations
- Debounced text input to prevent excessive queries
- Clear filters button and individual filter removal

**3.2.2 Technical Requirements**
- API route: `GET /api/grants/search` with Prisma queries supporting:
  - Text search via full-text index or fuzzy matching
  - Numeric range filters (amount, deadline days)
  - Array/enum filters (category, eligibility)
  - Sorting and pagination (cursor-based or offset)
- Client-side URL param encoding/decoding for filter state persistence
- Debounce utility (300-500ms) on text input to reduce API calls
- Cache search results with 5-minute TTL for identical queries
- Handle Gemini embeddings for semantic similarity if available
- Zod schemas for search query validation and filter types

**3.2.3 UX/Design Requirements**
- Search bar prominently positioned in page header or above results
- Filter sidebar or collapsible filter panel (responsive on mobile)
- Individual filter pills showing active filters with X to remove
- Result cards with grant title, funder, deadline, funding amount, eligibility match indicator
- Pagination: show 20 results per page with next/previous navigation or infinite scroll
- Loading skeleton for results while search is in progress
- Empty state when no results match filters (suggest broadening criteria)
- Animations: Framer Motion for filter transitions, result card entrance
- Color-code by deadline urgency (red for <7 days, yellow for <30 days, green for >30 days)

**3.2.4 Business Logic Requirements**
- Eligibility matching: cross-reference user profile (org type, location, size) against grant requirements
- Deadline calculation: count days until deadline, mark as "deadline approaching" if <7 days
- Relevance scoring: combine user eligibility match, funding fit, deadline urgency
- Source handling: clearly attribute grants to source (federal.gov, state portal, foundation database)
- Data freshness: only show grants with deadline in future or recently expired (7 days)
- Saved search alerts: trigger email notifications when new grants match saved criteria (daily digest or immediate)

**3.2.5 Edge Cases & Error States**
- No results with all filters applied → suggest removing most restrictive filters
- Search timeout (Gemini API slow) → show cached results with "Loading latest matches..." banner
- Grant source is unreachable → show grants from other sources, notify admin
- Deadline parsing error → display raw deadline text with warning icon
- User hasn't completed onboarding → show modal recommending eligibility profile completion
- Very large result set (>1000) → paginate aggressively, offer export as CSV

---

### 3.3 Application Workspace Expansion

**User request:** "Users need to organize their applications"

**Expanded requirements:**

**3.3.1 Feature Requirements**
- Workspace dashboard showing all applications at a glance
- Individual application pages with:
  - Grant details card (title, funder, deadline, amount)
  - Requirements checklist with individual requirement tracking
  - Documents section for uploading and organizing required files
  - Notes/timeline for tracking application milestones
  - Status tracking (draft → in-progress → submitted → result)
- Multi-user collaboration: invite team members, assign tasks, comment on requirements
- Document versioning and history (who uploaded what, when)
- Integration with User Vault for reusing saved documents and credentials
- Export application details as PDF for offline reference
- Deadline-based sorting and urgency indicators

**3.3.2 Technical Requirements**
- New data models: Workspace, Application (with status enum), Requirement, Document, ApplicationComment
- Database migrations for relationships and constraints
- API routes:
  - `POST /api/workspaces` create workspace
  - `GET /api/workspaces/[id]` get workspace with applications
  - `POST /api/applications` create application from grant
  - `PUT /api/applications/[id]` update status, notes, assignments
  - `POST /api/applications/[id]/documents` upload document
  - `GET /api/applications/[id]/documents` list documents with versions
  - `POST /api/applications/[id]/comments` add comment/note
- File storage: integrate with cloud storage (S3, Supabase Storage) for document uploads
- Real-time updates: use WebSockets or polling for collaboration feedback
- Zod schemas for workspace/application/document creation and updates
- Permission checks: only workspace members can view/edit applications

**3.3.3 UX/Design Requirements**
- Workspace sidebar with workspace selection and quick-access to applications
- Application list view: cards showing grant title, deadline, status badge, last updated
- Application detail page layout: sidebar with navigation (details/checklist/documents/notes)
- Checklist UI: checkboxes for each requirement, visual progress indicator
- Documents section: drag-and-drop upload area, file previews, download/delete actions
- Notes timeline: chronological view of milestones and comments
- Collaboration indicator: show avatars of workspace members viewing the app
- Status workflow: dropdown to change status with confirmation dialog
- Mobile-responsive: stacked layout on mobile, collapsible sections
- Pulse Grid tokens for spacing, Radix UI for dialogs/dropdowns

**3.3.4 Business Logic Requirements**
- Status workflow: draft → in-progress (user signals started work) → submitted (user submits to funder) → pending (waiting for result) → result (accepted/rejected)
- Requirements automation: pull grant requirements from Grant data and create checklist items
- Document validation: check file type/size, require uploads for critical documents before status change to submitted
- Deadline notifications: alert user 7 days before deadline if application is not yet submitted
- Collaboration rules: workspace owner can add/remove members, assign requirements to members
- Audit trail: log all status changes, document uploads, permission changes
- Archive: allow workspaces to be archived but not deleted (for historical tracking)

**3.3.5 Edge Cases & Error States**
- Grant requirements change after user starts application → migration logic to add/remove requirements, flag as changed
- Document upload fails (file too large, network error) → allow retry with progress bar
- Multiple users editing checklist simultaneously → show live update badges, prevent status change race conditions
- User loses access to workspace (removed by owner) → gracefully redirect to workspaces list
- Grant deadline passes while application in draft → show warning banner, allow change to "abandoned"
- Document file corruption or deletion from storage → show error and allow re-upload
- User deletes final required document → prevent status change to submitted until re-uploaded

---

### 3.4 AI Grant Matching Expansion

**User request:** "Add AI matching to help users find relevant grants"

**Expanded requirements:**

**3.4.1 Feature Requirements**
- Personalized grant recommendations on user dashboard
- Matching score for each search result (0-100%)
- "Why this grant matches" explanation showing which eligibility criteria and interests align
- Recommendation refresh (daily or on-demand)
- AI matching considers: user organization type/size, location, sector/industry, previous applications, grant history
- Integration with grant search (show matched grants at top of results)
- Matching explainability: show which user attributes triggered the match

**3.4.2 Technical Requirements**
- Gemini API integration for:
  - User profile embedding (from eligibility answers + org data)
  - Grant content embedding (title, description, eligibility text)
  - Similarity scoring (cosine similarity of embeddings)
  - Match explanation generation (why this grant is relevant)
- Caching strategy: cache user embeddings for 24 hours, grant embeddings for 7 days
- Background job for daily recommendation generation (store in GrantUserMatch table)
- API route: `GET /api/recommendations` returning top 20 matches with scores and explanations
- Error handling: if Gemini API fails, fall back to rule-based matching (eligibility + location)
- Rate limiting: track Gemini API usage to stay within quota
- Streaming response for explanations if generation is slow
- Zod schema for match result format

**3.4.3 UX/Design Requirements**
- Recommendations carousel on dashboard: show top 10 grants with match score badges (95%, 87%, etc.)
- Match score visualization: progress bar or circular percentage
- "Why matched" tooltip: click to reveal explanation in a modal
- Search results: show match score next to grant title, sort by relevance (match score + deadline)
- Refresh button: allow user to request fresh recommendations (throttle to once per hour)
- AI indicator: subtle Gemini logo or "AI-powered match" text
- Loading state: skeleton cards while computing recommendations
- Mobile-friendly: swipeable carousel on mobile, simplified match score

**3.4.4 Business Logic Requirements**
- User data for matching: org type, location, revenue/staff size, sector, eligibility answers (from onboarding), previous applications
- Matching factors: eligibility match (primary), geographic fit, funding amount fit, deadline proximity, sector alignment
- Weighting: adjust match score based on relevance factors (deadline urgency weighted higher)
- Cold start: for new users, use rule-based matching until embeddings are computed
- Drift detection: if user eligibility changes (location, org size), recompute embeddings
- Privacy: never share user data with Gemini API except anonymized aggregates for quality metrics
- Transparency: user can see which attributes informed the match

**3.4.5 Edge Cases & Error States**
- Gemini API timeout (>30s) → show cached recommendations with "Last updated X hours ago" label
- Gemini API rate limit → queue recommendation jobs, prioritize by user creation date
- User has no onboarding data → skip matching, show generic popular grants + onboarding prompt
- Grant data is incomplete (missing description) → skip that grant from matching, log data quality issue
- Token limit exceeded for explanation generation → truncate explanation or show templated summary
- User updates eligibility mid-search → invalidate cached recommendations, offer to refresh
- Cold start (new user, new grant) → use rule-based matching for immediate feedback
- Matching produces low scores for all grants → suggest completing onboarding profile for better matches

---

### 3.5 Admin Dashboard Expansion

**User request:** "Admins need to manage the grant database"

**Expanded requirements:**

**3.5.1 Feature Requirements**
- Grant management: view all grants, edit fields, update deadlines, mark as archived
- Data quality dashboard: % complete, missing fields, outdated deadlines, duplicate grants
- Bulk operations: import grants from CSV/API, update multiple grants at once, delete expired grants
- Grant source management: configure external sources, sync frequency, error logs
- User analytics: total users, onboarding completion, active applications, grant views
- Duplicate detection: flag potential duplicate grants (similar title/funder)
- Grant approval workflow: new grants in "pending" status, admin reviews and publishes
- Activity logs: audit trail of admin actions (edits, deletions, imports)
- Settings: configure alert email addresses, sync schedules, data quality thresholds

**3.5.2 Technical Requirements**
- Database queries for analytics (aggregations, date ranges)
- API routes:
  - `GET /api/admin/grants` (all grants with filtering/sorting)
  - `PUT /api/admin/grants/[id]` (update grant data)
  - `DELETE /api/admin/grants/[id]` (soft delete with archival)
  - `POST /api/admin/grants/import` (bulk import with validation)
  - `GET /api/admin/analytics` (user and grant metrics)
  - `GET /api/admin/data-quality` (completeness and duplicate reports)
  - `POST /api/admin/sync` (trigger external source sync)
  - `GET /api/admin/logs` (activity audit trail)
- CSV parser and validator for bulk imports
- Duplicate detection algorithm: fuzzy string matching on title/funder
- Role-based access control: only admin/super_admin roles can access
- Zod schemas for bulk import validation

**3.5.3 UX/Design Requirements**
- Admin-only route: `/admin` with sidebar navigation to sections
- Grant table: sortable columns (title, funder, deadline, source, updated), search/filter, pagination
- Inline editing: quick edit for common fields (deadline, category, eligibility tags)
- Data quality heatmap: visual indicators (red/yellow/green) for each grant's completeness
- Bulk action toolbar: select multiple grants, apply actions (archive, update category, etc.)
- Import modal: file upload, preview of data to import, validation errors
- Analytics dashboard: key metrics as cards, charts for trends over time
- Activity log: timestamped list of admin actions with user/change details
- Confirmation dialogs: for destructive actions (delete, bulk archive)

**3.5.4 Business Logic Requirements**
- Data quality scoring: combine % fields filled, deadline validity, source recency
- Duplicate detection: run on import and daily, score confidence level
- Sync automation: pull new/updated grants from external sources on schedule
- Grant lifecycle: new → pending review → published (searchable) → archived (not searchable but retained)
- Approval workflow: new grants stay in draft until admin reviews and publishes
- Data validation: on import, validate deadline format, funding amount is numeric, category is recognized
- Source attribution: always track original source and sync timestamp
- Cleanup: auto-archive grants 30 days after deadline passes

**3.5.5 Edge Cases & Error States**
- Import file has formatting errors → show specific line/column errors, allow partial import
- External source API is unreachable → log error, try again next sync, alert admin
- Duplicate detection produces false positives → show similar grants to admin for review
- User tries to access admin panel without permission → 403 Forbidden, redirect to home
- Bulk update affects thousands of grants → show progress bar, allow background execution
- Grant has active applications when marked for deletion → prevent deletion, suggest archive
- Source provides duplicate grant data → detect and merge, consolidate to single record
- Admin updates grant eligibility requirements mid-application → existing applications stay on old version, new applications use new version

---

### 3.6 AI Chat Assistant Expansion

**User request:** "Add a chat assistant to help users navigate grants"

**Expanded requirements:**

**3.6.1 Feature Requirements**
- Conversational AI: answer questions about grants, onboarding, applications
- Context awareness: can reference user's saved grants, applications, eligibility profile
- Guidance: help users refine searches, understand eligibility, navigate application process
- FAQ automation: common questions (how to apply, eligibility checks, deadlines) answered from knowledge base
- Escalation: option to escalate to human support if AI can't help
- Chat history: persist conversation for continuity across sessions
- Quick actions: "Show me matching grants", "Help with eligibility", "Start application"

**3.6.2 Technical Requirements**
- Gemini API integration with prompt engineering for grant context
- Conversation storage: ConversationMessage table with user context
- Vector search: embed FAQ and help docs, search relevant ones for context
- Session management: maintain conversation state across page navigations
- API route: `POST /api/chat/message` and `GET /api/chat/messages`
- Real-time typing indicator and streaming response
- Rate limiting: prevent abuse (5 messages per minute per user)
- Error handling: graceful fallback if Gemini API unavailable
- Moderation: filter inappropriate requests, blocked topics

**3.6.3 UX/Design Requirements**
- Chat panel: persistent or slide-out panel, positioned at bottom-right
- Message bubbles: distinguish user vs assistant, show timestamps
- Typing indicator: animated dots while AI is responding
- Quick action buttons: show suggested next questions or actions
- Accessibility: keyboard navigation, screen reader support
- Mobile: adapt chat panel to mobile viewports (full-width on small screens)
- Loading state: skeleton for message while streaming response
- Error message: clear explanation if chat is unavailable

**3.6.4 Business Logic Requirements**
- Grant context: can reference user's saved grants, active applications by name
- Eligibility questions: answer based on user's onboarding profile and eligibility answers
- Application guidance: explain requirements, suggest document types, timeline advice
- Deadline awareness: mention upcoming deadlines in recommendations
- Knowledge base: train on Frequently Asked Questions, help docs, grant eligibility guides
- User privacy: don't expose other users' grants or application data
- Escalation: collect user contact info and open support ticket

**3.6.5 Edge Cases & Error States**
- User asks about grant not in database → acknowledge and suggest search
- Gemini API times out → show "Thinking..." spinner for longer, or suggest human support
- User context is too large for token limit → summarize recent grants/apps
- Inappropriate prompt (hate speech, threats) → refuse and suggest support contact
- Chat history exceeds storage limit → archive older conversations
- User is anonymous (not logged in) → offer login before enabling chat
- API rate limit exceeded → queue message, show "Sending..." indicator

---

### 3.7 5-Step Onboarding Expansion

**User request:** "Users are confused during signup"

**Expanded requirements:**

**3.7.1 Feature Requirements**
- Step 1: Profile (name, organization, role, contact info)
- Step 2: Organization Details (type: nonprofit/for-profit/education/government, size, location, sector)
- Step 3: Eligibility Profile (quick questions to determine grant eligibility, e.g., "Organization is minority-owned", "Have you received grants before")
- Step 4: Grant Preferences (interests: education, healthcare, small business, etc., preferred funding range, geographic focus)
- Step 5: Vault Setup (upload/create first saved document, e.g., organizational mission statement, financial statement)
- Progress indicator showing all 5 steps
- Back navigation to edit previous steps
- Skippable steps (recommended but not required)
- Email verification at end

**3.7.2 Technical Requirements**
- Multi-step form component using React state and validation
- Zod schemas for each step (enforcing types, required fields)
- Progress persistence: save step data to localStorage until completion
- Conditional fields: some questions/steps based on organization type
- File upload for vault step: cloud storage integration
- Email sending: verification email at completion
- Redirect: after completion, route to dashboard or grant search
- Analytics: track completion rate per step, dropout points

**3.7.3 UX/Design Requirements**
- Full-screen or modal onboarding flow
- Progress bar at top showing current step (1/5)
- Step title and description
- Form fields with inline validation errors
- Placeholder text or example values to guide users
- Next/Back/Skip buttons clearly labeled
- Accessibility: proper form labels, error associations, focus management
- Mobile: full-width form on mobile, possibly simplified questions
- Pulse Grid tokens: consistent spacing, color scheme

**3.7.4 Business Logic Requirements**
- Organization type determines grant categories shown in preferences
- Location (state) determines available federal/state grant filters
- Eligibility answers inform AI matching algorithms
- Completion is NOT required but strongly encouraged for better recommendations
- Vault document becomes first saved asset for reuse in applications
- Onboarding data feeds into admin user analytics

**3.7.5 Edge Cases & Error States**
- User navigates away mid-onboarding → save to localStorage, allow resume from same step
- User enters invalid email → show validation error, prevent progression
- File upload fails in Step 5 → allow skip or retry (vault is optional)
- User completes onboarding but then updates profile → allow re-visit to onboarding to update eligibility
- Organization type "other" selected → show free-text field for clarification
- Geographic location not found → suggest closest location or free-text entry
- User closes tab mid-step → on return, restore from localStorage

---

## Stage 4: Example Transformation & Pattern Injection

**Purpose:** Show concrete examples of how vague user requests are transformed into detailed specifications using GrantEase-specific patterns.

### 4.1 Example 1: "Add a search bar"

**Original user request:**
"We need a search bar on the grants page so users can find grants more easily."

**Stage 1 - Clarification:**
"I understand you want a search feature. A few quick questions:
1. Should this search support both text (grant title/description) and filters (category, amount, deadline)?
2. What's the priority: quick text search or powerful filtering for power users?
3. Should searches be saved so users can receive email alerts for new matching grants?
4. Should search results be sortable, and by what criteria (deadline, relevance, amount)?"

**Stage 2 - Context Injection:**
The GrantEase platform already has grant data with structured fields (category, eligibility, location, deadline, funding amount). Users are discovering grants across multiple sources (federal, state, foundation). The core challenge is matching diverse user profiles to diverse opportunities within minutes of a deadline.

**Stage 3 - Expansion:**
This becomes a multi-part feature:
- **Text search** on grant titles/descriptions with debouncing
- **Category filter** supporting multi-select (federal, state, nonprofit foundation, etc.)
- **Eligibility smart filter** auto-detecting user org type and suggesting relevant grants
- **Location filter** for geographic targeting (state-level)
- **Funding range** slider for min/max amounts
- **Deadline filter** showing grants by urgency (< 7 days, < 30 days, < 90 days)
- **Search saving** to create reusable saved searches with optional email alerts
- **URL parameters** to make searches shareable
- **Result ranking** combining deadline urgency, user eligibility match, and funding fit

**Stage 4 - Example Transformation:**
```
VAGUE REQUEST:
"Add a search bar"

TRANSFORMED SPECIFICATION:
Feature: Advanced Grant Discovery Search

User Story:
"As a nonprofit executive, I want to quickly discover federal and state grants matching
my organization's focus areas (education, healthcare) and location (California) so I can
identify funding opportunities before deadlines pass."

Detailed Requirements:

1. SEARCH INTERFACE
   - Text input with placeholder: "Search grants by title, funder, or keywords..."
   - Debounced search (500ms) to avoid excessive API calls
   - Real-time results as user types (show loading skeleton)
   - Quick clear button (X icon) to reset search

2. FILTER SIDEBAR (expandable on mobile)
   - Category multi-select: Federal, State, Foundation, Nonprofit
   - Eligibility quick-filter: "Nonprofits", "Women-owned", "Minority-owned" (based on user org type)
   - Location: State dropdown with "All states" option
   - Funding Amount: Range slider ($0 - $500K+) with custom range input
   - Deadline Type: Buttons for "< 7 days", "< 30 days", "< 90 days", "All"
   - "Clear all filters" link

3. RESULTS DISPLAY
   - Grant card showing: Title, Funder, Deadline (with countdown days), Funding Amount, Eligibility Match %
   - Cards sorted by deadline urgency first, then relevance match score
   - Pagination: 20 results per page with next/previous navigation
   - Empty state: "No grants match your criteria. Try broadening your search." with suggestions
   - Save search button: "Save this search and get email alerts" with toggle for notifications

4. TECHNICAL IMPLEMENTATION
   - API: GET /api/grants/search?q=query&category=federal,state&location=CA&amountMin=0&amountMax=500000&deadlineType=urgent
   - Database: Prisma query with text search, range filters, sorting
   - Cache: 5-minute TTL for identical queries to reduce DB load
   - Error handling: If search timeout > 3s, show "Searching..." with fallback to cached results

5. MOBILE CONSIDERATIONS
   - Search bar fixed at top of results
   - Filters in collapsible panel (swipe from left or button toggle)
   - Full-width grant cards
   - Touch-friendly filter controls (large slider, big buttons)

6. ACCESSIBILITY
   - ARIA labels on search input: aria-label="Search grants"
   - Filter labels properly associated with inputs
   - Keyboard navigation: Tab through filters, Enter to apply
   - Screen reader announces result count: "23 grants found"

7. EDGE CASES
   - No results: Suggest removing most restrictive filters or expanding date range
   - Slow search (API timeout): Show cached results with "Results may be outdated" banner
   - Grant deadline in past: Still show but mark as "Deadline passed" with disabled application button
   - User completes onboarding: Pre-fill Location and Eligibility filters based on profile

8. SUCCESS METRICS
   - Search completion rate (% of users who search vs. browse)
   - Filter usage (% of users who use filters vs. text-only search)
   - Save search conversion (% who save searches and enable alerts)
   - Time to first grant view (does search reduce time vs. browsing?)
```

---

### 4.2 Example 2: "Fix the header"

**Original user request:**
"The header looks cluttered. We should improve it."

**Stage 1 - Clarification:**
"I understand the header needs attention. Let me ask:
1. What's most important in the header for grant-focused users (search, saved grants, notifications, profile)?
2. Should the header show real-time notifications (new matching grants, deadline alerts)?
3. Is the header the same on all pages or customized per section?
4. Do you want breadcrumb navigation for context (e.g., Workspace → Application → Document)?"

**Stage 2 - Context Injection:**
The GrantEase header currently shows the logo, navigation links, and user menu. The design system uses Pulse Grid tokens for spacing and colors. Key user needs: quick access to saved grants, awareness of grant notifications, active workspace indicator, and onboarding progress.

**Stage 3 - Expansion:**
The header serves multiple roles: branding, navigation hub, notification center, and context indicator. It must work across grant discovery, application workspaces, admin dashboard, and onboarding flows.

**Stage 4 - Example Transformation:**
```
VAGUE REQUEST:
"Fix the header"

TRANSFORMED SPECIFICATION:
Feature: Streamlined Header & Navigation

Current Problems:
- Logo, nav, user menu all compete for space
- No notification indicator (users miss new grant matches)
- Workspace context not visible (users lose context switching between pages)
- Mobile header is difficult to navigate
- Alert badges pile up visually

Redesigned Header Structure:

1. LAYOUT (Desktop 1440px)
   [Logo] [Search/Filter toggle] [Active Workspace] [Notifications] [User Menu]

   [Logo - 200px]
     - GrantEase wordmark + icon
     - Clickable to home or workspace switcher

   [Search/Filter - 300px]
     - Quick search bar: "Search grants, applications..."
     - Click to expand full search modal if needed

   [Active Workspace - 150px]
     - Workspace name and icon (if in workspace)
     - Dropdown to switch workspaces
     - Hidden if not in workspace context

   [Notifications - 80px]
     - Bell icon with badge count (0-9+)
     - Dropdown to show: New matches, Deadline alerts, Application updates
     - Clear notifications link

   [User Menu - 100px]
     - User avatar with initial
     - Dropdown: Profile, Settings, Onboarding status, Sign out

2. RESPONSIVE MOBILE (375px)
   [Menu icon] [Logo] [Notifications badge] [User avatar]

   - Hamburger menu toggles sidebar with: Search, Workspace switcher, Nav links
   - Notifications and user menu icons always visible
   - Workspace name hidden (shown in hamburger menu)
   - Full-width search modal on click

3. VISUAL DESIGN (Pulse Grid Tokens)
   - Background: --color-surface-primary (white/dark mode)
   - Border: --color-border-subtle (divider line bottom)
   - Text: --color-text-primary for nav links
   - Spacing: --space-md (16px) for padding, --space-sm (8px) for gaps
   - Typography: --font-size-sm for labels, --font-weight-medium for active nav
   - Hover: --color-background-hover (subtle highlight)

4. NOTIFICATION BADGE DESIGN
   - Badge color: --color-status-alert (red for urgent deadlines < 3 days)
   - Badge position: top-right corner of bell icon
   - Animation: Framer Motion pulse on new notification
   - Tooltip: Hover shows "3 new matches, 1 deadline alert"

5. ACTIVE WORKSPACE INDICATOR
   - Shows: "[Workspace Name] - Application Name" or "[Workspace Name]"
   - Prevents user disorientation when managing multiple applications
   - Click to switcher modal
   - Color-coded by workspace (optional: user-selected color)

6. ACCESSIBILITY
   - ARIA labels: aria-label="Search grants and applications"
   - Navigation landmark: <nav> wrapper
   - Active page indicator: aria-current="page"
   - Skip link: "Skip to main content" link
   - Keyboard: Tab through all header items, Enter/Space to activate

7. INTERACTION PATTERNS
   - Logo click: Home if on other page, workspace switcher if in workspace
   - Search click: Expand full search modal with all filters visible
   - Notification click: Toggle dropdown, auto-close on selection
   - Workspace dropdown: Show recent workspaces first, search if many
   - User menu: Smooth slide-down animation, click outside closes

8. EDGE CASES
   - User has no workspaces: Show "Welcome" and onboarding CTA in workspace area
   - User has 10+ workspaces: Add search/filter in workspace switcher
   - Many notifications (10+): Show "3 more" with number, pagination in dropdown
   - Header width < 768px: Collapse to mobile layout
   - User role is admin: Show admin dashboard link in user menu

9. TECHNICAL IMPLEMENTATION
   - Component: `<Header>` in layout root (all pages share)
   - State: useContext for active workspace, useNotifications hook for badge count
   - Real-time: WebSocket or polling for notification updates
   - Animation: Framer Motion for notification pulse, dropdown slide
   - Mobile menu: Radix UI Dialog for sidebar, dismissable outside click

10. SUCCESS METRICS
    - Header interaction rate (% who click notifications, workspace switcher)
    - Notification click-through (% who view notification details)
    - Mobile header usability (completion rate without accidental touches)
    - Time to switch workspaces (reduced cognitive load)
```

---

### 4.3 Example 3: "Add a support form"

**Original user request:**
"Users want to contact support for help with grants."

**Stage 1 - Clarification:**
"Great idea for user support. Quick clarifications:
1. Should this be a general support form or grant-specific (asking about specific grant)?
2. Should the form integrate with an existing ticketing system?
3. What information is critical to collect (email, topic, description, attachment)?
4. Should AI chat be offered as first-line support to deflect common questions?"

**Stage 2 - Context Injection:**
GrantEase users encounter various support needs: understanding eligibility, application guidance, grant data corrections, account issues. The platform has both AI chat and human support channels. Zod validation ensures data quality before submission.

**Stage 3 - Expansion:**
Support form is not just a contact form but a triage system routing requests to appropriate channels (AI chat for FAQ, human support for complex issues, grant correction reports).

**Stage 4 - Example Transformation:**
```
VAGUE REQUEST:
"Add a support form"

TRANSFORMED SPECIFICATION:
Feature: Multi-Channel Grant-Specific Support Form

User Story:
"As a nonprofit applying for a federal grant, I want to ask GrantEase support about
specific eligibility requirements so I don't spend hours on an ineligible grant."

Support Flow:

1. SUPPORT ENTRY POINTS
   - Header: "Help" button or "?" icon
   - Sidebar: "Get Help" link in main navigation
   - Contextual: "Contact support about this grant" from grant detail page
   - Application workspace: "Need help with this requirement?" link per requirement

2. SUPPORT TRIAGE (Smart Routing)

   Step 1: Issue Type Selection
   - Radio buttons:
     [ ] "Question about a grant" → Pre-fill grant ID from context
     [ ] "Help with my application" → Pre-fill application ID
     [ ] "Report incorrect grant data" → Link to correction form
     [ ] "Account/technical issue" → Route to account support
     [ ] "Feedback/feature request" → Route to product team
     [ ] "Other" → Free-text category

   Step 2: Category-Specific Follow-up

   IF "Question about a grant":
     - Grant field (searchable dropdown, pre-filled if available)
     - Specific question type (radio):
       [ ] "Eligibility" → Route to AI chat first (FAQ about eligibility)
       [ ] "Requirements" → Route to AI chat (explain document needs)
       [ ] "Application process" → Route to AI chat (step-by-step guide)
       [ ] "Grant timeline/deadline" → Direct answer from grant data
       [ ] "Funder contact information" → Direct answer from grant data
       [ ] "Something else"
     - Message field: "What's your specific question?"
     - AI chat widget: "Let me help answer your question..." (try to resolve)
     - If not resolved by chat: "I couldn't fully answer that. Would you like to contact human support?"

   IF "Help with my application":
     - Application dropdown (list user's applications)
     - Requirement dropdown (list checklist items from selected application)
     - Message: "What do you need help with for this requirement?"
     - Attachment: "Upload a draft or document for feedback" (optional)
     - Route to human support (writing assistant not sufficient)

   IF "Report incorrect grant data":
     - Grant field (searchable dropdown)
     - Error type (radio):
       [ ] "Deadline is wrong"
       [ ] "Eligibility requirement is missing/wrong"
       [ ] "Funding amount is incorrect"
       [ ] "Funder contact is wrong"
       [ ] "Grant is no longer available"
       [ ] "Other"
     - Description: "What's the issue? How should it be corrected?"
     - Source: "Where did you find the correct information?" (URL/doc)
     - Route to data quality/admin team

   IF "Account/technical issue":
     - Issue type (radio):
       [ ] "Can't log in"
       [ ] "Document upload failed"
       [ ] "Can't save search"
       [ ] "Performance issue"
       [ ] "Other"
     - Browser/device info: "Browser: Chrome 121, OS: macOS, Device: Desktop"
     - Description: "What happened? What did you expect?"
     - Route to technical support

3. SUBMISSION & CONFIRMATION

   Form Submission:
   - Validate required fields (Zod schema)
   - Show "Submitting..." state
   - Send confirmation email: "We received your request. Ticket #12345"

   Routing Logic:
   - AI chat answers (eligibility, requirements, process) → No ticket created, user gets answer inline
   - Grant data corrections → Create ticket, notify data quality team
   - Application help → Create ticket, offer writing assistant link
   - Account/technical → Create ticket with browser info, route to engineering
   - Feedback/feature → Create issue in product backlog

   Confirmation Message:
   - If routed to AI chat: "Got it! Let me look into this..." (show chat response)
   - If ticket created: "Your support request #12345 has been received. We'll get back to you within 24 hours."
   - If urgent (grant deadline < 24 hours): "This looks urgent! We've prioritized your request."

4. FORM DESIGN & UX

   Layout:
   - Modal or page (page if opened from Help link, modal if in-context)
   - Progress indicator: Step 1/2 or 1/3 depending on type
   - Back button to change issue type

   Styling (Pulse Grid):
   - Input fields: --color-input-background
   - Labels: --font-weight-medium, --font-size-sm
   - Help text: --color-text-secondary, --font-size-xs
   - Button: Primary button for "Next"/"Submit"
   - Error states: --color-status-error, inline error messages

   Mobile Optimization:
   - Full-screen modal on mobile
   - Single column layout
   - Large touch targets (44px minimum)
   - Simplified AI chat widget

5. TECHNICAL IMPLEMENTATION

   API Routes:
   - POST /api/support/create-ticket
     Request: { issueType, category, grantId?, applicationId?, message, attachments? }
     Response: { ticketId, estimatedResponse, aiChatStarted? }

   - POST /api/support/ai-answer
     Request: { issueType, category, context (grantId/appId) }
     Response: { answer, resolved (boolean), suggestTicket (boolean) }

   - POST /api/support/report-grant-data
     Request: { grantId, errorType, description, source }
     Response: { ticketId, thankyou_message }

   Data Models:
   - SupportTicket: id, userId, issueType, category, grantId, applicationId, message, status, createdAt, respondedAt
   - GrantDataCorrection: id, grantId, errorType, description, sourceUrl, createdBy, verified, merged

   File Upload:
   - Cloud storage (S3/Supabase) for attachments
   - Validate file type (PDF, DOCX, images only)
   - Max 10MB per file, 3 files total
   - Auto-delete attachments after 90 days

   Validation (Zod):
   ```typescript
   const SupportFormSchema = z.object({
     issueType: z.enum(['grant_question', 'application_help', 'data_error', 'account_issue', 'feedback']),
     category: z.string().min(1).max(50),
     grantId: z.string().uuid().optional(),
     message: z.string().min(10).max(2000),
     attachments: z.array(z.instanceof(File)).max(3).optional(),
   });
   ```

6. EDGE CASES & ERROR STATES

   - Grant not found in dropdown → Free-text field "Grant name or funder?"
   - User uploads non-PDF document → Explain accepted formats, offer conversion
   - Support chat AI timeout → "Thanks for your question. A human will review shortly."
   - Grant deadline is < 2 hours → Escalate to urgent queue, show "We'll prioritize this"
   - User submitted identical ticket twice → Detect duplicate, merge, notify user of ticket #
   - Attachment is larger than limit → Show "File too large (15MB limit). Please compress or upload to Google Drive and share link."
   - User hasn't completed onboarding → Suggest completing profile for better support routing
   - Ticket status page: User can view their open tickets, estimated wait time, chat with support agent

7. FOLLOW-UP & TRACKING

   Support Ticket Lifecycle:
   - Created: Confirmation email sent
   - Assigned: "Your support agent is Jane M."
   - In Progress: "We're working on your ticket. You'll hear from us by EOD."
   - Waiting for User: "Please provide the grant ID so we can help further"
   - Resolved: "Your issue has been resolved. Ticket #12345 is closed."
   - Reopenable: User can reopen within 7 days

   Notifications:
   - Email on ticket creation (confirmation #, estimated wait)
   - Email when assigned to agent
   - Email when agent replies (inline in email)
   - Email when resolved

8. SUCCESS METRICS
   - Support form usage (% of users who submit forms)
   - AI chat resolution rate (% resolved without human intervention)
   - Time to resolution (target: < 24 hours)
   - User satisfaction (follow-up survey)
   - Grant data correction accuracy (% of corrections verified and applied)
```

---

## Stage 5: Implementation Guidance & Rollout Strategy

**Purpose:** Provide actionable implementation patterns, file organization, testing strategies, and rollout considerations specific to GrantEase.

### 5.1 Implementation Pattern Library

#### 5.1.1 Server-Side Grant Search Pattern

```typescript
// app/api/grants/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchGrantsSchema } from '@/lib/validation';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const filters = searchGrantsSchema.parse(query);

    // Build Prisma query with filters
    const grants = await prisma.grant.findMany({
      where: {
        ...(filters.q && {
          OR: [
            { title: { search: filters.q } },
            { description: { search: filters.q } },
          ],
        }),
        ...(filters.category && { category: { in: filters.category } }),
        ...(filters.location && { location: filters.location }),
        ...(filters.amountMin && filters.amountMax && {
          fundingAmount: {
            gte: filters.amountMin,
            lte: filters.amountMax,
          },
        }),
        ...(filters.deadlineBefore && {
          deadline: { lte: new Date(filters.deadlineBefore) },
        }),
        status: 'published', // Only published grants
        deadline: { gt: new Date() }, // Not expired
      },
      orderBy: [
        { deadline: 'asc' }, // Deadline urgency first
        { relevanceScore: 'desc' }, // Then relevance
      ],
      take: 20,
      skip: filters.skip || 0,
    });

    return NextResponse.json({
      grants,
      count: grants.length,
      hasMore: grants.length === 20,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

#### 5.1.2 Debounced Search Component Pattern

```typescript
// components/GrantSearch.tsx
'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash-es';
import { Input } from '@/components/ui/input';

export function GrantSearch() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set('q', value);
        } else {
          params.delete('q');
        }
        router.push(`/grants?${params.toString()}`);
      });
    }, 500),
    [router, searchParams]
  );

  return (
    <div className="relative">
      <Input
        placeholder="Search grants..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        disabled={isPending}
      />
      {isPending && <span className="text-xs text-gray-400">Searching...</span>}
    </div>
  );
}
```

#### 5.1.3 AI Grant Matching Pattern

```typescript
// lib/ai/matchGrants.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

interface UserProfile {
  orgType: string;
  location: string;
  sector: string;
  eligibilityAnswers: Record<string, string>;
}

export async function computeGrantMatches(userId: string, userProfile: UserProfile) {
  try {
    // Get all published grants
    const grants = await prisma.grant.findMany({
      where: { status: 'published', deadline: { gt: new Date() } },
      select: { id: true, title: true, description: true, eligibilityText: true },
    });

    // Use Gemini to compute embeddings and matches
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });

    const userEmbed = await model.embedContent(
      formatUserProfile(userProfile)
    );

    const matches = await Promise.all(
      grants.map(async (grant) => {
        const grantEmbed = await model.embedContent(grant.description);
        const score = cosineSimilarity(userEmbed.embedding, grantEmbed.embedding);
        return { grantId: grant.id, score, explanation: '' };
      })
    );

    // Generate explanations for top matches
    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    for (const match of topMatches) {
      const grant = grants.find((g) => g.id === match.grantId);
      const explanation = await generateExplanation(
        userProfile,
        grant,
        model
      );
      match.explanation = explanation;
    }

    // Store matches for caching
    await prisma.grantUserMatch.createMany({
      data: topMatches.map((m) => ({
        userId,
        grantId: m.grantId,
        matchScore: m.score,
        explanation: m.explanation,
      })),
    });

    return topMatches;
  } catch (error) {
    console.error('Grant matching error:', error);
    // Fallback to rule-based matching
    return await rulBasedMatching(userProfile, prisma);
  }
}

function formatUserProfile(profile: UserProfile): string {
  return `
    Organization Type: ${profile.orgType}
    Location: ${profile.location}
    Sector: ${profile.sector}
    Eligibility: ${JSON.stringify(profile.eligibilityAnswers)}
  `;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, x, i) => sum + x * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const normB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  return dotProduct / (normA * normB);
}

async function generateExplanation(
  userProfile: UserProfile,
  grant: any,
  model: any
): Promise<string> {
  const prompt = `
    Why is this grant a good match?

    Organization: ${userProfile.orgType} in ${userProfile.location}
    Grant: ${grant.title}
    Grant description: ${grant.description}

    Provide a 1-sentence explanation.
  `;

  const response = await model.generateContent(prompt);
  return response.response.text();
}
```

#### 5.1.4 Application Workspace Component Pattern

```typescript
// app/workspaces/[id]/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { ApplicationList } from './components/ApplicationList';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';

export default async function WorkspacePage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) redirect('/auth/signin');

  // Fetch workspace with permission check
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: {
      members: true,
      applications: {
        include: {
          grant: true,
          checklist: true,
          documents: true,
        },
        orderBy: { deadline: 'asc' },
      },
    },
  });

  if (!workspace) {
    redirect('/workspaces');
  }

  // Check permission
  const isMember = workspace.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    redirect('/workspaces');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <WorkspaceSidebar workspace={workspace} />
      <div className="flex-1 overflow-auto">
        <ApplicationList applications={workspace.applications} workspaceId={workspace.id} />
      </div>
    </div>
  );
}
```

#### 5.1.5 Error Boundary for AI Features Pattern

```typescript
// components/AIFeatureErrorBoundary.tsx
'use client';

import { ReactNode } from 'react';
import { useErrorHandler } from 'react-error-boundary';

interface AIFeatureErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  feature: string; // e.g., 'matching', 'chat', 'writing'
}

export function AIFeatureErrorBoundary({
  children,
  fallback,
  feature,
}: AIFeatureErrorBoundaryProps) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`${feature} AI feature error:`, error);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          The {feature} feature is temporarily unavailable.
          {feature === 'matching' && ' Using basic filtering instead.'}
          {feature === 'chat' && ' Please contact support for help.'}
        </p>
        {fallback}
      </div>
    );
  }
}
```

---

### 5.2 Grant-Specific Edge Case Handlers

#### 5.2.1 No Results Handler

```typescript
// components/NoGrantsResults.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function NoGrantsResults() {
  const searchParams = useSearchParams();
  const hasFilters = Array.from(searchParams.entries()).length > 0;

  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold">No grants found</h3>
      <p className="text-gray-600 mt-2">
        {hasFilters
          ? 'Your filters were too specific. Try adjusting them.'
          : 'Get started by searching for a grant or exploring categories.'}
      </p>

      {hasFilters && (
        <div className="mt-4 space-x-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Adjust Filters
          </Button>
          <Button variant="link" onClick={() => window.location.href = '/grants'}>
            Clear All Filters
          </Button>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>💡 Tip: Save your search to get notified when new matching grants are added.</p>
      </div>
    </div>
  );
}
```

#### 5.2.2 Deadline Approaching Handler

```typescript
// lib/utils/deadlineHandlers.ts
export function getDeadlineStatus(deadline: Date) {
  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return { status: 'expired', label: 'Deadline Passed', color: 'red' };
  } else if (daysUntil === 0) {
    return { status: 'today', label: 'Deadline Today', color: 'red' };
  } else if (daysUntil <= 3) {
    return { status: 'urgent', label: `${daysUntil}d left`, color: 'red' };
  } else if (daysUntil <= 7) {
    return { status: 'soon', label: `${daysUntil}d left`, color: 'yellow' };
  } else {
    return { status: 'open', label: `${daysUntil}d left`, color: 'green' };
  }
}

export function shouldShowDeadlineAlert(deadline: Date): boolean {
  const daysUntil = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil <= 7 && daysUntil >= 0;
}
```

#### 5.2.3 Gemini API Timeout Handler

```typescript
// lib/ai/withGeminiTimeout.ts
export async function withGeminiTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs = 10000,
  fallbackValue?: T
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), timeoutMs)
    ),
  ]).catch((error) => {
    if (fallbackValue !== undefined) {
      console.warn('Gemini API timeout, using fallback:', error);
      return fallbackValue;
    }
    throw error;
  });
}

// Usage in API route:
const recommendations = await withGeminiTimeout(
  () => computeGrantMatches(userId, userProfile),
  5000, // 5 second timeout
  [] // Fallback to empty recommendations
);
```

#### 5.2.4 Grant Data Normalization Handler

```typescript
// lib/grants/normalizeGrantData.ts
import { z } from 'zod';

const GrantDataSchema = z.object({
  title: z.string().min(5).max(500),
  deadline: z.string().refine(isValidDate, 'Invalid deadline date'),
  fundingAmount: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).refine(d => d.min <= d.max, 'Min must be <= max'),
  eligibility: z.array(z.string()).default([]),
  category: z.enum(['federal', 'state', 'foundation', 'nonprofit']),
});

export async function normalizeAndValidateGrant(rawData: any) {
  try {
    return GrantDataSchema.parse(rawData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Grant validation errors:', error.errors);
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path}: ${e.message}`),
      };
    }
    throw error;
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
```

---

### 5.3 Testing Strategy

#### 5.3.1 Search Feature Tests

```typescript
// __tests__/grants/search.test.ts
import { GET } from '@/app/api/grants/search/route';
import { createMockRequest } from '@/test-utils';

describe('Grant Search API', () => {
  it('should return grants matching text query', async () => {
    const request = createMockRequest({
      searchParams: { q: 'education' },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.grants).toBeDefined();
    expect(data.grants.some((g) => g.title.toLowerCase().includes('education'))).toBe(true);
  });

  it('should filter by category', async () => {
    const request = createMockRequest({
      searchParams: { category: 'federal' },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(data.grants.every((g) => g.category === 'federal')).toBe(true);
  });

  it('should return 400 for invalid filters', async () => {
    const request = createMockRequest({
      searchParams: { amountMin: 'invalid' },
    });
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('should exclude expired grants', async () => {
    const request = createMockRequest({
      searchParams: {},
    });
    const response = await GET(request);
    const data = await response.json();

    expect(data.grants.every((g) => new Date(g.deadline) > new Date())).toBe(true);
  });
});
```

#### 5.3.2 Workspace Collaboration Tests

```typescript
// __tests__/workspaces/collaboration.test.ts
describe('Workspace Collaboration', () => {
  it('should allow workspace owner to add members', async () => {
    // Create workspace as user1
    const workspace = await createWorkspace(user1);

    // Add user2 as member
    const response = await addWorkspaceMember(workspace.id, user2.email);

    expect(response.status).toBe(200);
    expect(response.data.members).toContain(user2.id);
  });

  it('should prevent non-members from viewing workspace', async () => {
    const workspace = await createWorkspace(user1);
    const response = await getWorkspace(workspace.id, user3);

    expect(response.status).toBe(403);
  });

  it('should track document version history', async () => {
    const application = await createApplication(workspace);

    // Upload document v1
    await uploadDocument(application.id, file1);

    // Upload document v2 (same file)
    await uploadDocument(application.id, file2);

    const versions = await getDocumentVersions(application.id);
    expect(versions.length).toBe(2);
    expect(versions[1].uploadedBy).toBe(user1.id);
  });
});
```

#### 5.3.3 AI Feature Fallback Tests

```typescript
// __tests__/ai/matching-fallback.test.ts
describe('AI Grant Matching Fallback', () => {
  it('should fall back to rule-based matching if Gemini API fails', async () => {
    // Mock Gemini API to fail
    jest.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn(() => ({
        getGenerativeModel: () => ({
          embedContent: jest.fn().mockRejectedValue(new Error('API Error')),
        }),
      })),
    }));

    const result = await computeGrantMatches(user1.id, userProfile);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].matchScore).toBeDefined(); // Rule-based score
  });

  it('should timeout gracefully if Gemini takes too long', async () => {
    const result = await withGeminiTimeout(
      () => new Promise(() => {}), // Never resolves
      100, // 100ms timeout
      [] // Fallback
    );

    expect(result).toEqual([]);
  });
});
```

---

### 5.4 Rollout Strategy for Grant Features

#### 5.4.1 Search Feature Rollout

```yaml
Phase 1: Internal Testing (Week 1)
- Deploy to staging environment
- Test with 5-10 sample grants
- Validate Prisma queries performance
- Confirm debouncing works as expected

Phase 2: Beta Rollout (Week 2-3)
- Enable for 10% of users (feature flag: GRANT_SEARCH_ENABLED)
- Monitor search performance, error rates
- Collect user feedback via in-app survey
- Set up alerts for slow queries (>2s)

Phase 3: Gradual Rollout (Week 4-6)
- Increase to 25%, then 50%, then 100%
- Monitor at each step for:
  - API response time (target: <500ms)
  - Empty result rate (should be <20%)
  - Search success rate (users finding grants)
  - Database query load

Phase 4: Optimization (Week 7+)
- Add search analytics (popular queries, zero-result queries)
- Improve suggestions for zero-result queries
- Add saved searches and alerts feature
```

#### 5.4.2 AI Matching Feature Rollout

```yaml
Phase 1: Rule-Based Matching (Week 1)
- Deploy rule-based matching as fallback
- Verify matching logic with test user profiles
- Test with different organization types

Phase 2: Gemini Integration (Week 2)
- Deploy Gemini embeddings (staging only)
- Compare Gemini vs. rule-based matches
- Validate explanation generation quality
- Monitor API quotas and costs

Phase 3: Gradual Rollout (Week 3-4)
- Enable for 5% of users
- A/B test: Gemini vs. rule-based matching
- Measure: user engagement, match relevance ratings
- Collect feedback

Phase 4: Full Rollout (Week 5+)
- Increment to 100% as Gemini results are validated
- Monitor: explanation accuracy, user satisfaction
- Cache frequently matched grants for performance

Fallback Strategy:
- If Gemini API fails for any user: show rule-based matches
- If Gemini rate-limited: queue requests, serve from cache
- If explanation generation times out: show simplified score only
```

#### 5.4.3 Onboarding Flow Rollout

```yaml
Phase 1: Current Flow Only (Baseline)
- Measure: completion rate, dropout points
- Target: >80% completion on desktop, >60% on mobile

Phase 2: Enhanced Flow (Staged)
- Add contextual help tooltips to Step 2 (Organization Details)
- Add examples to Step 3 (Eligibility Profile)
- Deploy to 50% of new users

Phase 3: Measure & Iterate
- Compare: original vs. enhanced completion rates
- Optimize questions with highest dropout
- Simplify language where necessary

Phase 4: Mobile Optimization
- Simplify form fields for small screens
- Test Step 5 (Vault) file upload on mobile
- Reduce to 3-4 critical questions if needed

Success Metrics:
- Completion: >85% complete all 5 steps
- Time: <5 minutes average (target: 3 minutes)
- Satisfaction: >4/5 stars in post-onboarding survey
- Impact: Users who complete onboarding get 50% more grant matches
```

---

### 5.5 Monitoring & Success Metrics

#### 5.5.1 Grant Search Metrics

```typescript
// lib/metrics/search.ts
export const SEARCH_METRICS = {
  // Performance
  searchLatency: 'Duration from query to results in milliseconds',
  emptyResultRate: 'Percentage of searches returning zero results',
  apiErrorRate: 'Percentage of search requests that fail',

  // Engagement
  searchesPerUser: 'Average number of searches per active user per week',
  resultsClickThroughRate: 'Percentage of search results that users click',
  saveSearchRate: 'Percentage of users who save their search',

  // Quality
  filterUsageRate: 'Percentage of searches that use filters beyond text',
  averageResultsPerSearch: 'Average number of grants shown',
  deadlineDistribution: 'Distribution of deadline urgency in results',

  // Business
  searchToApplicationRate: 'Percentage of searched grants that lead to applications',
  userSearchRetention: 'Percentage of searchers who return within 7 days',
};

// Example implementation
export async function logSearchMetric(userId: string, metric: string, value: number) {
  await prisma.metric.create({
    data: {
      userId,
      type: 'SEARCH',
      metric,
      value,
      timestamp: new Date(),
    },
  });
}
```

#### 5.5.2 AI Matching Metrics

```typescript
export const MATCHING_METRICS = {
  // Accuracy
  matchRelevanceScore: 'User rating of match quality (1-5 stars)',
  matchAcceptanceRate: 'Percentage of recommended grants user applies for',
  explainationHelpfulness: 'User rating of "why matched" explanation',

  // Performance
  matchComputeTime: 'Duration to compute all matches for a user',
  apiUsageCost: 'Cost of Gemini API calls per user',
  cachHitRate: 'Percentage of match requests served from cache',

  // Engagement
  recommendationsViewRate: 'Percentage of users who view recommendations',
  recommendationClickRate: 'Percentage of users who click recommended grants',
  refreshRate: 'How often users request fresh recommendations',

  // Business
  conversionRate: 'Recommended grants → applications',
  awardRate: 'Applications from recommended grants that succeed',
};
```

---

## Conclusion

The GrantEase Prompt Enhancement Engine transforms user requests through five sophisticated stages:

1. **Intent Recognition** - Clarify what the user actually needs
2. **Context Injection** - Provide grant domain and GrantEase architecture knowledge
3. **Requirement Expansion** - Decompose into technical, UX, business, and edge case dimensions
4. **Example Transformation** - Show how vague requests become detailed specifications
5. **Implementation Guidance** - Provide patterns, testing, and rollout strategies

Every example is grant-specific, referencing grant discovery, application workflows, eligibility matching, deadline handling, and data quality challenges unique to the grant funding ecosystem. The engine ensures that GrantEase features are comprehensive, well-thought-out, and aligned with the platform's goals of helping nonprofits and eligible organizations discover and secure grant funding efficiently.
