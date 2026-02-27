# PREMIUM UI UPGRADE AUDIT & IMPLEMENTATION
## GrantEase: Full-App Visual Refinement Pass

**Purpose:** Systematically upgrade every page in GrantEase to feel premium, modern, and effortlessly navigable — without replacing the existing Pulse Grid design system, color tokens, or custom components. This prompt focuses on *what's inside* the components, not the components themselves.

**Target Audience:** Non-tech-savvy grant seekers (easy to navigate, zero confusion) who also happen to be the younger generation that expects *beautiful* software. Think: the polish of Linear, the clarity of Notion, the vibe of Arc Browser.

**Philosophy:** Clean ≠ boring. Premium ≠ cluttered. Modern ≠ gimmicky. Every pixel earns its place.

---

## GROUND RULES

Before touching any file, internalize these constraints:

1. **DO NOT** replace Pulse Grid color tokens, design system primitives, or custom UI components (Button, Card, GlassCard, PremiumButton, Badge, etc.)
2. **DO NOT** change the dark-first theme, #40ffaa mint accent, or core brand identity
3. **DO** upgrade content hierarchy, spacing rhythm, micro-interactions, typography weight distribution, empty states, loading states, and information density
4. **DO** make every page scannable in under 3 seconds — users should know exactly where they are and what to do next
5. **DO** ensure all upgrades are fully responsive (mobile-first, then scale up)
6. **DO** preserve all existing functionality — this is a visual refinement, not a feature rewrite

---

## STEP 1: GLOBAL REFINEMENTS (Apply Everywhere First)

### 1.1 Typography Hierarchy Reset

Audit every page for flat typography. Premium apps have *dramatic* contrast between heading levels.

**Implementation Pattern:**
```
Page Title:       text-3xl md:text-4xl font-bold tracking-tight
Section Heading:  text-xl md:text-2xl font-semibold tracking-tight
Subsection:       text-lg font-medium text-pulse-text-secondary
Body:             text-sm md:text-base text-pulse-text-secondary leading-relaxed
Caption/Meta:     text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium
```

**Checklist:**
- [ ] Every page has ONE clear page title (never competing headings)
- [ ] Section headings use `tracking-tight` for that premium density feel
- [ ] Meta text (dates, counts, labels) uses `uppercase tracking-wider text-xs` for refinement
- [ ] Body text uses `leading-relaxed` for comfortable reading
- [ ] No orphaned headings — every heading has content below it
- [ ] Number displays (stats, counts, amounts) use `tabular-nums font-semibold` for alignment

### 1.2 Spacing Rhythm

Replace inconsistent padding/margin with a deliberate 8px rhythm system.

**Implementation Pattern:**
```
Page padding:       px-4 md:px-8 lg:px-12
Section gap:        space-y-8 md:space-y-12
Card internal:      p-5 md:p-6
Card grid gap:      gap-4 md:gap-6
Inline element gap: gap-2 md:gap-3
```

**Checklist:**
- [ ] All pages use consistent outer padding (no random px-6 vs px-10)
- [ ] Card grids use uniform gap values
- [ ] Vertical sections breathe — minimum `space-y-8` between major sections
- [ ] No cramped content — minimum `p-5` inside cards
- [ ] Consistent spacing between label and input in all forms

### 1.3 Micro-Interactions Upgrade

Add subtle motion that makes the app feel alive without being distracting.

**Implementation Pattern (Framer Motion):**
```typescript
// Staggered list entrance (for card grids, search results)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

// Hover lift for interactive cards
const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 }
};

// Smooth section entrance on scroll
const fadeInOnScroll = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: 'easeOut' }
};
```

**Checklist:**
- [ ] Card grids use staggered entrance animation
- [ ] Interactive cards have subtle hover lift (y: -2, not y: -8 — keep it refined)
- [ ] Page sections fade in on scroll for marketing pages
- [ ] Buttons have `whileTap: { scale: 0.98 }` for tactile feedback
- [ ] Modals/dialogs use `AnimatePresence` with fade + scale
- [ ] NO bouncy/springy animations — use `easeOut` curves only
- [ ] Skeleton loaders pulse smoothly (existing shimmer component)

