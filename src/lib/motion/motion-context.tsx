'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface MotionState {
  reducedMotion: boolean
  scrollY: number
  scrollVelocity: number
  mousePosition: { x: number; y: number }
  isNavigating: boolean
  activeRoute: string
}

interface MotionContextValue extends MotionState {
  setIsNavigating: (value: boolean) => void
}

const MotionContext = createContext<MotionContextValue | null>(null)

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [reducedMotion, setReducedMotion] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeRoute, setActiveRoute] = useState('')

  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const rafId = useRef<number | null>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Track scroll position and velocity
  useEffect(() => {
    if (reducedMotion) return

    const handleScroll = () => {
      if (rafId.current) return

      rafId.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const currentTime = Date.now()
        const timeDelta = currentTime - lastScrollTime.current

        if (timeDelta > 0) {
          const velocity = Math.abs(currentScrollY - lastScrollY.current) / timeDelta
          setScrollVelocity(velocity)
        }

        setScrollY(currentScrollY)
        lastScrollY.current = currentScrollY
        lastScrollTime.current = currentTime
        rafId.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [reducedMotion])

  // Track mouse position (normalized -1 to 1)
  useEffect(() => {
    if (reducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [reducedMotion])

  // Track route changes
  useEffect(() => {
    setActiveRoute(pathname)
    setIsNavigating(true)

    const timeout = setTimeout(() => {
      setIsNavigating(false)
    }, 400) // Match page transition duration

    return () => clearTimeout(timeout)
  }, [pathname])

  const value: MotionContextValue = {
    reducedMotion,
    scrollY,
    scrollVelocity,
    mousePosition,
    isNavigating,
    activeRoute,
    setIsNavigating,
  }

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  )
}

// Main hook
export function useMotion() {
  const context = useContext(MotionContext)
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider')
  }
  return context
}

// Convenience hooks
export function useReducedMotion() {
  const { reducedMotion } = useMotion()
  return reducedMotion
}

export function useScroll() {
  const { scrollY, scrollVelocity } = useMotion()
  return { scrollY, scrollVelocity }
}

export function useMouse() {
  const { mousePosition } = useMotion()
  return mousePosition
}

export function useNavigation() {
  const { isNavigating, activeRoute, setIsNavigating } = useMotion()
  return { isNavigating, activeRoute, setIsNavigating }
}

// Utility hook for magnetic effect
export function useMagnetic(strength: number = 0.3) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const elementRef = useRef<HTMLElement | null>(null)
  const { reducedMotion } = useMotion()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (reducedMotion || !elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const x = (e.clientX - centerX) * strength
    const y = (e.clientY - centerY) * strength

    setOffset({ x, y })
  }, [strength, reducedMotion])

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  const bindMagnetic = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('mousemove', handleMouseMove)
      elementRef.current.removeEventListener('mouseleave', handleMouseLeave)
    }

    elementRef.current = element

    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('mousemove', handleMouseMove)
        elementRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [handleMouseMove, handleMouseLeave])

  return { offset, bindMagnetic, reducedMotion }
}
