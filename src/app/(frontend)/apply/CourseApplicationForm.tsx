'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowIcon } from '../SiteChrome'

export type ApplicationCourseOption = {
  slug: string
  title: string
  category: string
  sessions: string[]
}

type FormValues = {
  fullName: string
  email: string
  country: string
  countryCode: string
  phone: string
  company: string
  jobTitle: string
  courseSlug: string
  selectedSession: string
  message: string
}

type FieldErrors = Partial<Record<keyof FormValues, string>>

type SubmissionResult = {
  stored: boolean
  emailSent: boolean
  message: string
}

const COUNTRIES = [
  'United Kingdom',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Oman',
  'Bahrain',
  'France',
  'Germany',
  'Netherlands',
  'Switzerland',
  'Malaysia',
  'Singapore',
  'Rwanda',
  'Kenya',
  'Ghana',
  'Nigeria',
  'South Africa',
  'United States',
  'Other',
]

const COUNTRY_CODES = [
  '+44 (UK)',
  '+971 (UAE)',
  '+966 (Saudi Arabia)',
  '+974 (Qatar)',
  '+965 (Kuwait)',
  '+968 (Oman)',
  '+33 (France)',
  '+49 (Germany)',
  '+31 (Netherlands)',
  '+41 (Switzerland)',
  '+60 (Malaysia)',
  '+65 (Singapore)',
  '+250 (Rwanda)',
  '+254 (Kenya)',
  '+233 (Ghana)',
  '+234 (Nigeria)',
  '+27 (South Africa)',
  '+1 (US/Canada)',
  'Other',
]

