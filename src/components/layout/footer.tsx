import Link from 'next/link'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <AnimatedLogo size="md" className="text-pulse-accent" />
              <BrandLogo size="lg" />
            </Link>
            <p className="text-body-sm text-pulse-text-tertiary max-w-xs">
              Grant intelligence software. Profile-based qualification and execution tracking.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-label text-pulse-accent mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-label text-pulse-accent mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-label text-pulse-accent mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-pulse-text-secondary hover:text-pulse-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-pulse-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-body-sm text-pulse-text-tertiary">
            © {new Date().getFullYear()} Grants By AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-label-sm text-pulse-text-tertiary normal-case">
              Built for operators.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
