'use client'

/**
 * MOCKUP SELECTOR PAGE
 * --------------------
 * Navigate between the 3 premium onboarding mockups
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Layout, Layers, Box } from 'lucide-react'
import { AnimatedLogo } from '@/components/ui/animated-logo'

const MOCKUPS = [
  {
    id: 1,
    title: 'Split Screen Immersive',
    description: 'Linear/Notion style with branded left panel, animated gradients, and selection grid on right.',
    icon: Layout,
    gradient: 'from-violet-500 to-purple-600',
    features: ['Split layout', 'Animated orbs', 'Stats display', 'Expandable location'],
    href: '/onboarding/mockup-1',
  },
  {
    id: 2,
    title: 'Card Carousel Spotlight',
    description: 'Apple/Stripe style with dramatic spotlight effect and horizontal card carousel.',
    icon: Layers,
    gradient: 'from-rose-500 to-pink-600',
    features: ['Spotlight glow', 'Featured card', 'Two-step selection', 'Ultra-dark theme'],
    href: '/onboarding/mockup-2',
  },
  {
    id: 3,
    title: 'Interactive 3D Journey',
    description: 'Arc/Raycast style with 3D tilt cards, journey progress, and emoji accents.',
    icon: Box,
    gradient: 'from-emerald-500 to-teal-600',
    features: ['3D parallax hover', 'Visual stepper', 'Feature bullets', 'Floating helper'],
    href: '/onboarding/mockup-3',
  },
]

export default function MockupSelector() {
  return (
    <div className="min-h-screen bg-pulse-bg flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3">
          <AnimatedLogo size="md" />
          <span className="text-xl font-bold text-pulse-text">GrantEase</span>
        </Link>

        <Link
          href="/onboarding/step-1"
          className="text-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
        >
          View Current Design →
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
              <span className="text-sm text-pulse-text-secondary">Onboarding Mockups</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl text-pulse-text mb-4">
              Choose a Design Style
            </h1>
            <p className="text-lg text-pulse-text-secondary max-w-xl mx-auto">
              Click any card below to view the full interactive mockup for the onboarding flow.
            </p>
          </motion.div>

          {/* Mockup Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {MOCKUPS.map((mockup, index) => (
              <motion.div
                key={mockup.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={mockup.href} className="block group">
                  <div className="relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
                    {/* Gradient glow on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mockup.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity pointer-events-none`} />

                    {/* Icon */}
                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${mockup.gradient} p-[1px] mb-5`}>
                      <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                        <mockup.icon className="w-6 h-6 text-pulse-text" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="relative text-xl font-semibold text-pulse-text mb-2 group-hover:text-white transition-colors">
                      {mockup.title}
                    </h3>

                    {/* Description */}
                    <p className="relative text-sm text-pulse-text-tertiary mb-5 leading-relaxed">
                      {mockup.description}
                    </p>

                    {/* Features */}
                    <div className="relative space-y-2 mb-6">
                      {mockup.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-pulse-text-secondary">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mockup.gradient}`} />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="relative flex items-center gap-2 text-sm font-medium text-pulse-accent group-hover:gap-3 transition-all">
                      <span>View Mockup {mockup.id}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-pulse-text-tertiary mb-4">Quick Links</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/onboarding/mockup-1"
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-pulse-text-secondary hover:text-pulse-text hover:border-white/[0.12] transition-colors"
              >
                Mockup 1
              </Link>
              <Link
                href="/onboarding/mockup-2"
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-pulse-text-secondary hover:text-pulse-text hover:border-white/[0.12] transition-colors"
              >
                Mockup 2
              </Link>
              <Link
                href="/onboarding/mockup-3"
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-pulse-text-secondary hover:text-pulse-text hover:border-white/[0.12] transition-colors"
              >
                Mockup 3
              </Link>
              <Link
                href="/onboarding/step-1"
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-pulse-text-secondary hover:text-pulse-text hover:border-white/[0.12] transition-colors"
              >
                Current Design
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
