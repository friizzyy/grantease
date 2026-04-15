'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Onboarding error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <AlertCircle className="w-10 h-10 text-pulse-error mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-pulse-text mb-2">Onboarding error</h2>
        <p className="text-sm text-pulse-text-secondary mb-4">
          Something went wrong during setup. Your progress has been saved.
        </p>
        <Button onClick={reset} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  )
}
