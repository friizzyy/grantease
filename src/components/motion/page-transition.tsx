'use client'

// Simple passthrough - no animations on page load
// This prevents the jarring page transition effect

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>
}

// Section animation wrapper - now just a passthrough
interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  return <section className={className}>{children}</section>
}

// Staggered container - passthrough
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return <div className={className}>{children}</div>
}

// Stagger item - passthrough
interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return <div className={className}>{children}</div>
}

// Fade in view - passthrough
interface FadeInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function FadeInView({ children, className }: FadeInViewProps) {
  return <div className={className}>{children}</div>
}
