'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useInView } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const tabs = [
  {
    name: 'Narrative',
    text: 'Our organization has served the Central Valley community for over 12 years, providing environmental education and conservation programs that have reached more than 40,000 residents.',
    shortText: 'Our organization has served the Central Valley community for over 12 years, providing environmental education...',
  },
  {
    name: 'Budget',
    text: 'Personnel costs: $185,000. Program supplies: $42,000. Travel and outreach: $18,500. Indirect costs (12%): $29,460.',
    shortText: 'Personnel: $185,000. Supplies: $42,000. Travel: $18,500.',
  },
  {
    name: 'Timeline',
    text: 'Q1: Community needs assessment and staff onboarding. Q2: Launch pilot programs in three target neighborhoods. Q3: Expand to full service area.',
    shortText: 'Q1: Assessment. Q2: Pilot launch. Q3: Full expansion.',
  },
]

const TYPE_SPEED = 50
const PAUSE_BETWEEN_TABS = 2500

interface AIWritingSimulatorProps {
  compact?: boolean
}

export function AIWritingSimulator({ compact = false }: AIWritingSimulatorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()

  const [activeTab, setActiveTab] = useState(0)
  const [typed, setTyped] = useState('')
  const [doneTyping, setDoneTyping] = useState(false)

  const startedRef = useRef(false)
  const typeIntervalRef = useRef<ReturnType<typeof setInterval>>()
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const getText = useCallback((tabIndex: number) => {
    const tab = tabs[tabIndex]
    return compact ? tab.shortText : tab.text
  }, [compact])

  const stopAll = useCallback(() => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current)
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
  }, [])

  // Type out a tab's text character by character, then call onDone
  const typeTab = useCallback((tabIndex: number, onDone: () => void) => {
    const text = getText(tabIndex)
    let i = 0
    setTyped('')
    setDoneTyping(false)
    setActiveTab(tabIndex)

    typeIntervalRef.current = setInterval(() => {
      i++
      setTyped(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(typeIntervalRef.current)
        setDoneTyping(true)
        onDone()
      }
    }, TYPE_SPEED)
  }, [getText])

  // After a tab finishes typing, wait then type the next tab (stops after one full cycle)
  const scheduleNext = useCallback((currentIndex: number) => {
    const next = currentIndex + 1
    if (next >= tabs.length) return // Stop after cycling through all tabs once
    pauseTimeoutRef.current = setTimeout(() => {
      typeTab(next, () => scheduleNext(next))
    }, PAUSE_BETWEEN_TABS)
  }, [typeTab])

  // Initial auto-start on scroll
  useEffect(() => {
    if (!isInView || startedRef.current) return
    startedRef.current = true

    if (reduced) {
      setTyped(getText(0))
      setDoneTyping(true)
      return
    }

    const timeout = setTimeout(() => {
      typeTab(0, () => scheduleNext(0))
    }, 400)
    return () => clearTimeout(timeout)
  }, [isInView, reduced, getText, typeTab, scheduleNext])

  useEffect(() => stopAll, [stopAll])

  const handleTabClick = (i: number) => {
    if (i === activeTab && doneTyping) return

    stopAll()
    typeTab(i, () => scheduleNext(i))
  }

  return (
    <div ref={ref} className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
      {/* Tab pills */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
        {tabs.map((tab, i) => (
          <button
            key={tab.name}
            className={`px-3 py-1 rounded-md text-label-sm font-medium transition-colors duration-200 ${
              activeTab === i
                ? 'bg-pulse-rose/15 text-pulse-rose'
                : 'text-pulse-text-tertiary hover:text-pulse-text-secondary'
            }`}
            onClick={() => handleTabClick(i)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Text area mockup */}
      <div className={`px-4 ${compact ? 'py-3' : 'py-4'} relative`}>
        <div className={`text-body-sm text-pulse-text-secondary leading-relaxed ${compact ? 'min-h-[60px]' : 'min-h-[80px]'}`}>
          {typed}
          {!doneTyping && isInView && !reduced && (
            <span className="inline-block w-[2px] h-4 bg-pulse-rose ml-0.5 align-middle animate-cursor-blink" />
          )}
        </div>

        {/* AI badge */}
        <div className="flex justify-end mt-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-pulse-rose/10 text-label-sm font-medium text-pulse-rose ${
              !reduced && !doneTyping && isInView ? 'animate-badge-pulse' : ''
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI
          </div>
        </div>
      </div>
    </div>
  )
}
