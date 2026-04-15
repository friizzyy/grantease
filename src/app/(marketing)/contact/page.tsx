'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, MapPin, Send, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionIntro } from '@/components/marketing/SectionIntro'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'

const topics = [
  { label: 'General question', value: 'General question' },
  { label: 'Bug report', value: 'Bug report' },
  { label: 'Feature request', value: 'Feature request' },
  { label: 'Sales inquiry', value: 'Sales inquiry' },
  { label: 'Billing issue', value: 'Billing issue' },
  { label: 'Partnership', value: 'Partnership' },
]

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    info: 'support@grantsby.ai',
    detail: 'We respond within 24 hours',
    color: 'indigo' as const,
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    info: 'Available 9am-6pm EST',
    detail: 'For Pro and Team users',
    color: 'accent' as const,
  },
  {
    icon: MapPin,
    title: 'Location',
    info: 'San Francisco, CA',
    detail: 'Remote-first company',
    color: 'rose' as const,
  },
]

const colorMap = {
  accent: { bg: 'bg-pulse-accent/10', text: 'text-pulse-accent', border: 'border-pulse-accent/15' },
  rose: { bg: 'bg-pulse-rose-dim', text: 'text-pulse-rose', border: 'border-pulse-rose/15' },
  indigo: { bg: 'bg-pulse-indigo-dim', text: 'text-pulse-indigo', border: 'border-pulse-indigo/15' },
}

const MAX_MESSAGE = 2000

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { reduced, m } = useReducedMotion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[10%] w-[500px] h-[400px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute bottom-[5%] left-[15%] w-[400px] h-[300px] rounded-full bg-pulse-indigo/[0.025] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <Mail className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">Contact Us</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              Let&apos;s{' '}
              <span className="text-gradient-rose italic">talk.</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-indigo/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mx-auto">
              Have a question, feedback, or need help? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* ---- CONTACT CARDS ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {contactMethods.map((method) => {
              const Icon = method.icon
              const colors = colorMap[method.color]
              return (
                <div
                  key={method.title}
                  className={`group relative p-5 rounded-xl bg-white/[0.02] border ${colors.border} hover:bg-white/[0.04] transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                    </div>
                    <h3 className="text-heading-sm text-pulse-text">{method.title}</h3>
                  </div>
                  <p className="text-body-sm text-pulse-text-secondary font-medium">{method.info}</p>
                  <p className="text-caption text-pulse-text-tertiary">{method.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ---- FORM ---- */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20"
        {...m(fadeIn)}
      >
        <div className="max-w-3xl mx-auto">
          <div className="relative p-6 sm:p-8 rounded-2xl card-glass">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    className="w-16 h-16 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center mx-auto mb-6"
                    initial={reduced ? undefined : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-pulse-accent" />
                  </motion.div>
                  <h3 className="text-display-section text-pulse-text mb-3">Message sent!</h3>
                  <p className="text-body text-pulse-text-secondary mb-8 max-w-md mx-auto">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setFormState({ name: '', email: '', subject: '', message: '' })
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold text-body-sm rounded-lg hover:border-white/[0.15] transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={reduced ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="mb-8">
                    <SectionIntro
                      label="Contact"
                      headingAs="h2"
                      accent="accent"
                      description="Choose a topic and fill out the form below."
                    >
                      Send us a message
                    </SectionIntro>
                  </div>

                  {/* Quick-select topic chips */}
                  <div className="mb-6">
                    <label className="block text-body-sm font-medium text-pulse-text-secondary mb-3">
                      What&apos;s this about?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <button
                          key={topic.value}
                          type="button"
                          onClick={() => setFormState(s => ({ ...s, subject: topic.value }))}
                          className={cn(
                            'px-3.5 py-1.5 rounded-lg text-body-sm font-medium border transition-all duration-200',
                            formState.subject === topic.value
                              ? 'bg-pulse-accent/15 border-pulse-accent/30 text-pulse-accent'
                              : 'border-white/[0.08] text-pulse-text-tertiary hover:border-white/[0.15] hover:text-pulse-text-secondary'
                          )}
                        >
                          {topic.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-body-sm font-medium text-pulse-text-secondary mb-2">
                          Name
                        </label>
                        <input
                          required
                          value={formState.name}
                          onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full h-12 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary/50 focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-body-sm font-medium text-pulse-text-secondary mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
                          placeholder="you@example.com"
                          className="w-full h-12 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary/50 focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-body-sm font-medium text-pulse-text-secondary mb-2">
                        Subject
                      </label>
                      <input
                        required
                        value={formState.subject}
                        onChange={(e) => setFormState(s => ({ ...s, subject: e.target.value }))}
                        placeholder="Or type your own subject"
                        className="w-full h-12 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary/50 focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-body-sm font-medium text-pulse-text-secondary">
                          Message
                        </label>
                        <span className={cn(
                          'text-caption tabular-nums transition-colors',
                          formState.message.length > MAX_MESSAGE * 0.9
                            ? 'text-pulse-error'
                            : 'text-pulse-text-tertiary'
                        )}>
                          {formState.message.length}/{MAX_MESSAGE}
                        </span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        maxLength={MAX_MESSAGE}
                        value={formState.message}
                        onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                        placeholder="Tell us more..."
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary/50 focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-pulse disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-pulse-bg/30 border-t-pulse-bg rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Response time note */}
          <div className="mt-6 flex items-center justify-center gap-2.5 text-center">
            <div className="w-2 h-2 rounded-full bg-pulse-accent animate-pulse" />
            <span className="text-body-sm text-pulse-text-tertiary">
              Average response time: <span className="text-pulse-text-secondary font-medium">under 24 hours</span>
            </span>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
