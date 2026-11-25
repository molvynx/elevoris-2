'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowIcon } from './SiteChrome'

const countries = [
  'United Kingdom',
  'United Arab Emirates',
  'Saudi Arabia',
  'France',
  'Malaysia',
  'Rwanda',
  'Ghana',
  'Austria',
  'Maldives',
  'Nigeria',
  'South Africa',
  'Qatar',
  'Kuwait',
  'Oman',
  'Other',
]

export default function InquiryForm({
  defaultCourse = '',
  courseOptions,
  locationOptions,
}: {
  defaultCourse?: string
  courseOptions: Array<{ slug: string; title: string }>
  locationOptions: string[]
}) {
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [savedNotice, setSavedNotice] = useState('')
  const [error, setError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(defaultCourse)

  useEffect(() => {
    const requestedCourse = new URLSearchParams(window.location.search).get('course')
    if (requestedCourse && courseOptions.some((course) => course.title === requestedCourse)) {
      setSelectedCourse(requestedCourse)
    }
  }, [courseOptions])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')
    setSavedNotice('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = (await response.json()) as {
        success?: boolean
        stored?: boolean
        error?: string
      }
      if (response.ok && result.success) {
        setSuccess(true)
        return
      }
      if (result.stored) {
        setSavedNotice(
          result.error ||
            'Your enquiry has been recorded. For urgent assistance, please also reach us at info@elevoris.com or WhatsApp.',
        )
        setSuccess(true)
        return
      }
      throw new Error(result.error || 'Unable to submit your enquiry.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit your enquiry.')
    } finally {
      setSending(false)
    }
  }

  if (success)
    return (
      <div className="rounded-2xl border border-amber-200 bg-[#fbf6eb] p-6 text-center sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#96691e] text-xl text-white sm:h-14 sm:w-14 sm:text-2xl">
          ✓
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold text-[#081632] sm:mt-5 sm:text-2xl">
          {savedNotice ? 'Enquiry recorded.' : 'Thank you for your enquiry.'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {savedNotice ||
            'An Elevoris training advisor will review your requirements and contact you with availability and a verified quotation.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-bold">
          <a
            href="mailto:info@elevoris.com"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[#081632] hover:border-[#96691e]"
          >
            Email info@elevoris.com
          </a>
          <a
            href="https://wa.me/447405900092"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#25D366] px-4 py-2.5 text-white hover:opacity-90"
          >
            Message on WhatsApp
          </a>
        </div>
      </div>
    )

  const fieldClass =
    'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 text-sm outline-none focus:border-[#96691e] focus:bg-white sm:h-12 sm:px-4'
  return (
    <form
      data-advisor-zone="form"
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(3,33,52,.08)] sm:grid-cols-2 sm:gap-5 sm:p-8"
      onSubmit={submit}
    >
      <div
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="text-xs font-bold text-[#355465]">
        Full name
        <input
          className={fieldClass}
          name="fullName"
          required
          maxLength={120}
          autoComplete="name"
        />
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Email address
        <input
          className={fieldClass}
          name="email"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
        />
      </label>
      <label className="text-xs font-bold text-[#355465]">
        International country code
        <select className={fieldClass} name="countryCode" required defaultValue="+44">
          <option value="+44">United Kingdom (+44)</option>
          <option value="+971">United Arab Emirates (+971)</option>
          <option value="+966">Saudi Arabia (+966)</option>
          <option value="+33">France (+33)</option>
          <option value="+60">Malaysia (+60)</option>
          <option value="+250">Rwanda (+250)</option>
          <option value="+233">Ghana (+233)</option>
          <option value="+234">Nigeria (+234)</option>
          <option value="+27">South Africa (+27)</option>
          <option value="+974">Qatar (+974)</option>
          <option value="+965">Kuwait (+965)</option>
          <option value="+968">Oman (+968)</option>
          <option>Other</option>
        </select>
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Phone number
        <input
          className={fieldClass}
          name="phone"
          required
          maxLength={30}
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="Your phone number"
        />
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Country
        <select className={fieldClass} name="country" required autoComplete="country-name">
          <option value="">Select country</option>
          {countries.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Company name
        <input
          className={fieldClass}
          name="company"
          required
          maxLength={160}
          autoComplete="organization"
        />
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Course of interest
        <select
          className={fieldClass}
          name="courseInterest"
          required
          value={selectedCourse}
          onChange={(event) => setSelectedCourse(event.target.value)}
        >
          <option value="">Select a programme</option>
          {courseOptions.map((course) => (
            <option key={course.slug} value={course.title}>
              {course.title}
            </option>
          ))}
          <option>Corporate / bespoke training</option>
        </select>
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Preferred training location
        <select className={fieldClass} name="preferredLocation" required>
          <option value="">Select location</option>
          {locationOptions.map((location) => (
            <option key={location}>{location}</option>
          ))}
          <option>Live Online</option>
          <option>At our premises</option>
        </select>
      </label>
      <label className="text-xs font-bold text-[#355465]">
        Number of participants
        <input
          className={fieldClass}
          min={1}
          max={500}
          name="participants"
          required
          type="number"
          defaultValue={1}
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[.75fr_1.25fr]">
        <label className="text-xs font-bold text-[#355465]">
          Currency
          <select className={fieldClass} name="currency" required defaultValue="USD">
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
            <option value="AED">AED — UAE Dirham</option>
            <option value="SAR">SAR — Saudi Riyal</option>
          </select>
        </label>
        <label className="text-xs font-bold text-[#355465]">
          Budget (optional)
          <input className={fieldClass} name="budget" maxLength={80} placeholder="Your range" />
        </label>
      </div>
      <label className="text-xs font-bold text-[#355465] sm:col-span-2">
        Message
        <textarea
          className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-[#f8fafc] p-4 text-sm outline-none focus:border-[#96691e] focus:bg-white"
          name="message"
          required
          maxLength={3000}
          placeholder="Tell us about your goals, preferred dates and any specific requirements."
        />
      </label>
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 sm:col-span-2">
          {error}
        </p>
      )}
      <p className="text-[10px] leading-4 text-slate-400 sm:col-span-2">
        Prices are confirmed by the Elevoris team. If a published price is unavailable, we will
        provide a verified quotation in your preferred currency.
      </p>
      <button
        className="btn-primary min-h-12 w-full sm:col-span-2"
        data-advisor-protected="apply"
        disabled={sending}
        type="submit"
      >
        {sending ? 'Submitting…' : 'Submit international enquiry'} {!sending && <ArrowIcon />}
      </button>
    </form>
  )
}
