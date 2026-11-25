'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react'

const TOPIC_OPTIONS = [
  'All Insights',
  'Career Growth',
  'Certifications',
  'Corporate Training',
  'Study Tips',
] as const

export default function BlogNewsletter({
  defaultTopic = 'All Insights',
  variant = 'cream',
}: {
  defaultTopic?: string
  variant?: 'cream' | 'navy'
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [topicInterest, setTopicInterest] = useState(
    TOPIC_OPTIONS.includes(defaultTopic as (typeof TOPIC_OPTIONS)[number])
      ? defaultTopic
      : 'All Insights',
  )
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)

    const trimmedEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          fullName: fullName.trim(),
          topicInterest,
          website,
        }),
      })
      const data = (await response.json()) as {
        success?: boolean
        message?: string
        error?: string
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to subscribe right now. Please try again.')
      }

      setStatus({
        type: 'success',
        message:
          data.message ||
          'Thank you for subscribing to Elevoris Insights.',
      })
      setEmail('')
      setFullName('')
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to complete subscription.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isNavy = variant === 'navy'

  return (
    <section
      aria-labelledby="newsletter-heading"
      className={`rounded-2xl border p-6 sm:rounded-3xl sm:p-10 ${
        isNavy
          ? 'border-[#c79a3c]/30 bg-[#081632] text-white'
          : 'border-amber-200/80 bg-[#f7f2e8] text-[#081632]'
      }`}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <p className={`eyebrow ${isNavy ? 'text-[#e2bd68]' : 'text-[#96691e]'}`}>
            Elevoris executive briefing
          </p>
          <h2
            id="newsletter-heading"
            className={`mt-2.5 font-display text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl ${
              isNavy ? 'text-white' : 'text-[#081632]'
            }`}
          >
            Receive practical insights &amp; upcoming training dates.
          </h2>
          <p
            className={`mt-3 max-w-xl text-sm leading-6 ${
              isNavy ? 'text-white/75' : 'text-slate-600'
            }`}
          >
            Monthly practitioner notes on leadership, regulatory readiness, corporate L&amp;D, and
            new international schedules—never spam.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Honeypot anti-spam field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="newsletter-website">Leave blank</label>
            <input
              id="newsletter-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newsletter-name"
                className={`mb-1.5 block text-[11px] font-bold ${
                  isNavy ? 'text-white/80' : 'text-[#355465]'
                }`}
              >
                Full name (optional)
              </label>
              <input
                id="newsletter-name"
                name="fullName"
                type="text"
                maxLength={120}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition ${
                  isNavy
                    ? 'border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:border-[#e2bd68]'
                    : 'border-slate-200 bg-white text-[#081632] placeholder:text-slate-400 focus:border-[#96691e]'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="newsletter-topic"
                className={`mb-1.5 block text-[11px] font-bold ${
                  isNavy ? 'text-white/80' : 'text-[#355465]'
                }`}
              >
                Primary interest
              </label>
              <select
                id="newsletter-topic"
                name="topicInterest"
                value={topicInterest}
                onChange={(event) => setTopicInterest(event.target.value)}
                className={`h-11 w-full rounded-xl border px-3 text-sm font-medium outline-none transition ${
                  isNavy
                    ? 'border-white/20 bg-[#0d2147] text-white focus:border-[#e2bd68]'
                    : 'border-slate-200 bg-white text-[#081632] focus:border-[#96691e]'
                }`}
              >
                {TOPIC_OPTIONS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    isNavy ? 'text-white/45' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@organisation.com"
                  className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-sm outline-none transition ${
                    isNavy
                      ? 'border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:border-[#e2bd68]'
                      : 'border-slate-200 bg-white text-[#081632] placeholder:text-slate-400 focus:border-[#96691e]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary h-11 shrink-0 px-6 whitespace-nowrap disabled:opacity-60"
            >
              {submitting ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>

          {status && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
                status.type === 'success'
                  ? isNavy
                    ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : isNavy
                    ? 'border-rose-400/35 bg-rose-500/15 text-rose-200'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
