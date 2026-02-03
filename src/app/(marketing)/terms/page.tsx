import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText, CheckCircle2, AlertTriangle, Scale, BookOpen, Shield, Users, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Grants By AI',
  description: 'Grants By AI terms of service and usage agreement.',
}

const keyTerms = [
  {
    icon: CheckCircle2,
    title: 'Service Access',
    description: 'Access to our platform for grant discovery and tracking.',
  },
  {
    icon: BookOpen,
    title: 'Grant Information',
    description: 'Aggregated data from 50+ sources, updated daily.',
  },
  {
    icon: Shield,
    title: 'Account Security',
    description: 'Secure login and data protection measures.',
  },
]

const userResponsibilities = [
  'Provide accurate information about yourself and your organization',
  'Maintain the confidentiality of your account credentials',
  'Use the platform only for legitimate grant discovery purposes',
  'Verify grant information with original sources before applying',
  'Comply with all applicable laws and regulations',
  'Report any security vulnerabilities or misuse you discover',
]

const restrictions = [
  { title: 'No Automated Access', description: 'Scraping, bots, or automated data collection is prohibited' },
  { title: 'No Reselling', description: 'You may not resell or redistribute our data commercially' },
  { title: 'No Misrepresentation', description: 'Don\'t impersonate others or misrepresent your eligibility' },
  { title: 'No Interference', description: 'Don\'t attempt to disrupt or compromise our systems' },
]

export default function TermsPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-pulse-accent/[0.06] blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
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
            <Scale className="w-4 h-4 text-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">Legal Agreement</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-pulse-text mb-6 tracking-tight">
            Terms of <span className="text-pulse-accent">Service</span>
          </h1>

          <p className="text-lg text-pulse-text-secondary leading-relaxed mb-4">
            These terms govern your use of Grants By AI. By accessing our platform, you agree to be bound by
            these terms. Please read them carefully.
          </p>

          <p className="text-sm text-pulse-text-tertiary">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Our Services</span>
            </div>
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              What we provide
            </h2>
            <p className="text-pulse-text-secondary">
              Grants By AI offers a comprehensive platform for discovering and managing grant opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {keyTerms.map((term) => {
              const Icon = term.icon
              return (
                <div
                  key={term.title}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4 group-hover:bg-pulse-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-pulse-text mb-2 group-hover:text-pulse-accent transition-colors">
                    {term.title}
                  </h3>
                  <p className="text-sm text-pulse-text-secondary leading-relaxed">
                    {term.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* User Responsibilities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Your Responsibilities</span>
            </div>
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              What we expect from you
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {userResponsibilities.map((responsibility, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-pulse-accent shrink-0 mt-0.5" />
                <span className="text-pulse-text-secondary">{responsibility}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restrictions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400">Restrictions</span>
            </div>
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              Prohibited activities
            </h2>
            <p className="text-pulse-text-secondary">
              To maintain a fair and secure platform for everyone, certain activities are not permitted.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {restrictions.map((restriction) => (
              <div
                key={restriction.title}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/20 transition-all"
              >
                <h3 className="font-semibold text-pulse-text mb-1 group-hover:text-amber-400 transition-colors">
                  {restriction.title}
                </h3>
                <p className="text-sm text-pulse-text-tertiary">
                  {restriction.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Disclaimers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
              <span className="text-sm text-pulse-accent">Disclaimers</span>
            </div>
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              Important notices
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Information Accuracy',
                description: 'Grant information is provided for informational purposes only. We strive for accuracy but cannot guarantee that all details are current or complete. Always verify with the original grant source.',
              },
              {
                title: 'No Guarantee of Funding',
                description: 'Using Grants By AI does not guarantee you will receive grant funding. Success depends on many factors including eligibility, application quality, and funder decisions.',
              },
              {
                title: 'Service Availability',
                description: 'We aim for 99.9% uptime but cannot guarantee uninterrupted access. Scheduled maintenance and unforeseen issues may occasionally affect availability.',
              },
              {
                title: 'Third-Party Links',
                description: 'Our platform may contain links to external grant sources. We are not responsible for the content or practices of these third-party sites.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-pulse-text mb-1">{item.title}</h3>
                  <p className="text-sm text-pulse-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intellectual Property */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
                <span className="text-sm text-pulse-accent">Intellectual Property</span>
              </div>
              <h2 className="text-3xl font-bold text-pulse-text mb-4">
                Ownership & licensing
              </h2>
              <p className="text-pulse-text-secondary leading-relaxed">
                The Grants By AI platform, including its design, features, code, and content, is protected
                by intellectual property laws. You retain ownership of any data you submit, but grant
                us a license to use it to provide our services.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Our Platform', value: 'We own it' },
                { label: 'Your Data', value: 'You own it' },
                { label: 'Grant Info', value: 'Public sources' },
                { label: 'Your Feedback', value: 'Licensed to us' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <div className="text-sm text-pulse-text-tertiary mb-1">{item.label}</div>
                  <div className="font-semibold text-pulse-text">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.06] blur-[150px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-pulse-accent/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-pulse-accent" />
          </div>

          <h2 className="text-3xl font-bold text-pulse-text mb-4">
            Questions about our terms?
          </h2>

          <p className="text-lg text-pulse-text-secondary mb-8">
            Our legal team is happy to clarify any part of this agreement.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:legal@grantsby.ai"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all"
            >
              Contact Legal Team
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
