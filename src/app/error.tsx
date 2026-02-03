'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-pulse-bg">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          <motion.div
            className="w-16 h-16 rounded-full bg-pulse-error/10 border border-pulse-error/30 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <AlertCircle className="w-8 h-8 text-pulse-error" />
          </motion.div>

          <h1 className="font-serif text-heading-md text-pulse-text mb-2">
            Something went wrong
          </h1>

          <p className="text-pulse-text-secondary mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>

          {error.digest && (
            <p className="text-xs text-pulse-text-tertiary mb-6 font-mono bg-pulse-surface px-3 py-2 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
