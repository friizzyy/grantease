'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Mail,
  Search,
  X,
  HelpCircle,
  Bell,
  FolderKanban,
  Receipt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionIntro } from '@/components/marketing/SectionIntro'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'

/* ─── DATA ─── */

const categories = [
  { key: 'general', label: 'General', icon: HelpCircle },
  { key: 'search', label: 'Search & Matching', icon: Search },
  { key: 'alerts', label: 'Alerts & Saved', icon: Bell },
  { key: 'workspaces', label: 'Workspaces', icon: FolderKanban },
  { key: 'billing', label: 'Billing', icon: Receipt },
]

const allFaqs: { category: string; q: string; a: string }[] = [
  { category: 'general', q: 'What is Grants By AI?', a: 'An intelligent grant discovery platform that aggregates funding opportunities from federal, state, local, nonprofit, and private sources. We help you find, match, and apply to grants faster.' },
  { category: 'general', q: 'What types of grants can I find?', a: 'Small business, nonprofit, education, research, agriculture, climate, healthcare, arts & culture, housing, community development, technology, and workforce development.' },
  { category: 'general', q: 'How often is the grant data updated?', a: 'Daily. Our system ingests new grants and updates existing listings from Grants.gov, SAM.gov, state portals, and foundation databases every day.' },
  { category: 'general', q: 'Is Grants By AI free to use?', a: 'Yes. The Starter plan is free forever with unlimited searches, basic filters, and up to 10 saved grants. Paid plans unlock AI writing assistance and team collaboration.' },
  { category: 'search', q: 'How does the search work?', a: 'Full-text matching across grant titles, descriptions, sponsors, and eligibility criteria. Use filters to narrow by category, funding amount, deadline, and location.' },
  { category: 'search', q: 'Can I search by location?', a: 'Yes. Filter grants by country, state, or region. Many grants are location-specific, so this helps you find opportunities you actually qualify for.' },
  { category: 'search', q: 'What does the match score mean?', a: 'It indicates how well a grant aligns with your profile based on organization type, focus areas, revenue, and eligibility criteria. Higher scores mean better compatibility.' },
  { category: 'alerts', q: 'How do saved searches work?', a: 'Save any search with filters to re-run it with one click. Pro and Team plans can enable email alerts when new grants match your saved criteria.' },
  { category: 'alerts', q: 'How often are alerts sent?', a: 'Choose daily or weekly frequency for each saved search. Alerts are sent only when new matching grants are found, never spam.' },
  { category: 'alerts', q: 'Can I export my saved grants?', a: 'Yes. Pro and Team users can export saved grants to CSV for offline analysis or reporting.' },
  { category: 'workspaces', q: 'What is an application workspace?', a: 'A workspace organizes a single grant application with checklists, notes, deadline tracking, and status management, all in one place.' },
  { category: 'workspaces', q: 'Can I collaborate with my team?', a: 'Team plan users can share workspaces, assign tasks, and track activity across the organization.' },
  { category: 'workspaces', q: 'Does Grants By AI submit applications for me?', a: "No. We're a discovery and organization tool. You submit through the official grant portal. Our AI can help you draft application content." },
  { category: 'billing', q: 'How do I upgrade my plan?', a: 'Upgrade anytime from account settings. Changes take effect immediately with prorated billing.' },
  { category: 'billing', q: 'Can I cancel my subscription?', a: 'Yes. Cancel anytime. You keep paid features until the end of your billing period, then revert to the free Starter plan.' },
  { category: 'billing', q: 'Do you offer refunds?', a: "14-day money-back guarantee on all paid plans. Contact support if you're not satisfied." },
]

/* ─── ANIMATION ─── */

// Material/Apple standard ease
const ease = [0.4, 0, 0.2, 1] as const

// Answer panel: single unified crossfade, no stagger, no positional movement
const answerFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// Watermark: slow independent fade layered behind content
const watermarkFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.7, ease, delay: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

// Mobile accordion: spring-based height for physical weight
const mobileExpand = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto' as const,
    opacity: 1,
    transition: {
      height: { type: 'spring' as const, stiffness: 150, damping: 22 },
      opacity: { duration: 0.3, ease, delay: 0.06 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      opacity: { duration: 0.15 },
      height: { type: 'spring' as const, stiffness: 200, damping: 26 },
    },
  },
}

