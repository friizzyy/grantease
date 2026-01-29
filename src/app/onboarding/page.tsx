'use client'

/**
 * ONBOARDING INDEX PAGE
 * ---------------------
 * Entry point that redirects to appropriate step
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function OnboardingIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // In a real app, we'd check the user's onboarding status here
    // For now, redirect to step 1
    router.replace('/onboarding/step-1')
  }, [router])

  return (
    <div className="min-h-screen bg-pulse-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-pulse-accent mx-auto mb-4" />
        <p className="text-pulse-text-secondary">Loading...</p>
      </div>
    </div>
  )
}
