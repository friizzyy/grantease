# GrantEase Accessibility Audit

## Overview
This audit evaluates accessibility compliance across the GrantEase application. Focus areas include WCAG 2.1 AA compliance, keyboard navigation, screen reader support, color contrast, focus management, and semantic HTML. The goal is to ensure GrantEase is usable by everyone, including users with disabilities.

---

## STEP 1: Grant Card Accessibility

### 1.1 Grant Card ARIA and Semantic HTML
Verify grant card component implements accessibility:

```typescript
// components/grants/GrantCard.tsx
import { Heart } from 'lucide-react';
import Link from 'next/link';

export function GrantCard({ grant, isSaved, onToggleSave, onAddToWorkspace }) {
  return (
    <article
      className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-[#40ffaa] transition-colors"
      role="article"
      aria-label={`Grant: ${grant.title}`}
    >
      {/* Card Header with Title */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white text-lg line-clamp-2">
          {grant.title}
        </h3>

        {/* Save Button with Accessible Label */}
        <button
          aria-label={isSaved ? 'Remove from saved grants' : 'Save this grant'}
          aria-pressed={isSaved}
          onClick={onToggleSave}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-[#40ffaa] transition-colors"
        >
          <Heart
            className={isSaved ? 'fill-[#40ffaa] text-[#40ffaa]' : ''}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Organization Name */}
      <p className="text-sm text-slate-400 mb-3">{grant.organization}</p>

      {/* Grant Amount Section */}
      <div className="mb-3">
        <span className="text-[#40ffaa] font-bold text-lg">
          ${grant.amount.toLocaleString()}
        </span>
        <span className="text-slate-400 text-sm ml-2">Available</span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 mb-4 line-clamp-3">
        {grant.description}
      </p>

      {/* Category Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {grant.categories.map((cat) => (
          <span
            key={cat}
            className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Deadline Info */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <span aria-hidden="true">📅</span>
        <span className="text-slate-400">
          Deadline: {new Date(grant.deadline).toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/app/grants/${grant.id}`}
          className="flex-1 px-4 py-2 bg-[#40ffaa] text-slate-950 font-semibold rounded hover:bg-[#3ae699] focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
        >
          View Details
        </Link>
        <button
          onClick={onAddToWorkspace}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#40ffaa] transition-colors"
          aria-label={`Add ${grant.title} to workspace`}
        >
          Add to Workspace
        </button>
      </div>
    </article>
  );
}
```

**Checklist:**
- [ ] Article element used with `role="article"`
- [ ] Title in semantic `<h3>` tag
- [ ] Grant card has descriptive aria-label
- [ ] Save button has aria-label describing action
- [ ] Save button uses aria-pressed for toggle state
- [ ] Icons have aria-hidden="true" (decorative)
- [ ] Buttons have focus ring with visible outline
- [ ] Focus ring color uses accent color (#40ffaa)
- [ ] Focus ring has offset for visibility on dark background
- [ ] All interactive elements keyboard accessible

### 1.2 Grant Grid Navigation
Verify grid keyboard navigation:

**Checklist:**
- [ ] Tab key navigates through cards left to right
- [ ] Shift+Tab navigates backwards
- [ ] Tab order logical and expected
- [ ] All buttons within cards focusable
- [ ] Focus trap managed (focus doesn't get stuck)
- [ ] Grid role applied if needed (`role="grid"`)
- [ ] No tab-index hijacking or manipulation
- [ ] Mobile: touch targets minimum 44x44 pixels

---

## STEP 2: Grant Filter Panel Accessibility

### 2.1 Filter Form Labels and Inputs
Verify filter panel semantic structure:

```typescript
// components/grants/FilterPanel.tsx
import { useState } from 'react';

