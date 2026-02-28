import Link from 'next/link'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

const links = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]


export function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top row: logo + nav links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <AnimatedLogo size="sm" className="text-pulse-accent" />
            <BrandLogo size="md" />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-pulse-text-tertiary hover:text-pulse-text transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row: copyright + socials */}
        <div className="pt-5 border-t border-white/[0.04]">
          <p className="text-[12px] text-pulse-text-tertiary">
            &copy; {new Date().getFullYear()} Grants By AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