/* ─── HELPERS ─── */

function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-pulse-accent/20 text-pulse-accent rounded px-0.5">{part}</mark>
    ) : (
      part
    )
  )
}

/* ─── PAGE ─── */

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState<number | null>(null)
  const { reduced, m } = useReducedMotion()

  const currentFaqs = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return allFaqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    }
    return allFaqs.filter(f => f.category === activeCategory)
  }, [activeCategory, searchQuery])

  useEffect(() => {
    setActiveIndex(0)
    setMobileOpen(null)
  }, [activeCategory, searchQuery])

  const activeFaq = currentFaqs[activeIndex]
  const isSearching = searchQuery.trim().length > 0

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex(prev => Math.min(prev + 1, currentFaqs.length - 1))
  }, [currentFaqs.length])

  const goPrev = useCallback(() => {
    setActiveIndex(prev => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  const activeCat = activeFaq ? categories.find(c => c.key === activeFaq.category) : null
  const ActiveCatIcon = activeCat?.icon || HelpCircle

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[20%] w-[500px] h-[400px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-pulse-accent/[0.025] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">Help Center</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              Questions?{' '}
              <span className="text-pulse-indigo italic">Answered.</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-indigo/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mx-auto">
              Everything you need to know about Grants By AI, instantly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ BROWSER ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/25"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Gradient top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-pulse-indigo/50 to-transparent" />

            <div className="bg-white/[0.02] border-x border-b border-white/[0.08] rounded-b-2xl">

              {/* ── TAB BAR + SEARCH ── */}
              <div className="border-b border-white/[0.06] px-2 sm:px-4">
                <div className="flex items-center">
                  {categories.map(cat => {
                    const Icon = cat.icon
                    const isActive = !isSearching && activeCategory === cat.key
                    const count = allFaqs.filter(f => f.category === cat.key).length
                    return (
                      <button
                        key={cat.key}
                        onClick={() => { setActiveCategory(cat.key); setSearchQuery('') }}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 lg:px-3.5 py-3.5 text-body-sm font-medium border-b-2 -mb-px transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-pulse-accent/30',
                          isActive
                            ? 'border-pulse-accent text-pulse-accent'
                            : 'border-transparent text-pulse-text-tertiary hover:text-pulse-text-secondary',
                          isSearching && 'opacity-40'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline whitespace-nowrap">{cat.label}</span>
                        <span className={cn(
                          'hidden lg:inline text-[10px] tabular-nums px-1.5 py-0.5 rounded-full leading-none transition-colors duration-200',
                          isActive
                            ? 'bg-pulse-accent/15 text-pulse-accent'
                            : 'bg-white/[0.04] text-pulse-text-tertiary/40'
                        )}>
                          {count}
                        </span>
                      </button>
                    )
                  })}

                  {/* Inline search */}
                  <div className="ml-auto flex items-center shrink-0 pl-2 py-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pulse-text-tertiary pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-32 sm:w-40 h-8 pl-8 pr-7 rounded-lg bg-white/[0.04] border border-white/[0.06] text-caption text-pulse-text placeholder:text-pulse-text-tertiary/40 focus:outline-none focus:ring-1 focus:ring-pulse-accent/30 focus:shadow-[0_0_15px_rgba(64,255,170,0.06)] focus:w-48 sm:focus:w-56 transition-all duration-200"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search indicator */}
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease }}
                    className="overflow-hidden border-b border-white/[0.04]"
                  >
                    <div className="px-5 py-2.5 bg-pulse-accent/[0.03]">
                      <p className="text-caption text-pulse-text-tertiary">
                        {currentFaqs.length} result{currentFaqs.length !== 1 ? 's' : ''} across all categories
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentFaqs.length > 0 ? (
                <>
                  {/* ── DESKTOP: TWO-PANEL BROWSER ── */}
                  <div className="hidden lg:grid grid-cols-[300px_1fr]">
                    {/* Left: Question index */}
                    <div className="border-r border-white/[0.06] max-h-[520px] overflow-y-auto scrollbar-hide">
                      {currentFaqs.map((faq, i) => (
                        <button
                          key={faq.q}
                          onClick={() => goTo(i)}
                          className={cn(
                            'w-full text-left flex items-start gap-3 px-5 py-4 border-l-2 transition-all duration-200 focus:outline-none',
                            i !== currentFaqs.length - 1 && 'border-b border-b-white/[0.04]',
                            i === activeIndex
                              ? 'border-l-pulse-accent bg-gradient-to-r from-pulse-accent/[0.08] to-transparent'
                              : 'border-l-transparent hover:bg-white/[0.03]'
                          )}
                        >
                          <span className={cn(
                            'text-label-sm tabular-nums font-mono mt-0.5 shrink-0 w-5 transition-colors duration-200',
                            i === activeIndex ? 'text-pulse-accent' : 'text-pulse-text-tertiary/25'
                          )}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className={cn(
                            'text-body-sm leading-snug line-clamp-2 transition-colors duration-200',
                            i === activeIndex ? 'text-pulse-text font-medium' : 'text-pulse-text-secondary'
                          )}>
                            {highlightText(faq.q, searchQuery)}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Right: Answer detail */}
                    <div className="relative flex flex-col min-h-[520px]">
                      {/* Decorative gradient blob */}
                      <div className="absolute top-8 right-8 w-[280px] h-[220px] rounded-full bg-pulse-indigo/[0.03] blur-[100px] pointer-events-none" />

                      {/* Decorative question number watermark */}
                      <div className="absolute top-6 right-10 pointer-events-none select-none overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={activeIndex}
                            className="block text-[100px] font-bold leading-none text-white/[0.02] tracking-tighter"
                            {...(reduced ? {} : watermarkFade)}
                          >
                            {String(activeIndex + 1).padStart(2, '0')}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      <div className="flex-1 relative z-10 p-8 sm:p-10">
                        <AnimatePresence mode="wait" initial={false}>
                          {activeFaq && (
                            <motion.div
                              key={activeFaq.q}
                              {...(reduced ? {} : answerFade)}
                            >
                              {/* Category badge with icon */}
                              <div className="flex items-center gap-3 mb-6">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pulse-indigo/10 border border-pulse-indigo/10 text-pulse-indigo text-label-sm font-medium">
                                  <ActiveCatIcon className="w-3 h-3" />
                                  {activeCat?.label}
                                </span>
                                <span className="text-caption text-pulse-text-tertiary/25 tabular-nums font-mono">
                                  {activeIndex + 1} / {currentFaqs.length}
                                </span>
                              </div>

                              {/* Question heading */}
                              <h3 className="text-xl sm:text-2xl font-semibold text-pulse-text mb-4 leading-snug tracking-tight">
                                {highlightText(activeFaq.q, searchQuery)}
                              </h3>

                              {/* Accent divider */}
                              <div className="h-px w-10 bg-gradient-to-r from-pulse-accent/50 to-transparent mb-5" />

                              {/* Answer text */}
                              <p className="text-body text-pulse-text-secondary leading-[1.8] max-w-xl">
                                {highlightText(activeFaq.a, searchQuery)}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Navigation footer */}
                      <div className="border-t border-white/[0.06] px-8 sm:px-10 py-4 flex items-center justify-between relative z-10">
                        <button
                          onClick={goPrev}
                          disabled={activeIndex === 0}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-all duration-200 focus:outline-none',
                            activeIndex === 0
                              ? 'text-pulse-text-tertiary/15 cursor-not-allowed'
                              : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-white/[0.04]'
                          )}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Previous
                        </button>

                        {/* Dot indicators */}
                        <div className="flex items-center gap-1.5">
                          {currentFaqs.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => goTo(i)}
                              aria-label={`Go to question ${i + 1}`}
                              className={cn(
                                'h-1.5 rounded-full transition-all duration-300 focus:outline-none',
                                i === activeIndex
                                  ? 'bg-pulse-accent w-5 shadow-[0_0_8px_rgba(64,255,170,0.4)]'
                                  : 'bg-white/[0.08] w-1.5 hover:bg-white/[0.15]'
                              )}
                            />
                          ))}
                        </div>

                        <button
                          onClick={goNext}
                          disabled={activeIndex === currentFaqs.length - 1}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-all duration-200 focus:outline-none',
                            activeIndex === currentFaqs.length - 1
                              ? 'text-pulse-text-tertiary/15 cursor-not-allowed'
                              : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-white/[0.04]'
                          )}
                        >
                          Next
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── MOBILE: NUMBERED ACCORDION ── */}
                  <div className="lg:hidden divide-y divide-white/[0.04]">
                    {currentFaqs.map((faq, i) => {
                      const isOpen = isSearching || mobileOpen === i
                      const MobileCatIcon = categories.find(c => c.key === faq.category)?.icon || HelpCircle
                      return (
                        <div key={faq.q} className={cn('transition-colors duration-200', isOpen && 'bg-pulse-accent/[0.02]')}>
                          <button
                            onClick={() => setMobileOpen(isOpen && !isSearching ? null : i)}
                            className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left focus:outline-none"
                          >
                            <span className={cn(
                              'text-label-sm tabular-nums font-mono shrink-0 w-5 transition-colors duration-200',
                              isOpen ? 'text-pulse-accent' : 'text-pulse-text-tertiary/25'
                            )}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className={cn(
                              'flex-1 text-body-sm leading-snug transition-colors duration-200',
                              isOpen ? 'text-pulse-text font-medium' : 'text-pulse-text-secondary'
                            )}>
                              {highlightText(faq.q, searchQuery)}
                            </span>
                            {!isSearching && (
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                                className="shrink-0"
                              >
                                <ChevronDown className={cn(
                                  'w-4 h-4 transition-colors duration-200',
                                  isOpen ? 'text-pulse-accent' : 'text-pulse-text-tertiary'
                                )} />
                              </motion.div>
                            )}
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                {...mobileExpand}
                                className="overflow-hidden"
                              >
                                <div className="px-4 sm:px-5 pb-5 ml-6 pl-6 sm:pl-7 border-l-2 border-pulse-accent/20">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pulse-indigo/10 border border-pulse-indigo/10 text-pulse-indigo text-label-sm font-medium mb-3">
                                    <MobileCatIcon className="w-2.5 h-2.5" />
                                    {categories.find(c => c.key === faq.category)?.label}
                                  </span>
                                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">
                                    {highlightText(faq.a, searchQuery)}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                /* ── EMPTY STATE ── */
                <motion.div
                  className="text-center py-20 px-4"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/10">
                    <Search className="w-7 h-7 text-pulse-text-tertiary" />
                  </div>
                  <p className="text-heading text-pulse-text mb-2">No results found</p>
                  <p className="text-body-sm text-pulse-text-tertiary mb-6 max-w-sm mx-auto">
                    Try a different search term or browse by topic.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('general') }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-body-sm font-medium text-pulse-accent border border-pulse-accent/20 rounded-lg hover:bg-pulse-accent/10 transition-all duration-200"
                  >
                    Show all questions
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Keyboard hint */}
          <div className="hidden lg:flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-pulse-text-tertiary/25">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono leading-none">&#8593;</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono leading-none">&#8595;</kbd>
              <span className="text-[11px] ml-0.5">navigate</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[400px] bg-pulse-indigo/[0.025] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-10 text-center">
            <SectionIntro
              label="Support"
              headingAs="h2"
              description="Can't find what you're looking for? We're here to help."
            >
              Still have questions?
            </SectionIntro>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="relative p-6 rounded-xl card-glass group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text mb-1.5">Email us</h3>
                  <p className="text-body-sm text-pulse-text-tertiary mb-4">
                    Our team responds within 24 hours.
                  </p>
                  <Link
                    href="/contact"
                    className="text-body-sm text-pulse-accent hover:underline underline-offset-2 inline-flex items-center gap-1.5 transition-colors duration-200"
                  >
                    Contact Support <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative p-6 rounded-xl card-glass-accent group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/15 border border-pulse-accent/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text mb-1.5">Get started</h3>
                  <p className="text-body-sm text-pulse-text-tertiary mb-4">
                    Join 15,000+ organizations finding grants.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-pulse-accent text-pulse-bg font-semibold text-body-sm rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_20px_rgba(64,255,170,0.12)]"
                  >
                    Start Free <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
