'use client'

import { FormEvent, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Message = {
  role: 'assistant' | 'user'
  content: string
}

const starterQuestions = [
  'Recommend a leadership course for senior managers',
  'What courses are available in Dubai?',
  'I need live online finance or AI training',
  'Do you offer tailored corporate training for teams?',
]

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    'Hello — I’m the Elevoris AI Training Advisor. Tell me your role, industry, topic, preferred city or Live Online format, and I’ll recommend verified Elevoris programmes.',
}

const FLOATING_PROMPTS = [
  'Need help finding the right course?',
  'Explore your training options.',
  'Ask me anything.',
  'Discover your next learning opportunity.',
]

type PlacementMode = 'bottom-right' | 'top-right' | 'bottom-left' | 'hidden'

function rectsCollide(
  a: { left: number; right: number; top: number; bottom: number },
  b: DOMRect,
  pad = 16,
) {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  )
}

function AdvisorIcon({
  name,
}: {
  name: 'arrow' | 'bot' | 'close' | 'minimize' | 'reset' | 'send'
}) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    bot: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="4" />
        <path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    minimize: <path d="M5 12h14" />,
    reset: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
    send: <path d="m4 4 16 8-16 8 2-8-2-8Zm2 8h14" />,
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 sm:h-5 sm:w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  )
}

function renderInlineFormatting(text: string, onNavigate: () => void) {
  const tokenRegex =
    /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|(?:\/(?:courses|categories|locations|inquiry|apply|about|contact|corporate-training|training-solutions)(?:\/[a-z0-9-]+)?))/gi
  const parts = text.split(tokenRegex)

  return parts.map((part, idx) => {
    if (!part) return null

    const mdLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (mdLink) {
      const [, label, href] = mdLink
      if (href.startsWith('http') || href.startsWith('mailto:')) {
        return (
          <a
            key={idx}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noreferrer' : undefined}
            className="font-semibold text-[#96691e] underline underline-offset-2 hover:text-[#7c5517]"
          >
            {label}
          </a>
        )
      }
      return (
        <Link
          key={idx}
          href={href}
          onClick={onNavigate}
          className="font-semibold text-[#96691e] underline underline-offset-2 hover:text-[#7c5517]"
        >
          {label}
        </Link>
      )
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-[#081632]">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith('/')) {
      return (
        <Link
          key={idx}
          href={part}
          onClick={onNavigate}
          className="font-semibold text-[#96691e] underline underline-offset-2 hover:text-[#7c5517]"
        >
          {part}
        </Link>
      )
    }

    return <Fragment key={idx}>{part}</Fragment>
  })
}

