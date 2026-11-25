'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { NavCategoryItem } from '@/lib/categories-nav'

const logo = '/images/elevoris/elevoris-logo.png'
const WHATSAPP_URL = 'https://wa.me/447405900092'

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}

function SparkIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.4 4.1a5.2 5.2 0 0 1-3.3 3.3L3 12l4.3 1.6a5.2 5.2 0 0 1 3.3 3.3L12 21l1.4-4.1a5.2 5.2 0 0 1 3.3-3.3L21 12l-4.3-1.6a5.2 5.2 0 0 1-3.3-3.3L12 3Z" />
    </svg>
  )
}

function MegaColumn({
  title,
  links,
  onSelect,
}: {
  title: string
  links: string[][]
  onSelect: () => void
}) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#96691e]">
        {title}
      </p>
      <div className="space-y-0.5">
        {links.map(([label, href]) => (
          <Link
            className="flex min-h-8 items-center text-[13px] font-medium text-slate-700 transition hover:translate-x-1 hover:text-[#96691e]"
            href={href}
            key={label}
            onClick={onSelect}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function SiteHeaderClient({
  navigation,
  totalCourseCount,
}: {
  navigation: NavCategoryItem[]
  totalCourseCount: number
}) {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<'courses' | 'locations' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function openMenuHover(menu: 'courses' | 'locations') {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setOpenMenu(menu)
  }

  function scheduleMenuClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setOpenMenu(null)
    }, 180)
  }

  function cancelMenuClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openAdvisor() {
    setOpenMenu(null)
    setMobileOpen(false)
    window.dispatchEvent(new CustomEvent('elevoris:open-advisor'))
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Top Executive Utility Bar (WhatsApp & Official Email, no phone number) */}
      <div className="border-b border-[#c79a3c]/20 bg-[#050e21] text-white/80">
        <div className="page-shell flex h-9 items-center justify-between gap-4 text-[11px] font-medium sm:text-xs">
          <div className="flex items-center gap-2.5 truncate text-white/70">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e2bd68]" aria-hidden="true" />
            <span className="truncate">
              <span className="sm:hidden">ISO 9001:2015 Certified</span>
              <span className="hidden sm:inline">
                ISO 9001:2015 Certified · Practitioner-Led Executive Training Worldwide
              </span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <a
              href="mailto:info@elevoris.com"
              className="hidden items-center gap-1.5 text-white/85 transition hover:text-[#e2bd68] sm:inline-flex"
            >
              <svg
                className="h-3.5 w-3.5 text-[#e2bd68]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>info@elevoris.com</span>
            </a>
            <span className="hidden h-3.5 w-px bg-white/15 sm:block" aria-hidden="true" />
            <a
              className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366]/15 px-2.5 py-1 text-[11px] font-semibold text-[#5ee68d] transition hover:bg-[#25D366]/25 hover:text-white"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with Elevoris on WhatsApp"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        ref={headerRef}
        onMouseLeave={scheduleMenuClose}
        className="sticky top-0 z-40 border-b border-[#c79a3c]/30 bg-[#081632]/95 text-white shadow-[0_6px_28px_rgba(4,12,28,.22)] backdrop-blur-xl"
      >
        <div className="page-shell flex h-[68px] items-center justify-between gap-4 sm:h-[78px] lg:gap-6">
          {/* Brand Anchor with Transparent Logo */}
          <div className="flex shrink-0 items-center gap-4">
            <Link
              className="flex items-center rounded-lg py-1 focus-visible:outline-[#e2bd68]"
              href="/"
              aria-label="Elevoris home"
              onClick={() => {
                setOpenMenu(null)
                setMobileOpen(false)
              }}
            >
              <Image
                src={logo}
                alt="Elevoris — Elevate Your Excellence"
                className="h-11 w-auto object-contain sm:h-[52px]"
                width={157}
                height={119}
                priority
              />
            </Link>
            <div className="hidden h-7 w-px bg-[#c79a3c]/30 2xl:block" aria-hidden="true" />
            <span className="hidden text-[11px] font-medium tracking-wide text-white/60 2xl:block">
              Global Executive Training
            </span>
          </div>

          {/* Centered Prominent Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden flex-1 items-center justify-center gap-5 text-[13px] font-semibold text-white/85 lg:flex xl:gap-7 xl:text-[14px]"
          >
            <div
              onMouseEnter={() => openMenuHover('courses')}
              onMouseLeave={scheduleMenuClose}
              className="flex items-center"
            >
              <button
                aria-expanded={openMenu === 'courses'}
                aria-haspopup="true"
                className={`nav-link flex shrink-0 items-center gap-1 whitespace-nowrap ${
                  openMenu === 'courses' || isActive('/courses') ? 'text-[#e2bd68]' : ''
                }`}
                onClick={() => setOpenMenu((prev) => (prev === 'courses' ? null : 'courses'))}
                type="button"
              >
                <span>Courses</span>
                <svg
                  className={`h-3.5 w-3.5 transition ${openMenu === 'courses' ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            <Link
              className={`nav-link shrink-0 whitespace-nowrap ${
                isActive('/categories') ? 'text-[#e2bd68]' : ''
              }`}
              href="/categories"
              onMouseEnter={() => setOpenMenu(null)}
              onClick={() => setOpenMenu(null)}
            >
              Categories
            </Link>

            <Link
              className={`nav-link shrink-0 whitespace-nowrap ${
                isActive('/training-solutions') || isActive('/corporate-training')
                  ? 'text-[#e2bd68]'
                  : ''
              }`}
              href="/training-solutions"
              onMouseEnter={() => setOpenMenu(null)}
              onClick={() => setOpenMenu(null)}
            >
              Solutions
            </Link>

            <div
              onMouseEnter={() => openMenuHover('locations')}
              onMouseLeave={scheduleMenuClose}
              className="flex items-center"
            >
              <button
                aria-expanded={openMenu === 'locations'}
                aria-haspopup="true"
                className={`nav-link flex shrink-0 items-center gap-1 whitespace-nowrap ${
                  openMenu === 'locations' || isActive('/locations') ? 'text-[#e2bd68]' : ''
                }`}
                onClick={() => setOpenMenu((prev) => (prev === 'locations' ? null : 'locations'))}
                type="button"
              >
                <span>Locations</span>
                <svg
                  className={`h-3.5 w-3.5 transition ${openMenu === 'locations' ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            <Link
              className={`nav-link shrink-0 whitespace-nowrap ${
                isActive('/about') ? 'text-[#e2bd68]' : ''
              }`}
              href="/about"
              onMouseEnter={() => setOpenMenu(null)}
              onClick={() => setOpenMenu(null)}
            >
              About Elevoris
            </Link>

            <Link
              className={`nav-link shrink-0 whitespace-nowrap ${
                isActive('/blog') ? 'text-[#e2bd68]' : ''
              }`}
              href="/blog"
              onMouseEnter={() => setOpenMenu(null)}
              onClick={() => setOpenMenu(null)}
            >
              Blog
            </Link>

            <Link
              className={`nav-link shrink-0 whitespace-nowrap ${
                isActive('/contact') ? 'text-[#e2bd68]' : ''
              }`}
              href="/contact"
              onMouseEnter={() => setOpenMenu(null)}
              onClick={() => setOpenMenu(null)}
            >
              Contact Us
            </Link>
          </nav>

          {/* Header Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={openAdvisor}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#e2bd68]/50 bg-white/5 px-2.5 text-xs font-bold text-[#e2bd68] transition hover:border-[#e2bd68] hover:bg-[#e2bd68]/15 hover:text-white active:scale-[0.98] sm:h-11 sm:px-3.5"
              aria-label="Open AI Training Advisor"
            >
              <SparkIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">AI Advisor</span>
            </button>

            <Link
              className="btn-primary hidden h-11 shrink-0 whitespace-nowrap px-4 text-xs md:inline-flex xl:px-5 xl:text-[13px]"
              href="/inquiry"
              onClick={() => setOpenMenu(null)}
            >
              Request a Proposal <ArrowIcon className="h-3.5 w-3.5" />
            </Link>

            <button
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#c79a3c]/50 text-[#e2bd68] transition hover:bg-white/10 active:scale-[0.96] lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              type="button"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path d="m6 6 12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Large Complete Desktop Courses Mega Menu (Near Full Desktop Width · All 20 Categories · All 101 Courses) */}
        {openMenu === 'courses' && (
          <div
            onMouseEnter={cancelMenuClose}
            onMouseLeave={scheduleMenuClose}
            className="mega-menu-enter absolute left-0 right-0 top-full z-40 hidden border-t border-[#c79a3c]/40 bg-white text-[#081632] shadow-[0_32px_80px_rgba(4,12,28,.28)] lg:block"
          >
            {/* Navy & Gold Branded Top Command Bar */}
            <div className="border-b border-[#c79a3c]/25 bg-[#081632] text-white">
              <div className="mx-auto flex w-[min(1440px,calc(100vw-24px))] flex-wrap items-center justify-between gap-4 px-4 py-3.5 xl:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e2bd68]">
                    Complete Elevoris Training Directory
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    All {navigation.length} Official Categories &amp; All {totalCourseCount} Courses
                    Organized by Subject
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/courses?format=Classroom"
                    onClick={() => setOpenMenu(null)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white/90 transition hover:border-[#e2bd68] hover:text-[#e2bd68]"
                  >
                    Classroom
                  </Link>
                  <Link
                    href="/courses?format=Live+Online"
                    onClick={() => setOpenMenu(null)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white/90 transition hover:border-[#e2bd68] hover:text-[#e2bd68]"
                  >
                    Live Online
                  </Link>
                  <Link
                    href="/categories"
                    onClick={() => setOpenMenu(null)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-[#e2bd68]/60 bg-white/5 px-3.5 text-xs font-bold text-[#e2bd68] transition hover:bg-[#e2bd68] hover:text-[#081632]"
                  >
                    View All Categories
                  </Link>
                  <Link
                    href="/courses"
                    onClick={() => setOpenMenu(null)}
                    className="btn-primary min-h-9 px-4 py-1.5 text-xs"
                  >
                    View All {totalCourseCount} Courses <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/apply"
                    onClick={() => setOpenMenu(null)}
                    className="inline-flex min-h-9 items-center rounded-lg border border-white/30 px-3.5 text-xs font-bold text-white transition hover:border-[#e2bd68] hover:text-[#e2bd68]"
                  >
                    Apply for Course
                  </Link>
                </div>
              </div>
            </div>

            {/* Spacious Full-Width Multi-Column Directory of All 20 Categories & All 101 Courses */}
            <div className="mx-auto max-h-[calc(100dvh-225px)] w-[min(1440px,calc(100vw-24px))] overflow-y-auto px-4 py-6 xl:px-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {navigation.map((cat) => (
                  <div
                    key={cat.slug}
                    className="flex flex-col rounded-2xl border border-slate-200/90 bg-[#f9fbfd] p-3.5 transition hover:border-[#c79a3c] hover:bg-[#fbf6eb]/45 hover:shadow-sm"
                  >
                    <div className="border-b border-[#c79a3c]/25 pb-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/categories/${cat.slug}`}
                          onClick={() => setOpenMenu(null)}
                          className="font-display text-[13px] font-bold leading-snug text-[#081632] transition hover:text-[#96691e]"
                        >
                          {cat.name}
                        </Link>
                        <span className="shrink-0 rounded-md bg-[#081632] px-1.5 py-0.5 text-[10px] font-bold text-[#e2bd68] tabular-nums">
                          {cat.count > 0 ? cat.count : 'Custom'}
                        </span>
                      </div>
                    </div>

                    {cat.subcategories.length > 0 && (
                      <div className="mt-2.5 space-y-2 border-b border-slate-200/70 pb-2.5">
                        {cat.subcategories.map((subcategory) => (
                          <div key={subcategory.slug}>
                            <Link
                              href={`/categories/${subcategory.slug}`}
                              onClick={() => setOpenMenu(null)}
                              className="text-[11px] font-bold text-[#96691e] hover:underline"
                            >
                              {subcategory.name}
                            </Link>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {subcategory.courses.length}{' '}
                              {subcategory.courses.length === 1 ? 'course' : 'courses'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {cat.courses.length > 0 ? (
                      <ul className="mt-2.5 flex-1 space-y-1">
                        {cat.courses.map((course) => (
                          <li key={course.slug}>
                            <Link
                              href={`/courses/${course.slug}`}
                              onClick={() => setOpenMenu(null)}
                              className="group flex items-start gap-1.5 rounded-md px-1 py-0.5 text-[12px] leading-4 text-slate-700 transition hover:bg-white hover:text-[#96691e]"
                            >
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#c79a3c]/70 group-hover:bg-[#96691e]" />
                              <span className="group-hover:underline">{course.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2.5 flex-1 rounded-xl border border-dashed border-slate-200 bg-white/80 p-2.5 text-[11px] leading-4 text-slate-500">
                        Schedule to be announced. Tailored in-house delivery available on request.
                      </div>
                    )}

                    <div className="mt-3 border-t border-slate-200/70 pt-2">
                      <Link
                        href={cat.courses.length > 0 ? `/categories/${cat.slug}` : '/inquiry'}
                        onClick={() => setOpenMenu(null)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#96691e] hover:underline"
                      >
                        {cat.courses.length > 0 ? 'Browse category →' : 'Request custom training →'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Utility & Quick Help Footer */}
            <div className="border-t border-slate-200 bg-[#f7f2e8]/80">
              <div className="mx-auto flex w-[min(1440px,calc(100vw-24px))] flex-wrap items-center justify-between gap-3 px-4 py-3 xl:px-6">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                  <span className="font-semibold text-[#081632]">
                    Looking for bespoke corporate delivery or international venue guidance?
                  </span>
                  <Link
                    href="/corporate-training"
                    onClick={() => setOpenMenu(null)}
                    className="font-bold text-[#96691e] hover:underline"
                  >
                    Corporate Training
                  </Link>
                  <Link
                    href="/locations"
                    onClick={() => setOpenMenu(null)}
                    className="font-bold text-[#96691e] hover:underline"
                  >
                    40+ Global Locations
                  </Link>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={openAdvisor}
                    className="btn-outline min-h-9 bg-white py-1.5 text-xs"
                  >
                    <SparkIcon className="h-3.5 w-3.5 text-[#96691e]" /> Ask AI Advisor
                  </button>
                  <Link
                    className="btn-primary min-h-9 py-1.5 text-xs"
                    href="/inquiry"
                    onClick={() => setOpenMenu(null)}
                  >
                    Request a proposal <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Locations Mega Menu */}
        {openMenu === 'locations' && (
          <div
            onMouseEnter={cancelMenuClose}
            onMouseLeave={scheduleMenuClose}
            className="mega-menu-enter absolute left-0 right-0 top-full z-40 hidden border-t border-slate-100 bg-white text-[#081632] shadow-[0_28px_60px_rgba(4,31,47,.16)] lg:block"
          >
            <div className="page-shell grid grid-cols-[.9fr_1fr_1fr_1fr] gap-8 py-8">
              <div>
                <p className="eyebrow">Global training</p>
                <h3 className="mt-2.5 font-display text-xl font-semibold">
                  Learn somewhere worth travelling to.
                </h3>
                <Link
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#96691e] hover:underline"
                  href="/locations"
                  onClick={() => setOpenMenu(null)}
                >
                  View all locations <ArrowIcon />
                </Link>
              </div>
              <MegaColumn
                title="Europe"
                onSelect={() => setOpenMenu(null)}
                links={[
                  ['London', '/courses?city=London'],
                  ['Paris', '/courses?city=Paris'],
                  ['Vienna', '/courses?city=Vienna'],
                  ['Amsterdam', '/courses?city=Amsterdam'],
                ]}
              />
              <MegaColumn
                title="Middle East"
                onSelect={() => setOpenMenu(null)}
                links={[
                  ['Dubai', '/courses?city=Dubai'],
                  ['Riyadh', '/courses?city=Riyadh'],
                  ['Jeddah', '/courses?city=Jeddah'],
                  ['In-house delivery', '/inquiry'],
                ]}
              />
              <MegaColumn
                title="Africa, Asia & Online"
                onSelect={() => setOpenMenu(null)}
                links={[
                  ['Kuala Lumpur', '/courses?city=Kuala+Lumpur'],
                  ['Kigali', '/courses?city=Kigali'],
                  ['Nairobi', '/courses?city=Nairobi'],
                  ['Live/Online', '/courses?city=Live%2FOnline'],
                ]}
              />
            </div>
          </div>
        )}
      </header>

      {/* Separate Touch-Friendly Mobile Navigation Drawer (rendered outside sticky/blur header so fixed + z-[55] are viewport-relative) */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-[55] flex h-dvh flex-col bg-white text-[#081632] lg:hidden"
        >
          <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-[#081632] px-4 text-white sm:px-6">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center">
              <Image
                src={logo}
                alt="Elevoris"
                className="h-10 w-auto object-contain"
                width={157}
                height={119}
              />
            </Link>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#c79a3c]/50 text-[#e2bd68] hover:bg-white/10"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Mobile navigation"
            className="flex-1 overflow-y-auto px-4 pb-8 pt-3 sm:px-6"
          >
            <div className="mb-3 grid grid-cols-2 gap-2 border-b border-slate-100 pb-3.5">
              {[
                [`All ${totalCourseCount} Courses`, '/courses'],
                [`All ${navigation.length} Categories`, '/categories'],
                ['Apply for Course', '/apply'],
                ['Locations', '/locations'],
                ['Solutions', '/training-solutions'],
                ['Blog & Insights', '/blog'],
                ['Corporate Training', '/corporate-training'],
                ['About & Contact', '/contact'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-[#f8fafc] px-2.5 text-center text-xs font-bold text-[#081632] active:bg-[#fbf6eb]"
                >
                  {label}
                </Link>
              ))}
            </div>

            <details className="border-b border-slate-100" open>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-[#081632]">
                <span>Courses &amp; All {navigation.length} Categories</span>
                <span className="text-[#96691e]">+</span>
              </summary>
              <div className="space-y-3 pb-4">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {[
                    [`Browse all ${totalCourseCount} courses`, '/courses'],
                    [`All ${navigation.length} course categories`, '/categories'],
                    ['Classroom training', '/courses?format=Classroom'],
                    ['Live online training', '/courses?format=Live+Online'],
                    ['Apply for a course', '/apply'],
                  ].map(([label, href]) => (
                    <Link
                      className="flex min-h-10 items-center rounded-xl bg-[#fbf6eb] px-3.5 text-xs font-bold text-[#96691e]"
                      href={href}
                      key={label}
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {navigation.map((cat) => (
                    <details
                      key={cat.slug}
                      className="rounded-xl border border-slate-100 bg-[#f8fafc] px-3 py-1.5"
                    >
                      <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-[#081632]">
                        <span>{cat.name}</span>
                        <span className="shrink-0 text-[10px] font-bold text-[#96691e] tabular-nums">
                          {cat.count > 0 ? `${cat.count} courses` : 'Custom'}
                        </span>
                      </summary>
                      <div className="mt-1.5 space-y-1 border-t border-slate-200/70 pb-1.5 pt-2">
                        <Link
                          href={`/categories/${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block py-1 text-xs font-bold text-[#96691e]"
                        >
                          Open {cat.name} →
                        </Link>
                        {cat.subcategories.map((subcategory) => (
                          <details
                            key={subcategory.slug}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1"
                          >
                            <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-bold text-[#96691e]">
                              <span>{subcategory.name}</span>
                              <span>{subcategory.courses.length}</span>
                            </summary>
                            <div className="border-t border-slate-100 py-1.5">
                              <Link
                                href={`/categories/${subcategory.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="block py-1 text-[11px] font-bold text-[#081632]"
                              >
                                Open subcategory →
                              </Link>
                              {subcategory.courses.map((course) => (
                                <Link
                                  key={course.slug}
                                  href={`/courses/${course.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-1 text-[11px] leading-4 text-slate-600"
                                >
                                  {course.title}
                                </Link>
                              ))}
                            </div>
                          </details>
                        ))}
                        {cat.courses.length > 0 ? (
                          cat.courses.map((course) => (
                            <Link
                              key={course.slug}
                              href={`/courses/${course.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1 text-[11px] leading-4 text-slate-600 hover:text-[#96691e]"
                            >
                              • {course.title}
                            </Link>
                          ))
                        ) : (
                          <Link
                            href="/inquiry"
                            onClick={() => setMobileOpen(false)}
                            className="block py-1 text-[11px] text-slate-500"
                          >
                            Tailored delivery available on request →
                          </Link>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </details>

            <details className="border-b border-slate-100">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-[#081632]">
                <span>Training Solutions</span>
                <span className="text-[#96691e]">+</span>
              </summary>
              <div className="grid grid-cols-1 gap-1.5 pb-4 sm:grid-cols-2">
                {[
                  ['All training solutions', '/training-solutions'],
                  ['Corporate training', '/corporate-training'],
                  ['In-house training', '/training-solutions#in-house'],
                  ['Bespoke programmes', '/training-solutions#bespoke'],
                ].map(([label, href]) => (
                  <Link
                    className="flex min-h-10 items-center rounded-xl bg-[#f8fafc] px-3.5 text-xs font-semibold text-[#355465]"
                    href={href}
                    key={label}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </details>

            <details className="border-b border-slate-100">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-[#081632]">
                <span>Locations</span>
                <span className="text-[#96691e]">+</span>
              </summary>
              <div className="grid grid-cols-2 gap-1.5 pb-4 sm:grid-cols-4">
                {[
                  ['All locations', '/locations'],
                  ['London', '/courses?city=London'],
                  ['Dubai', '/courses?city=Dubai'],
                  ['Paris', '/courses?city=Paris'],
                  ['Kuala Lumpur', '/courses?city=Kuala+Lumpur'],
                  ['Kigali', '/courses?city=Kigali'],
                  ['Riyadh', '/courses?city=Riyadh'],
                  ['Live/Online', '/courses?city=Live%2FOnline'],
                ].map(([label, href]) => (
                  <Link
                    className="flex min-h-10 items-center rounded-xl bg-[#f8fafc] px-3 text-xs font-semibold text-[#355465]"
                    href={href}
                    key={label}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </details>

            <div className="grid grid-cols-2 gap-2 py-4">
              <Link
                className="flex min-h-10 items-center justify-center rounded-xl bg-[#f8fafc] px-3.5 text-xs font-bold text-[#081632] sm:text-sm"
                href="/about"
                onClick={() => setMobileOpen(false)}
              >
                About Elevoris
              </Link>
              <Link
                className="flex min-h-10 items-center justify-center rounded-xl bg-[#f8fafc] px-3.5 text-xs font-bold text-[#081632] sm:text-sm"
                href="/contact"
                onClick={() => setMobileOpen(false)}
              >
                Contact Us
              </Link>
            </div>

            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={openAdvisor}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#96691e] bg-[#fbf6eb] px-4 text-xs font-bold text-[#96691e]"
              >
                <SparkIcon /> Ask AI Training Advisor
              </button>
              <Link
                className="btn-primary min-h-10 w-full"
                href="/inquiry"
                onClick={() => setMobileOpen(false)}
              >
                Request a proposal <ArrowIcon />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <a
                  className="btn-outline min-h-10 justify-center border-[#25D366] text-[#128C45]"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  className="btn-outline min-h-10 justify-center text-xs"
                  href="mailto:info@elevoris.com"
                >
                  info@elevoris.com
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
