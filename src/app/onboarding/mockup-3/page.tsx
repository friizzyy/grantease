'use client'

/**
 * MOCKUP 3: INTERACTIVE VISUAL JOURNEY
 * ------------------------------------
 * Inspired by Arc/Raycast onboarding
 * - Full-screen immersive experience
 * - Interactive 3D-like card hover effects
 * - Progress as a visual journey
 * - Micro-interactions everywhere
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  Heart,
  Building2,
  Briefcase,
  GraduationCap,
  Landmark,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
  Target,
  TrendingUp,
  Globe,
} from 'lucide-react'
import { AnimatedLogo } from '@/components/ui/animated-logo'

const ENTITY_OPTIONS = [
  {
    id: 'individual',
    label: 'Individual',
    tagline: 'Researchers & Creators',
    icon: User,
    emoji: '🎨',
    bgGradient: 'from-violet-950/50 to-purple-950/50',
    accentColor: 'violet',
    features: ['Personal fellowships', 'Research grants', 'Artist residencies'],
  },
  {
    id: 'nonprofit',
    label: 'Nonprofit',
    tagline: '501(c)(3) Organizations',
    icon: Heart,
    emoji: '💝',
    bgGradient: 'from-rose-950/50 to-pink-950/50',
    accentColor: 'rose',
    features: ['Foundation grants', 'Government funding', 'Corporate giving'],
  },
  {
    id: 'small_business',
    label: 'Small Business',
    tagline: 'Startups & SMBs',
    icon: Building2,
    emoji: '🚀',
    bgGradient: 'from-blue-950/50 to-cyan-950/50',
    accentColor: 'blue',
    features: ['SBIR/STTR grants', 'Innovation funds', 'State programs'],
  },
  {
    id: 'educational',
    label: 'Educational',
    tagline: 'Schools & Universities',
    icon: GraduationCap,
    emoji: '📚',
    bgGradient: 'from-emerald-950/50 to-teal-950/50',
    accentColor: 'emerald',
    features: ['Education grants', 'Research funding', 'Program support'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    tagline: 'Large Organizations',
    icon: Briefcase,
    emoji: '🏢',
    bgGradient: 'from-amber-950/50 to-orange-950/50',
    accentColor: 'amber',
    features: ['R&D incentives', 'Workforce programs', 'Sustainability grants'],
  },
  {
    id: 'government',
    label: 'Government',
    tagline: 'Public Agencies',
    icon: Landmark,
    emoji: '🏛️',
    bgGradient: 'from-slate-950/50 to-gray-950/50',
    accentColor: 'slate',
    features: ['Federal programs', 'State allocations', 'Municipal grants'],
  },
]

// 3D Tilt Card Component
function TiltCard({ option, isSelected, onClick }: { option: typeof ENTITY_OPTIONS[0], isSelected: boolean, onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg'])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const accentColors: Record<string, string> = {
    violet: 'border-violet-500/50 shadow-violet-500/20',
    rose: 'border-rose-500/50 shadow-rose-500/20',
    blue: 'border-blue-500/50 shadow-blue-500/20',
    emerald: 'border-emerald-500/50 shadow-emerald-500/20',
    amber: 'border-amber-500/50 shadow-amber-500/20',
    slate: 'border-slate-500/50 shadow-slate-500/20',
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 ${
        isSelected
          ? `${accentColors[option.accentColor]} bg-gradient-to-br ${option.bgGradient} shadow-2xl`
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
      }`}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
          transform: 'translateZ(1px)',
        }}
      />

      <div className="relative" style={{ transform: 'translateZ(50px)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{option.emoji}</span>
            <div>
              <h3 className="font-bold text-lg text-white">{option.label}</h3>
              <p className="text-sm text-white/50">{option.tagline}</p>
            </div>
          </div>

          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isSelected ? 'bg-pulse-accent' : 'bg-white/[0.06]'
          }`}>
            {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {option.features.map((feature, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-sm ${
                isSelected ? 'text-white/70' : 'text-white/40'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-pulse-accent' : 'bg-white/30'}`} />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

export default function OnboardingMockup3() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const selectedOption = ENTITY_OPTIONS.find(e => e.id === selected)

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-pulse-accent/[0.03] rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-emerald-500/[0.02] rounded-full blur-[150px]" />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
        <Link href="/" className="flex items-center gap-3">
          <AnimatedLogo size="md" />
          <span className="text-xl font-bold text-white hidden sm:block">GrantEase</span>
        </Link>

        {/* Progress Journey */}
        <div className="flex items-center gap-1">
          {['Profile', 'Industry', 'Details', 'Goals', 'Finish'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i + 1 === step
                  ? 'bg-pulse-accent/20 text-pulse-accent border border-pulse-accent/30'
                  : i + 1 < step
                  ? 'text-white/40'
                  : 'text-white/20'
              }`}>
                {i + 1 < step ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="w-4 text-center">{i + 1}</span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < 4 && (
                <div className={`w-4 lg:w-8 h-px mx-1 ${i + 1 < step ? 'bg-pulse-accent/30' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
              <Zap className="w-4 h-4 text-pulse-accent" />
              <span className="text-sm text-white/60">Takes about 2 minutes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Let's personalize your
              <br />
              <span className="bg-gradient-to-r from-pulse-accent via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                grant discovery
              </span>
            </h1>

            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Select the category that best describes your organization
            </p>
          </motion.div>

          {/* Cards Grid with 3D Effect */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12" style={{ perspective: '1000px' }}>
            {ENTITY_OPTIONS.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <TiltCard
                  option={option}
                  isSelected={selected === option.id}
                  onClick={() => setSelected(option.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            {/* Selected summary */}
            <AnimatePresence mode="wait">
              {selectedOption ? (
                <motion.div
                  key={selectedOption.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-2xl">{selectedOption.emoji}</span>
                  <div>
                    <p className="text-sm text-white/40">You selected</p>
                    <p className="font-semibold text-white">{selectedOption.label}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 px-3 py-1 rounded-full bg-pulse-accent/10 text-pulse-accent text-sm">
                    <Target className="w-3.5 h-3.5" />
                    <span>8,500+ grants</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-white/30"
                >
                  <Globe className="w-5 h-5" />
                  <span>Select an option to continue</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 rounded-xl text-white/40 hover:text-white/60 transition-colors">
                Skip for now
              </button>

              <motion.button
                disabled={!selected}
                whileHover={selected ? { scale: 1.02 } : {}}
                whileTap={selected ? { scale: 0.98 } : {}}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                  selected
                    ? 'bg-gradient-to-r from-pulse-accent to-emerald-500 text-white shadow-lg shadow-pulse-accent/25 hover:shadow-xl hover:shadow-pulse-accent/30'
                    : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <motion.div
                  animate={selected ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Floating helper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-white/40"
      >
        <Sparkles className="w-4 h-4 text-pulse-accent" />
        <span>You can change this anytime in Settings</span>
      </motion.div>
    </div>
  )
}
