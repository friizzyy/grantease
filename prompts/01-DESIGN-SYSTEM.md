# DESIGN SYSTEM & UI AUDIT PROMPT
## GrantEase: Grant Discovery & Application Management Platform

**Project Context:** GrantEase is a dark-first grant discovery and application management platform built with Next.js 14+, TypeScript, Tailwind CSS 3, and the Pulse Grid Design System. This audit verifies that all UI components, tokens, typography, animations, and responsive layouts align with the Pulse Grid specification and dark-first design philosophy.

---

## STEP 1: PULSE GRID COLOR TOKENS AUDIT

### 1.1 Core Color Palette Verification

Audit the complete Pulse Grid color token implementation. These tokens form the visual foundation of GrantEase and must be consistent across all components.

**Token Definitions to Verify:**

```
Neutral Surface Tokens (Dark-First):
- pulse-bg: #0a0a0b (Absolute black background - page root)
- pulse-surface: #111113 (Primary surface - cards, modals)
- pulse-elevated: #1a1a1d (Elevated surface - overlays, floating elements)
- pulse-border: #2d2d31 (Border/divider lines)
- pulse-border-hover: #3d3d42 (Border on hover states)

Semantic Colors:
- pulse-accent: #40ffaa (Primary accent - calls-to-action, highlights)
- pulse-accent-hover: #33e096 (Accent hover state)
- pulse-accent-dark: #2db888 (Accent on dark backgrounds)
- pulse-success: #4ade80 (Success states, positive feedback)
- pulse-warning: #fbbf24 (Warning states, caution messages)
- pulse-error: #ff6b6b (Error states, destructive actions)
- pulse-info: #60a5fa (Information, informational messages)

Text Colors:
- pulse-text-primary: #ffffff (Primary text - maximum contrast)
- pulse-text-secondary: #b4b4b4 (Secondary text - ~70% opacity)
- pulse-text-tertiary: #808080 (Tertiary text - ~50% opacity)
- pulse-text-muted: #4a4a4a (Muted text - ~30% opacity)

Overlay & Backdrop:
- pulse-overlay: rgba(0, 0, 0, 0.4) (Backdrop overlays)
- pulse-overlay-strong: rgba(0, 0, 0, 0.7) (Strong overlays)
```

