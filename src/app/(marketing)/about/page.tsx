'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Target, Users, Lightbulb, Heart } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

const values = [
  {
    icon: Target,
    title: 'Precision first',
    description: 'Quality over quantity. Every feature helps you find the right grants.',
  },
  {
    icon: Users,
    title: 'Universal access',
    description: 'Tools that work for first-time applicants and experts alike.',
  },
  {
    icon: Lightbulb,
    title: 'Radical transparency',
    description: 'Clear information, honest pricing, no hidden catches.',
  },
  {
    icon: Heart,
    title: 'Real impact',
    description: 'Every grant won means a project funded, a mission advanced.',
  },
]

const timeline = [
  { year: '2022', title: 'The problem', desc: 'Founders spent 100+ hours searching fragmented databases.' },
  { year: '2023', title: 'The solution', desc: 'Built Grants By AI, aggregating 20+ sources into one platform.' },
  { year: '2024', title: 'The growth', desc: 'Expanded to 50+ sources, launched AI matching, 10K users.' },
  { year: 'Now', title: 'The mission', desc: '15,000+ organizations trust Grants By AI for funding.' },
]

export default function AboutPage() {
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
      {/* ---- HERO ---- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">About Grants By AI</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[680px]">
              Democratizing access to{' '}
              <span className="text-pulse-text-secondary italic">funding</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mb-10">
              Finding grants shouldn&apos;t require a dedicated staff member or expensive consultants.
              We make funding accessible to every organization that deserves it.
            </p>

            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)]"
            >
              Join 15K+ Organizations
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {[
              { value: '$12B+', label: 'Available funding' },
              { value: '20K+', label: 'Grant programs' },
              { value: '15K+', label: 'Organizations' },
              { value: '94%', label: 'Match accuracy' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-stat text-pulse-accent tabular-nums">{s.value}</div>
                <div className="text-label-sm text-pulse-text-tertiary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---- TIMELINE ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04] relative"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-14">
            <span className="text-label text-pulse-accent mb-4 block">Our Journey</span>
            <h2 className="text-display-section text-pulse-text max-w-md">
              Born from frustration, built with purpose
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((item, i) => (
              <div
                key={item.year}
                className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                {/* Accent top bar */}
                <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${
                  i === timeline.length - 1
                    ? 'from-pulse-accent/30 to-pulse-accent/5'
                    : 'from-pulse-accent/20 to-pulse-accent/5'
                }`} />

                <span className="text-label-sm text-pulse-accent mb-3 block">{item.year}</span>
                <h3 className="text-heading-sm text-pulse-text mb-2">{item.title}</h3>
                <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---- VALUES ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <span className="text-label text-pulse-accent mb-4 block">Our Values</span>
            <h2 className="text-display-section text-pulse-text max-w-sm">What drives us</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="group relative p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/20 to-pulse-accent/5" />

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-pulse-accent" />
                    </div>
                    <div>
                      <h3 className="text-heading-sm text-pulse-text mb-1">{value.title}</h3>
                      <p className="text-body-sm text-pulse-text-tertiary">{value.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ---- CTA ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/[0.04] relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pulse-accent/[0.03] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2 className="text-display-section text-pulse-text mb-3 max-w-md">
                Ready to find your{' '}
                <span className="text-pulse-accent">funding?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Join 15,000+ organizations discovering grants with Grants By AI.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)]"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
              >
                Contact us
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
