import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Privacy Policy | GrantEase',
  description: 'GrantEase privacy policy and data handling practices.',
}

export default function PrivacyPage() {
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

        <h1 className="font-serif text-display text-pulse-text mb-6">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-pulse-text-secondary text-lg mb-8">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">1. Information We Collect</h2>
            <p className="text-pulse-text-secondary mb-4">
              We collect information you provide directly to us, including your name, email address,
              organization details, and grant preferences when you create an account or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">2. How We Use Your Information</h2>
            <p className="text-pulse-text-secondary mb-4">
              We use the information we collect to provide, maintain, and improve our services,
              including personalized grant recommendations and application tracking features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">3. Information Sharing</h2>
            <p className="text-pulse-text-secondary mb-4">
              We do not sell your personal information. We may share information with service providers
              who assist in operating our platform, subject to confidentiality agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">4. Data Security</h2>
            <p className="text-pulse-text-secondary mb-4">
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-pulse-text mb-4">5. Contact Us</h2>
            <p className="text-pulse-text-secondary mb-4">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@grantease.com" className="text-pulse-accent hover:underline">
                privacy@grantease.com
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
