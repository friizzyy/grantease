'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/motion/animations'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, name, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasError, setHasError] = React.useState(!!error)
    const errorId = error ? `${name || id}-error` : undefined

    React.useEffect(() => {
      setHasError(!!error)
    }, [error])

    return (
      <div className="relative">
        {/* Icon with focus animation */}
        <AnimatePresence>
          {icon && (
            <motion.div
              className="absolute left-3 top-0 bottom-0 flex items-center text-pulse-text-tertiary pointer-events-none"
              animate={{
                color: isFocused ? 'rgba(64, 255, 170, 0.8)' : 'rgba(250, 250, 250, 0.4)',
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect on focus */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={false}
          animate={{
            boxShadow: isFocused
              ? error
                ? '0 0 0 2px rgba(255, 64, 64, 0.1), 0 0 20px rgba(255, 64, 64, 0.1)'
                : '0 0 0 2px rgba(64, 255, 170, 0.1), 0 0 20px rgba(64, 255, 170, 0.1)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
        />

        <input
          type={type}
          name={name}
          id={id}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'flex h-10 w-full rounded-lg bg-pulse-surface border border-pulse-border px-4 py-2.5 text-sm text-pulse-text-primary placeholder:text-pulse-text-tertiary',
            'transition-all duration-150',
            'hover:border-pulse-border-hover hover:bg-pulse-surface',
            'focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:shadow-[0_0_15px_rgba(64,255,170,0.1)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'placeholder:text-pulse-text-tertiary/60',
            icon && 'pl-10',
            error && 'border-pulse-error focus:border-pulse-error focus:shadow-[0_0_15px_rgba(255,64,64,0.1)]',
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Error message with animation */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={errorId}
              role="alert"
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-1 text-xs text-pulse-error overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Input.displayName = 'Input'

// Animated textarea variant
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="relative">
        {/* Glow effect on focus */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={false}
          animate={{
            boxShadow: isFocused
              ? error
                ? '0 0 0 2px rgba(255, 64, 64, 0.1), 0 0 20px rgba(255, 64, 64, 0.1)'
                : '0 0 0 2px rgba(64, 255, 170, 0.1), 0 0 20px rgba(64, 255, 170, 0.1)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
        />

        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-lg bg-pulse-surface border border-pulse-border px-4 py-2.5 text-sm text-pulse-text-primary placeholder:text-pulse-text-tertiary',
            'transition-all duration-150',
            'hover:border-pulse-border-hover hover:bg-pulse-surface',
            'focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:shadow-[0_0_15px_rgba(64,255,170,0.1)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            'placeholder:text-pulse-text-tertiary/60',
            error && 'border-pulse-error focus:border-pulse-error focus:shadow-[0_0_15px_rgba(255,64,64,0.1)]',
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Error message with animation */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-1 text-xs text-pulse-error overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, Textarea }
