'use client'

import { motion } from 'framer-motion'

/**
 * PAGE TRANSITION - SMOOTH FADE
 * ----------------------------
 * Wraps page content with a subtle, smooth fade-in transition.
 * Avoids jarring layout shifts while still providing visual polish.
 */

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Section animation wrapper — smooth fade-in on mount
interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.section>
  )
}

// Staggered container — children animate in sequence
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ children, className, staggerDelay = 0.05 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger item — used inside StaggerContainer
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        initial: { opacity: 0, y: 12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Fade in view — appears when scrolled into viewport
interface FadeInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

const directionOffsets = {
  up: { y: 16 },
  down: { y: -16 },
  left: { x: 16 },
  right: { x: -16 },
  none: {},
}

export function FadeInView({ children, className, delay = 0, direction = 'up' }: FadeInViewProps) {
  const offset = directionOffsets[direction]

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