export default function CourseApplicationForm({
  courses,
  initialCourseSlug = '',
  initialSession = '',
}: {
  courses: ApplicationCourseOption[]
  initialCourseSlug?: string
  initialSession?: string
}) {
  const searchParams = useSearchParams()
  const queryCourse = searchParams.get('course') || initialCourseSlug
  const querySession = searchParams.get('session') || initialSession
  const matchedInitialCourse = useMemo(
    () =>
      courses.find(
        (c) => c.slug === queryCourse || c.title.toLowerCase() === queryCourse.toLowerCase(),
      ) ?? null,
    [courses, queryCourse],
  )

  const [values, setValues] = useState<FormValues>({
    fullName: '',
    email: '',
    country: '',
    countryCode: '+44 (UK)',
    phone: '',
    company: '',
    jobTitle: '',
    courseSlug: matchedInitialCourse?.slug ?? '',
    selectedSession:
      querySession ||
      matchedInitialCourse?.sessions[0] ||
      (matchedInitialCourse ? 'Schedule to be announced. / Request tailored dates' : ''),
    message: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [reviewedData, setReviewedData] = useState<
    (FormValues & { courseTitle: string; category: string }) | null
  >(null)
  const [copied, setCopied] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const submittingRef = useRef(false)

  // Keep query params synchronized on first load and client-side Link transitions.
  useEffect(() => {
    const found = courses.find(
      (c) => c.slug === queryCourse || c.title.toLowerCase() === queryCourse.toLowerCase(),
    )
    if (found) {
      setValues((prev) => ({
        ...prev,
        courseSlug: found.slug,
        selectedSession:
          querySession || found.sessions[0] || 'Schedule to be announced. / Request tailored dates',
      }))
    } else if (querySession) {
      setValues((prev) => ({ ...prev, selectedSession: querySession }))
    }
  }, [courses, queryCourse, querySession])

  const currentCourse = useMemo(
    () => courses.find((c) => c.slug === values.courseSlug) ?? null,
    [courses, values.courseSlug],
  )

  function handleCourseChange(nextSlug: string) {
    const found = courses.find((c) => c.slug === nextSlug)
    setValues((prev) => ({
      ...prev,
      courseSlug: nextSlug,
      selectedSession: found?.sessions[0] || 'Schedule to be announced. / Request tailored dates',
    }))
    setErrors((prev) => ({ ...prev, courseSlug: undefined, selectedSession: undefined }))
  }

  function validate(input: FormValues): FieldErrors {
    const next: FieldErrors = {}
    if (!input.fullName.trim() || input.fullName.trim().length < 2) {
      next.fullName = 'Please enter your full name.'
    }
    if (!input.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      next.email = 'Please enter a valid work or personal email address.'
    }
    if (!input.country.trim()) {
      next.country = 'Please select your country.'
    }
    if (!input.countryCode.trim()) {
      next.countryCode = 'Please select a country dialling code.'
    }
    const cleanDigits = input.phone.replace(/[^\d+]/g, '')
    if (!cleanDigits || cleanDigits.length < 6) {
      next.phone = 'Please enter a valid phone number (at least 6 digits).'
    }
    if (!input.company.trim()) {
      next.company = 'Please enter your organisation or company name.'
    }
    if (!input.jobTitle.trim()) {
      next.jobTitle = 'Please enter your job title or role.'
    }
    if (!input.courseSlug) {
      next.courseSlug = 'Please select a course from the catalogue.'
    }
    if (!input.selectedSession.trim()) {
      next.selectedSession = 'Please select a preferred session or request dates.'
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    submittingRef.current = true
    setSubmitting(true)

    const courseObj = courses.find((c) => c.slug === values.courseSlug)
    const review = {
      ...values,
      courseTitle: courseObj?.title || values.courseSlug,
      category: courseObj?.category || 'Professional Training',
    }

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          countryCode: values.countryCode.split(' ')[0],
          phone: values.phone,
          country: values.country,
          company: values.company,
          courseInterest: review.courseTitle,
          preferredLocation: values.selectedSession.slice(0, 120),
          participants: 1,
          currency: 'GBP',
          budget: '',
          message: [
            `Course application for ${review.courseTitle}.`,
            `Preferred session: ${values.selectedSession}.`,
            `Job title: ${values.jobTitle}.`,
            values.message.trim() ? `Applicant note: ${values.message.trim()}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        stored?: boolean
        emailSent?: boolean
        error?: string
      }

      setReviewedData(review)
      if (result.stored) {
        setSubmissionResult({
          stored: true,
          emailSent: result.emailSent === true,
          message:
            result.emailSent === true
              ? 'Your application was saved and the Elevoris team was notified by email.'
              : result.error ||
                'Your application has been saved for review. For urgent assistance, please use one of the direct contact options below.',
        })
      } else {
        setSubmissionResult({
          stored: false,
          emailSent: false,
          message:
            result.error ||
            'We could not submit your application right now. Your details have not been sent. Please try again or use one of the direct contact options below.',
        })
      }
    } catch {
      setReviewedData(review)
      setSubmissionResult({
        stored: false,
        emailSent: false,
        message:
          'We could not submit your application right now. Your details have not been sent. Please try again or use one of the direct contact options below.',
      })
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  function buildSummaryText() {
    if (!reviewedData) return ''
    return [
      `Course Application Summary — Elevoris`,
      `Course: ${reviewedData.courseTitle}`,
      `Category: ${reviewedData.category}`,
      `Preferred Session / Date: ${reviewedData.selectedSession}`,
      `Full Name: ${reviewedData.fullName}`,
      `Email Address: ${reviewedData.email}`,
      `Country: ${reviewedData.country}`,
      `Phone Number: ${reviewedData.countryCode} ${reviewedData.phone}`,
      `Company Name: ${reviewedData.company}`,
      `Job Title: ${reviewedData.jobTitle}`,
      reviewedData.message.trim() ? `Additional Message: ${reviewedData.message.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n')
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildSummaryText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard API unavailable in restricted context
    }
  }

  if (reviewedData) {
    const summaryText = buildSummaryText()
    const mailtoHref = `mailto:info@elevoris.com?subject=${encodeURIComponent(
      `Course Application: ${reviewedData.courseTitle}`,
    )}&body=${encodeURIComponent(summaryText)}`

    return (
      <div className="rounded-2xl border border-amber-200 bg-[#fbf6eb] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#96691e] text-lg font-bold text-white">
            ✓
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#96691e]">
              {submissionResult?.stored ? 'Application received' : 'Application details validated'}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#081632]">
              {submissionResult?.stored
                ? 'Your application has been saved'
                : 'Your application summary is ready'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{submissionResult?.message}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-xs leading-6 text-[#081632]">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-bold uppercase tracking-wider text-slate-400">Selected Course</dt>
              <dd className="mt-0.5 font-semibold">{reviewedData.courseTitle}</dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wider text-slate-400">
                Preferred Session / Date
              </dt>
              <dd className="mt-0.5 font-semibold text-[#96691e]">
                {reviewedData.selectedSession}
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wider text-slate-400">Applicant</dt>
              <dd className="mt-0.5 font-medium">
                {reviewedData.fullName} · {reviewedData.jobTitle} ({reviewedData.company})
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wider text-slate-400">Contact</dt>
              <dd className="mt-0.5 font-medium">
                {reviewedData.email} · {reviewedData.countryCode} {reviewedData.phone} (
                {reviewedData.country})
              </dd>
            </div>
          </dl>
          {reviewedData.message.trim() && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="font-bold uppercase tracking-wider text-slate-400">
                Additional Message
              </p>
              <p className="mt-1 text-slate-600">{reviewedData.message}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={mailtoHref} className="btn-primary text-xs sm:text-sm">
            Send via Email Client (info@elevoris.com) <ArrowIcon />
          </a>
          <button
            type="button"
            onClick={() => void copySummary()}
            className="btn-outline bg-white text-xs sm:text-sm"
          >
            {copied ? 'Copied summary ✓' : 'Copy application summary'}
          </button>
          <a
            href={`https://wa.me/447405900092?text=${encodeURIComponent(summaryText)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl bg-[#25D366] px-4 text-xs font-bold text-white transition hover:opacity-90 sm:text-sm"
          >
            Send via WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setReviewedData(null)
              setSubmissionResult(null)
            }}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#081632]"
          >
            Edit application
          </button>
        </div>
      </div>
    )
  }

  const inputClass =
    'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 text-sm text-[#081632] outline-none transition focus:border-[#96691e] focus:bg-white sm:h-12 sm:px-4'

  const sessionOptions = currentCourse?.sessions ?? []
  const hasCustomInitialSession =
    Boolean(values.selectedSession) && !sessionOptions.includes(values.selectedSession)

  return (
    <form
      noValidate
      data-advisor-zone="form"
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(3,33,52,.08)] sm:grid-cols-2 sm:gap-5 sm:p-8"
    >
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold text-[#355465]">
          Selected Course <span className="text-[#96691e]">*</span>
          <select
            className={inputClass}
            value={values.courseSlug}
            onChange={(e) => handleCourseChange(e.target.value)}
            required
          >
            <option value="">Select an Elevoris course</option>
            {courses.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.title} ({course.category})
              </option>
            ))}
          </select>
        </label>
        {errors.courseSlug && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.courseSlug}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-bold text-[#355465]">
          Preferred Scheduled Session or Date <span className="text-[#96691e]">*</span>
          <select
            className={inputClass}
            value={values.selectedSession}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, selectedSession: e.target.value }))
              setErrors((prev) => ({ ...prev, selectedSession: undefined }))
            }}
            required
          >
            <option value="">Select a scheduled session or preference</option>
            {hasCustomInitialSession && (
              <option value={values.selectedSession}>{values.selectedSession}</option>
            )}
            {sessionOptions.map((sess) => (
              <option key={sess} value={sess}>
                {sess}
              </option>
            ))}
            <option value="Schedule to be announced. / Request tailored dates">
              Schedule to be announced. / Request customized dates
            </option>
          </select>
        </label>
        {currentCourse && sessionOptions.length === 0 && (
          <p className="mt-1 text-[11px] text-slate-500">
            This programme currently lists: Schedule to be announced.
          </p>
        )}
        {errors.selectedSession && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.selectedSession}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#355465]">
          Full Name <span className="text-[#96691e]">*</span>
          <input
            type="text"
            className={inputClass}
            value={values.fullName}
            maxLength={120}
            autoComplete="name"
            placeholder="Your full name"
            onChange={(e) => {
              setValues((prev) => ({ ...prev, fullName: e.target.value }))
              setErrors((prev) => ({ ...prev, fullName: undefined }))
            }}
            required
          />
        </label>
        {errors.fullName && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#355465]">
          Email Address <span className="text-[#96691e]">*</span>
          <input
            type="email"
            inputMode="email"
            className={inputClass}
            value={values.email}
            maxLength={200}
            autoComplete="email"
            placeholder="name@company.com"
            onChange={(e) => {
              setValues((prev) => ({ ...prev, email: e.target.value }))
              setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            required
          />
        </label>
        {errors.email && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#355465]">
          Country <span className="text-[#96691e]">*</span>
          <select
            className={inputClass}
            value={values.country}
            autoComplete="country-name"
            onChange={(e) => {
              setValues((prev) => ({ ...prev, country: e.target.value }))
              setErrors((prev) => ({ ...prev, country: undefined }))
            }}
            required
          >
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        {errors.country && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.country}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[.85fr_1.15fr] sm:gap-2.5">
        <div>
          <label className="block text-xs font-bold text-[#355465]">
            Code <span className="text-[#96691e]">*</span>
            <select
              className={inputClass}
              value={values.countryCode}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, countryCode: e.target.value }))
                setErrors((prev) => ({ ...prev, countryCode: undefined }))
              }}
              required
            >
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#355465]">
            Phone Number <span className="text-[#96691e]">*</span>
            <input
              type="tel"
              inputMode="tel"
              className={inputClass}
              value={values.phone}
              maxLength={30}
              autoComplete="tel-national"
              placeholder="Phone number"
              onChange={(e) => {
                setValues((prev) => ({ ...prev, phone: e.target.value }))
                setErrors((prev) => ({ ...prev, phone: undefined }))
              }}
              required
            />
          </label>
        </div>
        {(errors.countryCode || errors.phone) && (
          <p className="text-xs font-semibold text-red-700 sm:col-span-2">
            {errors.countryCode || errors.phone}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#355465]">
          Company Name <span className="text-[#96691e]">*</span>
          <input
            type="text"
            className={inputClass}
            value={values.company}
            maxLength={160}
            autoComplete="organization"
            placeholder="Your organisation"
            onChange={(e) => {
              setValues((prev) => ({ ...prev, company: e.target.value }))
              setErrors((prev) => ({ ...prev, company: undefined }))
            }}
            required
          />
        </label>
        {errors.company && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.company}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#355465]">
          Job Title <span className="text-[#96691e]">*</span>
          <input
            type="text"
            className={inputClass}
            value={values.jobTitle}
            maxLength={120}
            autoComplete="organization-title"
            placeholder="Your role / title"
            onChange={(e) => {
              setValues((prev) => ({ ...prev, jobTitle: e.target.value }))
              setErrors((prev) => ({ ...prev, jobTitle: undefined }))
            }}
            required
          />
        </label>
        {errors.jobTitle && (
          <p className="mt-1.5 text-xs font-semibold text-red-700">{errors.jobTitle}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-bold text-[#355465]">
          Additional Message
          <textarea
            className="mt-1.5 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 text-sm text-[#081632] outline-none transition focus:border-[#96691e] focus:bg-white sm:p-4"
            value={values.message}
            maxLength={2500}
            placeholder="Share team size, dietary or accessibility requests, invoice requirements, or questions about the syllabus."
            onChange={(e) => setValues((prev) => ({ ...prev, message: e.target.value }))}
          />
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 text-[11px] leading-5 text-slate-600 sm:col-span-2">
        Submit your details for review by the Elevoris training team. You will receive a clear
        confirmation after submission. Need urgent assistance?{' '}
        <Link href="/courses" className="font-bold text-[#96691e] hover:underline">
          Browse courses
        </Link>{' '}
        or email{' '}
        <a href="mailto:info@elevoris.com" className="font-bold text-[#96691e] hover:underline">
          info@elevoris.com
        </a>
        .
      </div>

      <button
        type="submit"
        disabled={submitting}
        data-advisor-protected="apply"
        className="btn-primary min-h-12 w-full sm:col-span-2"
      >
        {submitting ? 'Submitting application…' : 'Submit Course Application'}{' '}
        {!submitting && <ArrowIcon />}
      </button>
    </form>
  )
}
