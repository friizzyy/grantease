import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { PulseGridBackground } from '@/components/pulse-grid/background'
import { PageTransition } from '@/components/motion/page-transition'

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
      <main id="main-content" className="ml-52 min-h-screen relative z-10">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
