'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
]

const menuVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const menuItemVariants = {
  closed: { opacity: 0, x: -20 },
  open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Whether this header should be hidden (app/admin routes have their own nav)
  const isHidden = pathname?.startsWith('/app') || pathname?.startsWith('/admin')

  // Scroll detection for transparent-to-solid transition
  useEffect(() => {
    if (isHidden) return
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHidden])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (isHidden) {
    return null
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-pulse-bg/80 backdrop-blur-md border-b border-pulse-border shadow-lg shadow-black/10'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo -- left */}
          <Link href="/" className="flex items-center gap-2.5">
            <AnimatedLogo className="text-pulse-accent" />
            <BrandLogo size="lg" />
          </Link>

          {/* Desktop Navigation -- center */}
          <div className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'text-body-sm font-medium transition-colors duration-200 relative py-1',
                    isActive
                      ? 'text-pulse-accent'
                      : 'text-pulse-text-secondary hover:text-pulse-text'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pulse-accent rounded-full"
                      aria-hidden="true"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* CTA Buttons -- right */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Build Profile</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-pulse-text-secondary hover:text-pulse-text transition-colors focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu -- full overlay with staggered links */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              className="md:hidden fixed inset-0 top-16 z-50 bg-pulse-bg/95 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="navigation"
              aria-label="Mobile navigation"
            >
              <motion.div
                className="flex flex-col p-6 gap-2"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div key={item.href} variants={menuItemVariants}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-4 py-3 text-lg font-medium rounded-xl transition-colors duration-150',
                          isActive
                            ? 'text-pulse-accent bg-pulse-accent/10'
                            : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-elevated'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  )
                })}

                <motion.div variants={menuItemVariants} className="flex gap-3 mt-6 px-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/register">Build Profile</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