### 1.4 Empty States & Loading States

Every empty state is a branding opportunity. No blank pages, no "No results found" in plain text.

**Empty State Pattern:**
```
┌────────────────────────────────┐
│                                │
│       [Contextual Icon]        │  ← 48px, text-pulse-text-tertiary
│                                │
│    No grants saved yet         │  ← text-lg font-medium
│                                │
│  Save grants you're interested │  ← text-sm text-pulse-text-tertiary
│  in to keep track of them here │
│                                │
│    [ Discover Grants → ]       │  ← Primary action CTA
│                                │
└────────────────────────────────┘
```

**Checklist:**
- [ ] Every list/grid page has a designed empty state (not just text)
- [ ] Empty states include a relevant icon, clear message, and CTA
- [ ] Loading states use skeleton screens (not spinners) matching the content layout
- [ ] Error states are friendly ("Something went wrong" with retry button, not stack traces)
- [ ] All skeleton loaders match the actual content dimensions

### 1.5 Dividers & Visual Separation

Replace hard borders with subtle visual hierarchy.

**Pattern:**
```
Primary divider:   border-t border-pulse-border/50
Section break:     A wider gap (space-y-10) instead of a line
Card separation:   gap in grid (no borders between cards)
Sidebar divider:   border-r border-pulse-border/30
```

**Checklist:**
- [ ] Remove unnecessary borders — use spacing for separation where possible
- [ ] Remaining borders use `/50` or `/30` opacity for subtlety
- [ ] No double-borders (border on card + border on container)
- [ ] Use `divide-y divide-pulse-border/30` for lists instead of individual borders

---

## STEP 2: MARKETING PAGES (Non-App, Public-Facing)

These pages sell the product. They need to feel like a $100M startup, not a side project.

### 2.1 Landing Page (`/(marketing)/page.tsx`)

**Current State Audit → Target State:**

**Hero Section:**
- [ ] Headline: Should be benefit-driven, max 8 words, `text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight`
- [ ] Subheadline: One sentence, `text-lg md:text-xl text-pulse-text-secondary max-w-2xl mx-auto`
- [ ] CTA: Two buttons — primary (filled mint) + secondary (ghost/outline). Not stacked on desktop.
- [ ] Social proof row: "Trusted by X,XXX grant seekers" or logos, directly under CTA
- [ ] Background: Subtle gradient or grid pattern (use existing PulseGridBackground), not flat black
- [ ] Entrance animation: Headline fades up first, then subheadline, then CTA (staggered 150ms)

**Feature Section:**
- [ ] Use a 3-column grid (mobile: 1-col stack) with FeatureCards
- [ ] Each card: Icon (24-32px, mint accent) + short title + one-sentence description
- [ ] Cards should NOT have heavy borders — use subtle `bg-pulse-surface` with `hover:bg-pulse-elevated` transition
- [ ] Section title above: centered, `text-2xl md:text-3xl font-bold`
- [ ] Subtitle: one line, `text-pulse-text-secondary`

**How It Works / Steps Section:**
- [ ] 3-step horizontal flow with numbered indicators (1 → 2 → 3)
- [ ] Each step: number badge (mint circle) + title + short description
- [ ] On mobile: vertical stack with connecting line between steps
- [ ] Use timeline/stepper visual pattern — users LOVE visual progress

**Testimonials / Social Proof:**
- [ ] If testimonials exist: quote cards with avatar, name, role
- [ ] If stats: big numbers with animated counters (`AnimatedCounter` component)
- [ ] Stats format: "10,000+" in `text-4xl font-bold text-pulse-accent` with label below in `text-xs uppercase tracking-wider`

**Final CTA Section:**
- [ ] Full-width section with gradient background (pulse-bg → pulse-surface)
- [ ] Bold headline + single CTA button
- [ ] Keep it simple — this is the "convinced" user's click target

### 2.2 Pricing Page (`/(marketing)/pricing/page.tsx`)

