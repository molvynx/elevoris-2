import 'server-only'

import { saveNewsletterSubscription } from '@/lib/payload'
import { checkRateLimit, isCrossSiteRequest, readJsonObject } from '@/lib/request-security'

const ALLOWED_TOPICS = new Set([
  'All Insights',
  'Career Growth',
  'Certifications',
  'Corporate Training',
  'Study Tips',
])

export async function POST(request: Request) {
  if (isCrossSiteRequest(request)) {
    return Response.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
  }

  const rateLimit = checkRateLimit(request, 'newsletter', 6, 10 * 60 * 1000)
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Too many subscription attempts. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    )
  }

  const body = await readJsonObject(request, 16_000)
  if (!body) {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 })
  }

  // Honeypot trap for automated spam submissions
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return Response.json({ success: true }, { status: 201 })
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
  if (!rawEmail || rawEmail.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail)) {
    return Response.json({ error: 'Please enter a valid work or personal email address.' }, { status: 400 })
  }

  const rawName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  if (rawName.length > 120) {
    return Response.json({ error: 'Name must be 120 characters or fewer.' }, { status: 400 })
  }

  const rawTopic = typeof body.topicInterest === 'string' ? body.topicInterest.trim() : 'All Insights'
  const topicInterest = ALLOWED_TOPICS.has(rawTopic) ? rawTopic : 'All Insights'

  try {
    const result = await saveNewsletterSubscription({
      email: rawEmail,
      fullName: rawName || undefined,
      topicInterest,
    })

    if (result.alreadySubscribed) {
      return Response.json(
        {
          success: true,
          alreadySubscribed: true,
          message: 'This email address is already subscribed to Elevoris Insights.',
        },
        { status: 200 },
      )
    }

    return Response.json(
      {
        success: true,
        alreadySubscribed: false,
        message: 'Thank you for subscribing. You will receive curated Elevoris briefings and programme updates.',
      },
      { status: 201 },
    )
  } catch {
    return Response.json(
      { error: 'Unable to complete your subscription right now. Please try again shortly.' },
      { status: 500 },
    )
  }
}
