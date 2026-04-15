'use client'

import { useEffect } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Discover error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-pulse-error/10 flex items-center justify-center mx-auto mb-5">
          <Search className="w-7 h-7 text-pulse-error" />
        </div>
        <h2 className="text-heading text-pulse-text mb-2">Discovery unavailable</h2>
        <p className="text-body-sm text-pulse-text-secondary mb-6">
          We couldn&apos;t load grant results. Please try again.
        </p>
        {error.digest && (
          <p className="text-label-sm text-pulse-text-tertiary mb-4 font-mono bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg inline-block normal-case">
            {error.digest}
          </p>
        )}
        <div className="flex justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry search
          </Button>
        </div>
      </div>
    </div>
  )
}
