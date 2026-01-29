'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database, Activity, Settings, ArrowLeft } from 'lucide-react'

const adminNavItems = [
  { href: '/admin/ingestion', label: 'Ingestion', icon: Database },
  { href: '/admin/logs', label: 'Logs', icon: Activity },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-pulse-bg">
      {/* Admin Header */}
      <header className="border-b border-pulse-border bg-pulse-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/app" 
                className="flex items-center gap-2 text-pulse-muted hover:text-pulse-text transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to App</span>
              </Link>
              <div className="h-4 w-px bg-pulse-border" />
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-pulse-accent" />
                <span className="font-serif text-lg text-pulse-text">Admin</span>
              </div>
            </div>
            
            <nav className="flex items-center gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-pulse-accent/10 text-pulse-accent'
                        : 'text-pulse-muted hover:text-pulse-text hover:bg-pulse-surface'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
