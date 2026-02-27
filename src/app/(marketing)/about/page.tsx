'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Target, Users, Lightbulb, Heart, Sparkles, Shield, Globe, Zap, Award } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Precision First',
    description: 'Quality over quantity. Every feature helps you find the right grants.',
  },
  {
    icon: Users,
    title: 'Universal Access',
    description: 'Tools that work for first-time applicants and experts alike.',
  },
  {
    icon: Lightbulb,
    title: 'Radical Transparency',
    description: 'Clear information, honest pricing, no hidden catches.',
  },
  {
    icon: Heart,
    title: 'Real Impact',
    description: 'Every grant won means a project funded, a mission advanced.',
  },
]

const timeline = [
  { year: '2022', title: 'The Problem', description: 'Founders spent 100+ hours searching fragmented databases.' },
  { year: '2023', title: 'The Solution', description: 'Built Grants By AI, aggregating 20+ sources into one platform.' },
  { year: '2024', title: 'The Growth', description: 'Expanded to 50+ sources, launched AI matching, 10K users.' },
  { year: 'Now', title: 'The Mission', description: '15,000+ organizations trust Grants By AI for funding.' },
]

const stats = [
  { value: '$12B+', label: 'Available Funding' },
  { value: '20K+', label: 'Grant Programs' },
  { value: '15K+', label: 'Organizations' },
  { value: '94%', label: 'Match Accuracy' },
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
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
}

export default function AboutPage() {
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

  return (
    <main className="pt-20">
      {/* Hero */}
      <motion.section
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        {...motionProps(fadeInUp)}
      >
        {/* Ambient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[800px] h-[800px] rounded-full bg-pulse-accent/[0.06] blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Mission statement - centered, prominent */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
              <span className="text-sm text-pulse-text-secondary">About Grants By AI</span>
            </div>

            <h1 className="text-display font-bold text-pulse-text mb-6 tracking-tight">
              Democratizing access to <span className="text-pulse-accent">funding</span>
            </h1>

            <p className="text-lg text-pulse-text-secondary leading-relaxed max-w-2xl mx-auto mb-8">
              We believe finding grants shouldn&apos;t require a dedicated staff member or expensive consultants.
              Our mission is to make funding accessible to every organization that deserves it.
            </p>

            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all"
            >
              Join 15K+ Organizations
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all text-center"
              >
                <div className="text-3xl font-bold text-pulse-accent mb-1 tabular-nums">{stat.value}</div>
                <div className="text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Our Journey</span>
            </div>
            <h2 className="text-3xl font-bold text-pulse-text">
              Born from frustration, built with purpose
            </h2>
          </div>

          <motion.div
            className="grid md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {timeline.map((item) => (
              <motion.div
                key={item.year}
                variants={staggerItem}
                {...(prefersReducedMotion ? {} : hoverLift)}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all"
              >
                <span className="text-3xl font-bold text-pulse-accent/30 block mb-4 group-hover:text-pulse-accent/50 transition-colors tabular-nums">
                  {item.year}
                </span>
                <h3 className="text-lg font-semibold text-pulse-text mb-2 group-hover:text-pulse-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-pulse-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Our Values</span>
            </div>
            <h2 className="text-3xl font-bold text-pulse-text">
              What drives us
            </h2>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {values.map((value) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  variants={staggerItem}
                  {...(prefersReducedMotion ? {} : hoverLift)}
                  className="group flex gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center shrink-0 group-hover:bg-pulse-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-pulse-text-secondary">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Features bar */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              { icon: Zap, title: 'Lightning Fast', desc: '< 1 second search' },
              { icon: Shield, title: 'Secure', desc: 'SOC 2 compliant' },
              { icon: Globe, title: 'Always Current', desc: 'Daily updates' },
              { icon: Award, title: 'Top Rated', desc: '4.9/5 stars' },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} className="group" variants={staggerItem}>
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-pulse-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h3 className="font-semibold text-pulse-text mb-1">{feature.title}</h3>
                  <p className="text-sm text-pulse-text-tertiary">{feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        {...motionProps(fadeInUp)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.06] blur-[150px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
            Ready to find your <span className="text-pulse-accent">funding</span>?
          </h2>

          <p className="text-lg text-pulse-text-secondary mb-8">
            Start discovering grants today and see why 15,000+ organizations trust Grants By AI.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
