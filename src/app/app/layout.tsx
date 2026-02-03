import { AppSidebar } from '@/components/layout/app-sidebar'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <PulseGridBackground />
      <AppSidebar isAdmin={true} />
      <main className="ml-64 min-h-screen relative z-10">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
