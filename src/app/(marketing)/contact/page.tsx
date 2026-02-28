'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, MapPin, Send, ArrowRight, CheckCircle2 } from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    info: 'support@grantsby.ai',
    detail: 'We respond within 24 hours',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    info: 'Available 9am-6pm EST',
    detail: 'For Pro and Team users',
  },
  {
    icon: MapPin,
    title: 'Location',
    info: 'San Francisco, CA',
    detail: 'Remote-first company',
  },
]

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const m = (props: Record<string, unknown>) => (reduced ? {} : props)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <main className="pt-[60px]">
      {/* ---- HERO ---- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">Contact</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[540px]">
              Get in{' '}
              <span className="text-pulse-text-secondary italic">touch</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg">
              Have a question, feedback, or need help? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- FORM + CONTACT INFO ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left: Form (3 cols) */}
            <div className="lg:col-span-3">
              <div className="relative p-6 sm:p-8 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/20 to-pulse-accent/5" />

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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold text-[14px] rounded-lg hover:border-white/[0.15] transition-colors"
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
                      <div className="mb-6">
                        <h2 className="text-heading-lg text-pulse-text mb-1">Send us a message</h2>
                        <p className="text-body-sm text-pulse-text-tertiary">
                          Fill out the form below and we&apos;ll get back to you soon.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-label-sm text-pulse-text-secondary mb-2">
                              Name
                            </label>
                            <input
                              required
                              value={formState.name}
                              onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                              placeholder="Your name"
                              className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-label-sm text-pulse-text-secondary mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              required
                              value={formState.email}
                              onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
                              placeholder="you@example.com"
                              className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-label-sm text-pulse-text-secondary mb-2">
                            Subject
                          </label>
                          <input
                            required
                            value={formState.subject}
                            onChange={(e) => setFormState(s => ({ ...s, subject: e.target.value }))}
                            placeholder="How can we help?"
                            className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-label-sm text-pulse-text-secondary mb-2">
                            Message
                          </label>
                          <textarea
                            required
                            rows={5}
                            value={formState.message}
                            onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                            placeholder="Tell us more..."
                            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-pulse-text text-body-sm placeholder:text-pulse-text-tertiary focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 transition-all resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)] disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Contact info (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {contactMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.title}
                    className="relative group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                  >
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/20 to-pulse-accent/5" />

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-pulse-accent" />
                      </div>
                      <div>
                        <h3 className="text-heading-sm text-pulse-text mb-0.5">{method.title}</h3>
                        <p className="text-body-sm text-pulse-text-secondary">{method.info}</p>
                        <p className="text-body-sm text-pulse-text-tertiary">{method.detail}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Response time card */}
              <div className="relative p-5 rounded-xl bg-pulse-accent/[0.04] border border-pulse-accent/20">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/30 to-pulse-accent/5" />

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-pulse-accent" />
                  </div>
                  <div>
                    <h3 className="text-heading-sm text-pulse-text mb-0.5">Response time</h3>
                    <p className="text-body-sm text-pulse-text-secondary">
                      We typically respond within <span className="text-pulse-accent font-medium">24 hours</span> on weekdays.
                      Pro and Team users get priority support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
