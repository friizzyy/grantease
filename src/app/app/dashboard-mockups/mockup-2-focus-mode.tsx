'use client'

/**
 * MOCKUP 2: FOCUS MODE
 * ---------------------
 * A minimal, distraction-free dashboard with:
 * - Single prominent "next action" card
 * - Progress bar showing overall journey
 * - Clean card stack for grants
 * - Ambient status indicators
 * - Zen-like spacing and typography
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Search,
  Bookmark,
  Clock,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

// Mock data
const nextAction = {
  type: 'deadline',
  title: 'Complete SBIR Phase I Application',
  subtitle: 'National Science Foundation',
  deadline: '3 days remaining',
  progress: 75,
  amount: '$275,000',
}

const journeyProgress = {
  discovered: 24,
  saved: 12,
  applying: 4,
  submitted: 8,
  awarded: 3,
}

const grantStack = [
  {
    id: '1',
    title: 'Small Business Innovation Research (SBIR)',
    sponsor: 'NSF',
    status: 'In Progress',
    progress: 75,
  },
  {
    id: '2',
    title: 'Community Development Block Grant',
    sponsor: 'HUD',
    status: 'Draft',
    progress: 30,
  },
  {
    id: '3',
    title: 'Environmental Justice Grant',
    sponsor: 'EPA',
    status: 'Saved',
    progress: 0,
  },
]

// Animated progress bar
function ProgressBar({ progress, delay = 0 }: { progress: number; delay?: number }) {
  return (
    <div className="h-1 bg-pulse-border rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-pulse-accent to-pulse-accent/60 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
      />
    </div>
  )
}

// Journey step indicator
function JourneyStep({ label, count, isActive, index }: {
  label: string; count: number; isActive: boolean; index: number
}) {
  return (
    <motion.div
      className="flex-1 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <motion.div
        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 border-2 transition-colors ${
          isActive
            ? 'bg-pulse-accent/20 border-pulse-accent text-pulse-accent'
            : 'bg-pulse-surface border-pulse-border text-pulse-text-tertiary'
        }`}
        whileHover={{ scale: 1.1 }}
      >
        <span className="text-sm font-semibold">{count}</span>
      </motion.div>
      <p className={`text-xs ${isActive ? 'text-pulse-accent' : 'text-pulse-text-tertiary'}`}>
        {label}
      </p>
    </motion.div>
  )
}

export default function MockupFocusMode() {
  const totalProgress = Math.round(
    ((journeyProgress.submitted + journeyProgress.awarded) /
      (journeyProgress.discovered + journeyProgress.saved + journeyProgress.applying + journeyProgress.submitted + journeyProgress.awarded)) *
      100
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Minimal Header */}
      <motion.div
        className="mb-16 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-pulse-text-tertiary text-sm mb-2">Welcome back</p>
        <h1 className="font-serif text-display text-pulse-text">
          What will you accomplish today?
        </h1>
      </motion.div>

      {/* Primary Action Card */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pulse-accent/20 via-pulse-accent/10 to-pulse-accent/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

          <div className="relative bg-pulse-surface/80 border border-pulse-accent/30 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge variant="warning" className="mb-3">Priority Action</Badge>
                <h2 className="font-serif text-heading-lg text-pulse-text mb-2">
                  {nextAction.title}
                </h2>
                <p className="text-pulse-text-secondary">{nextAction.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif text-pulse-accent">{nextAction.amount}</p>
                <p className="text-sm text-pulse-warning flex items-center justify-end gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {nextAction.deadline}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-pulse-text-secondary">Application Progress</span>
                <span className="text-pulse-accent font-medium">{nextAction.progress}%</span>
              </div>
              <div className="h-2 bg-pulse-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pulse-accent to-pulse-accent/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${nextAction.progress}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Action Button */}
            <Button className="w-full" size="lg">
              <PlayCircle className="w-5 h-5 mr-2" />
              Continue Application
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Journey Progress */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <p className="text-pulse-text-tertiary text-sm mb-1">Your Grant Journey</p>
          <p className="text-pulse-text font-medium">{totalProgress}% to your next award</p>
        </div>

        {/* Journey Steps */}
        <div className="flex items-center justify-between relative mb-4">
          {/* Connecting line */}
          <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-pulse-border" />
          <motion.div
            className="absolute top-5 left-[10%] h-0.5 bg-pulse-accent"
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />

          <JourneyStep label="Discovered" count={journeyProgress.discovered} isActive index={0} />
          <JourneyStep label="Saved" count={journeyProgress.saved} isActive index={1} />
          <JourneyStep label="Applying" count={journeyProgress.applying} isActive index={2} />
          <JourneyStep label="Submitted" count={journeyProgress.submitted} isActive={false} index={3} />
          <JourneyStep label="Awarded" count={journeyProgress.awarded} isActive={false} index={4} />
        </div>
      </motion.div>

      {/* Grant Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-pulse-text">In Progress</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/workspace">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {grantStack.map((grant, i) => (
            <motion.div
              key={grant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link
                href={`/app/workspace/${grant.id}`}
                className="block p-5 rounded-2xl bg-pulse-surface/50 border border-pulse-border hover:border-pulse-accent/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      grant.progress > 50 ? 'bg-pulse-accent/20 text-pulse-accent' :
                      grant.progress > 0 ? 'bg-pulse-warning/20 text-pulse-warning' :
                      'bg-pulse-border text-pulse-text-tertiary'
                    }`}>
                      {grant.progress === 100 ? <CheckCircle2 className="w-4 h-4" /> :
                       grant.progress > 0 ? <PlayCircle className="w-4 h-4" /> :
                       <Circle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-pulse-text font-medium group-hover:text-pulse-accent transition-colors">
                        {grant.title}
                      </p>
                      <p className="text-sm text-pulse-text-tertiary">{grant.sponsor}</p>
                    </div>
                  </div>
                  <Badge variant={
                    grant.status === 'In Progress' ? 'warning' :
                    grant.status === 'Draft' ? 'default' : 'outline'
                  }>
                    {grant.status}
                  </Badge>
                </div>

                {grant.progress > 0 && <ProgressBar progress={grant.progress} delay={0.5 + i * 0.1} />}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Action */}
      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      >
        <Button size="lg" className="rounded-full shadow-lg shadow-pulse-accent/20" asChild>
          <Link href="/app/discover">
            <Search className="w-5 h-5 mr-2" />
            Find New Grants
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
