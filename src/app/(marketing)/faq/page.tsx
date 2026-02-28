'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Grants By AI?',
        a: 'Grants By AI is an intelligent grant discovery platform that aggregates funding opportunities from federal, state, local, nonprofit, and private sources. We help you find, match, and apply to grants faster.',
      },
      {
        q: 'What types of grants can I find?',
        a: 'We cover small business, nonprofit, education, research, agriculture, climate, healthcare, arts & culture, housing, community development, technology, and workforce development.',
      },
      {
        q: 'How often is the grant data updated?',
        a: 'Our system runs daily to ingest new grants and update existing listings from Grants.gov, SAM.gov, state portals, and foundation databases.',
      },
      {
        q: 'Is Grants By AI free to use?',
        a: 'Yes! Our Starter plan is free forever with unlimited searches, basic filters, and up to 10 saved grants. Paid plans unlock additional features like AI writing assistance and team collaboration.',
      },
    ],
  },
  {
    category: 'Search & Matching',
    questions: [
      {
        q: 'How does the search work?',
        a: 'Our search uses full-text matching across grant titles, descriptions, sponsors, and eligibility criteria. Use filters to narrow by category, funding amount, deadline, and location.',
      },
      {
        q: 'Can I search by location?',
        a: 'Yes — filter grants by country, state, or region. Many grants are location-specific, so this helps you find opportunities you qualify for.',
      },
      {
        q: 'What does the match score mean?',
        a: 'Match scores indicate how well a grant aligns with your profile. Higher scores suggest better compatibility based on your organization type, focus areas, and eligibility criteria.',
      },
    ],
  },
  {
    category: 'Alerts & Saved Searches',
    questions: [
      {
        q: 'How do saved searches work?',
        a: 'Save any search with filters to re-run it with one click. Pro and Team plans can enable email alerts when new grants match your criteria.',
      },
      {
        q: 'How often are alerts sent?',
        a: 'Choose daily or weekly frequency for each saved search. Alerts are sent only when new matching grants are found — no spam.',
      },
      {
        q: 'Can I export my saved grants?',
        a: 'Yes, Pro and Team users can export saved grants to CSV for offline analysis or reporting.',
      },
    ],
  },
  {
    category: 'Workspaces & Applications',
    questions: [
      {
        q: 'What is an application workspace?',
        a: 'Workspaces help you organize grant applications with checklists, notes, deadline tracking, and status management — all in one place.',
      },
      {
        q: 'Can I collaborate with my team?',
        a: 'Team plan users can share workspaces, assign tasks, and track activity across the organization.',
      },
      {
        q: 'Does Grants By AI submit applications for me?',
        a: "No — we're a discovery and organization tool. You submit applications through the official grant portal. Our AI can help you draft application content.",
      },
    ],
  },
  {
    category: 'Billing',
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Upgrade anytime from account settings. Changes take effect immediately with prorated billing.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, cancel anytime. You keep paid features until the end of your billing period, then revert to the free Starter plan.',
      },
      {
        q: 'Do you offer refunds?',
        a: "We offer a 14-day money-back guarantee on all paid plans. Contact support if you're not satisfied.",
      },
    ],
  },
]

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        isOpen
          ? 'bg-white/[0.04] border border-pulse-accent/15'
          : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]'
      )}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className={cn(
          'text-[15px] font-medium transition-colors',
          isOpen ? 'text-pulse-accent' : 'text-pulse-text'
        )}>
          {question}
        </span>
        <div className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all',
          isOpen
            ? 'bg-pulse-accent text-pulse-bg'
            : 'bg-white/[0.04] text-pulse-text-tertiary'
        )}>
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-body-sm text-pulse-text-secondary leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const m = (props: Record<string, unknown>) => (reduced ? {} : props)

  const handleToggle = (question: string) => {
    setOpenQuestion(openQuestion === question ? null : question)
  }

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">Help Center</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[680px]">
              Frequently asked{' '}
              <span className="text-pulse-text-secondary italic">questions</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg">
              Everything you need to know about Grants By AI.
              Can&apos;t find what you&apos;re looking for?{' '}
              <Link href="/contact" className="text-pulse-accent hover:underline underline-offset-2">Contact us</Link>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ SECTIONS ─── */}
      {faqs.map((section, sectionIndex) => (
        <motion.section
          key={section.category}
          className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16 border-t border-white/[0.04]"
          {...m(fadeIn)}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-label-sm text-pulse-accent">0{sectionIndex + 1}</span>
              <h2 className="text-heading text-pulse-text">{section.category}</h2>
            </div>

            <div className="space-y-2">
              {section.questions.map((faq) => (
                <FAQItem
                  key={faq.q}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openQuestion === faq.q}
                  onToggle={() => handleToggle(faq.q)}
                />
              ))}
            </div>
          </div>
        </motion.section>
      ))}

      {/* ─── CTA ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/[0.04] relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pulse-accent/[0.03] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Support card */}
            <div className="relative p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/20 to-pulse-accent/5" />
              <h3 className="text-heading text-pulse-text mb-2">Still have questions?</h3>
              <p className="text-body-sm text-pulse-text-tertiary mb-4">Our team responds within 24 hours.</p>
              <Link
                href="/contact"
                className="text-body-sm text-pulse-accent hover:underline underline-offset-2 inline-flex items-center gap-1.5 transition-colors"
              >
                Contact Support <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Get started card */}
            <div className="relative p-6 rounded-xl bg-pulse-accent/[0.04] border border-pulse-accent/15 hover:border-pulse-accent/25 transition-all duration-300">
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/30 to-pulse-accent/5" />
              <h3 className="text-heading text-pulse-text mb-2">Ready to get started?</h3>
              <p className="text-body-sm text-pulse-text-tertiary mb-4">Join 15,000+ organizations finding grants.</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pulse-accent text-pulse-bg font-semibold text-[14px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200"
              >
                Start Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
