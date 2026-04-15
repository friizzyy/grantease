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
          <div className="absolute top-[-15%] left-[20%] w-[600px] h-[400px] rounded-full bg-pulse-accent/[0.03] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[350px] rounded-full bg-emerald-500/[0.02] blur-[120px]" />
        </div>

        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Footer with links */}
      <footer className="relative z-10 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <p className="text-xs text-pulse-text-tertiary">
            &copy; {new Date().getFullYear()} Grants By AI
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block w-px h-3 bg-white/[0.06]" />
            <Link href="/privacy" className="text-xs text-pulse-text-tertiary hover:text-pulse-text transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-pulse-text-tertiary hover:text-pulse-text transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-xs text-pulse-text-tertiary hover:text-pulse-text transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
