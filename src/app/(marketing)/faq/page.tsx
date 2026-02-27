'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, Minus, Search, Bell, FolderOpen, CreditCard, HelpCircle, MessageCircle } from 'lucide-react'

const faqs = [
  {
    category: 'General',
    icon: HelpCircle,
    questions: [
      {
        q: 'What is Grants By AI?',
        a: 'Grants By AI is an intelligent grant discovery platform that aggregates funding opportunities from federal, state, local, nonprofit, and private sources.',
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
        a: 'Yes! Our Starter plan is free forever with unlimited searches, basic filters, and up to 10 saved grants. Paid plans offer additional features.',
      },
    ],
  },
  {
    category: 'Search',
    icon: Search,
    questions: [
      {
        q: 'How does the search work?',
        a: 'Our search uses full-text matching across grant titles, descriptions, sponsors, and eligibility criteria. Use filters to narrow by category, funding amount, and deadline.',
      },
      {
        q: 'Can I search by location?',
        a: 'Yes! Filter grants by country, state, or region. Many grants are location-specific, so this helps you find opportunities you qualify for.',
      },
      {
        q: 'What does the match score mean?',
        a: 'Match scores indicate how well a grant aligns with your profile. Higher scores suggest better compatibility, though always review eligibility requirements.',
      },
    ],
  },
  {
    category: 'Alerts',
    icon: Bell,
    questions: [
      {
        q: 'How do saved searches work?',
        a: 'Save any search with filters to re-run it with one click. Pro and Team plans can enable email alerts when new grants match your criteria.',
      },
      {
        q: 'How often are alerts sent?',
        a: 'Choose daily or weekly frequency for each saved search. Alerts are sent only when new matching grants are found.',
      },
      {
        q: 'Can I export my saved grants?',
        a: 'Yes, Pro and Team users can export saved grants to CSV for offline analysis or reporting.',
      },
    ],
  },
  {
    category: 'Workspaces',
    icon: FolderOpen,
    questions: [
      {
        q: 'What is an application workspace?',
        a: 'Workspaces help you organize grant applications with checklists, notes, deadline tracking, and status management.',
      },
      {
        q: 'Can I collaborate with my team?',
        a: 'Team plan users can share workspaces, assign tasks, and track activity across the organization.',
      },
      {
        q: 'Does Grants By AI submit applications?',
        a: "No, we're a discovery and organization tool. You submit applications through the official grant portal directly.",
      },
    ],
  },
  {
    category: 'Billing',
    icon: CreditCard,
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Upgrade anytime from account settings. Changes take effect immediately with prorated billing.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, cancel anytime. You keep paid features until the end of your billing period, then revert to free Starter plan.',
      },
      {
        q: 'Do you offer refunds?',
        a: "We offer a 14-day money-back guarantee on all paid plans. Contact support if you're not satisfied.",
      },
    ],
  },
]

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  prefersReducedMotion,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  prefersReducedMotion: boolean
}) {
  return (
    <div
      className={`group rounded-xl transition-all duration-200 ${
        isOpen
          ? 'bg-white/[0.03] border border-pulse-accent/20'
          : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className={`font-medium transition-colors ${
          isOpen ? 'text-pulse-accent' : 'text-pulse-text'
        }`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          isOpen
            ? 'bg-pulse-accent text-pulse-bg'
            : 'bg-white/[0.03] border border-white/[0.08] text-pulse-text-tertiary'
        }`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-pulse-text-secondary leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('General')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const motionProps = (props: Record<string, unknown>) =>
    prefersReducedMotion ? {} : props

  const handleToggle = (question: string) => {
    setOpenQuestion(openQuestion === question ? null : question)
  }

  const activeSection = faqs.find(f => f.category === activeCategory)

  return (
    <main className="pt-20">
      {/* Hero */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        {...motionProps(fadeInUp)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <MessageCircle className="w-4 h-4 text-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">Help Center</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-pulse-text mb-4 tracking-tight">
            Frequently asked <span className="text-pulse-accent">questions</span>
          </h1>

          <p className="text-lg text-pulse-text-secondary max-w-xl mx-auto">
            Everything you need to know about Grants By AI.{' '}
            <Link href="/contact" className="text-pulse-accent hover:underline">Contact us</Link> if you need more help.
          </p>
        </div>
      </motion.section>

      {/* Category tabs */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {faqs.map((section) => {
              const Icon = section.icon
              const isActive = activeCategory === section.category
              return (
                <button
                  key={section.category}
                  onClick={() => {
                    setActiveCategory(section.category)
                    setOpenQuestion(null)
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-pulse-accent text-pulse-bg font-medium'
                      : 'bg-white/[0.02] border border-white/[0.06] text-pulse-text-secondary hover:border-white/[0.12]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pulse-bg' : 'text-pulse-accent'}`} />
                  {section.category}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {activeSection && (
              <motion.div
                key={activeSection.category}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <motion.div
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {activeSection.questions.map((faq) => (
                    <motion.div key={faq.q} variants={staggerItem}>
                      <FAQItem
                        question={faq.q}
                        answer={faq.a}
                        isOpen={openQuestion === faq.q}
                        onToggle={() => handleToggle(faq.q)}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <MessageCircle className="w-10 h-10 text-pulse-accent mb-4" />
              <h3 className="text-xl font-semibold text-pulse-text mb-2">Still have questions?</h3>
              <p className="text-pulse-text-secondary mb-4">Our team responds within 24 hours.</p>
              <Link href="/contact" className="text-pulse-accent font-medium hover:underline inline-flex items-center gap-1">
                Contact Support <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-8 rounded-2xl bg-pulse-accent/10 border border-pulse-accent/20">
              <ArrowRight className="w-10 h-10 text-pulse-accent mb-4" />
              <h3 className="text-xl font-semibold text-pulse-text mb-2">Ready to get started?</h3>
              <p className="text-pulse-text-secondary mb-4">Join 15,000+ organizations finding grants.</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pulse-accent text-pulse-bg font-medium rounded-lg hover:bg-pulse-accent/90 transition-all"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
