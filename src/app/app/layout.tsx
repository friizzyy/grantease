import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  return (
    <div className="min-h-screen">
      <PulseGridBackground />
      <AppSidebar isAdmin={isAdmin} />
      <MobileNav isAdmin={isAdmin} />
      <main
        id="main-content"
        className="md:ml-52 min-h-screen relative z-10 pt-14 md:pt-0"
      >
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