- [ ] Card grid: 2-3 tiers side by side (mobile: stacked)
- [ ] Recommended tier has a subtle mint glow/border: `ring-1 ring-pulse-accent/30` + "Most Popular" badge
- [ ] Price display: `text-4xl font-bold` with `/mo` in `text-sm text-pulse-text-tertiary`
- [ ] Feature list inside cards: checkmarks in mint, text in secondary color
- [ ] Missing features on lower tiers: show with `line-through text-pulse-text-tertiary/50` or omit entirely (cleaner)
- [ ] CTA at bottom of each card, not top
- [ ] FAQ accordion below pricing cards (common questions about billing)

### 2.3 How It Works (`/(marketing)/how-it-works/page.tsx`)

- [ ] Step-by-step visual walkthrough (not a wall of text)
- [ ] Each step: large number/icon on left, content on right (alternating sides on desktop)
- [ ] Include inline mockup screenshots or illustrations if available
- [ ] Progress indicator showing which step user is reading (subtle, scroll-based)
- [ ] Final step leads directly into CTA ("Ready to get started?")

### 2.4 About Page (`/(marketing)/about/page.tsx`)

- [ ] Mission statement: big, bold, centered — one sentence
- [ ] Team section (if applicable): avatar + name + role, clean grid
- [ ] Values or pillars: icon + title + description, 3-column grid
- [ ] No giant blocks of Lorem Ipsum energy — short, punchy paragraphs

### 2.5 FAQ Page (`/(marketing)/faq/page.tsx`)

- [ ] Accordion pattern with smooth expand/collapse animation (Framer Motion)
- [ ] Category tabs or sections (General, Pricing, Security, etc.)
- [ ] Search bar at top to filter questions (if 10+ FAQs)
- [ ] Clean `+`/`−` or chevron indicator for expand state
- [ ] Generous padding inside expanded answers — don't cram text

### 2.6 Contact Page (`/(marketing)/contact/page.tsx`)

- [ ] Two-column layout: form on left, contact info on right (mobile: stacked)
- [ ] Form fields: clean labels above inputs (not placeholder-only)
- [ ] Submit button full-width on form column
- [ ] Success state: animated checkmark + "We'll be in touch" message
- [ ] Contact info side: email, social links, response time expectation

### 2.7 Auth Pages (`/(auth)/login/page.tsx`, `register/page.tsx`, etc.)

- [ ] Centered card on subtle gradient background
- [ ] Logo at top of card
- [ ] Social OAuth buttons at top (Google, GitHub) with divider "or continue with email"
- [ ] Form fields: `text-sm` labels, generous padding, clear focus states with mint accent ring
- [ ] Error messages: inline below field, `text-error text-xs` with fade-in animation
- [ ] "Forgot password?" link: subtle, right-aligned below password field
- [ ] Toggle link at bottom: "Don't have an account? Sign up" in `text-pulse-text-tertiary`

---

## STEP 3: APP PAGES (Authenticated Experience)

These pages are where users spend 90% of their time. They must be *effortlessly* usable.

### 3.1 Dashboard (`/app/page.tsx`)

