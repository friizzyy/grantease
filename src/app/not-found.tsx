'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

export default function NotFound() {
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
            className="text-7xl font-serif text-pulse-accent mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            404
          </motion.div>

          <h1 className="font-serif text-heading-md text-pulse-text mb-2">
            Page not found
          </h1>

          <p className="text-pulse-text-secondary mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-pulse-border">
            <p className="text-sm text-pulse-text-tertiary mb-3">
              Looking for grants?
            </p>
            <Button variant="secondary" asChild>
              <Link href="/app/discover">
                <Search className="w-4 h-4 mr-2" />
                Discover Grants
              </Link>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
