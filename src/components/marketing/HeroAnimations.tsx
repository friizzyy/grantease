'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface FloatingCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FloatingCard({ children, className, delay = 0 }: FloatingCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -12, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay: delay * 0.3 },
        y: {
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay * 0.5,
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function PulsingDot() {
  return (
    <div className="relative w-2 h-2">
      <div className="absolute inset-0 rounded-full bg-pulse-accent" />
      <motion.div
        className="absolute inset-0 rounded-full bg-pulse-accent"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

/**
 * Animated border beam effect — a glowing dot that travels around the border
 */
export function BorderBeam({
  size = 80,
  duration = 6,
  delay = 0,
  color = '#40ffaa',
}: {
  size?: number
  duration?: number
  delay?: number
  color?: string
}) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <motion.div
        className="absolute"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color}60 0%, ${color}20 40%, transparent 70%)`,
          borderRadius: '50%',
          filter: `blur(${size / 4}px)`,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          delay,
        }}
        // Use CSS offset-path for smooth border traversal
        // Fallback to a rotating approach
      />
      {/* Top edge beam */}
      <motion.div
        className="absolute top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
          width: '40%',
        }}
        animate={{ left: ['-40%', '100%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
      />
      {/* Bottom edge beam */}
      <motion.div
        className="absolute bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}30, transparent)`,
          width: '30%',
        }}
        animate={{ right: ['-30%', '100%'] }}
        transition={{ duration: duration * 1.2, repeat: Infinity, ease: 'linear', delay: delay + 1 }}
      />
    </div>
  )
}

/**
 * Animated counter that counts up to a target number
 */
export function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return <span>{count.toLocaleString()}{suffix}</span>
}

/**
 * Glassmorphism card with subtle mouse-tracking tilt
 */
export function GlassShowcaseCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-100, 100], [3, -3]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-100, 100], [-3, 3]), { stiffness: 300, damping: 30 })

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left - rect.width / 2)
    y.set(event.clientY - rect.top - rect.height / 2)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}
