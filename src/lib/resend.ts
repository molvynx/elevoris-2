import 'server-only'

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  )
}

export async function sendInquiryEmails(values: Record<string, string>, participants: number) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { sent: false as const, reason: 'not-configured' as const }

  const rows = [
    ['Name', values.fullName],
    ['Email', values.email],
    ['Phone', `${values.countryCode} ${values.phone}`],
    ['Country', values.country],
    ['Company', values.company],
    ['Course', values.courseInterest],
    ['Preferred location', values.preferredLocation],
    ['Participants', String(participants)],
    ['Budget', `${values.currency} ${values.budget || 'Not provided'}`],
    ['Message', values.message],
  ]
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(
          label,
        )}</th><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`,
    )
    .join('')

  const response = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      {
        from,
        to: ['info@elevoris.com'],
        reply_to: values.email,
        subject: `New Elevoris enquiry: ${values.courseInterest}`,
        html: `<h1>New training enquiry</h1><table style="border-collapse:collapse">${rows}</table>`,
      },
      {
        from,
        to: [values.email],
        reply_to: 'info@elevoris.com',
        subject: 'We received your Elevoris training enquiry',
        html: `<h1>Thank you, ${escapeHtml(values.fullName)}</h1><p>We received your enquiry about <strong>${escapeHtml(
          values.courseInterest,
        )}</strong>. An Elevoris training advisor will review your requirements and contact you with verified availability and pricing.</p><p>If your request is urgent, email <a href="mailto:info@elevoris.com">info@elevoris.com</a> or call +44 7405 900 092.</p>`,
      },
    ]),
    signal: AbortSignal.timeout(15000),
  })

  return response.ok
    ? { sent: true as const }
    : { sent: false as const, reason: 'provider-error' as const }
}
