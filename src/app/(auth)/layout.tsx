import Link from 'next/link'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'
import { SkipLink } from '@/components/ui/skip-link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <PulseGridBackground />

      {/* Simple Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <AnimatedLogo size="md" className="text-pulse-accent" />
          <BrandLogo size="lg" />
        </Link>
      </header>

      {/* Content */}
      <main id="main-content" className="relative z-10 flex-1 flex items-center justify-center p-6">
        {/* Subtle ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[15%] w-[600px] h-[400px] rounded-full bg-pulse-accent/[0.03] blur-[160px]" />
          <div className="absolute bottom-[-5%] right-[10%] w-[500px] h-[350px] rounded-full bg-emerald-500/[0.02] blur-[130px]" />
        </div>

        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-pulse-text-tertiary">
          &copy; {new Date().getFullYear()} Grants By AI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
