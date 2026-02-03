import Link from 'next/link'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PulseGridBackground />

      {/* Simple Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <AnimatedLogo size="md" className="text-pulse-accent" />
          <BrandLogo size="lg" />
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-pulse-text-tertiary">
          © {new Date().getFullYear()} Grants By AI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
