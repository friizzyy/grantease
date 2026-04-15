'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const QUERY = 'environmental nonprofit'
const TYPE_SPEED = 80

const mockResults = [
  { name: 'CA Climate Action Fund', category: 'Environment', match: 94 },
  { name: 'Green Communities Initiative', category: 'Community', match: 87 },
  { name: 'Environmental Justice Grant', category: 'Environment', match: 82 },
]

const categoryColors: Record<string, string> = {
  Environment: 'text-emerald-400 bg-emerald-400/10',
  Community: 'text-cyan-400 bg-cyan-400/10',
}

export function MiniSearchDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()

  const [typed, setTyped] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [doneTyping, setDoneTyping] = useState(false)

  const startTyping = useCallback(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setTyped(QUERY.slice(0, i))
      if (i >= QUERY.length) {
        clearInterval(interval)
        setDoneTyping(true)
        setTimeout(() => setShowResults(true), 300)
      }
    }, TYPE_SPEED)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isInView) return

    if (reduced) {
      setTyped(QUERY)
      setDoneTyping(true)
      setShowResults(true)
      return
    }

    const timeout = setTimeout(startTyping, 400)
    return () => clearTimeout(timeout)
  }, [isInView, reduced, startTyping])

  return (
    <div ref={ref} className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
      {/* Search bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
        <Search className="w-4 h-4 text-pulse-text-tertiary shrink-0" />
        <span className="text-body-sm text-pulse-text">
          {typed}
          {!doneTyping && isInView && (
            <span className="inline-block w-[2px] h-4 bg-pulse-accent ml-0.5 align-middle animate-cursor-blink" />
          )}
        </span>
      </div>

      {/* Results */}
      <div className="px-4 py-3 space-y-1.5">
        {mockResults.map((result, i) => {
          const catClass = categoryColors[result.category] || 'text-pulse-accent bg-pulse-accent/10'
          const show = reduced || showResults

          return (
            <motion.div
              key={result.name}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02]"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex-1 min-w-0">
                <span className="text-body-sm font-medium text-pulse-text truncate block">
                  {result.name}
                </span>
                <span className={`inline-flex px-1.5 py-0.5 text-label-sm font-medium rounded mt-0.5 ${catClass}`}>
                  {result.category}
                </span>
              </div>

              {/* Match bar */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-pulse-accent"
                    initial={{ width: 0 }}
                    animate={show ? { width: `${result.match}%` } : {}}
                    transition={{ duration: 0.6, delay: reduced ? 0 : 0.2 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-label-sm font-medium text-pulse-text-secondary tabular-nums w-7 text-right">
                  {result.match}%
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
