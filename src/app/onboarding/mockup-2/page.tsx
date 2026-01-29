'use client'

/**
 * MOCKUP 2: CARD CAROUSEL / SPOTLIGHT
 * -----------------------------------
 * Inspired by Apple/Stripe onboarding
 * - Large centered card with spotlight effect
 * - Horizontal scrolling options at bottom
 * - Dramatic lighting and depth
 * - Minimal, focused experience
 */

import { useState, useRef } from 'react'
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
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
} from 'lucide-react'
import { AnimatedLogo } from '@/components/ui/animated-logo'

const ENTITY_OPTIONS = [
  {
    id: 'individual',
    label: 'Individual',
    headline: 'For Researchers & Creators',
    description: 'Independent professionals, artists, researchers, and solo practitioners seeking personal grants and fellowships.',
    icon: User,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    stats: { grants: '2,400+', avgAward: '$45K' }
  },
  {
    id: 'nonprofit',
    label: 'Nonprofit',
    headline: 'For Mission-Driven Orgs',
    description: '501(c)(3) organizations, foundations, and tax-exempt entities making positive change in communities.',
    icon: Heart,
    gradient: 'from-rose-600 via-pink-600 to-red-600',
    stats: { grants: '8,500+', avgAward: '$125K' }
  },
  {
    id: 'small_business',
    label: 'Small Business',
    headline: 'For Growing Companies',
    description: 'Startups and SMBs under 500 employees looking for SBIR/STTR grants and innovation funding.',
    icon: Building2,
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    stats: { grants: '4,200+', avgAward: '$250K' }
  },
  {
    id: 'educational',
    label: 'Educational',
    headline: 'For Learning Institutions',
    description: 'Schools, universities, training centers, and educational programs expanding access to learning.',
    icon: GraduationCap,
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    stats: { grants: '3,800+', avgAward: '$180K' }
  },
  {
    id: 'government',
    label: 'Government',
    headline: 'For Public Agencies',
    description: 'Federal, state, and local government entities seeking intergovernmental grants and funding.',
    icon: Landmark,
    gradient: 'from-slate-600 via-gray-600 to-zinc-600',
    stats: { grants: '1,900+', avgAward: '$500K' }
  },
]

export default function OnboardingMockup2() {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentOption = ENTITY_OPTIONS[selectedIndex]

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    setConfirmed(false)
  }

  const handleConfirm = () => {
    setConfirmed(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col relative overflow-hidden">
      {/* Spotlight effect following selected card */}
      <motion.div
        className={`absolute top-1/3 left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br ${currentOption.gradient} opacity-[0.07] blur-[150px] pointer-events-none`}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      {/* Secondary glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-pulse-accent/[0.05] blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3">
          <AnimatedLogo size="md" />
          <span className="text-xl font-bold text-white">GrantEase</span>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-2 text-sm text-white/40">
            <span className="text-white font-medium">01</span>
            <span>/</span>
            <span>05</span>
          </div>
          <button className="text-sm text-white/40 hover:text-white/60 transition-colors">
            Skip
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Who are you?
          </h1>
          <p className="text-lg text-white/50 max-w-md mx-auto">
            Select your organization type to see relevant funding opportunities.
          </p>
        </motion.div>

        {/* Featured Card */}
        <motion.div
          key={currentOption.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl mb-12"
        >
          <div className={`relative rounded-3xl overflow-hidden`}>
            {/* Gradient border */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentOption.gradient} opacity-50`} />

            {/* Card content */}
            <div className="relative m-[1px] rounded-3xl bg-[#0a0a0b] p-8 sm:p-10">
              {/* Icon and badge */}
              <div className="flex items-start justify-between mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentOption.gradient} p-[1px]`}>
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0b] flex items-center justify-center">
                    <currentOption.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <AnimatePresence>
                  {confirmed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-pulse-accent/20 border border-pulse-accent/30"
                    >
                      <Check className="w-4 h-4 text-pulse-accent" />
                      <span className="text-sm font-medium text-pulse-accent">Selected</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text content */}
              <div className="mb-8">
                <p className={`text-sm font-medium bg-gradient-to-r ${currentOption.gradient} bg-clip-text text-transparent mb-2`}>
                  {currentOption.headline}
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {currentOption.label}
                </h2>
                <p className="text-white/50 text-lg leading-relaxed">
                  {currentOption.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-white/[0.06]">
                <div>
                  <div className="text-2xl font-bold text-white">{currentOption.stats.grants}</div>
                  <div className="text-sm text-white/40">Available grants</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pulse-accent">{currentOption.stats.avgAward}</div>
                  <div className="text-sm text-white/40">Average award</div>
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={handleConfirm}
                className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  confirmed
                    ? 'bg-pulse-accent/20 text-pulse-accent border border-pulse-accent/30'
                    : `bg-gradient-to-r ${currentOption.gradient} text-white hover:opacity-90`
                }`}
              >
                {confirmed ? 'This is me' : 'Select this option'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Carousel Navigation */}
        <div className="w-full max-w-4xl">
          {/* Scrollable options */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {ENTITY_OPTIONS.map((option, index) => (
              <motion.button
                key={option.id}
                onClick={() => handleSelect(index)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`shrink-0 w-40 p-4 rounded-2xl border transition-all ${
                  selectedIndex === index
                    ? 'border-white/30 bg-white/[0.08]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mb-3 bg-gradient-to-br ${option.gradient} p-[1px]`}>
                  <div className="w-full h-full rounded-xl bg-[#0a0a0b] flex items-center justify-center">
                    <option.icon className={`w-4 h-4 ${selectedIndex === index ? 'text-white' : 'text-white/50'}`} />
                  </div>
                </div>
                <p className={`text-sm font-medium ${selectedIndex === index ? 'text-white' : 'text-white/50'}`}>
                  {option.label}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-8 py-6 flex items-center justify-between">
        <button className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          disabled={!confirmed}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all ${
            confirmed
              ? 'bg-white text-[#0a0a0b] hover:bg-white/90'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  )
}
