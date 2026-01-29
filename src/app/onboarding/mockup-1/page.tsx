'use client'

/**
 * MOCKUP 1: SPLIT SCREEN IMMERSIVE
 * --------------------------------
 * Inspired by premium SaaS like Linear/Notion
 * - Split screen layout with visual left panel
 * - Large immersive cards with hover effects
 * - Floating progress indicator
 * - Animated gradient orbs
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  Heart,
  Building2,
  Briefcase,
  GraduationCap,
  Landmark,
  Users,
  ArrowRight,
  Sparkles,
  Check,
  Globe,
  MapPin,
} from 'lucide-react'
import { AnimatedLogo } from '@/components/ui/animated-logo'

const ENTITY_OPTIONS = [
  { id: 'individual', label: 'Individual', description: 'Researcher, artist, or independent professional', icon: User, color: 'from-violet-500 to-purple-600' },
  { id: 'nonprofit', label: 'Nonprofit', description: '501(c)(3) or tax-exempt organization', icon: Heart, color: 'from-rose-500 to-pink-600' },
  { id: 'small_business', label: 'Small Business', description: 'Under 500 employees, for-profit', icon: Building2, color: 'from-blue-500 to-cyan-600' },
  { id: 'for_profit', label: 'Enterprise', description: 'Large company or corporation', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
  { id: 'educational', label: 'Educational', description: 'School, university, or training center', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
  { id: 'government', label: 'Government', description: 'Federal, state, or local agency', icon: Landmark, color: 'from-slate-500 to-gray-600' },
]

export default function OnboardingMockup1() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const selectedOption = ENTITY_OPTIONS.find(e => e.id === selected)

  return (
    <div className="min-h-screen bg-pulse-bg flex">
      {/* Left Panel - Visual Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-pulse-accent/20 blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-[80px]"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[60px]"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                              linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <AnimatedLogo size="lg" />
            <span className="text-2xl font-bold text-pulse-text">GrantEase</span>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-serif text-5xl text-pulse-text leading-tight mb-6">
                Let's find the
                <br />
                <span className="bg-gradient-to-r from-pulse-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  perfect grants
                </span>
                <br />
                for you.
              </h2>
              <p className="text-lg text-pulse-text-secondary max-w-md">
                Answer a few quick questions and we'll match you with funding opportunities tailored to your needs.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <div className="text-3xl font-bold text-pulse-text">20K+</div>
                <div className="text-sm text-pulse-text-tertiary">Active grants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pulse-accent">$12B+</div>
                <div className="text-sm text-pulse-text-tertiary">Total funding</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pulse-text">94%</div>
                <div className="text-sm text-pulse-text-tertiary">Match accuracy</div>
              </div>
            </motion.div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === 1 ? 'w-8 bg-pulse-accent' : 'w-3 bg-white/10'
                }`}
              />
            ))}
            <span className="ml-3 text-sm text-pulse-text-tertiary">Step 1 of 5</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Selection */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2">
            <AnimatedLogo size="sm" />
            <span className="text-lg font-bold text-pulse-text">GrantEase</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
          <div className="max-w-2xl mx-auto w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 text-pulse-accent mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Getting Started</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-pulse-text mb-3">
                What best describes you?
              </h1>
              <p className="text-lg text-pulse-text-secondary">
                Select the option that fits your organization type.
              </p>
            </motion.div>

            {/* Options Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {ENTITY_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => setSelected(option.id)}
                  onMouseEnter={() => setHoveredId(option.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`relative group text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    selected === option.id
                      ? 'border-pulse-accent bg-pulse-accent/[0.08]'
                      : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Gradient glow on hover */}
                  <AnimatePresence>
                    {(hoveredId === option.id || selected === option.id) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.color} opacity-[0.08] pointer-events-none`}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} p-[1px]`}>
                      <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                        <option.icon className={`w-5 h-5 ${selected === option.id ? 'text-pulse-accent' : 'text-pulse-text-secondary'}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className={`font-semibold mb-1 ${selected === option.id ? 'text-pulse-text' : 'text-pulse-text-secondary'}`}>
                        {option.label}
                      </h3>
                      <p className="text-sm text-pulse-text-tertiary leading-relaxed">
                        {option.description}
                      </p>
                    </div>

                    {/* Check indicator */}
                    <div className={`absolute top-5 right-5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      selected === option.id
                        ? 'bg-pulse-accent scale-100'
                        : 'bg-white/[0.06] scale-90 opacity-50'
                    }`}>
                      {selected === option.id && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Location quick-add */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-10 overflow-hidden"
                >
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-pulse-text">Where are you based?</h3>
                        <p className="text-sm text-pulse-text-tertiary">Many grants are region-specific</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <select className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-pulse-text focus:border-pulse-accent/50 outline-none transition-colors">
                        <option value="">Select country</option>
                        <option value="US">🇺🇸 United States</option>
                        <option value="CA">🇨🇦 Canada</option>
                        <option value="OTHER">🌍 Other</option>
                      </select>
                      <select className="flex-1 h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-pulse-text focus:border-pulse-accent/50 outline-none transition-colors">
                        <option value="">Select state</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between"
            >
              <button className="text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors">
                Skip setup →
              </button>

              <button
                disabled={!selected}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  selected
                    ? 'bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90 shadow-lg shadow-pulse-accent/25'
                    : 'bg-white/[0.06] text-pulse-text-tertiary cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile progress */}
        <div className="lg:hidden p-6 border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full ${
                  step === 1 ? 'w-8 bg-pulse-accent' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
