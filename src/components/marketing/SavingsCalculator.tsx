'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, DollarSign, TrendingUp } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const HOURS_PER_GRANT_OLD = 80
const HOURS_PER_GRANT_NEW = 8
const CONSULTANT_COST = 8000

export function SavingsCalculator() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()
  const show = reduced || isInView

  const [grants, setGrants] = useState(5)

  const hoursSaved = grants * (HOURS_PER_GRANT_OLD - HOURS_PER_GRANT_NEW)
  const moneySaved = grants * CONSULTANT_COST - 348 // Pro annual cost
  const oldHours = grants * HOURS_PER_GRANT_OLD
  const newHours = grants * HOURS_PER_GRANT_NEW

  return (
    <div ref={ref} className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-pulse-rose/15">
      {/* Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-body font-medium text-pulse-text">
            Grant applications per year
          </label>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pulse-rose/10 border border-pulse-rose/20">
            <span className="text-heading font-bold text-pulse-rose tabular-nums">{grants}</span>
          </div>
        </div>

        <input
          type="range"
          min={1}
          max={20}
          value={grants}
          onChange={(e) => setGrants(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/[0.06] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pulse-rose [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(64,255,170,0.4)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-pulse-rose [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        />

        <div className="flex justify-between mt-2">
          <span className="text-caption text-pulse-text-tertiary">1 per year</span>
          <span className="text-caption text-pulse-text-tertiary">20 per year</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Time saved */}
        <motion.div
          className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Clock className="w-4.5 h-4.5 text-pulse-accent mb-3" />
          <div className="text-2xl sm:text-3xl font-bold text-pulse-accent tabular-nums mb-0.5">
            {hoursSaved.toLocaleString()} hrs
          </div>
          <p className="text-caption text-pulse-text-tertiary">saved per year</p>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center justify-between text-caption mb-1.5">
              <span className="text-pulse-text-tertiary">Traditional</span>
              <span className="text-pulse-text-tertiary tabular-nums">{oldHours} hrs</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/[0.06] mb-2">
              <div className="h-full rounded-full bg-pulse-error/40" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between text-caption">
              <span className="text-pulse-accent font-medium">With us</span>
              <span className="text-pulse-accent tabular-nums font-medium">{newHours} hrs</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-pulse-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(newHours / oldHours) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Money saved */}
        <motion.div
          className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <DollarSign className="w-4.5 h-4.5 text-pulse-rose mb-3" />
          <div className="text-2xl sm:text-3xl font-bold text-pulse-rose tabular-nums mb-0.5">
            ${Math.max(0, moneySaved).toLocaleString()}
          </div>
          <p className="text-caption text-pulse-text-tertiary">saved vs consultants</p>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center justify-between text-caption mb-1">
              <span className="text-pulse-text-tertiary">Consultant fees</span>
              <span className="text-pulse-text-tertiary tabular-nums line-through">
                ${(grants * CONSULTANT_COST).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-caption">
              <span className="text-pulse-rose font-medium">Pro plan</span>
              <span className="text-pulse-rose tabular-nums font-medium">$348/yr</span>
            </div>
          </div>
        </motion.div>

        {/* Multiplier */}
        <motion.div
          className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <TrendingUp className="w-4.5 h-4.5 text-pulse-accent mb-3" />
          <div className="text-2xl sm:text-3xl font-bold text-pulse-accent tabular-nums mb-0.5">
            {(HOURS_PER_GRANT_OLD / HOURS_PER_GRANT_NEW).toFixed(0)}x
          </div>
          <p className="text-caption text-pulse-text-tertiary">faster per application</p>
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <p className="text-caption text-pulse-text-tertiary leading-relaxed">
              Submit <span className="text-pulse-accent font-medium">{grants} applications</span> in the time
              it takes to do <span className="text-pulse-text-tertiary">{Math.max(1, Math.round(grants / 10))} the old way</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
