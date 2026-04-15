'use client'

import { useState, useEffect } from 'react'

/**
 * Hook that detects prefers-reduced-motion and returns a motion helper.
 * `m(props)` returns the props unchanged or `{}` when reduced motion is active.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const m = (props: Record<string, unknown>) => (reduced ? {} : props)

  return { reduced, m }
}
