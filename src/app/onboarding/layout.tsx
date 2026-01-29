'use client'

/**
 * ONBOARDING LAYOUT
 * -----------------
 * Provides OnboardingProvider context to all onboarding pages
 */

import { ReactNode } from 'react'
import { OnboardingProvider } from '@/lib/contexts/OnboardingContext'

export default function OnboardingRootLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  )
}
