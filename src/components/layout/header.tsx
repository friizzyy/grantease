'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show on app routes (they have their own nav)
  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-pulse-bg/80 backdrop-blur-md border-b border-pulse-border" />
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <AnimatedLogo className="text-pulse-accent" />
            <span className="font-serif text-xl tracking-tight text-pulse-text">GrantEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-1',
                  pathname === item.href
                    ? 'text-pulse-accent'
                    : 'text-pulse-text-secondary hover:text-pulse-text'
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-pulse-accent" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-pulse-text-secondary hover:text-pulse-text"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-pulse-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'text-pulse-accent bg-pulse-accent/10'
                      : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4 px-4">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