The dashboard is the home base. Users should see their most important info in 3 seconds.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Welcome back, Julius                    [avatar] │  ← Greeting + quick actions
├─────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│ │ Stat  │ │ Stat  │ │ Stat  │ │ Stat  │       │  ← Key metrics row
│ └───────┘ └───────┘ └───────┘ └───────┘       │
├─────────────────────────────────────────────────┤
│ Recent Grants               Saved Searches      │
│ ┌─────────────────┐  ┌────────────────┐        │  ← Two-column content
│ │ Grant Card      │  │ Search Item    │        │
│ │ Grant Card      │  │ Search Item    │        │
│ │ Grant Card      │  │ Search Item    │        │
│ └─ View All →─────┘  └─ View All → ──┘        │
└─────────────────────────────────────────────────┘
```

**Checklist:**
- [ ] Personalized greeting with user's first name (not "Welcome, user")
- [ ] Stat cards: `text-3xl font-bold tabular-nums` for the number, `text-xs uppercase tracking-wider text-pulse-text-tertiary` for the label
- [ ] Stat cards have subtle accent color indicators (mint for positive, warning for pending)
- [ ] Recent grants section: max 3-5 cards, with "View all →" link
- [ ] Quick action buttons: "Discover Grants", "New Search", "View Workspace"
- [ ] If user has no data yet, show welcoming onboarding prompt (not empty grid)
- [ ] Activity feed or recent actions (optional, bottom of page)

### 3.2 Grant Discovery (`/app/discover/page.tsx`)

The core experience. Must feel like browsing a premium marketplace.

**Checklist:**
- [ ] Search bar: prominent, full-width, with search icon and clear button
- [ ] Search bar placeholder: helpful example ("Search by keyword, funder, or category...")
- [ ] Filter bar: horizontal pill/chip toggles below search (not a sidebar on mobile)
- [ ] Active filters shown as dismissible badges/chips with `×` buttons
- [ ] Results count: "Showing X of Y grants" in `text-sm text-pulse-text-tertiary`
- [ ] Grant cards in grid: 1-col mobile, 2-col tablet, 3-col desktop
- [ ] Each grant card shows: title (bold), funder, amount range, deadline, match score badge
- [ ] Match score: circular or pill badge with percentage, colored by confidence (mint = high)
- [ ] Deadline proximity: "Closes in 5 days" in warning color if urgent
- [ ] Hover state on cards: subtle lift + border glow (`ring-1 ring-pulse-accent/20`)
- [ ] Pagination or infinite scroll with loading skeleton
- [ ] Sort dropdown: "Relevance", "Deadline", "Amount", "Newest"
- [ ] Zero results state: helpful message + suggested actions

### 3.3 Grant Detail (`/app/grants/[id]/page.tsx`)

This is where users decide to apply. It must build confidence.

**Checklist:**
- [ ] Sticky header bar with grant title + "Save" and "Apply" buttons (visible on scroll)
- [ ] Hero section: Grant title (`text-2xl md:text-3xl font-bold`), funder, deadline, amount
- [ ] Key details in a clean metadata grid (not a paragraph dump):
  ```
  Funder:     [Name]          Amount:    $XX,XXX - $XXX,XXX
  Deadline:   March 15, 2026  Category:  [Badge] [Badge]
  Status:     Open            Match:     92% ████████░░
  ```
- [ ] Tab navigation for long content: Overview | Eligibility | How to Apply | FAQ
- [ ] "Your Match Score" section: visual breakdown of why the AI matched this grant
- [ ] Related grants section at bottom (3-card horizontal scroll)
- [ ] Action buttons are always visible (sticky bottom bar on mobile)
- [ ] AI chat prompt: "Have questions about this grant? Ask our AI assistant"

### 3.4 Saved Grants & Searches (`/app/saved/page.tsx`, `/app/searches/page.tsx`)

**Checklist:**
- [ ] Tab or toggle between "Saved Grants" and "Saved Searches"
- [ ] Saved grants: card list with grant title, funder, deadline, and "Remove" action
- [ ] Saved searches: show search query/filters + result count + "Run again" button
- [ ] Alert toggle: enable/disable email alerts per saved search (switch component)
- [ ] Empty state: friendly illustration + CTA to discover grants
- [ ] Bulk actions: "Remove selected" for saved grants (optional, stretch goal)

### 3.5 Workspace (`/app/workspace/page.tsx`, `/app/workspace/[id]/page.tsx`)

**Workspace List:**
- [ ] Card grid of workspaces with name, member count, last updated, grant count
- [ ] "Create Workspace" button prominently placed
- [ ] Quick-access to most recent workspace

**Workspace Detail:**
- [ ] Clear workspace title + description at top
- [ ] Tab navigation: Applications | Documents | Team | Settings
- [ ] Applications tab: kanban-style or list view of grant applications with status
- [ ] Status badges: Draft, In Progress, Submitted, Awarded, Rejected
- [ ] Member avatars shown inline (stacked circles pattern)
- [ ] Activity timeline on the side or bottom

### 3.6 Settings (`/app/settings/page.tsx`)

- [ ] Vertical tab navigation on left (mobile: horizontal tabs or accordion)
- [ ] Sections: Profile, Notifications, Integrations, Billing, Security
- [ ] Profile section: avatar upload, name, email, bio — clean form layout
- [ ] Save button per section (not one giant form)
- [ ] Success toast on save (not page redirect)
- [ ] Danger zone (delete account) at very bottom, visually separated with red accent

### 3.7 Onboarding (`/onboarding/page.tsx`)

- [ ] Full-screen, focused flow — no sidebar, no distractions
- [ ] Progress bar at top showing step X of 5
- [ ] Each step: clear heading, subheading explaining why this info matters
- [ ] Form inputs are large and touch-friendly
- [ ] "Skip for now" option on non-critical steps (text link, not button)
- [ ] Back/Next navigation at bottom, "Next" in mint accent
- [ ] Final step: celebration animation + redirect to dashboard
- [ ] Progress bar animates smoothly between steps

---

## STEP 4: COMPONENT-LEVEL POLISH

### 4.1 Navigation & Sidebar

**App Sidebar:**
- [ ] Slim by default (icon-only) with expand on hover or toggle (progressive disclosure)
- [ ] Active route: mint accent indicator (left border or background tint)
- [ ] Icons: consistent set (Lucide recommended), 20px, `text-pulse-text-tertiary` default, `text-pulse-accent` active
- [ ] User avatar + name at bottom of sidebar
- [ ] Smooth width transition on expand/collapse (not instant)

**Marketing Navbar:**
- [ ] Transparent on hero, solid on scroll (add `backdrop-blur-md bg-pulse-bg/80`)
- [ ] Logo left, nav links center, CTA right
- [ ] Mobile: hamburger → full-screen overlay menu with staggered link animation
- [ ] Active link: `text-pulse-accent` or underline indicator

### 4.2 Cards (Global Pattern)

All cards across the app should follow this refined pattern:

```
┌────────────────────────────────┐
│ p-5 md:p-6                     │
│ bg-pulse-surface                │
│ rounded-xl                      │  ← NOT rounded-lg, xl feels more premium
│ border border-pulse-border/40   │  ← Subtle, not heavy
│ hover:border-pulse-border-hover │
│ transition-all duration-200     │
│ hover:shadow-lg                 │  ← Shadow on hover, not at rest
│ hover:shadow-pulse-accent/5     │  ← Tinted shadow for brand feel
└────────────────────────────────┘
```

**Checklist:**
- [ ] All cards use `rounded-xl` (not `rounded-lg` or `rounded-md`)
- [ ] Border opacity is `/40` at rest, full on hover
- [ ] Shadow only appears on hover (cards are flat at rest)
- [ ] Hover shadow has mint tint: `shadow-pulse-accent/5`
- [ ] Card content has consistent internal padding `p-5 md:p-6`

### 4.3 Buttons

**Primary (Mint):**
```
bg-pulse-accent text-pulse-bg font-medium rounded-lg px-5 py-2.5
hover:bg-pulse-accent-hover
active:scale-[0.98]
transition-all duration-150
```

**Secondary (Ghost):**
```
bg-transparent border border-pulse-border text-pulse-text-primary rounded-lg px-5 py-2.5
hover:bg-pulse-elevated hover:border-pulse-border-hover
```

**Checklist:**
- [ ] Consistent height across all button sizes
- [ ] Icon buttons: square aspect ratio, centered icon
- [ ] Loading state: spinner replaces text (button width doesn't change)
- [ ] Disabled state: reduced opacity, no hover effects, `cursor-not-allowed`

### 4.4 Form Inputs

```
bg-pulse-surface border border-pulse-border rounded-lg px-4 py-2.5
text-sm text-pulse-text-primary placeholder:text-pulse-text-tertiary
focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent
transition-all duration-150
```

**Checklist:**
- [ ] All inputs have visible labels (never placeholder-only)
- [ ] Focus state: mint accent ring (not browser default blue)
- [ ] Error state: red border + inline error message below
- [ ] Consistent height with buttons (so they look good side by side)

### 4.5 Tables & Data Lists

- [ ] Header row: `text-xs uppercase tracking-wider text-pulse-text-tertiary bg-pulse-surface/50`
- [ ] Row hover: `hover:bg-pulse-elevated/50`
- [ ] Alternating row colors: NO — use consistent background with subtle dividers
- [ ] Sortable columns: arrow indicator, sorted column highlighted
- [ ] Mobile: transform tables to card-based list layout (no horizontal scroll)

---

## STEP 5: RESPONSIVE & ACCESSIBILITY REFINEMENTS

### 5.1 Mobile Experience

- [ ] All touch targets: minimum 44x44px
- [ ] Bottom navigation bar for mobile app pages (not top nav)
- [ ] Swipe-to-dismiss on modals/drawers
- [ ] No horizontal scroll anywhere (test at 320px width)
- [ ] Sticky action buttons at bottom of long forms
- [ ] Search bar is always accessible (not hidden behind a toggle)

### 5.2 Accessibility

- [ ] Color contrast: all text meets WCAG AA (4.5:1 minimum)
- [ ] Focus indicators: visible on all interactive elements (mint ring)
- [ ] Screen reader: all images have alt text, icons have aria-label
- [ ] Keyboard navigation: all actions reachable via Tab/Enter/Space
- [ ] Reduced motion: respect `prefers-reduced-motion` — disable Framer Motion animations
- [ ] Skip-link: "Skip to main content" link (already exists, verify it works)

---

## STEP 6: EXECUTION ORDER

Run this audit in the following order to maximize efficiency:

### Phase 1: Global Tokens (30 min)
1. Typography hierarchy reset (all pages)
2. Spacing rhythm normalization (all pages)
3. Card pattern standardization (all cards)
4. Button and input consistency (all forms)

### Phase 2: Marketing Pages (1-2 hours)
5. Landing page hero & sections
6. Pricing page
7. How It Works page
8. About, FAQ, Contact pages
9. Auth pages (Login, Register, Forgot Password)

### Phase 3: App Pages (2-3 hours)
10. Dashboard
11. Grant Discovery
12. Grant Detail
13. Saved Grants & Searches
14. Workspace (list + detail)
15. Settings
16. Onboarding

### Phase 4: Polish (1 hour)
17. Empty states for all list pages
18. Loading skeletons for all data-dependent pages
19. Micro-interaction pass (hover states, entrance animations)
20. Mobile responsive pass (test at 375px, 768px, 1024px, 1440px)
21. Accessibility pass (contrast, focus, keyboard, screen reader)

---

## STEP 7: VALIDATION CHECKLIST

After all changes, verify:

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings related to changes
- [ ] All pages render correctly at 375px (mobile), 768px (tablet), 1440px (desktop)
- [ ] All Framer Motion animations respect `prefers-reduced-motion`
- [ ] No regressions in existing functionality (forms submit, auth works, API calls succeed)
- [ ] Color contrast passes WCAG AA on all new/modified text
- [ ] All empty states have designed fallbacks
- [ ] All loading states use skeleton screens
- [ ] No console errors or warnings in browser dev tools
- [ ] Lighthouse score: Performance 90+, Accessibility 95+, Best Practices 90+

---

## REFERENCE FILES

When implementing, reference these existing files:

| File | Purpose |
|------|---------|
| `src/components/ui/*` | Base UI primitives (Button, Card, Input, etc.) |
| `src/components/pulse-grid/background.tsx` | Animated grid background |
| `src/components/motion/*` | Framer Motion wrapper components |
| `src/components/landing/*` | Marketing page components |
| `src/components/grants/*` | Grant-specific components (GrantCard, etc.) |
| `tailwind.config.ts` | Pulse Grid color tokens, spacing, typography |
| `prompts/01-DESIGN-SYSTEM.md` | Full design system specification |
| `prompts/09-NAVIGATION-UX.md` | Navigation and UX patterns |

---

## TONE OF THE UPGRADE

To summarize the vibe we're going for:

**Linear** — clean, focused, intentional spacing, beautiful transitions
**Notion** — effortless navigation, clear hierarchy, feels simple but is powerful
**Vercel** — dark theme done right, typography that commands attention
**Arc Browser** — playful touches, modern feel, makes you smile

We're not basic. We're not corporate. We're not SaaS-template-core. We're building something that makes grant seekers think: *"This is the best tool I've ever used."*