export function FilterPanel({ onFilterChange }) {
  const [amount, setAmount] = useState([0, 500000]);
  const [categories, setCategories] = useState([]);
  const [fundingType, setFundingType] = useState('');

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4" aria-label="Grant filters">
      {/* Search Filter */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-white mb-2">
          Search Grants
        </legend>
        <input
          type="text"
          placeholder="Keyword..."
          aria-label="Search grants by keyword"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa]"
        />
      </fieldset>

      {/* Grant Amount Range Slider */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-white mb-2">
          Grant Amount
        </legend>
        <div className="flex gap-2 mb-2">
          <div>
            <label htmlFor="min-amount" className="text-xs text-slate-400">
              Min
            </label>
            <input
              id="min-amount"
              type="number"
              value={amount[0]}
              onChange={(e) => setAmount([parseInt(e.target.value), amount[1]])}
              aria-label="Minimum grant amount"
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
            />
          </div>
          <div>
            <label htmlFor="max-amount" className="text-xs text-slate-400">
              Max
            </label>
            <input
              id="max-amount"
              type="number"
              value={amount[1]}
              onChange={(e) => setAmount([amount[0], parseInt(e.target.value)])}
              aria-label="Maximum grant amount"
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white"
            />
          </div>
        </div>
        {/* Accessible Range Slider */}
        <input
          type="range"
          min="0"
          max="500000"
          step="10000"
          value={amount[0]}
          onChange={(e) => setAmount([parseInt(e.target.value), amount[1]])}
          aria-label="Minimum grant amount slider"
          className="w-full"
        />
        <input
          type="range"
          min="0"
          max="500000"
          step="10000"
          value={amount[1]}
          onChange={(e) => setAmount([amount[0], parseInt(e.target.value)])}
          aria-label="Maximum grant amount slider"
          className="w-full"
        />
      </fieldset>

      {/* Category Checkboxes */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-white mb-2">
          Category
        </legend>
        <div className="space-y-2">
          {['Tech', 'Healthcare', 'Agriculture', 'Manufacturing'].map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={cat}
                checked={categories.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCategories([...categories, cat]);
                  } else {
                    setCategories(categories.filter((c) => c !== cat));
                  }
                }}
                className="w-4 h-4 rounded focus:ring-2 focus:ring-[#40ffaa]"
                aria-label={`Filter by ${cat} category`}
              />
              <span className="text-white text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Funding Type Radio Buttons */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-white mb-2">
          Funding Type
        </legend>
        <div className="space-y-2">
          {['All', 'Grant', 'Loan', 'Equity'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="funding-type"
                value={type}
                checked={fundingType === type}
                onChange={(e) => setFundingType(e.target.value)}
                className="w-4 h-4 focus:ring-2 focus:ring-[#40ffaa]"
                aria-label={`Filter by ${type} funding type`}
              />
              <span className="text-white text-sm">{type}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Reset Button */}
      <button
        onClick={() => {
          setAmount([0, 500000]);
          setCategories([]);
          setFundingType('');
        }}
        className="w-full mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#40ffaa] transition-colors"
        aria-label="Reset all filters to defaults"
      >
        Reset Filters
      </button>
    </aside>
  );
}
```

**Checklist:**
- [ ] Fieldset and legend wrap grouped form controls
- [ ] All inputs have associated labels (id/htmlFor)
- [ ] aria-label provided for inputs without visible labels
- [ ] Radio buttons grouped with fieldset/legend
- [ ] Checkboxes have clear descriptions
- [ ] Range sliders have accessible labels
- [ ] All form controls focusable via Tab key
- [ ] Focus ring visible on all inputs
- [ ] Error states announced to screen readers

### 2.2 Filter State Announcements
Verify filter updates announced:

**Checklist:**
- [ ] Live region announces applied filters (aria-live="polite")
- [ ] Result count updated and announced
- [ ] Filter count displayed (e.g., "3 filters applied")
- [ ] Clear feedback when filters applied/removed
- [ ] No automatic announcements disrupting keyboard navigation

---

## STEP 3: Search Input and Results

### 3.1 Search Input Accessibility
Verify search component:

```typescript
// components/SearchInput.tsx
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SearchInput({ onSearch, results }) {
  const [query, setQuery] = useState('');

  return (
    <div className="relative">
      <label htmlFor="search-input" className="sr-only">
        Search grants
      </label>
      <div className="relative">
        <Search
          className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="search-input"
          type="search"
          placeholder="Search grants..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#40ffaa]"
          aria-label="Search grants"
          aria-autocomplete="list"
          aria-controls="search-results"
          role="combobox"
          aria-expanded={query.length > 0}
        />
      </div>

      {/* Live Region for Results */}
      <div
        id="search-results"
        role="region"
        aria-label="Search results"
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
      >
        {query && results.length > 0
          ? `${results.length} grants found matching ${query}`
          : query
            ? 'No grants found'
            : ''}
      </div>
    </div>
  );
}
```

**Checklist:**
- [ ] Search input has associated label (visible or sr-only)
- [ ] Placeholder not used as label
- [ ] aria-label or aria-labelledby provided
- [ ] Search icon has aria-hidden="true"
- [ ] Focus ring visible on input
- [ ] Search type attribute: `type="search"`

### 3.2 Result Announcements
Verify live region announcements:

**Checklist:**
- [ ] Live region announces result count (aria-live="polite")
- [ ] Announcement triggers on results loaded
- [ ] "No results found" state announced
- [ ] Result count format: "X grants found"
- [ ] Screen readers not overwhelmed with announcements
- [ ] Announcements clear and concise

---

## STEP 4: Data Tables in Admin Dashboard

### 4.1 Table Semantic Structure
Verify table accessibility:

```typescript
// components/admin/AdminTable.tsx
export function AdminTable({ data, columns }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Table Caption */}
        <caption className="text-left mb-4 font-semibold text-white">
          {columns.length} User Accounts
        </caption>

        {/* Table Head */}
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className="text-left px-4 py-2 text-sm font-semibold text-white"
              >
                {col.label}
                {col.sortable && (
                  <button
                    aria-label={`Sort by ${col.label}`}
                    className="ml-2 inline"
                  >
                    ↕️
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id}
              className="border-b border-slate-800 hover:bg-slate-900"
              role="row"
            >
              {columns.map((col) => (
                <td
                  key={`${row.id}-${col.id}`}
                  className="px-4 py-2 text-slate-300"
                  role="cell"
                >
                  {col.render ? col.render(row[col.id], row) : row[col.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Checklist:**
- [ ] Table has semantic `<table>`, `<thead>`, `<tbody>`, `<tfoot>`
- [ ] Table has `<caption>` describing table content
- [ ] Header cells use `<th scope="col">`
- [ ] Row headers use `<th scope="row">` if applicable
- [ ] Table structure logical and clear
- [ ] Data grouped properly with thead/tbody
- [ ] No nested tables (flatten if possible)
- [ ] Sortable columns have buttons with aria-label
- [ ] Table scrollable horizontally if needed

---

## STEP 5: Modal Dialogs (Radix UI)

### 5.1 Dialog Focus Management
Verify Radix Dialog accessibility:

```typescript
// components/workspace/CreateWorkspaceModal.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function CreateWorkspaceModal({ isOpen, onClose }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay with backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />

        {/* Dialog Content */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded-lg p-6 z-50 w-96 max-w-full"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Dialog Title */}
          <Dialog.Title className="text-lg font-semibold text-white mb-4">
            Create New Workspace
          </Dialog.Title>

          {/* Dialog Description */}
          <Dialog.Description className="text-sm text-slate-400 mb-6">
            Enter a name and description for your new workspace to start
            tracking grants.
          </Dialog.Description>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="workspace-name" className="block text-sm font-medium text-white mb-1">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                placeholder="e.g., Tech Grants 2024"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa]"
              />
            </div>

            <div>
              <label htmlFor="workspace-desc" className="block text-sm font-medium text-white mb-1">
                Description (optional)
              </label>
              <textarea
                id="workspace-desc"
                placeholder="What is this workspace for?"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#40ffaa]"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 bg-[#40ffaa] hover:bg-[#3ae699] text-slate-950 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-[#40ffaa] focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Create
              </button>
            </div>
          </form>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] rounded"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Checklist:**
- [ ] Radix Dialog component used for modals
- [ ] Dialog has title: `<Dialog.Title>`
- [ ] Dialog has description: `<Dialog.Description>`
- [ ] Focus moves to first focusable element in dialog (or prevented with onOpenAutoFocus)
- [ ] Focus trapped within dialog (Tab cycles within dialog)
- [ ] Escape key closes dialog
- [ ] Click outside (overlay) closes dialog (optional, configurable)
- [ ] Focus returns to trigger button on close
- [ ] Overlay has aria-hidden="true"
- [ ] All form inputs in dialog properly labeled
- [ ] Submit and Cancel buttons clearly distinguishable
- [ ] Close button has aria-label

---

## STEP 6: Toast Notifications (Radix UI)

### 6.1 Toast Accessibility
Verify toast notifications:

```typescript
// components/Toast.tsx
import * as Toast from '@radix-ui/react-toast';

export function ToastProvider({ children }) {
  return (
    <Toast.Provider swipeDirection="right">
      {children}
      <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col gap-2 p-4 z-50 max-w-md" />
    </Toast.Provider>
  );
}

export function useToast() {
  const [open, setOpen] = React.useState(false);
  const eventDateRef = React.useRef(new Date());

  return {
    toast: (message, type = 'success') => {
      <Toast.Root open={open} onOpenChange={setOpen} type={type}>
        {/* Toast Title */}
        <Toast.Title className="text-sm font-semibold text-white">
          {type === 'success' ? '✓ Success' : '✕ Error'}
        </Toast.Title>

        {/* Toast Description */}
        <Toast.Description asChild>
          <p className="text-sm text-slate-300">{message}</p>
        </Toast.Description>

        {/* Close Button */}
        <Toast.Close
          asChild
          aria-label="Close notification"
        >
          <button className="text-slate-400 hover:text-white">×</button>
        </Toast.Close>
      </Toast.Root>;
    },
  };
}
```

**Checklist:**
- [ ] Radix Toast component used
- [ ] Toast has title and description
- [ ] Toast title describes action (success, error, info)
- [ ] Toast automatically dismissed after 4-5 seconds
- [ ] Manual close button available
- [ ] Toast uses aria-live="polite" (Radix default)
- [ ] Toast not interrupting keyboard navigation
- [ ] Multiple toasts don't stack confusingly
- [ ] Toast position doesn't block critical content
- [ ] Color alone not used to convey status (use icons/text too)

---

## STEP 7: Onboarding Wizard Accessibility

### 7.1 Step Indicators
Verify onboarding progress indication:

```typescript
// components/onboarding/StepIndicator.tsx
export function StepIndicator({ currentStep, totalSteps, stepLabels }) {
  return (
    <nav aria-label="Onboarding steps">
      <ol className="flex justify-center items-center">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <li key={idx} className="flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => goToStep(stepNum)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${label}: Step ${stepNum} of ${totalSteps}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#40ffaa] text-slate-950'
                    : isCompleted
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </button>

              {/* Connector Line (hidden from screen readers) */}
              {idx < stepLabels.length - 1 && (
                <div
                  className={`w-8 h-1 mx-2 ${
                    isCompleted ? 'bg-slate-700' : 'bg-slate-800'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Text Description */}
      <p className="text-center mt-4 text-sm text-slate-400">
        {currentStep} of {totalSteps}: {stepLabels[currentStep - 1]}
      </p>
    </nav>
  );
}
```

**Checklist:**
- [ ] Step indicator uses `<nav>` with aria-label
- [ ] Current step marked with aria-current="step"
- [ ] Completed steps visually distinct
- [ ] Step count displayed numerically (e.g., "3 of 5")
- [ ] Step label/title displayed
- [ ] Buttons keyboard accessible
- [ ] Connectors between steps have aria-hidden="true"
- [ ] No reliance on color alone to show progress

### 7.2 Onboarding Form Navigation
Verify step navigation:

**Checklist:**
- [ ] "Next" button navigates to next step (validation passes)
- [ ] "Back" button navigates to previous step
- [ ] "Next" disabled if required fields empty
- [ ] Keyboard shortcuts optional (e.g., Enter = Next)
- [ ] Form submissions don't require mouse
- [ ] Tab order logical within step
- [ ] Required fields marked and announced
- [ ] Error messages clear and associated with fields

---

## STEP 8: Workspace Checklist Accessibility

### 8.1 Checkbox Accessibility
Verify workspace checklist:

```typescript
// components/workspace/ChecklistItem.tsx
export function ChecklistItem({ item, completed, onToggle }) {
  return (
    <label className="flex items-center gap-3 p-3 bg-slate-900 rounded cursor-pointer hover:bg-slate-800 transition-colors">
      {/* Checkbox Input */}
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(item.id)}
        className="w-4 h-4 rounded cursor-pointer focus:ring-2 focus:ring-[#40ffaa]"
        aria-label={`${item.name}${completed ? ' (completed)' : ''}`}
      />

      {/* Checkbox Label */}
      <span
        className={`text-sm ${
          completed ? 'line-through text-slate-500' : 'text-white'
        }`}
      >
        {item.name}
      </span>
    </label>
  );
}
```

**Checklist:**
- [ ] Checkbox input properly labeled
- [ ] Label associated with checkbox via `<label>` wrapping or id/htmlFor
- [ ] Checked state announced by screen readers
- [ ] Focus ring visible on checkbox
- [ ] Completed state reflected in aria-label
- [ ] Strikethrough for completed items (supported by screen readers)
- [ ] Click area includes label (full label clickable)

---

## STEP 9: AI Chat Interface Accessibility

### 9.1 Chat Message List
Verify chat component:

```typescript
// components/chat/ChatMessages.tsx
import { useEffect, useRef } from 'react';

export function ChatMessages({ messages }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      aria-atomic="false"
      className="space-y-4 p-4 bg-slate-950 rounded-lg h-96 overflow-y-auto"
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          role="article"
          aria-label={`Message from ${msg.role}: ${msg.content.substring(0, 50)}...`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded ${
              msg.role === 'user'
                ? 'bg-[#40ffaa] text-slate-950'
                : 'bg-slate-800 text-white'
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            {msg.timestamp && (
              <time className="text-xs opacity-75 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </time>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

**Checklist:**
- [ ] Message list uses `role="log"` for continuous updates
- [ ] aria-live="polite" announces new messages
- [ ] Messages have semantic structure (article, p tags)
- [ ] New messages announced but don't interrupt
- [ ] Auto-scroll to newest message
- [ ] Scroll history still readable
- [ ] Message sender identified (aria-label)
- [ ] Timestamps accessible

### 9.2 Chat Input
Verify chat input accessibility:

**Checklist:**
- [ ] Text input has aria-label
- [ ] Send button keyboard accessible (Enter key sends)
- [ ] Send button has aria-label
- [ ] Placeholder not used as label
- [ ] Character limit displayed (aria-describedby)
- [ ] Error messages announced
- [ ] No auto-submit or auto-complete overriding user intent

---

## STEP 10: Color Contrast on Dark Theme

### 10.1 Text Color Contrast
Verify WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):

**Expected Contrast Ratios:**
```
White text (#ffffff) on Dark (#1e293b): 17.9:1 ✓ (exceeds 4.5:1)
Accent (#40ffaa) on Dark (#0f172a): 5.3:1 ✓ (exceeds 4.5:1)
Slate-400 (#94a3b8) on Dark (#0f172a): 6.2:1 ✓ (exceeds 4.5:1)
Slate-500 (#64748b) on Dark (#0f172a): 3.5:1 ✗ (below 4.5:1, avoid for body text)
```

**Testing Tool:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Right-click element → Inspect → Computed styles

**Checklist:**
- [ ] Body text: White (#ffffff) or Light gray (#e2e8f0)
- [ ] Accent text: Mint (#40ffaa) only for highlights/CTAs
- [ ] Secondary text: Slate-400 (#94a3b8) minimum
- [ ] Avoid Slate-500 for text (contrast too low)
- [ ] Links have sufficient contrast
- [ ] Button text on button color has sufficient contrast
- [ ] Form labels have sufficient contrast
- [ ] Error messages in red with contrast verified
- [ ] No color-only indicators (use icons/text too)

### 10.2 Interactive Element Contrast
Verify focused/hovered states:

**Checklist:**
- [ ] Focus ring (#40ffaa) visible on all interactive elements
- [ ] Focus ring has sufficient contrast (visible on dark background)
- [ ] Hover states have sufficient contrast change
- [ ] Disabled states visually distinct
- [ ] Active/selected states visually distinct

---

## STEP 11: Skip-to-Content Links

### 11.1 Skip Links Implementation
Add skip links for keyboard navigation:

```typescript
// components/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[#40ffaa] focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded font-semibold"
    >
      Skip to main content
    </a>
  );
}

// In root layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SkipLink />
        <nav>{/* Navigation */}</nav>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
```

**Checklist:**
- [ ] Skip link placed at top of page
- [ ] Skip link hidden visually (sr-only) until focused
- [ ] Skip link visible when focused
- [ ] Skip link links to `#main-content`
- [ ] Main content has `id="main-content"`
- [ ] Keyboard user can Tab to skip link immediately
- [ ] Skip link styled distinctly (high contrast)

---

## STEP 12: Heading Hierarchy

### 12.1 Proper Heading Structure
Verify heading hierarchy on each page:

**Example: Grant Detail Page**
```typescript
<h1>Grant Title</h1>              {/* Page title */}
<h2>Grant Details</h2>            {/* Section heading */}
<h3>About This Grant</h3>        {/* Subsection */}
<h2>Eligibility Requirements</h2> {/* New section */}
<h2>What You'll Need</h2>        {/* New section */}
```

**Checklist:**
- [ ] Every page has exactly one `<h1>` (page title)
- [ ] H1 is first heading on page
- [ ] H2s used for main section headings
- [ ] H3s used for subsections under H2
- [ ] No skipped heading levels (h1 → h3 bad, h1 → h2 → h3 good)
- [ ] Navigation not counted as H1
- [ ] Page titles descriptive and unique
- [ ] Headings not used for styling (use semantic divs)

---

## STEP 13: Form Validation and Error Messages

### 13.1 Error Message Accessibility
Verify form validation feedback:

```typescript
// components/forms/TextInput.tsx
export function TextInput({ label, error, ...props }) {
  const inputId = `input-${Math.random()}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="mb-4">
      {/* Label */}
      <label htmlFor={inputId} className="block text-sm font-medium text-white mb-1">
        {label}
        {props.required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Input */}
      <input
        {...props}
        id={inputId}
        aria-describedby={errorId}
        aria-invalid={!!error}
        className={`w-full px-3 py-2 bg-slate-900 border rounded text-white focus:outline-none focus:ring-2 focus:ring-[#40ffaa] ${
          error ? 'border-red-500' : 'border-slate-700'
        }`}
      />

      {/* Error Message */}
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Required fields marked with `*` and aria-label="required"
- [ ] Error messages appear below field with red text
- [ ] aria-describedby connects field to error message
- [ ] aria-invalid="true" set on invalid fields
- [ ] role="alert" on error message
- [ ] Error messages clear and specific (not technical)
- [ ] Error colors verified for contrast (red on dark)
- [ ] No error flashing on first interaction
- [ ] Error persists until field corrected
- [ ] Multiple errors shown, not just first

---

## STEP 14: Focus Management

### 14.1 Focus After Save/Delete
Verify focus management on actions:

**Checklist:**
- [ ] After saving form: focus moves to success message or next logical element
- [ ] After deleting item: focus moves to next item or parent list
- [ ] After closing modal: focus returns to trigger button
- [ ] After navigating: focus moves to main content (h1)
- [ ] Focus not trapped or lost
- [ ] Focus visible at all times

### 14.2 Focus in Dynamic Content
Verify updates with new content:

**Checklist:**
- [ ] New grant cards in results: focus on first new card (optional)
- [ ] Paginated results: focus on first result or load indicator
- [ ] Filtering: focus on results area or "X results found" message
- [ ] Loading states: announcements don't steal focus
- [ ] New notifications: announced but don't steal focus

---

## STEP 15: Motion and Animation Accessibility

### 15.1 Prefers Reduced Motion
Verify motion respects user preferences:

```typescript
// lib/motion.ts
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// components/animated/AnimatedCard.tsx
import { motion } from 'framer-motion';
import { shouldReduceMotion } from '@/lib/motion';

export function AnimatedCard({ children }) {
  const prefersReducedMotion = shouldReduceMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}
```

**Checklist:**
- [ ] Framer Motion used for animations
- [ ] `prefers-reduced-motion` query implemented
- [ ] Animations disabled when user prefers reduced motion
- [ ] CSS transitions don't rely on motion
- [ ] Animations don't create seizure risks (no flashing)
- [ ] Page functionality works without animations
- [ ] Loading skeletons animate (safe animation type)
- [ ] Pulse Grid animations respect reduced motion

---

## STEP 16: Accessibility Testing

### 16.1 Automated Testing
Run automated accessibility checks:

**Tools:**
- axe DevTools Chrome Extension
- Lighthouse (built into Chrome DevTools)
- WAVE Web Accessibility Evaluation Tool
- Pa11y command line tool

**Checklist:**
- [ ] Run axe DevTools on each page type
- [ ] Run Lighthouse accessibility audit
- [ ] Fix all violations (red/orange warnings)
- [ ] Review best practice items (blue notices)
- [ ] Run tests on mobile viewport
- [ ] Test all page states (empty, loaded, error)

### 16.2 Manual Testing
Perform manual accessibility testing:

**Keyboard Navigation:**
- [ ] Navigate entire app using only Tab/Shift+Tab
- [ ] All buttons/links reachable via keyboard
- [ ] Focus order logical and visible
- [ ] No keyboard traps
- [ ] Enter/Space activate buttons correctly
- [ ] Escape closes modals
- [ ] Arrow keys work in appropriate contexts

**Screen Reader Testing (NVDA/JAWS on Windows, VoiceOver on Mac):**
- [ ] All images have alt text or aria-hidden
- [ ] Page structure makes sense when reading headings only
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Links have descriptive text (not "click here")
- [ ] Buttons have descriptive labels
- [ ] Dynamic updates announced

**Mobile Accessibility:**
- [ ] Touch targets minimum 44x44 pixels
- [ ] Zoom/pinch not prevented
- [ ] Orientation lock not forced
- [ ] Mobile screen reader (TalkBack/VoiceOver) functional
- [ ] No horizontal scrolling required
- [ ] Text resizable and reflows properly

### 16.3 User Testing
Test with real users with disabilities:

**Checklist:**
- [ ] Test with keyboard-only users
- [ ] Test with screen reader users (NVDA, JAWS)
- [ ] Test with users with color blindness (use contrast checker)
- [ ] Test with users on slow connections (test animation performance)
- [ ] Gather feedback and iterate

---

## STEP 17: Accessibility Documentation

### 17.1 Accessibility Statement
Create accessibility statement (optional but recommended):

```markdown
# Accessibility Statement

GrantEase is committed to ensuring digital accessibility for all users,
including those with disabilities. We are continually improving the user
experience for everyone and apply the relevant accessibility standards.

## Accessibility Features
- Keyboard navigation support
- Screen reader compatibility
- High contrast theme
- Adjustable text sizes
- WCAG 2.1 AA compliant

## Report Accessibility Issues
If you encounter accessibility barriers, please contact us at
accessibility@grantease.com

## Third-party Content
External grant application links may not meet our accessibility standards.
We encourage grant providers to ensure their applications are accessible.
```

**Checklist:**
- [ ] Accessibility statement created (if desired)
- [ ] Contact method for accessibility issues provided
- [ ] Known limitations documented
- [ ] Third-party content limitations mentioned

---

## STEP 18: Accessibility Checklist Summary

### Critical (Must Have)
- [ ] Text contrast WCAG AA (4.5:1 normal, 3:1 large)
- [ ] All interactive elements keyboard accessible
- [ ] Form labels properly associated
- [ ] Heading hierarchy correct
- [ ] Images have alt text or aria-hidden
- [ ] Focus visible and managed
- [ ] Error messages clear and associated

### Important (Should Have)
- [ ] Screen reader support (semantic HTML)
- [ ] Live regions for dynamic content
- [ ] Skip links at top of page
- [ ] Prefers reduced motion respected
- [ ] Mobile touch targets 44x44+
- [ ] Modal dialogs properly implemented
- [ ] Status messages announced
- [ ] Form validation clear

### Nice to Have
- [ ] Accessibility statement
- [ ] ARIA landmarks (nav, main, aside, footer)
- [ ] ARIA descriptions for complex widgets
- [ ] Extended alt text for complex images
- [ ] Accessibility audit results published
- [ ] Third-party accessibility tools integrated

---

## WCAG 2.1 AA Compliance Target

The GrantEase application targets WCAG 2.1 AA conformance:

- Perceivable: All visual and audio information perceivable
- Operable: All functionality operable via keyboard
- Understandable: Text clear and predictable
- Robust: Compatible with assistive technologies

Focus initially on Critical items, then expand to Important, then Nice to Have.

---

## Summary

This accessibility audit ensures GrantEase is usable by everyone, regardless of ability. Prioritize fixing failing items in the following order:

1. Contrast ratio issues
2. Keyboard navigation gaps
3. Missing labels and descriptions
4. Focus management problems
5. Semantic HTML issues

Test regularly with both automated tools and real users with disabilities to maintain accessibility as the application evolves.
