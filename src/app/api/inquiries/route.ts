import 'server-only'

import { saveInquiry } from '@/lib/payload'
import { checkRateLimit, isCrossSiteRequest, readJsonObject } from '@/lib/request-security'
import { sendInquiryEmails } from '@/lib/resend'

const allowedCurrencies = new Set(['USD', 'GBP', 'EUR', 'AED', 'SAR'])
const fields = [
  'fullName',
  'email',
  'countryCode',
  'phone',
  'country',
  'company',
  'courseInterest',
  'preferredLocation',
  'currency',
  'budget',
  'message',
] as const

function text(value: unknown, max: number, required = true) {
  if (typeof value !== 'string') return required ? null : ''
  const clean = value.trim()
  if ((required && clean.length === 0) || clean.length > max) return null
  return clean
}

export async function POST(request: Request) {
  if (isCrossSiteRequest(request)) {
    return Response.json({ error: 'Cross-site submissions are not allowed.' }, { status: 403 })
  }

  const rateLimit = checkRateLimit(request, 'inquiry', 5, 10 * 60 * 1000)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Too many submissions. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    )
  }

  const body = await readJsonObject(request, 32_000)
  if (!body) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // A visually hidden field catches automated form fillers without exposing the rule.
  if (typeof body.website === 'string' && body.website.trim()) {
    return Response.json({ success: true }, { status: 201 })
  }

  const values: Record<string, string> = {}
  const limits: Record<(typeof fields)[number], number> = {
    fullName: 120,
    email: 200,
    countryCode: 8,
    phone: 30,
    country: 100,
    company: 160,
    courseInterest: 180,
    preferredLocation: 120,
    currency: 3,
    budget: 80,
    message: 3000,
  }
  for (const field of fields) {
    const value = text(body[field], limits[field], field === 'budget' ? false : true)
    if (value === null)
      return Response.json({ error: `Please provide a valid ${field}.` }, { status: 400 })
    values[field] = value
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 })
  if (!allowedCurrencies.has(values.currency))
    return Response.json({ error: 'Please select a supported currency.' }, { status: 400 })
  const participants =
    typeof body.participants === 'number' ? body.participants : Number(body.participants)
  if (!Number.isInteger(participants) || participants < 1 || participants > 500)
    return Response.json({ error: 'Participants must be between 1 and 500.' }, { status: 400 })

  try {
    await saveInquiry({
      fullName: values.fullName,
      email: values.email,
      countryCode: values.countryCode,
      phone: values.phone,
      country: values.country,
      company: values.company,
      courseInterest: values.courseInterest,
      preferredLocation: values.preferredLocation,
      participants,
      currency: values.currency as 'USD' | 'GBP' | 'EUR' | 'AED' | 'SAR',
      budget: values.budget || undefined,
      message: values.message,
    })
    const email = await sendInquiryEmails(values, participants)
    if (!email.sent) {
      return Response.json(
        {
          success: false,
          stored: true,
          error:
            email.reason === 'not-configured'
              ? 'Your enquiry has been recorded. For urgent assistance, please also email info@elevoris.com.'
              : 'Your enquiry has been recorded. For urgent assistance, please also email info@elevoris.com.',
        },
        { status: 202 },
      )
    }
    return Response.json({ success: true, stored: true, emailSent: true }, { status: 201 })
  } catch {
    return Response.json(
      { error: 'Your enquiry could not be submitted. Please email info@elevoris.com.' },
      { status: 500 },
    )
  }
}
