import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Shield, Eye, Lock, Server, Users, Bell, FileText, Mail, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Grants By AI',
  description: 'Grants By AI privacy policy and data handling practices.',
}

const dataCategories = [
  {
    icon: Users,
    title: 'Account Information',
    description: 'Name, email, organization details, and preferences you provide when creating an account.',
  },
  {
    icon: FileText,
    title: 'Usage Data',
    description: 'How you interact with our platform, including searches, saved grants, and application progress.',
  },
  {
    icon: Server,
    title: 'Technical Data',
    description: 'Device information, IP address, and browser type to ensure optimal performance.',
  },
]

const protections = [
  {
    icon: Lock,
    title: 'Encryption',
    description: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256).',
  },
  {
    icon: Shield,
    title: 'Access Controls',
    description: 'Strict role-based permissions and regular security audits.',
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description: 'We collect only what we need and never sell your data.',
  },
]

const rights = [
  { title: 'Access', description: 'Request a copy of your personal data' },
  { title: 'Correction', description: 'Update or correct inaccurate information' },
  { title: 'Deletion', description: 'Request deletion of your account and data' },
  { title: 'Portability', description: 'Export your data in a standard format' },
  { title: 'Opt-out', description: 'Unsubscribe from marketing communications' },
  { title: 'Restrict', description: 'Limit how we process your information' },
]

export default function PrivacyPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[800px] h-[800px] rounded-full bg-pulse-accent/[0.06] blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <Shield className="w-4 h-4 text-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">Your Privacy Matters</span>
          </div>

          <h1 className="text-display-lg font-bold text-pulse-text mb-6 tracking-tight">
            Privacy <span className="text-pulse-accent">Policy</span>
          </h1>

          <p className="text-body-lg text-pulse-text-secondary leading-relaxed mb-4 max-w-2xl">
            We&apos;re committed to protecting your privacy and being transparent about how we handle your data.
            This policy explains what we collect, how we use it, and your rights.
          </p>

          <p className="text-caption text-pulse-text-tertiary">
            Last updated: February 2026
          </p>
        </div>
      </section>

      {/* Data We Collect */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-pulse-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Data Collection</span>
            </div>
            <h2 className="text-heading-lg font-bold text-pulse-text mb-4 tracking-tight">
              Information we collect
            </h2>
            <p className="text-body text-pulse-text-secondary leading-relaxed">
              We collect information to provide better services and personalized grant recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {dataCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.title}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4 group-hover:bg-pulse-accent/20 transition-colors duration-200">
                    <Icon className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h3 className="text-heading-sm font-semibold text-pulse-text mb-2 group-hover:text-pulse-accent transition-colors duration-200">
                    {category.title}
                  </h3>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                    {category.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How We Use Data */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Data Usage</span>
            </div>
            <h2 className="text-heading-lg font-bold text-pulse-text mb-4 tracking-tight">
              How we use your information
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Personalized Recommendations', description: 'Match you with grants that fit your organization and mission' },
              { title: 'Platform Improvement', description: 'Analyze usage patterns to enhance features and user experience' },
              { title: 'Communication', description: 'Send grant alerts, application reminders, and important updates' },
              { title: 'Security', description: 'Detect and prevent fraud, abuse, and unauthorized access' },
              { title: 'Legal Compliance', description: 'Meet regulatory requirements and respond to legal requests' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-pulse-accent">{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-heading-sm font-semibold text-pulse-text mb-1">{item.title}</h3>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-pulse-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Security</span>
            </div>
            <h2 className="text-heading-lg font-bold text-pulse-text mb-4 tracking-tight">
              How we protect your data
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {protections.map((protection) => {
              const Icon = protection.icon
              return (
                <div
                  key={protection.title}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4 group-hover:bg-pulse-accent/20 transition-colors duration-200">
                    <Icon className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h3 className="text-heading-sm font-semibold text-pulse-text mb-2 group-hover:text-pulse-accent transition-colors duration-200">
                    {protection.title}
                  </h3>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                    {protection.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Your Rights</span>
            </div>
            <h2 className="text-heading-lg font-bold text-pulse-text mb-4 tracking-tight">
              Control over your data
            </h2>
            <p className="text-body text-pulse-text-secondary leading-relaxed">
              You have rights regarding your personal data. Here&apos;s what you can do:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rights.map((right) => (
              <div
                key={right.title}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all duration-200"
              >
                <h3 className="font-semibold text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors duration-200">
                  {right.title}
                </h3>
                <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">
                  {right.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-pulse-border/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.06] blur-[150px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-pulse-accent/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-pulse-accent" />
          </div>

          <h2 className="text-heading-lg font-bold text-pulse-text mb-4 tracking-tight">
            Questions about privacy?
          </h2>

          <p className="text-body-lg text-pulse-text-secondary mb-8">
            We&apos;re here to help. Reach out to our privacy team anytime.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:privacy@grantsby.ai"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all duration-200"
            >
              Contact Privacy Team
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-all duration-200"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
