'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderPlus, Calendar, ExternalLink, MoreVertical, Clock, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NoWorkspaces } from '@/components/grants/empty-state'
import { formatDate } from '@/lib/utils'
import { springs } from '@/lib/motion/animations'
import { useState, useEffect, useRef } from 'react'

// Mock workspaces
const workspaces = [
  {
    id: '1',
    name: 'SBIR Phase I Application',
    status: 'in_progress',
    grant: {
      id: '1',
      title: 'Small Business Innovation Research (SBIR) Phase I',
      sponsor: 'National Science Foundation',
      deadlineDate: new Date('2024-03-15'),
    },
    progress: 45,
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: '2',
    name: 'Community Development Grant',
    status: 'not_started',
    grant: {
      id: '2',
      title: 'Community Development Block Grant Program',
      sponsor: 'HUD',
      deadlineDate: new Date('2024-02-28'),
    },
    progress: 0,
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '3',
    name: 'EPA Environmental Justice',
    status: 'submitted',
    grant: {
      id: '3',
      title: 'Environmental Justice Collaborative Problem-Solving',
      sponsor: 'EPA',
      deadlineDate: new Date('2024-01-15'),
    },
    progress: 100,
    updatedAt: new Date('2024-01-14'),
  },
]

const statusConfig = {
  not_started: { label: 'Not Started', variant: 'default' as const },
  in_progress: { label: 'In Progress', variant: 'warning' as const },
  submitted: { label: 'Submitted', variant: 'success' as const },
  awarded: { label: 'Awarded', variant: 'accent' as const },
  rejected: { label: 'Not Selected', variant: 'error' as const },
}

// Animated progress bar
function AnimatedProgress({ progress, delay = 0 }: { progress: number; delay?: number }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWidth(progress)
    }, delay)
    return () => clearTimeout(timeout)
  }, [progress, delay])

  return (
    <div className="w-20 h-1.5 bg-pulse-border rounded-full mt-2 overflow-hidden">
      <motion.div
        className="h-full bg-pulse-accent rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: delay / 1000 }}
      />
    </div>
  )
}

// Animated counter
function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const timeout = setTimeout(() => {
      const duration = 800
      const startTime = Date.now()

      const updateValue = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
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

// Workspace card component
function WorkspaceCard({ workspace, index }: { workspace: typeof workspaces[0]; index: number }) {
  const status = statusConfig[workspace.status as keyof typeof statusConfig]
  const daysUntilDeadline = workspace.grant.deadlineDate
    ? Math.ceil((workspace.grant.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
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
      <Link href={`/app/workspace/${workspace.id}`}>
        <Card className="p-6 group cursor-pointer relative overflow-hidden">
          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-pulse-accent/5 to-transparent"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? '0%' : '-100%',
            }}
            transition={{ duration: 0.3 }}
          />

          <div className="flex items-start justify-between gap-4 relative z-10">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <motion.h3
                  className="text-heading-sm text-pulse-text group-hover:text-pulse-accent transition-colors truncate"
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {workspace.name}
                </motion.h3>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <motion.p
                className="text-body-sm text-pulse-text-secondary mb-3 truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {workspace.grant.title}
              </motion.p>

              <motion.div
                className="flex items-center gap-4 text-sm text-pulse-text-tertiary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {workspace.grant.deadlineDate
                    ? formatDate(workspace.grant.deadlineDate)
                    : 'No deadline'}
                </span>
                {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                  <>
                    <span>•</span>
                    <motion.span
                      className={daysUntilDeadline < 7 ? 'text-pulse-warning' : ''}
                      animate={
                        daysUntilDeadline < 7
                          ? {
                              scale: [1, 1.05, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1,
                        repeat: daysUntilDeadline < 7 ? Infinity : 0,
                        repeatDelay: 2,
                      }}
                    >
                      {daysUntilDeadline} days left
                    </motion.span>
                  </>
                )}
                <span>•</span>
                <span>Updated {formatDate(workspace.updatedAt)}</span>
              </motion.div>
            </div>

            {/* Progress */}
            <motion.div
              className="text-right shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="text-heading-sm text-pulse-text mb-1">
                <AnimatedCounter value={workspace.progress} delay={500 + index * 100} />%
              </div>
              <div className="text-xs text-pulse-text-tertiary">Complete</div>
              <AnimatedProgress progress={workspace.progress} delay={500 + index * 100} />
            </motion.div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function WorkspacesPage() {
  const isEmpty = workspaces.length === 0

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <motion.h1
            className="font-serif text-display text-pulse-text mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Workspaces
          </motion.h1>
          <motion.p
            className="text-body text-pulse-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Manage your grant applications with checklists, documents, and deadline tracking.
          </motion.p>
        </div>
        {!isEmpty && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Button asChild>
              <Link href="/app/discover">
                <FolderPlus className="w-4 h-4" />
                New Workspace
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NoWorkspaces />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FolderOpen className="w-4 h-4 text-pulse-accent" />
            <p className="text-body-sm text-pulse-text-tertiary">
              <span className="text-pulse-accent font-medium">{workspaces.length}</span> active workspace
              {workspaces.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          <div className="grid gap-4">
            {workspaces.map((workspace, index) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} index={index} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
