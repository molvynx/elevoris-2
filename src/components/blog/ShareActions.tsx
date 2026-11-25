'use client'

import { useState } from 'react'
import { Check, Link2, Mail, Share2 } from 'lucide-react'

export default function ShareActions({
  title,
  canonicalPath,
}: {
  title: string
  canonicalPath: string
}) {
  const [copied, setCopied] = useState(false)

  function resolvedUrl() {
    if (typeof window === 'undefined') return canonicalPath
    return `${window.location.origin}${canonicalPath}`
  }

  async function copyLink() {
    const url = resolvedUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  function shareTo(platform: 'linkedin' | 'x') {
    const url = encodeURIComponent(resolvedUrl())
    const text = encodeURIComponent(title)
    const target =
      platform === 'linkedin'
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        : `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    window.location.assign(target)
  }

  const mailtoHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
    `Recommended Elevoris article: ${title}\n\nRead online: ${canonicalPath}`,
  )}`

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Share2 className="h-3.5 w-3.5 text-[#96691e]" aria-hidden="true" />
        Share:
      </span>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#081632] transition hover:border-[#c79a3c] hover:text-[#96691e] whitespace-nowrap"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            Link copied
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            Copy link
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => shareTo('linkedin')}
        className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#081632] transition hover:border-[#c79a3c] hover:text-[#96691e] whitespace-nowrap"
      >
        LinkedIn
      </button>
      <button
        type="button"
        onClick={() => shareTo('x')}
        className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#081632] transition hover:border-[#c79a3c] hover:text-[#96691e] whitespace-nowrap"
      >
        X / Twitter
      </button>
      <a
        href={mailtoHref}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#081632] transition hover:border-[#c79a3c] hover:text-[#96691e] whitespace-nowrap"
      >
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        Email
      </a>
    </div>
  )
}