**Verification Checklist:**
- [ ] All tokens defined in `tailwind.config.ts` under `colors` object
- [ ] Color values match Pulse Grid specification exactly (no custom deviations)
- [ ] Tokens are used via Tailwind classes (e.g., `bg-pulse-bg`, `text-pulse-text-primary`)
- [ ] No hard-coded color hex values in component files (all use tokens)
- [ ] Verify contrast ratios: text-primary on surface ≥ 7:1 WCAG AAA
- [ ] Verify contrast ratios: text-secondary on surface ≥ 4.5:1 WCAG AA
- [ ] Accent color (#40ffaa) passes WCAG AA on dark backgrounds
- [ ] Semantic colors (success, warning, error, info) are distinguishable for colorblind users

**Audit Actions:**
1. Open `tailwind.config.ts` and verify all token definitions
2. Search codebase for hardcoded hex colors: `grep -r "#[0-9a-fA-F]{6}" src/`
3. Check Storybook (if exists) for color documentation
4. Screenshot components in both light and dark environments to verify appearance
5. Use WebAIM contrast checker to validate all text/background combinations
6. Test with accessibility tools (axe DevTools, Lighthouse)

---

### 1.2 Color Application Audit

Verify that Pulse Grid tokens are applied consistently across all UI layers.

**Component Color Usage Matrix:**

```
Component          | Background      | Text              | Border           | Accent
GrantCard          | pulse-surface   | pulse-text-primary| pulse-border     | pulse-accent
GrantDetailHeader  | pulse-elevated  | pulse-text-primary| pulse-border     | pulse-accent
GrantFilter        | pulse-surface   | pulse-text-primary| pulse-border     | pulse-accent
WorkspaceCard      | pulse-surface   | pulse-text-primary| pulse-border     | pulse-accent
Button (Primary)   | pulse-accent    | pulse-bg          | pulse-accent     | N/A
Button (Secondary) | pulse-surface   | pulse-accent      | pulse-accent     | N/A
Input/TextField    | pulse-elevated  | pulse-text-primary| pulse-border     | pulse-accent-hover
Dropdown/Menu      | pulse-elevated  | pulse-text-primary| pulse-border     | pulse-accent
Modal Backdrop     | pulse-overlay   | N/A               | N/A              | N/A
Notification (Error)| pulse-error*   | pulse-text-primary| pulse-error*     | N/A
Notification (Success)| pulse-success*| pulse-text-primary| pulse-success*   | N/A
```
*With reduced opacity for dark backgrounds: `bg-pulse-error/10`, `border-pulse-error/40`

**Verification Steps:**
1. For each component in `src/components/`, audit the Tailwind classes
2. Verify no inline `style={{backgroundColor: '...'}}` properties
3. Check that states (hover, focus, active, disabled) use appropriate token variations
4. Audit interactive components for focus ring colors: should use `ring-pulse-accent`
5. Check form validation states:
   - Invalid: `border-pulse-error`
   - Valid: `border-pulse-success`
   - Focused: `ring-pulse-accent`
6. Verify disabled state uses `pulse-text-muted` or `opacity-50` on text

**Focus Ring Specification:**
```tsx
// All interactive elements should follow this pattern:
<button className="focus:ring-2 ring-pulse-accent ring-offset-1 ring-offset-pulse-bg">
  {/* content */}
</button>
```

---

## STEP 2: TYPOGRAPHY AUDIT

### 2.1 Font Family Configuration

Verify that GrantEase uses the Pulse Grid typography stack correctly.

**Typography Stack:**

```
Display Font (Headings):
- Font Family: Instrument Serif
- Usage: Page titles (h1), major section headers (h2)
- Weights: 400 (Regular), 600 (SemiBold)
- Load from: Google Fonts or local file

Body Font (Content):
- Font Family: Inter
- Usage: Body text, UI labels, all non-display content
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Load from: Google Fonts or local variable font

Monospace Font (Code):
- Font Family: Geist Mono
- Usage: Code blocks, IDs, technical values, amounts
- Weights: 400 (Regular), 500 (Medium)
- Load from: Vercel Geist font or local file
```

**Configuration Verification in `tailwind.config.ts`:**
```tsx
theme: {
  fontFamily: {
    display: ['Instrument Serif', 'serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['Geist Mono', 'monospace'],
  },
}
```

**Verification Steps:**
1. Check `tailwind.config.ts` for correct font-family configuration
2. Verify fonts are loaded in `app/layout.tsx` or `_document.tsx`:
   - Google Fonts links for Instrument Serif and Inter
   - Geist Mono import from Vercel or local
3. Audit font variable declarations in `globals.css`:
   ```css
   @layer base {
     :root {
       --font-display: 'Instrument Serif', serif;
       --font-body: 'Inter', sans-serif;
       --font-mono: 'Geist Mono', monospace;
     }
   }
   ```
4. Verify no fallback fonts are used (e.g., `font-sans` should NOT be used)
5. Test font loading with slow 3G to verify graceful degradation
6. Check font subsetting/optimization (only necessary character sets loaded)

---

### 2.2 Typography Scale Audit

Verify heading, body, and code typography scales.

**Pulse Grid Typography Scale:**

```
Display (Instrument Serif):
h1: size-6xl (3.75rem), leading-10 (2.5rem), tracking-tight (-0.02em), font-600
h2: size-4xl (2.25rem), leading-9 (2.25rem), tracking-tight (-0.02em), font-600

Headings (Inter):
h3: size-2xl (1.5rem), leading-8 (2rem), tracking-normal, font-600
h4: size-xl (1.25rem), leading-7 (1.75rem), tracking-normal, font-600
h5: size-lg (1.125rem), leading-6 (1.5rem), tracking-normal, font-600
h6: size-base (1rem), leading-6 (1.5rem), tracking-normal, font-600

Body Text (Inter):
Paragraph: size-base (1rem), leading-6 (1.5rem), tracking-normal, font-400
Caption: size-sm (0.875rem), leading-5 (1.25rem), tracking-normal, font-400
Label: size-sm (0.875rem), leading-5 (1.25rem), tracking-normal, font-600

Code/Mono (Geist Mono):
Code: size-sm (0.875rem), leading-5 (1.25rem), tracking-normal, font-400
Code Small: size-xs (0.75rem), leading-4 (1rem), tracking-normal, font-400
```

**Component Typography Verification:**

```
Page Title (h1):
- Used in: grant detail page header, application overview
- Expected: "font-display text-6xl leading-10 font-600"
- Verify: dark-first appearance, sufficient spacing below

Section Header (h2):
- Used in: grant filter sections, workspace sections
- Expected: "font-display text-4xl leading-9 font-600"
- Verify: visual hierarchy, proper spacing

Subsection Header (h3):
- Used in: grant requirement sections, modal titles
- Expected: "font-body text-2xl leading-8 font-600"
- Verify: consistent sizing across components

Card Title (h4):
- Used in: GrantCard title, WorkspaceCard title
- Expected: "font-body text-xl leading-7 font-600"
- Verify: truncation with ellipsis if needed, readability

Label (span):
- Used in: form labels, badge text
- Expected: "font-body text-sm leading-5 font-600"
- Verify: proper contrast, association with inputs

Body Text (p):
- Used in: grant descriptions, application text
- Expected: "font-body text-base leading-6 font-400"
- Verify: line length (max ~65 chars for readability), paragraph spacing

Code Text (code, pre):
- Used in: API examples, technical IDs
- Expected: "font-mono text-sm leading-5 font-400"
- Verify: monospace rendering, proper contrast
```

**Audit Actions:**
1. Grep all component files for hardcoded font sizes: `grep -r "text-\[" src/components/`
2. Verify responsive typography (e.g., `text-base md:text-lg`) doesn't break scale
3. Check for any `style={{fontSize: '...'}}` inline styles
4. Audit all `<h1>` through `<h6>` tags for semantic correctness
5. Verify custom font classes (if any) are defined in `globals.css`
6. Test typography rendering in different browsers (Chrome, Firefox, Safari, Edge)
7. Check WebFont loading performance in DevTools Network tab

---

## STEP 3: COMPONENT CONSISTENCY AUDIT

### 3.1 Core Component Inventory

Audit the existence and consistency of all Pulse Grid components used in GrantEase.

**Required Components to Audit:**

```
Layout Components:
□ AppContainer (max-width, padding, background)
□ SideNav (navigation sidebar, pulse-surface background)
□ Header (top navigation bar)
□ Footer (if applicable)
□ Modal/Dialog (pulse-elevated background, proper z-index)

Grant Discovery Components:
□ GrantCard (grant preview card)
  - Fields: title, description, amount, deadline, category, status badge
  - Hover state with accent border
□ GrantDetailHeader (grant detail page header)
  - Fields: title, organization, category, amount, deadline
□ GrantDetailBody (grant full description, requirements, timeline)
□ GrantFilter (filter sidebar or dropdown)
  - Filters: category, eligibility, location, amount range, deadline
□ GrantList (collection of GrantCards with pagination)

Workspace Components:
□ WorkspaceCard (workspace preview card)
  - Fields: name, member count, last modified, action menu
□ WorkspaceDetail (workspace dashboard)
□ MemberList (team members in workspace)
□ InviteDialog (invite teammates to workspace)

Application Components:
□ ApplicationCard (saved application preview)
  - Fields: grant name, status, last updated, action menu
□ ApplicationForm (application detail form)
□ ApplicationTimeline (application status history)

Utility Components:
□ Button (primary, secondary, destructive variants)
□ TextField/Input (text input with validation)
□ Textarea (multi-line text input)
□ Select/Dropdown (select from options)
□ Checkbox (single and multi)
□ RadioGroup (mutually exclusive options)
□ Badge (category, status badges)
□ Tooltip (hover information)
□ Popover (contextual menus)
□ Toast/Notification (success, error, warning, info)
□ Skeleton/Loading (placeholder while loading)
□ Pagination (navigate between pages)
□ Breadcrumb (navigation trail)
```

**Component Checklist:**
- [ ] Each component has a dedicated file: `src/components/[ComponentName]/index.tsx`
- [ ] Each component has TypeScript types: `src/components/[ComponentName]/types.ts`
- [ ] Components are exported from `src/components/index.ts` barrel file
- [ ] Components use Pulse Grid tokens consistently
- [ ] No CSS-in-JS libraries (use Tailwind only)
- [ ] Each component has a Storybook story (`.stories.tsx`)
- [ ] Components have proper accessibility attributes (aria-*, role, etc.)
- [ ] Components accept className prop for extensibility
- [ ] Components have proper TypeScript typing (no `any` types)
- [ ] Prop names are consistent with Radix UI conventions

---

### 3.2 Component Structure Verification

Audit individual components for consistent structure and implementation patterns.

**Standard Component Structure Template:**

```tsx
// src/components/GrantCard/index.tsx
import React from 'react';
import { GrantCardProps } from './types';
import { cn } from '@/lib/utils'; // utility for classname merging

export const GrantCard = React.forwardRef<HTMLDivElement, GrantCardProps>(
  (
    {
      grant,
      isSelected,
      onClick,
      onSave,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'group relative rounded-lg border p-5',
          // Colors
          'bg-pulse-surface border-pulse-border',
          'hover:border-pulse-accent transition-colors',
          // States
          isSelected && 'ring-2 ring-pulse-accent ring-offset-1 ring-offset-pulse-bg',
          className
        )}
        onClick={onClick}
        role="article"
        {...props}
      >
        {/* Content */}
      </div>
    );
  }
);

GrantCard.displayName = 'GrantCard';
```

**Verification for Each Component:**
1. Uses `React.forwardRef` for components that need refs
2. Uses `cn()` utility (from `classnames` or `clsx`) for className merging
3. Spread `{...props}` to allow additional HTML attributes
4. Has proper TypeScript types in `types.ts`
5. Includes `displayName` for debugging
6. Uses Pulse Grid color tokens exclusively
7. Has `group` class for group hover effects if needed
8. Proper accessibility attributes (role, aria-*, tabIndex for interactive elements)
9. Responsive classes for mobile/tablet/desktop (if needed)
10. Proper spacing using Tailwind spacing scale (p-3, m-4, gap-2, etc.)

**State Management in Components:**
- [ ] Interactive components use Radix UI primitives (Dialog, Select, Popover, etc.)
- [ ] No React state in stateless components (use parent for state)
- [ ] Controlled components accept `value` and `onChange` props
- [ ] Uncontrolled components use `defaultValue` and `ref`
- [ ] Components properly memoized with `React.memo` if they accept complex props

---

## STEP 4: DARK-FIRST THEME VERIFICATION

### 4.1 Dark-First Design Principle

Verify that GrantEase is designed and implemented as a dark-first application, NOT a light-mode application with a dark mode toggle.

**Dark-First Principles:**
- Application is ALWAYS dark (no light mode option)
- All colors are specified for dark backgrounds
- Contrast is calculated for dark backgrounds
- User preference `prefers-color-scheme: dark` is always satisfied
- No light mode CSS overrides or toggles exist

**Verification Steps:**
1. Check `tailwind.config.ts` for `darkMode` configuration:
   ```tsx
   darkMode: 'class', // Should be 'class' only, not false
   ```
   OR
   ```tsx
   darkMode: false, // Only if Tailwind always outputs dark mode (no media queries)
   ```

2. Audit `globals.css` for light mode styles:
   ```css
   /* SHOULD NOT EXIST */
   @media (prefers-color-scheme: light) {
     /* light mode overrides */
   }
   ```

3. Verify HTML root element in `app/layout.tsx`:
   ```tsx
   export default function RootLayout({ children }) {
     return (
       <html className="dark"> {/* Always has 'dark' class */}
         <body className="bg-pulse-bg text-pulse-text-primary">
           {children}
         </body>
       </html>
     );
   }
   ```

4. Check for dark mode toggles in UI:
   - Search for `ThemeProvider` or `useTheme()` that allows switching
   - Search for theme toggle button (SUN/MOON icon)
   - If found, this is NOT dark-first design

5. Test in browser DevTools:
   - Set `prefers-color-scheme: light` → app should still be dark
   - Verify no light mode CSS applies

6. Accessibility check:
   - WCAG requires respecting user OS preference
   - Dark-first means: app is dark, but respects OS preference if light mode exists
   - Current GrantEase: app is ONLY dark, no light mode option

---

### 4.2 Dark Theme Contrast & Readability

Verify all text and interactive elements have sufficient contrast in dark theme.

**Contrast Verification Checklist:**
- [ ] Primary text (#ffffff) on surface (#111113) ≥ 7:1 ratio
- [ ] Secondary text (#b4b4b4) on surface (#111113) ≥ 4.5:1 ratio
- [ ] Tertiary text (#808080) on surface (#111113) ≥ 3:1 ratio for UI labels
- [ ] Accent text (#40ffaa) on dark backgrounds ≥ 4.5:1 ratio
- [ ] All buttons meet WCAG AA minimum (4.5:1)
- [ ] All form labels meet WCAG AA minimum (4.5:1)
- [ ] All badge text meets WCAG AA minimum (4.5:1)
- [ ] Error/warning/success colors are distinguishable and accessible

**Tools to Use:**
- WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
- axe DevTools (Chrome extension)
- Lighthouse Accessibility Audit
- Color Oracle (colorblind simulation)

**Audit Actions:**
1. For each major component, take screenshots
2. Use color picker to identify actual colors being rendered
3. Calculate contrast ratio using WebAIM calculator
4. Test with Color Oracle for colorblind simulation
5. Run Lighthouse accessibility audit (target: 90+ score)
6. Fix any contrast violations by adjusting Pulse Grid tokens or component usage

---

## STEP 5: ANIMATION AUDIT

### 5.1 Framer Motion Animation Inventory

Verify that all animations are implemented with Framer Motion and follow Pulse Grid animation principles.

**Animation Categories:**

```
Page Transitions:
□ Page enter: fade-in + slide-up
  - Duration: 300ms
  - Easing: easeOut (cubic-bezier(0.16, 1, 0.3, 1))
□ Page exit: fade-out + slide-down
  - Duration: 200ms
  - Easing: easeIn (cubic-bezier(0.7, 0, 0.84, 0))

Card Interactions:
□ Card hover: border color change + subtle scale
  - Duration: 150ms
  - Scale: 1.01 (very subtle)
  - Border: pulse-border → pulse-accent
□ Card click: visual feedback
  - Duration: 100ms
  - Shadow or opacity change

Button Interactions:
□ Button hover: background color shift, slight scale
  - Duration: 150ms
  - Scale: 0.98 (scale-down)
□ Button click: brief scale-down and scale-back
  - Duration: 100ms
  - Scale: 0.95 → 1.0

Loading & Skeletons:
□ Skeleton pulse: opacity pulse
  - Duration: 2000ms
  - Opacity: 0.5 → 1.0 → 0.5
□ Loading spinner: continuous rotation
  - Duration: 1000ms
  - Rotation: 0deg → 360deg

Modal/Dialog:
□ Modal backdrop: fade-in
  - Duration: 300ms
□ Modal content: scale + fade
  - Duration: 300ms
  - Scale: 0.9 → 1.0
□ Modal exit: scale + fade-out
  - Duration: 200ms

Dropdown/Menu:
□ Dropdown open: fade-in + scale
  - Duration: 200ms
  - Scale: 0.95 → 1.0
□ Menu item hover: background color + icon color
  - Duration: 100ms
```

**Framer Motion Implementation Pattern:**

```tsx
import { motion } from 'framer-motion';

// Page transition
export default function GrantDetailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
    </motion.div>
  );
}

// Card hover animation
export const GrantCard = ({ grant }) => {
  return (
    <motion.div
      whileHover={{
        borderColor: '#40ffaa',
        scale: 1.01,
      }}
      transition={{ duration: 0.15 }}
      className="border-pulse-border"
    >
      {/* Content */}
    </motion.div>
  );
};

// Button click feedback
export const Button = () => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      Click me
    </motion.button>
  );
};
```

**Animation Audit Checklist:**
- [ ] Page transitions use AnimatePresence wrapper
- [ ] All animations have explicit duration values (no defaults)
- [ ] Easing curves are consistent across similar animations
- [ ] No animation durations exceed 500ms (avoid sluggishness)
- [ ] Hover animations on mobile don't trigger unnecessarily
- [ ] Loading animations don't cause layout shift
- [ ] Animations respect `prefers-reduced-motion` preference
- [ ] Exit animations play before component unmounts
- [ ] No performance issues from repeated animations

**Reduced Motion Support:**

```tsx
import { useReducedMotion } from 'framer-motion';

export const Card = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
    >
      {/* Content */}
    </motion.div>
  );
};
```

**Verification Actions:**
1. Search for all `motion.` components: `grep -r "motion\." src/components/`
2. Verify each has explicit `transition` prop
3. Check for `AnimatePresence` wrapper in layout components
4. Test animations in DevTools with "Reduce motion" enabled
5. Record animations at 60fps, check for jank or stuttering
6. Performance test with DevTools Performance tab:
   - Animation should use transform/opacity only
   - Avoid animating dimensions, position (use transform instead)
7. Verify animations work on mobile (touch interactions)

---

### 5.2 Skeleton Loader Implementation

Verify skeleton loaders are used for data loading states.

**Skeleton Loader Pattern:**

```tsx
// src/components/SkeletonGrantCard/index.tsx
import { motion } from 'framer-motion';

export const SkeletonGrantCard = () => {
  return (
    <motion.div
      className="rounded-lg bg-pulse-surface border border-pulse-border p-5"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="h-6 bg-pulse-elevated rounded mb-3 w-2/3" />
      <div className="h-4 bg-pulse-elevated rounded mb-2" />
      <div className="h-4 bg-pulse-elevated rounded mb-4 w-5/6" />
      <div className="flex gap-2">
        <div className="h-8 bg-pulse-elevated rounded flex-1" />
        <div className="h-8 bg-pulse-elevated rounded flex-1" />
      </div>
    </motion.div>
  );
};
```

**Skeleton Loader Audit:**
- [ ] Used in all data-loading states (grants list, user profile, etc.)
- [ ] Match the actual component shape exactly
- [ ] Animation is subtle (opacity pulse, not color shift)
- [ ] Prevent layout shift when transitioning from skeleton to content
- [ ] Used for both initial load and refetch states
- [ ] Skeleton count matches actual content count

---

## STEP 6: RESPONSIVE DESIGN AUDIT

### 6.1 Breakpoint Verification

Verify Tailwind breakpoints are correctly configured and used throughout the app.

**Tailwind Breakpoints (Default + Custom):**

```
Default Breakpoints:
- sm: 640px (mobile landscape / small tablet)
- md: 768px (tablet)
- lg: 1024px (large tablet / small desktop)
- xl: 1280px (desktop)
- 2xl: 1536px (large desktop)

GrantEase Custom Breakpoints (if any):
- mobile: 320px (small mobile)
- compact: 1200px (compact desktop)
```

**Configuration Verification:**
```tsx
// tailwind.config.ts
theme: {
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}
```

**Responsive Audit Checklist:**
- [ ] Grant discovery grid: 1 column on mobile, 2 on tablet, 3+ on desktop
- [ ] Grant detail page: full-width content on mobile, 2-column layout on desktop
- [ ] Navigation: hamburger menu on mobile, horizontal nav on desktop
- [ ] Modals: full-screen on mobile, centered on desktop
- [ ] Forms: single column on mobile, optimized on desktop
- [ ] No horizontal scrolling on any screen size

---

### 6.2 Mobile-First Design Verification

Verify the application follows mobile-first responsive design principles.

**Mobile-First Pattern:**
```tsx
// Define base styles for mobile, then use md:, lg:, xl: for larger screens
// CORRECT - Mobile-first
<div className="p-3 md:p-4 lg:p-6">
  {/* Base padding 3, increases at md and lg */}
</div>

// INCORRECT - Desktop-first (avoid)
<div className="md:p-3 lg:p-4 xl:p-6">
  {/* Missing base mobile styles */}
</div>
```

**Verification Steps:**
1. Open DevTools and set to mobile viewport (375px)
2. Test grant discovery grid layout (should be 1 column)
3. Test navigation (should be mobile menu)
4. Test forms (single column layout)
5. Gradually resize to 640px, 768px, 1024px, 1280px
6. Verify layout shifts happen at correct breakpoints
7. Test typography sizing (may scale with breakpoints)
8. Verify spacing adjusts appropriately
9. Test touch interactions on mobile (buttons, inputs, modals)
10. Verify images/graphics scale appropriately

**Common Responsive Issues to Check:**
- [ ] No text overflow on mobile (use `truncate` or `line-clamp-*`)
- [ ] Buttons are at least 44px tall for touch targets
- [ ] Input fields are at least 44px tall
- [ ] No layout shift when responsive classes change
- [ ] Images use `object-cover` and `aspect-ratio` for consistency
- [ ] Tables have horizontal scroll on mobile (if needed)
- [ ] Modals have appropriate max-height on mobile

---

## STEP 7: SPACING & SIZING AUDIT

### 7.1 Spacing Scale Consistency

Verify all spacing (padding, margin, gaps) uses the Tailwind spacing scale.

**Tailwind Spacing Scale:**

```
0    = 0px
1    = 0.25rem (4px)
2    = 0.5rem (8px)
3    = 0.75rem (12px)
4    = 1rem (16px)
5    = 1.25rem (20px)
6    = 1.5rem (24px)
7    = 1.75rem (28px)
8    = 2rem (32px)
10   = 2.5rem (40px)
12   = 3rem (48px)
14   = 3.5rem (56px)
16   = 4rem (64px)
20   = 5rem (80px)
24   = 6rem (96px)
```

**Common GrantEase Spacing Patterns:**

```
Card Padding:
- Small card (badge, compact): p-2 or p-3
- Standard card (GrantCard, WorkspaceCard): p-4 or p-5
- Large card (detail sections): p-6 or p-8

Gap Between Items:
- Tight grid: gap-2
- Standard grid: gap-3 or gap-4
- Relaxed layout: gap-6

Margin Between Sections:
- Tight: mb-2 or mb-3
- Standard: mb-4 or mb-6
- Large: mb-8 or mb-12

Vertical Spacing:
- Page top/bottom padding: py-6 or py-8
- Section spacing: space-y-4 or space-y-6
- Form field spacing: space-y-3 or space-y-4
```

**Audit Actions:**
1. Search for hardcoded pixel values: `grep -r "px-\[\|py-\[\|p-\[" src/`
2. Check for any `style={{padding: '...'}}` inline styles
3. Audit all margin declarations (should use scale)
4. Verify form field spacing is consistent
5. Check card padding is consistent across all card types
6. Verify section spacing is consistent throughout app

---

### 7.2 Component Sizing Standards

Verify component sizes follow consistent standards.

**Standard Component Sizes:**

```
Buttons:
- Height: h-10 (40px) for standard, h-8 (32px) for small, h-12 (48px) for large
- Padding: px-4 (horizontal)
- Minimum width: no minimum (width auto or full)

Input Fields:
- Height: h-10 (40px) standard
- Padding: px-3 (12px)
- Border radius: rounded (4px) or rounded-lg (8px)

Badge/Chip:
- Height: h-6 or h-7 (depends on padding)
- Padding: px-2 py-1
- Font size: text-xs or text-sm
- Border radius: rounded-full (for pill-style)

Cards:
- Border radius: rounded-lg (8px)
- Min height: min-h-[200px] or no minimum (content-driven)

Icons:
- Standard: w-4 h-4 (16px), w-5 h-5 (20px)
- Large: w-6 h-6 (24px), w-8 h-8 (32px)
- Extra large: w-12 h-12 (48px)
```

**Verification Checklist:**
- [ ] All buttons have consistent height (h-10 standard)
- [ ] All input fields have consistent height (h-10)
- [ ] All badges use consistent sizing
- [ ] Card border radius is consistent (rounded-lg)
- [ ] Icon sizes are consistent across similar usage
- [ ] Touch targets are at least 44px on mobile (buttons, inputs)
- [ ] No arbitrary sizes (all use spacing scale)

---

## STEP 8: ICON CONSISTENCY AUDIT

### 8.1 Icon Library & Integration

Verify all icons are from a single consistent library.

**Icon Library Requirements:**
- All icons from Lucide React (recommended) or Heroicons
- Consistent size: w-5 h-5 (20px) for standard, w-4 h-4 (16px) for small
- Consistent stroke-width: 2 (standard)
- Colors use Pulse Grid tokens (usually `text-pulse-text-primary`)
- Proper spacing from adjacent text/elements

**Icon Implementation Pattern:**

```tsx
import { ChevronDown, Clock, DollarSign, MapPin } from 'lucide-react';

export const GrantCard = ({ grant }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold">{grant.title}</h3>

      <div className="flex items-center gap-2 text-sm text-pulse-text-secondary">
        <DollarSign className="w-4 h-4" />
        <span>{grant.amount}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-pulse-text-secondary">
        <Clock className="w-4 h-4" />
        <span>{grant.deadline}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-pulse-text-secondary">
        <MapPin className="w-4 h-4" />
        <span>{grant.location}</span>
      </div>
    </div>
  );
};
```

**Icon Audit Checklist:**
- [ ] Only one icon library is used (no mixing Lucide + Heroicons)
- [ ] All icons import from `lucide-react` or `@heroicons/react`
- [ ] Icon sizes are consistent (w-4 h-4 or w-5 h-5)
- [ ] Icon colors use text color tokens (not hardcoded)
- [ ] Icons are properly aligned with adjacent text (use `flex items-center`)
- [ ] Icon components have proper accessibility labels if standalone
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Functional icons have descriptive `aria-label`
- [ ] Icon spacing is consistent (gap-2 or gap-3 in flex layouts)

**Icon Usage Mapping:**

```
Common GrantEase Icons:
□ ChevronDown - Dropdown indicator
□ Search - Search field indicator
□ Filter - Filter button icon
□ X - Close/dismiss button
□ Menu - Mobile navigation toggle
□ Home - Home/dashboard navigation
□ Inbox - Notifications
□ Heart - Save/favorite action
□ DollarSign - Grant amount
□ Clock - Deadline
□ MapPin - Location
□ Users - Team/members
□ Settings - Settings/preferences
□ LogOut - Sign out action
□ ChevronRight - Navigation/expansion
□ Plus - Add/create action
□ Trash2 - Delete action
□ Edit - Edit action
□ Eye - View/show action
□ EyeOff - Hide action
```

---

## STEP 9: ACCESSIBILITY COMPLIANCE AUDIT

### 9.1 WCAG 2.1 AA Compliance

Verify the application meets WCAG 2.1 Level AA accessibility standards.

**Critical Accessibility Checks:**

```
Keyboard Navigation (WCAG 2.1.1):
□ All interactive elements are keyboard accessible
□ Tab order is logical and intuitive
□ No keyboard traps
□ Focus is always visible (focus ring visible)
□ Keyboard shortcuts have no conflicts

Color Contrast (WCAG 1.4.3):
□ Text on background: 4.5:1 minimum
□ UI components on background: 3:1 minimum
□ Color not used as only means of conveying information

Focus Indicators (WCAG 2.4.7):
□ All interactive elements have visible focus ring
□ Focus ring has sufficient contrast (3:1 minimum)
□ Focus ring is not obscured by other elements

Semantic HTML (WCAG 1.3.1):
□ Proper heading hierarchy (h1 → h2 → h3, no skipping)
□ Form inputs have associated <label> elements
□ Landmarks: <main>, <nav>, <aside>, <footer>
□ Buttons use <button> tag (not <div> or <a>)
□ Links use <a> tag for navigation

ARIA Labels (WCAG 1.3.1):
□ Form inputs have proper labels
□ Icon buttons have aria-label
□ Decorative elements have aria-hidden="true"
□ List items in custom lists have proper roles
□ Modal dialogs have role="dialog" and aria-modal="true"
□ Alert/toast notifications have role="alert"

Text Alternatives (WCAG 1.1.1):
□ Images have descriptive alt text
□ Icons used as buttons have aria-label
□ Decorative images have empty alt=""
□ Background images have text alternative
```

**Audit Tools:**
- axe DevTools Chrome extension
- Lighthouse accessibility audit (target: 90+)
- NVDA screen reader testing (Windows)
- VoiceOver screen reader testing (Mac)
- WebAIM contrast checker

**Verification Actions:**
1. Install axe DevTools and run accessibility scan
2. Fix all accessibility violations
3. Test keyboard navigation:
   - Press Tab through all interactive elements
   - Verify tab order is logical
   - Verify focus ring is always visible
4. Test with screen reader:
   - NVDA on Windows or VoiceOver on Mac
   - Verify all content is announced
   - Verify form instructions are announced with inputs
5. Run Lighthouse audit (target 90+ accessibility score)

---

### 9.2 Form Accessibility

Verify all forms are accessible to keyboard and screen reader users.

**Form Accessibility Pattern:**

```tsx
// ACCESSIBLE FORM
export const GrantApplicationForm = () => {
  const [formData, setFormData] = useState({ title: '', amount: '' });

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          Grant Application Information
        </legend>

        {/* Text Input */}
        <div className="space-y-2">
          <label htmlFor="grant-title" className="block font-medium">
            Grant Title
          </label>
          <input
            id="grant-title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-10 px-3 rounded border border-pulse-border bg-pulse-elevated"
            required
            aria-required="true"
          />
          <p id="grant-title-hint" className="text-sm text-pulse-text-secondary">
            Enter the full name of the grant
          </p>
        </div>

        {/* Number Input */}
        <div className="space-y-2">
          <label htmlFor="grant-amount" className="block font-medium">
            Grant Amount ($)
          </label>
          <input
            id="grant-amount"
            type="number"
            min="0"
            step="1000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full h-10 px-3 rounded border border-pulse-border bg-pulse-elevated"
            required
            aria-required="true"
            aria-describedby="grant-amount-hint"
          />
          <p id="grant-amount-hint" className="text-sm text-pulse-text-secondary">
            Enter the total grant amount
          </p>
        </div>

        {/* Checkbox Group */}
        <fieldset className="space-y-2">
          <legend className="font-medium">Eligibility</legend>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={false}
                className="w-4 h-4 rounded"
              />
              <span>Non-profit organization</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={false}
                className="w-4 h-4 rounded"
              />
              <span>Educational institution</span>
            </label>
          </div>
        </fieldset>

        {/* Select/Dropdown */}
        <div className="space-y-2">
          <label htmlFor="grant-category" className="block font-medium">
            Category
          </label>
          <select
            id="grant-category"
            className="w-full h-10 px-3 rounded border border-pulse-border bg-pulse-elevated"
            required
            aria-required="true"
          >
            <option value="">Select a category</option>
            <option value="arts">Arts & Culture</option>
            <option value="education">Education</option>
            <option value="health">Health & Science</option>
          </select>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label htmlFor="grant-description" className="block font-medium">
            Description
          </label>
          <textarea
            id="grant-description"
            rows={5}
            className="w-full px-3 py-2 rounded border border-pulse-border bg-pulse-elevated font-body text-base"
            required
            aria-required="true"
          />
        </div>
      </fieldset>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 h-10 rounded bg-pulse-accent text-pulse-bg font-medium"
        >
          Submit Application
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 h-10 rounded border border-pulse-accent text-pulse-accent font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
```

**Form Accessibility Checklist:**
- [ ] Every input has an associated `<label>` with `htmlFor` attribute
- [ ] Form groups use `<fieldset>` with `<legend>`
- [ ] Required fields have `required` attribute and `aria-required="true"`
- [ ] Error messages have `role="alert"` and are associated with input
- [ ] Help text is associated with input via `aria-describedby`
- [ ] Form submission works with keyboard (Enter key)
- [ ] Form validation errors are announced to screen reader
- [ ] Success message is announced after submission

---

## STEP 10: COMPONENT TESTING AUDIT

### 10.1 Storybook Coverage

Verify all components have Storybook stories for visual regression testing.

**Storybook File Structure:**
```
src/components/GrantCard/
├── index.tsx
├── types.ts
└── GrantCard.stories.tsx
```

**Storybook Story Template:**

```tsx
// src/components/GrantCard/GrantCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GrantCard } from './index';
import { GrantCardProps } from './types';

const meta = {
  component: GrantCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a0b' },
      ],
    },
  },
} satisfies Meta<typeof GrantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    grant: {
      id: '1',
      title: 'STEM Education Grant',
      description: 'Support for science and technology education programs',
      amount: 250000,
      deadline: '2025-06-30',
      category: 'Education',
      organization: 'National Science Foundation',
      eligibility: ['Non-profit', 'Educational Institution'],
      status: 'active',
    },
  },
};

export const Selected: Story = {
  args: {
    ...Default.args,
    isSelected: true,
  },
};

export const Saved: Story = {
  args: {
    ...Default.args,
    isSaved: true,
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    grant: {
      ...Default.args!.grant,
      title: 'Comprehensive Research Infrastructure and Technical Assistance Grant for Advanced Computing and Scientific Discovery',
    },
  },
};

export const ClosingDeadline: Story = {
  args: {
    ...Default.args,
    grant: {
      ...Default.args!.grant,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
    },
  },
};
```

**Storybook Audit Checklist:**
- [ ] All components have at least one story
- [ ] Stories cover default, selected, and disabled states
- [ ] Stories cover edge cases (long text, empty state, etc.)
- [ ] Stories have proper TypeScript types
- [ ] Stories are tagged with `['autodocs']` for documentation
- [ ] Dark background is configured for dark theme components
- [ ] Stories render correctly in Storybook
- [ ] No console errors in Storybook

**Verification Actions:**
1. Run `npm run storybook` to start Storybook
2. Verify all components appear in sidebar
3. Check each story renders correctly
4. Verify dark background is applied
5. Test component interactions in Storybook (hover, click, etc.)
6. Verify responsive preview works
7. Check for accessibility violations in Storybook (axe addon)

---

## STEP 11: VISUAL REGRESSION TESTING

### 11.1 Screenshot Testing Setup

Verify visual regression tests are configured and passing.

**Visual Regression Testing Tools:**
- Percy.io (screenshot diffing service)
- Chromatic (Storybook integrated testing)
- Visual Regression Testing Library (jest-image-snapshot)

**Configuration Verification:**
```tsx
// jest.config.ts
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/components/**/*.tsx',
    '!src/components/**/*.stories.tsx',
    '!src/components/**/index.ts',
  ],
};
```

**Visual Test Verification:**
- [ ] Percy or Chromatic is integrated
- [ ] Baseline screenshots captured for all components
- [ ] CI/CD pipeline runs visual tests on PR
- [ ] No visual regressions are detected
- [ ] Breaking changes are approved before merge

---

## AUDIT SUMMARY CHECKLIST

### Component Coverage
- [ ] All components have proper TypeScript types
- [ ] All components use Pulse Grid color tokens
- [ ] All components follow consistent structure pattern
- [ ] All components are exported from barrel file
- [ ] All components have Storybook stories

### Typography
- [ ] Font families are correctly configured
- [ ] Typography scales are consistent
- [ ] No hardcoded font sizes
- [ ] Responsive typography is implemented

### Colors & Contrast
- [ ] All colors use Pulse Grid tokens
- [ ] No hardcoded hex colors in components
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Dark-first theme is properly implemented
- [ ] No light mode styles exist

### Animations
- [ ] All animations use Framer Motion
- [ ] Animation durations are explicit and reasonable
- [ ] Reduced motion preference is respected
- [ ] Skeleton loaders are implemented for loading states

### Responsive Design
- [ ] Breakpoints are properly configured
- [ ] Mobile-first approach is used
- [ ] Layouts adapt correctly at breakpoints
- [ ] No horizontal scrolling on any screen size
- [ ] Touch targets are at least 44px

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation works throughout app
- [ ] Focus indicators are visible
- [ ] Forms are properly labeled and accessible
- [ ] Icons have proper accessibility attributes
- [ ] Semantic HTML is used correctly

### Testing
- [ ] All components have Storybook stories
- [ ] Visual regression tests are passing
- [ ] No console errors in browser
- [ ] Accessibility audit score is 90+

---

## TOOLS & RESOURCES

**Recommended Audit Tools:**
- Chrome DevTools (Inspect, Accessibility, Performance)
- axe DevTools (Accessibility)
- Lighthouse (Performance & Accessibility)
- WebAIM Contrast Checker (Color Contrast)
- Storybook (Component Documentation)
- Percy or Chromatic (Visual Regression)
- Color Oracle (Colorblind Simulation)

**Pulse Grid Documentation:**
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Components](https://radix-ui.com)
- [Framer Motion Documentation](https://framer.com/motion)
- [Lucide React Icons](https://lucide.dev)

---

**Audit Complete When:**
- All 11 steps have been executed
- All checklists are marked complete
- No accessibility violations remain
- All components follow Pulse Grid standards
- Visual regression tests pass
- Performance metrics meet targets
