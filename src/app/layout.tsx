import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { MotionProvider } from '@/lib/motion/motion-context'
import { SessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { Agentation } from 'agentation'

export const metadata: Metadata = {
  title: {
    default: 'Grants By AI - Intelligent Grant Discovery',
    template: '%s | Grants By AI',
  },
  description: 'Find grants across every category. Federal, state, local, nonprofit, and private funding opportunities. Search, qualify, organize, and apply with confidence.',
  keywords: ['grants', 'funding', 'nonprofit', 'small business', 'government grants', 'grant search', 'AI grants'],
  authors: [{ name: 'Grants By AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://grantsby.ai',
    siteName: 'Grants By AI',
    title: 'Grants By AI - Intelligent Grant Discovery',
    description: 'Find grants across every category. Federal, state, local, nonprofit, and private funding opportunities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grants By AI - Intelligent Grant Discovery',
    description: 'Find grants across every category.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0a0a0b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to font services - fonts loaded via @font-face in globals.css */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-pulse-bg text-pulse-text antialiased font-sans">
        <SessionProvider>
          <MotionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </MotionProvider>
        </SessionProvider>
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
