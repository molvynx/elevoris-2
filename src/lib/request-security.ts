import 'server-only'

type RateEntry = {
  count: number
  resetAt: number
}

const globalRateLimits = globalThis as typeof globalThis & {
  __elevorisRateLimits?: Map<string, RateEntry>
}

const rateLimits = globalRateLimits.__elevorisRateLimits ?? new Map<string, RateEntry>()
globalRateLimits.__elevorisRateLimits = rateLimits

function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return (
    forwarded ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function checkRateLimit(request: Request, bucket: string, limit: number, windowMs: number) {
  const now = Date.now()
  const key = `${bucket}:${clientKey(request)}`
  const current = rateLimits.get(key)

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1

  if (rateLimits.size > 1000) {
    for (const [entryKey, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(entryKey)
    }
  }

  return { allowed: true, retryAfter: 0 }
}

export function isCrossSiteRequest(request: Request) {
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase()
      const forwardedHost = request.headers
        .get('x-forwarded-host')
        ?.split(',')[0]
        ?.trim()
        .toLowerCase()
      const host = request.headers.get('host')?.toLowerCase()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.FIGMA_PUBLIC_URL
      let siteHost = ''
      if (siteUrl) {
        try {
          siteHost = new URL(siteUrl).host.toLowerCase()
        } catch {
          siteHost = ''
        }
      }
      const allowedHosts = new Set([forwardedHost, host, siteHost].filter(Boolean))
      if (allowedHosts.size > 0 && !allowedHosts.has(originHost)) {
        return true
      }
      return false
    } catch {
      return true
    }
  }
  return false
}

export async function readJsonObject(
  request: Request,
  maxBytes: number,
): Promise<Record<string, unknown> | null> {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > maxBytes) return null

  const body = await request.text()
  if (new TextEncoder().encode(body).byteLength > maxBytes) return null

  try {
    const parsed = JSON.parse(body) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}