export default function TrainingAdvisor() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptIndex, setPromptIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [placement, setPlacement] = useState<PlacementMode>('bottom-right')
  const [retryPayload, setRetryPayload] = useState<{
    question: string
    history: Message[]
    errorText: string
  } | null>(null)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const loadingRef = useRef(false)
  const openRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  openRef.current = open
  const isCourseDetail = Boolean(pathname?.startsWith('/courses/') && pathname !== '/courses')
  const isApplyPage = pathname === '/apply' || pathname?.startsWith('/apply?')

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Dynamic viewport collision detection so floating launcher NEVER covers Apply for Course buttons or application forms
  const evaluatePlacement = useCallback(() => {
    if (typeof window === 'undefined' || openRef.current) return

    const vw = window.innerWidth
    const vh = window.innerHeight
    const activeEl = document.activeElement as HTMLElement | null

    // Hide temporarily whenever user is actively interacting inside any application or inquiry form
    if (activeEl?.closest('[data-advisor-zone="form"], [data-advisor-zone="apply"]')) {
      setPlacement('hidden')
      return
    }

    // On dedicated application page, hide while the form section occupies the viewport so fields & submit button stay clean
    if (isApplyPage) {
      const formEl = document.querySelector('[data-advisor-zone="form"]')
      if (formEl) {
        const formRect = formEl.getBoundingClientRect()
        if (formRect.top < vh - 40 && formRect.bottom > 100) {
          setPlacement('hidden')
          return
        }
      }
    }

    const protectedNodes = Array.from(
      document.querySelectorAll(
        '[data-advisor-protected="apply"], [data-advisor-zone="apply"], [data-advisor-zone="form"] button[type="submit"], main a[href^="/apply"]',
      ),
    )

    const visibleProtectedRects: DOMRect[] = []
    for (const el of protectedNodes) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < vh) {
        visibleProtectedRects.push(rect)
      }
    }

    const btnW = vw < 640 ? 132 : 176
    const btnH = vw < 640 ? 44 : 52
    const sidePad = vw < 640 ? 12 : 24
    const bottomGap = isCourseDetail && vw < 1024 ? 82 : vw < 640 ? 14 : 24
    const topSafeY = vw < 640 ? 112 : 126

    const candidates: Array<{
      mode: Exclude<PlacementMode, 'hidden'>
      box: { left: number; right: number; top: number; bottom: number }
    }> = [
      {
        mode: 'bottom-right',
        box: {
          left: vw - sidePad - btnW,
          right: vw - sidePad,
          top: vh - bottomGap - btnH,
          bottom: vh - bottomGap,
        },
      },
      {
        mode: 'top-right',
        box: {
          left: vw - sidePad - btnW,
          right: vw - sidePad,
          top: topSafeY,
          bottom: topSafeY + btnH,
        },
      },
    ]

    if (vw >= 1024) {
      candidates.push({
        mode: 'bottom-left',
        box: {
          left: sidePad,
          right: sidePad + btnW,
          top: vh - 24 - btnH,
          bottom: vh - 24,
        },
      })
    }

    // Check active inquiry/application form viewport intersection for small screens too
    const formZone = document.querySelector('[data-advisor-zone="form"]')
    const formRect = formZone?.getBoundingClientRect()

    for (const candidate of candidates) {
      const hitsProtected = visibleProtectedRects.some((rect) =>
        rectsCollide(candidate.box, rect, 16),
      )
      const hitsMobileForm =
        vw < 1024 && formRect ? rectsCollide(candidate.box, formRect, 12) : false
      if (!hitsProtected && !hitsMobileForm) {
        setPlacement(candidate.mode)
        return
      }
    }

    setPlacement('hidden')
  }, [isApplyPage, isCourseDetail])

  useEffect(() => {
    if (open) return
    let rafId = 0
    const scheduleEval = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => evaluatePlacement())
    }

    scheduleEval()
    const settleTimer = setTimeout(scheduleEval, 180)

    window.addEventListener('scroll', scheduleEval, { passive: true })
    window.addEventListener('resize', scheduleEval, { passive: true })
    document.addEventListener('focusin', scheduleEval)
    document.addEventListener('focusout', scheduleEval)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(settleTimer)
      window.removeEventListener('scroll', scheduleEval)
      window.removeEventListener('resize', scheduleEval)
      document.removeEventListener('focusin', scheduleEval)
      document.removeEventListener('focusout', scheduleEval)
    }
  }, [open, pathname, evaluatePlacement])

  // Rotate refined helper message bubbles at natural intervals
  useEffect(() => {
    if (open || hasInteracted || reducedMotion || placement === 'hidden') {
      setShowPrompt(false)
      return
    }

    let hideTimer: ReturnType<typeof setTimeout> | undefined
    const showBurst = () => {
      setShowPrompt(true)
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => setShowPrompt(false), 4800)
    }

    const firstTimer = setTimeout(showBurst, 2200)
    const cycleInterval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % FLOATING_PROMPTS.length)
      showBurst()
    }, 11500)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(cycleInterval)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [open, hasInteracted, reducedMotion, placement])

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, retryPayload])

  const askWithHistory = useCallback(
    async (question: string, baseMessages: Message[], isRetry = false) => {
      const trimmed = question.trim()
      if (!trimmed || loadingRef.current) return

      loadingRef.current = true
      setLoading(true)
      setRetryPayload(null)

      const nextMessages: Message[] = isRetry
        ? baseMessages
        : [...baseMessages, { role: 'user', content: trimmed }]

      if (!isRetry) {
        setMessages(nextMessages)
        setInput('')
      }

      try {
        const response = await fetch('/api/training-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages.slice(-10) }),
        })
        const data = (await response.json().catch(() => ({}))) as {
          answer?: string
          error?: string
        }

        if (!response.ok || !data.answer) {
          setRetryPayload({
            question: trimmed,
            history: nextMessages,
            errorText:
              data.error ||
              "I'm sorry, I'm temporarily unable to respond. Please try again shortly or contact our team.",
          })
          return
        }

        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            content: data.answer!,
          },
        ])
      } catch {
        setRetryPayload({
          question: trimmed,
          history: nextMessages,
          errorText:
            "I'm sorry, I'm temporarily unable to respond. Please try again shortly or email info@elevoris.com.",
        })
      } finally {
        loadingRef.current = false
        setLoading(false)
        setTimeout(() => inputRef.current?.focus(), 60)
      }
    },
    [],
  )

  useEffect(() => {
    function handleOpenEvent(event: Event) {
      const custom = event as CustomEvent<{ question?: string }>
      setHasInteracted(true)
      setOpen(true)
      const q = custom.detail?.question?.trim()
      if (q) {
        void askWithHistory(q, [INITIAL_MESSAGE])
      } else {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && openRef.current) {
        setOpen(false)
      }
    }

    window.addEventListener('elevoris:open-advisor', handleOpenEvent)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('elevoris:open-advisor', handleOpenEvent)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [askWithHistory])

  async function ask(question: string) {
    await askWithHistory(question, messages)
  }

  function retryLast() {
    if (!retryPayload) return
    void askWithHistory(retryPayload.question, retryPayload.history, true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void ask(input)
  }

  function resetChat() {
    setMessages([INITIAL_MESSAGE])
    setRetryPayload(null)
    setInput('')
  }

  function openWidget() {
    setHasInteracted(true)
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function closeOnMobileNavigate() {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setOpen(false)
    }
  }

  const positionClasses =
    placement === 'top-right'
      ? 'right-3.5 top-[116px] sm:right-6 sm:top-[126px] items-end'
      : placement === 'bottom-left'
        ? 'left-4 bottom-4 sm:left-6 sm:bottom-6 items-start'
        : isCourseDetail
          ? 'right-3.5 bottom-[84px] sm:right-6 sm:bottom-6 items-end'
          : 'right-3.5 bottom-4 sm:right-6 sm:bottom-6 items-end'

  const isLauncherHidden = placement === 'hidden'
  const showBubbleBelow = placement === 'top-right'

  return (
    <>
      {!open && !isApplyPage && (
        <div
          aria-hidden={isLauncherHidden}
          className={`fixed z-[46] flex flex-col gap-2.5 transition-all duration-300 ease-out ${positionClasses} ${
            isLauncherHidden
              ? 'pointer-events-none translate-y-2 scale-90 opacity-0'
              : 'pointer-events-auto translate-y-0 scale-100 opacity-100'
          }`}
        >
          {showPrompt && !hasInteracted && !isLauncherHidden && !showBubbleBelow && (
            <div className="advisor-bubble-enter flex max-w-[235px] items-center gap-2 rounded-2xl rounded-br-sm border border-[#c79a3c]/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#081632] shadow-[0_14px_34px_rgba(8,22,50,.22)]">
              <button
                type="button"
                onClick={openWidget}
                className="flex-1 text-left leading-4 hover:text-[#96691e]"
              >
                {FLOATING_PROMPTS[promptIndex]}
              </button>
              <button
                type="button"
                aria-label="Dismiss helper message"
                onClick={() => setHasInteracted(true)}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          )}

          <div className="relative">
            {/* Soft ambient gold breathing glow behind button */}
            {!hasInteracted && !reducedMotion && !isLauncherHidden && (
              <span
                aria-hidden="true"
                className="advisor-aura-glow pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#96691e]/45 via-[#e2bd68]/40 to-[#081632]/20 blur-md"
              />
            )}

            <button
              aria-expanded={open}
              aria-label="Open AI Training Advisor"
              tabIndex={isLauncherHidden ? -1 : 0}
              className={`advisor-float-btn advisor-gold-sheen ${
                hasInteracted || reducedMotion ? 'advisor-float-btn--paused' : ''
              } relative flex items-center gap-1.5 rounded-full border border-[#e2bd68]/80 bg-[#081632] px-3 py-2 text-[11px] font-bold text-white transition hover:border-[#e2bd68] hover:bg-[#0f234b] active:scale-[0.97] sm:gap-2.5 sm:px-4.5 sm:py-3 sm:text-sm`}
              onClick={openWidget}
              type="button"
            >
              <span className="relative grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#e2bd68] to-[#96691e] text-[#081632] shadow-inner sm:h-8 sm:w-8">
                <AdvisorIcon name="bot" />
              </span>
              <span className="relative whitespace-nowrap text-[#f7e7be]">AI Advisor</span>
            </button>
          </div>

          {showPrompt && !hasInteracted && !isLauncherHidden && showBubbleBelow && (
            <div className="advisor-bubble-enter flex max-w-[235px] items-center gap-2 rounded-2xl rounded-tr-sm border border-[#c79a3c]/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#081632] shadow-[0_14px_34px_rgba(8,22,50,.22)]">
              <button
                type="button"
                onClick={openWidget}
                className="flex-1 text-left leading-4 hover:text-[#96691e]"
              >
                {FLOATING_PROMPTS[promptIndex]}
              </button>
              <button
                type="button"
                aria-label="Dismiss helper message"
                onClick={() => setHasInteracted(true)}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label="AI Training Advisor"
          className="advisor-dialog-enter fixed inset-x-2 bottom-2 top-2 z-[60] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(3,29,45,.32)] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(650px,calc(100dvh-96px))] sm:w-[430px]"
        >
          <header className="flex shrink-0 items-center justify-between bg-[#081632] px-4 py-3.5 text-white sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c79a3c] text-[#081632] sm:h-10 sm:w-10">
                <AdvisorIcon name="bot" />
              </span>
              <div>
                <h2 className="font-display text-sm font-semibold sm:text-base">
                  AI Training Advisor
                </h2>
                <p className="mt-0.5 text-[11px] text-white/65">Elevoris customer assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {messages.length > 1 && (
                <button
                  aria-label="Start new conversation"
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  onClick={resetChat}
                  title="New conversation"
                  type="button"
                >
                  <AdvisorIcon name="reset" />
                </button>
              )}
              <button
                aria-label="Minimize advisor"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                onClick={() => setOpen(false)}
                title="Minimize"
                type="button"
              >
                <AdvisorIcon name="minimize" />
              </button>
              <button
                aria-label="Close advisor"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={() => setOpen(false)}
                title="Close"
                type="button"
              >
                <AdvisorIcon name="close" />
              </button>
            </div>
          </header>

          <div className="shrink-0 border-b border-amber-200/70 bg-[#fbf6eb] px-4 py-2 text-[11px] leading-4 text-[#355465] sm:px-5">
            Ask about Elevoris courses, schedules, locations, registration, or corporate training.
            Bespoke pricing is confirmed by our advisors.
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#f8fafc] px-3.5 py-4 sm:px-4">
            {messages.map((message, index) => (
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                key={`${message.role}-${index}`}
              >
                <div
                  className={`max-w-[90%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 sm:px-4 sm:py-3 ${
                    message.role === 'user'
                      ? 'rounded-br-sm bg-[#081632] text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-[#1e3a4c] shadow-sm'
                  }`}
                >
                  {message.role === 'assistant'
                    ? renderInlineFormatting(message.content, closeOnMobileNavigate)
                    : message.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="space-y-2 pt-1">
                <p className="px-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
                  Suggested questions
                </p>
                {starterQuestions.map((question) => (
                  <button
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-[#294757] transition hover:border-[#96691e] hover:text-[#96691e]"
                    key={question}
                    onClick={() => void ask(question)}
                    type="button"
                  >
                    <span>{question}</span>
                    <AdvisorIcon name="arrow" />
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start" role="status" aria-live="polite">
                <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-600 shadow-sm">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#96691e]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#96691e] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#96691e] [animation-delay:300ms]" />
                  </span>
                  <span>Searching courses &amp; preparing advice…</span>
                </div>
              </div>
            )}

            {retryPayload && !loading && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-900"
              >
                <p className="font-medium leading-5">{retryPayload.errorText}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={retryLast}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#96691e] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#7c5517]"
                  >
                    <AdvisorIcon name="reset" />
                    <span>Retry</span>
                  </button>
                  <Link
                    href="/inquiry"
                    onClick={closeOnMobileNavigate}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100/50"
                  >
                    Send an enquiry
                  </Link>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <form className="flex items-end gap-2" onSubmit={submit}>
              <label className="sr-only" htmlFor="advisor-question">
                Ask about Elevoris training
              </label>
              <textarea
                ref={inputRef}
                className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0b293b] outline-none focus:border-[#96691e] focus:bg-white sm:text-xs"
                disabled={loading}
                id="advisor-question"
                maxLength={1000}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void ask(input)
                  }
                }}
                placeholder="Ask about courses, roles, cities, or formats..."
                rows={1}
                value={input}
              />
              <button
                aria-label="Send question"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#96691e] text-white hover:bg-[#7c5517] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !input.trim()}
                type="submit"
              >
                <AdvisorIcon name="send" />
              </button>
            </form>
            <div className="mt-2.5 flex items-center justify-around border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-500">
              <Link
                className="text-[#96691e] hover:text-[#7c5517]"
                href="/apply"
                onClick={closeOnMobileNavigate}
              >
                Apply for Course
              </Link>
              <a className="hover:text-[#96691e]" href="mailto:info@elevoris.com">
                info@elevoris.com
              </a>
              <a
                className="text-[#128C45] hover:underline"
                href="https://wa.me/447405900092"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
