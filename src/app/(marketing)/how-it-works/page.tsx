import Link from 'next/link'
import {
  ArrowRight,
  Search,
  BookOpen,
  PenLine,
  Send,
  CheckCircle2,
  Sparkles,
  FileText,
  Clock,
  Shield,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">How It Works</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-pulse-text mb-6 tracking-tight">
            You don&apos;t just find grants here.
            <br />
            <span className="text-pulse-accent">You finish them.</span>
          </h1>

          <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            We guide you through every step—from understanding if you qualify to
            submitting a professional application. No grant writing experience needed.
          </p>

          {/* Quick stats */}
          <div className="inline-flex flex-wrap justify-center items-center gap-6 md:gap-10 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">5 min</div>
              <div className="text-xs text-pulse-text-tertiary">Profile setup</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">Instant</div>
              <div className="text-xs text-pulse-text-tertiary">Grant matches</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">AI-guided</div>
              <div className="text-xs text-pulse-text-tertiary">Applications</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">100%</div>
              <div className="text-xs text-pulse-text-tertiary">Award is yours</div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step Journey - Detailed */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
              Your path from discovery to funded
            </h2>
            <p className="text-lg text-pulse-text-secondary max-w-2xl mx-auto">
              Four clear steps. Each one designed to remove confusion and build your confidence.
            </p>
          </div>

          {/* Step 1 */}
          <div className="mb-16">
            <div className="flex items-start gap-6 md:gap-10">
              <div className="hidden md:flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-pulse-accent/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-pulse-accent">1</span>
                </div>
                <div className="w-px h-full bg-gradient-to-b from-pulse-accent/30 to-transparent mt-4" />
              </div>
              <div className="flex-1">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center">
                      <Search className="w-6 h-6 text-pulse-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-pulse-text">Find Your Matches</h3>
                      <p className="text-sm text-pulse-text-tertiary">Stop searching. Start discovering.</p>
                    </div>
                  </div>
                  <p className="text-pulse-text-secondary mb-6 leading-relaxed">
                    Tell us about your organization—what you do, where you&apos;re located, what you need funding for.
                    Our AI searches 20,000+ grants from federal, state, and private sources. In seconds, you see
                    only the grants you actually qualify for.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      'AI analyzes your profile against every requirement',
                      'See why each grant matches (or doesn\'t)',
                      'Filter by amount, deadline, difficulty',
                      'Save promising grants for later',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-pulse-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-pulse-text-secondary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-16">
            <div className="flex items-start gap-6 md:gap-10">
              <div className="hidden md:flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-pulse-accent/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-pulse-accent">2</span>
                </div>
                <div className="w-px h-full bg-gradient-to-b from-pulse-accent/30 to-transparent mt-4" />
              </div>
              <div className="flex-1">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-pulse-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-pulse-text">Understand Before You Apply</h3>
                      <p className="text-sm text-pulse-text-tertiary">Know exactly what you&apos;re getting into.</p>
                    </div>
                  </div>
                  <p className="text-pulse-text-secondary mb-6 leading-relaxed">
                    Every grant is explained in plain English—not government jargon. See exactly what the grant funds,
                    who qualifies, what documents you&apos;ll need, and how much effort it takes to apply.
                    Make informed decisions before investing your time.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      'Plain English summary of requirements',
                      'Detailed eligibility breakdown',
                      'List of required documents',
                      'Estimated time to complete application',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-pulse-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-pulse-text-secondary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-16">
            <div className="flex items-start gap-6 md:gap-10">
              <div className="hidden md:flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-pulse-accent/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-pulse-accent">3</span>
                </div>
                <div className="w-px h-full bg-gradient-to-b from-pulse-accent/30 to-transparent mt-4" />
              </div>
              <div className="flex-1">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-pulse-accent/5 to-transparent border border-pulse-accent/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pulse-accent/20 flex items-center justify-center">
                      <PenLine className="w-6 h-6 text-pulse-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-pulse-text">Write with AI Assistance</h3>
                      <p className="text-sm text-pulse-accent font-medium">This is where the magic happens.</p>
                    </div>
                  </div>
                  <p className="text-pulse-text-secondary mb-6 leading-relaxed">
                    You&apos;re not alone. Our AI writing assistant helps you craft each section of your application.
                    Your profile auto-fills basic information—you never retype your address or organization details.
                    Get feedback on your drafts before you submit.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                      'Section-by-section guidance',
                      'AI drafts you can edit and refine',
                      'Auto-fill from your saved profile',
                      'Feedback on clarity and completeness',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-pulse-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-pulse-text">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-pulse-bg/50 border border-white/[0.06]">
                    <p className="text-sm text-pulse-text-secondary">
                      <span className="text-pulse-accent font-medium">No grant writer needed.</span> Our AI helps you
                      sound professional while keeping your authentic voice. Every word is yours to approve.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-start gap-6 md:gap-10">
              <div className="hidden md:flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">4</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Send className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-pulse-text">Submit & Track</h3>
                      <p className="text-sm text-pulse-text-tertiary">Confidence at every stage.</p>
                    </div>
                  </div>
                  <p className="text-pulse-text-secondary mb-6 leading-relaxed">
                    Review your complete application before submitting. Track your status, deadlines, and any
                    follow-up requirements all in one place. We help you stay organized even after you hit submit.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      'Complete application preview',
                      'Deadline reminders',
                      'Status tracking dashboard',
                      'Follow-up guidance if needed',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-pulse-text-secondary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Different */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.01] border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
              Built different from grant databases
            </h2>
            <p className="text-lg text-pulse-text-secondary max-w-2xl mx-auto">
              Other sites show you a list of grants. We actually help you complete applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'Plain English Explanations',
                description: 'Every grant requirement translated from bureaucratic jargon into language anyone can understand.',
              },
              {
                icon: FileText,
                title: 'One Profile, Many Applications',
                description: 'Enter your info once. It auto-fills every application. Update once, apply everywhere.',
              },
              {
                icon: Sparkles,
                title: 'AI Writing Assistance',
                description: 'Get help drafting every section. Sound professional without hiring a consultant.',
              },
              {
                icon: Shield,
                title: 'Eligibility Verification',
                description: 'Know if you qualify before you invest time. We check every requirement against your profile.',
              },
              {
                icon: Clock,
                title: 'Time Estimates',
                description: 'See how long each application takes before you start. Plan your time realistically.',
              },
              {
                icon: RefreshCw,
                title: 'Reusable Content',
                description: 'Good answers you write for one grant can be adapted for others. Your work compounds.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-pulse-accent" />
                </div>
                <h3 className="text-lg font-semibold text-pulse-text mb-2">{feature.title}</h3>
                <p className="text-sm text-pulse-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Do I need grant writing experience?',
                a: 'No. Our AI guides you through each section with suggestions and examples. You edit and approve everything—the final application is yours.',
              },
              {
                q: 'How long does it take to get started?',
                a: 'About 5 minutes to create your profile. You\'ll see matched grants immediately after. Your first application depends on the grant, but we show you time estimates upfront.',
              },
              {
                q: 'Do you take a percentage of my award?',
                a: 'Never. You keep 100% of every dollar you win. We charge a subscription fee for access to the platform, not a cut of your funding.',
              },
              {
                q: 'What if I get stuck on an application?',
                a: 'The AI assistant is there for every section. If you need more help, you can reach our support team. We want you to succeed.',
              },
              {
                q: 'Can I use this for any type of grant?',
                a: 'We focus on grants accessible to small organizations—small businesses, farms, nonprofits, individuals. Not the massive research grants that require institutional backing.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <h3 className="text-base font-medium text-pulse-text mb-2">{faq.q}</h3>
                <p className="text-sm text-pulse-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
            Ready to start your first application?
          </h2>

          <p className="text-lg text-pulse-text-secondary mb-8 max-w-xl mx-auto">
            Build your profile in 5 minutes. See your matched grants. Start applying with AI assistance.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-all"
            >
              View Pricing
            </Link>
          </div>

          <p className="mt-6 text-sm text-pulse-text-tertiary">
            Free to start. No credit card required.
          </p>
        </div>
      </section>
    </main>
  )
}
