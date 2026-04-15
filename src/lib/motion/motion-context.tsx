'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface MotionContextValue {
  reducedMotion: boolean
  isNavigating: boolean
  activeRoute: string
  setIsNavigating: (value: boolean) => void
}

const MotionContext = createContext<MotionContextValue | null>(null)

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeRoute, setActiveRoute] = useState('')

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Track route changes
  useEffect(() => {
    setActiveRoute(pathname)
    setIsNavigating(true)

    const timeout = setTimeout(() => {
      setIsNavigating(false)
    }, 400)

    return () => clearTimeout(timeout)
  }, [pathname])

  const value: MotionContextValue = {
    reducedMotion,
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
