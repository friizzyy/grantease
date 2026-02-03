import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PulseGridBackground />
      <Header />
      <main className="flex-1 relative z-10">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
