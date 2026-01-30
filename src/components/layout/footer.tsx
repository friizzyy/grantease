import Link from 'next/link'
import { AnimatedLogo } from '@/components/ui/animated-logo'

const footerLinks = {
  product: [
    { label: 'Features', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-pulse-border bg-pulse-bg/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <AnimatedLogo size="md" className="text-pulse-accent" />
              <span className="font-serif text-xl text-pulse-text">GrantEase</span>
            </Link>
            <p className="text-sm text-pulse-text-tertiary max-w-xs">
              Intelligent grant discovery across every category. Find, qualify, and apply with confidence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono text-micro uppercase tracking-wider text-pulse-accent mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-mono text-micro uppercase tracking-wider text-pulse-accent mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-micro uppercase tracking-wider text-pulse-accent mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-pulse-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-pulse-text-tertiary">
            © {new Date().getFullYear()} GrantEase. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-pulse-text-tertiary font-mono">
              Built for grant seekers everywhere
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
