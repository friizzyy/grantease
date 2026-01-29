import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms of Service | GrantEase',
  description: 'GrantEase terms of service and usage agreement.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-pulse-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="font-serif text-display text-pulse-text mb-6">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-pulse-text-secondary text-lg mb-8">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">1. Acceptance of Terms</h2>
            <p className="text-pulse-text-secondary mb-4">
              By accessing or using GrantEase, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">2. Description of Service</h2>
            <p className="text-pulse-text-secondary mb-4">
              GrantEase provides a platform for discovering, tracking, and managing grant opportunities.
              We aggregate grant information from various sources and provide tools to help you find
              and apply for relevant funding opportunities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">3. User Responsibilities</h2>
            <p className="text-pulse-text-secondary mb-4">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to provide accurate
              and complete information when using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">4. Intellectual Property</h2>
            <p className="text-pulse-text-secondary mb-4">
              The GrantEase platform, including its design, features, and content, is protected by
              intellectual property laws. You may not copy, modify, or distribute our platform
              without prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">5. Disclaimer</h2>
            <p className="text-pulse-text-secondary mb-4">
              Grant information is provided for informational purposes only. We make no guarantees
              about the accuracy, completeness, or timeliness of grant listings. Always verify
              information with the original grant source before applying.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">6. Contact</h2>
            <p className="text-pulse-text-secondary mb-4">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@grantease.com" className="text-pulse-accent hover:underline">
                legal@grantease.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-pulse-border">
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
