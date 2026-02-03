'use client'

import { useState } from 'react'
import { Mail, MessageSquare, MapPin, Send, ArrowRight } from 'lucide-react'

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

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] mb-8">
            <span className="text-sm text-pulse-text-secondary">Contact</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-pulse-text mb-6 tracking-tight leading-[1.1]">
            Get in <span className="text-pulse-accent">touch</span>
          </h1>
          <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.title}
                  className="group p-6 rounded-2xl bg-white/[0.02] backdrop-blur border border-white/[0.06] hover:border-pulse-accent/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4 group-hover:bg-pulse-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors">{method.title}</h3>
                  <p className="text-pulse-text-secondary">{method.info}</p>
                  <p className="text-sm text-pulse-text-tertiary mt-1">{method.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 md:p-12 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.08]">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-pulse-accent/10 flex items-center justify-center mx-auto mb-6">
                  <Send className="w-10 h-10 text-pulse-accent" />
                </div>
                <h3 className="text-3xl font-bold text-pulse-text mb-3">Message sent!</h3>
                <p className="text-lg text-pulse-text-secondary mb-8 max-w-md mx-auto">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-pulse-text mb-3">Send us a message</h2>
                  <p className="text-pulse-text-secondary">
                    Fill out the form below and we&apos;ll get back to you soon.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-pulse-text mb-2">
                        Name
                      </label>
                      <input
                        required
                        value={formState.name}
                        onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none focus:border-pulse-accent/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pulse-text mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none focus:border-pulse-accent/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pulse-text mb-2">
                      Subject
                    </label>
                    <input
                      required
                      value={formState.subject}
                      onChange={(e) => setFormState(s => ({ ...s, subject: e.target.value }))}
                      placeholder="How can we help?"
                      className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none focus:border-pulse-accent/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-pulse-text mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formState.message}
                      onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                      placeholder="Tell us more..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none focus:border-pulse-accent/40 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24" />
    </main>
  )
}
