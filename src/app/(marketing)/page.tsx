'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { HeroSearch } from '@/components/marketing/HeroSearch'

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

export default function HomePage() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const m = (props: Record<string, unknown>) => (reduced ? {} : props)

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 overflow-hidden">
        {/* Background warmth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[400px] rounded-full bg-emerald-500/[0.02] blur-[130px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">Grant Discovery Platform</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[680px]">
              Find grants.{' '}
              <span className="text-pulse-text-secondary italic">
                Finish applications.
              </span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mb-10">
              Search 20,000+ grants. Get matched instantly.
              AI helps you write every section.
            </p>

            <HeroSearch />
          </motion.div>
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04] relative"
        {...m(fadeIn)}
      >
        {/* Subtle section wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { num: '01', title: 'Smart matching', desc: 'Every requirement checked against your profile. Only see grants you qualify for.', accent: 'from-pulse-accent/20 to-pulse-accent/5' },
              { num: '02', title: 'Plain English', desc: 'No jargon. Every grant explained clearly so you know exactly what\'s required.', accent: 'from-emerald-400/20 to-emerald-400/5' },
              { num: '03', title: 'AI writing help', desc: 'Draft every section with AI. Your vault auto-fills the basics across all apps.', accent: 'from-teal-400/20 to-teal-400/5' },
              { num: '04', title: 'Keep 100%', desc: 'No percentage fees. No success fees. Every dollar you win goes directly to you.', accent: 'from-pulse-accent/20 to-emerald-400/5' },
            ].map((item) => (
              <div
                key={item.num}
                className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                {/* Accent top bar */}
                <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${item.accent}`} />

                <span className="text-label-sm text-pulse-accent mb-3 block">{item.num}</span>
                <h3 className="text-heading-sm text-pulse-text mb-2">{item.title}</h3>
                <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-6">
            <Link
              href="/how-it-works"
              className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
            >
              See how it works
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/pricing"
              className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
            >
              View pricing
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ─── STATS ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {[
              { value: '20,000+', label: 'Grants indexed' },
              { value: '50+', label: 'Data sources' },
              { value: '$12B+', label: 'Available funding' },
              { value: '15 min', label: 'To first match' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-stat text-pulse-accent tabular-nums">{s.value}</div>
                <div className="text-label-sm text-pulse-text-tertiary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── CTA ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/[0.04] relative overflow-hidden"
        {...m(fadeIn)}
      >
        {/* CTA background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pulse-accent/[0.03] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2 className="text-display-section text-pulse-text mb-3 max-w-md">
                Ready to find your{' '}
                <span className="text-pulse-accent">first grant?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Free to start &middot; No credit card &middot; 5 minutes to set up
              </p>
            </div>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)] shrink-0 self-start lg:self-auto"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
