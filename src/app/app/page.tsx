'use client'

import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { ArrowRight, Search, Bookmark, FolderOpen, Bell, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { springs } from '@/lib/motion/animations'
import { useEffect, useState, useRef } from 'react'

// Mock data for dashboard
const recentGrants = [
  {
    id: '1',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    deadline: '2024-03-15',
    amount: '$275,000',
    status: 'open',
  },
  {
    id: '2',
    title: 'Community Development Block Grant',
    sponsor: 'HUD',
    deadline: '2024-02-28',
    amount: '$500,000',
    status: 'open',
  },
  {
    id: '3',
    title: 'Environmental Justice Collaborative Problem-Solving',
    sponsor: 'EPA',
    deadline: '2024-04-01',
    amount: '$150,000',
    status: 'open',
  },
]

const stats = [
  { label: 'Saved Grants', value: 12, icon: Bookmark, change: '+3 this week' },
  { label: 'Active Workspaces', value: 4, icon: FolderOpen, change: '2 in progress' },
  { label: 'Saved Searches', value: 6, icon: Search, change: '8 new matches' },
  { label: 'Upcoming Deadlines', value: 3, icon: Clock, change: 'Next: 5 days' },
]

// Animated counter component
function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const timeout = setTimeout(() => {
      const duration = 1000
      const startTime = Date.now()

      const updateValue = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(eased * value))

        if (progress < 1) {
          requestAnimationFrame(updateValue)
        }
      }

      requestAnimationFrame(updateValue)
    }, delay)

    return () => clearTimeout(timeout)
  }, [value, delay])

  return <span>{displayValue}</span>
}

// Animated stat card
function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const Icon = stat.icon
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.2 + index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="p-5 relative overflow-hidden">
        {/* Animated glow on interactive */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-pulse-accent/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <div className="flex items-start justify-between mb-3 relative z-10">
          <motion.div
            className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center"
            animate={{
              scale: isHovered ? 1.1 : 1,
              borderColor: isHovered ? 'rgba(64, 255, 170, 0.4)' : 'rgba(64, 255, 170, 0.2)',
            }}
            transition={springs.snappy}
          >
            <motion.div
              animate={{ rotate: isHovered ? 10 : 0 }}
              transition={springs.snappy}
            >
              <Icon className="w-5 h-5 text-pulse-accent" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="font-serif text-heading-lg text-pulse-text relative z-10"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={springs.snappy}
        >
          <AnimatedCounter value={stat.value} delay={300 + index * 100} />
        </motion.div>

        <div className="text-sm text-pulse-text-secondary relative z-10">{stat.label}</div>

        <motion.div
          className="text-xs text-pulse-accent mt-1 relative z-10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          {stat.change}
        </motion.div>
      </Card>
    </motion.div>
  )
}

// Animated grant item
function GrantItem({ grant, index }: { grant: typeof recentGrants[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.4 + index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
    >
      <Link
        href={`/app/grants/${grant.id}`}
        className="block p-4 rounded-lg bg-pulse-surface/50 border border-pulse-border hover:border-pulse-accent/20 transition-colors group"
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <motion.p
              className="font-mono text-micro uppercase tracking-wider text-pulse-accent mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {grant.sponsor}
            </motion.p>
            <motion.h4
              className="text-body font-medium text-pulse-text line-clamp-1 group-hover:text-pulse-accent transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {grant.title}
            </motion.h4>
          </div>
          <Badge variant="success" className="shrink-0">Open</Badge>
        </div>
        <motion.div
          className="flex items-center gap-4 text-sm text-pulse-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.1 }}
        >
          <span>Up to {grant.amount}</span>
          <span>•</span>
          <span>Due {new Date(grant.deadline).toLocaleDateString()}</span>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Animated alert item
function AlertItem({ title, subtitle, index }: { title: string; subtitle: string; index: number }) {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsPulsing(true)
    }, 1000 + index * 200)
    return () => clearTimeout(timeout)
  }, [index])

  return (
    <motion.div
      className="p-3 rounded-lg bg-pulse-accent/5 border border-pulse-accent/10 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 + index * 0.15 }}
    >
      {/* Pulse effect */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            className="absolute inset-0 bg-pulse-accent/10 rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.05, 1.1] }}
            transition={{ duration: 1, ease: 'easeOut' }}
            onAnimationComplete={() => setIsPulsing(false)}
          />
        )}
      </AnimatePresence>

      <p className="text-sm text-pulse-text mb-1 relative z-10">
        <span className="font-medium">{title}</span> match your saved search
      </p>
      <p className="text-xs text-pulse-text-tertiary relative z-10">{subtitle}</p>
    </motion.div>
  )
}

export default function AppDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          className="font-serif text-display text-pulse-text mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Dashboard
        </motion.h1>
        <motion.p
          className="text-body text-pulse-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Welcome back. Here&apos;s an overview of your grant activity.
        </motion.p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="flex flex-wrap gap-3 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button asChild>
            <Link href="/app/discover">
              <Search className="w-4 h-4" />
              Discover Grants
            </Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Button variant="outline" asChild>
            <Link href="/app/saved">
              <Bookmark className="w-4 h-4" />
              Saved Grants
            </Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="outline" asChild>
            <Link href="/app/workspace">
              <FolderOpen className="w-4 h-4" />
              Workspaces
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Grants */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Card >
            <CardHeader className="flex-row items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle>Recently Viewed Grants</CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/discover">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrants.map((grant, index) => (
                  <GrantItem key={grant.id} grant={grant} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Bell className="w-4 h-4 text-pulse-accent" />
                  </motion.div>
                  New Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AlertItem
                    title="8 new grants"
                    subtitle="&quot;Small Business Technology&quot;"
                    index={0}
                  />
                  <AlertItem
                    title="3 new grants"
                    subtitle="&quot;Nonprofit Community Dev&quot;"
                    index={1}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                    <Link href="/app/searches">View All Searches</Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Card  className="bg-pulse-accent/5 border-pulse-accent/20 relative overflow-hidden">
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-pulse-accent/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: 'linear',
                }}
              />
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4,
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-pulse-accent shrink-0" />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-pulse-text mb-1">Pro Tip</p>
                    <p className="text-sm text-pulse-text-secondary">
                      Save your searches to get notified when new matching grants are posted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
