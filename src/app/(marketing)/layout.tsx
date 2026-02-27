import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'
import { SkipLink } from '@/components/ui/skip-link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <PulseGridBackground />
      <Header />
      <main id="main-content" className="flex-1 relative z-10">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
