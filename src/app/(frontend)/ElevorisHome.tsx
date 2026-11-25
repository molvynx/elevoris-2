'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SiteFooter } from './SiteChrome'

type IconName =
  | 'arrow'
  | 'building'
  | 'calendar'
  | 'clock'
  | 'globe'
  | 'pin'
  | 'search'
  | 'shield'
  | 'spark'
  | 'users'

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    building: (
      <>
        <path d="M3 21h18" />
        <path d="M6 21V5l6-3 6 3v16" />
        <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3-1.4 4.1a5.2 5.2 0 0 1-3.3 3.3L3 12l4.3 1.6a5.2 5.2 0 0 1 3.3 3.3L12 21l1.4-4.1a5.2 5.2 0 0 1 3.3-3.3L21 12l-4.3-1.6a5.2 5.2 0 0 1-3.3-3.3L12 3Z" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  }
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
      {paths[name]}
    </svg>
  )
}

const heroPhoto = '/images/elevoris/hero-training.jpg'
const solutionPhoto = '/images/elevoris/corporate-training.jpg'

export type HomeCourse = {
  slug: string
  title: string
  category: string
  categorySlug: string
  status: string
  sessionCount: number
  duration: string
  location: string
  method: string
  formats: string[]
  venues: string[]
  date: string
  dateISO: string
}

const HOME_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  'currently-available': 'Currently Available',
  'fully-booked': 'Fully Booked',
  'not-currently-scheduled': 'Not Currently Scheduled',
  'customized-training-available': 'Customized Training Available',
}

export type HomeCategory = {
  name: string
  slug: string
  description: string | null
  count: number
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openAdvisorWithQuestion(question?: string) {
  window.dispatchEvent(new CustomEvent('elevoris:open-advisor', { detail: { question } }))
}

const FEATURED_CATEGORIES = [
  'Executive Leadership & Management',
  'Oil, Gas & Energy Management',
  'Business Analytics & Artificial Intelligence (AI)',
  'Strategic Finance & Budgeting',
]

export default function ElevorisHome({
  courses,
  categories,
  locations,
}: {
  courses: HomeCourse[]
  categories: HomeCategory[]
  locations: string[]
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [location, setLocation] = useState('All locations')
  const [method, setMethod] = useState('All formats')

  const availableFormats = useMemo(
    () => [...new Set(courses.flatMap((c) => c.formats))].sort(),
    [courses],
  )

  const hasActiveFilter =
    Boolean(query.trim()) ||
    category !== 'All categories' ||
    location !== 'All locations' ||
    method !== 'All formats' ||
    showAllCategories

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter(
      (course) =>
        (!q ||
          course.title.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q)) &&
        (category === 'All categories' || course.category === category) &&
        (location === 'All locations' ||
          course.venues.includes(location) ||
          course.location === location) &&
        (method === 'All formats' || course.formats.includes(method) || course.method === method),
    )
  }, [courses, query, category, location, method])

  const numberedGroups = useMemo(() => {
    const categoryMeta = new Map(categories.map((c) => [c.name, c]))
    const groups = new Map<string, { slug: string; courses: HomeCourse[] }>()

    for (const course of filtered) {
      const existing = groups.get(course.category)
      if (existing) {
        existing.courses.push(course)
      } else {
        groups.set(course.category, {
          slug: categoryMeta.get(course.category)?.slug || course.categorySlug,
          courses: [course],
        })
      }
    }

    const sorted = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
    let counter = 0
    return sorted.map(([catName, group]) => ({
      catName,
      slug: group.slug,
      totalInCategory: categoryMeta.get(catName)?.count ?? group.courses.length,
      courses: group.courses.map((course) => {
        counter += 1
        return { course, number: counter }
      }),
    }))
  }, [filtered, categories])

  // On default unfiltered homepage view, show 4 signature categories × 3 courses (12 cards)
  // so the homepage stays clean and balanced; clicking "All Categories" or any specific category opens more cleanly.
  const displayedGroups = useMemo(() => {
    if (hasActiveFilter) {
      return numberedGroups.map((group) => ({
        ...group,
        visibleCourses:
          category !== 'All categories' || (!showAllCategories && numberedGroups.length <= 2)
            ? group.courses
            : group.courses.slice(0, 3),
      }))
    }

    const featuredSet = new Set(FEATURED_CATEGORIES)
    const featured = numberedGroups
      .filter((g) => featuredSet.has(g.catName))
      .sort(
        (a, b) => FEATURED_CATEGORIES.indexOf(a.catName) - FEATURED_CATEGORIES.indexOf(b.catName),
      )

    const picked = featured.length > 0 ? featured : numberedGroups.slice(0, 4)
    return picked.map((group) => ({
      ...group,
      visibleCourses: group.courses.slice(0, 3),
    }))
  }, [numberedGroups, hasActiveFilter, category, showAllCategories])

  // Track courses displayed in default featured showcase so Upcoming Training shows non-duplicate courses
  const featuredSlugs = useMemo(() => {
    const slugs = new Set<string>()
    if (!hasActiveFilter) {
      for (const group of displayedGroups) {
        for (const item of group.visibleCourses) {
          slugs.add(item.course.slug)
        }
      }
    }
    return slugs
  }, [displayedGroups, hasActiveFilter])

  const upcomingCourses = useMemo(
    () =>
      courses
        .filter((c) => c.dateISO && !featuredSlugs.has(c.slug))
        .slice()
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
        .slice(0, 5),
    [courses, featuredSlugs],
  )

  const activeFilterCount = [
    Boolean(query.trim()),
    category !== 'All categories',
    location !== 'All locations',
    method !== 'All formats',
    showAllCategories,
  ].filter(Boolean).length

  function clearFilters() {
    setQuery('')
    setCategory('All categories')
    setShowAllCategories(false)
    setLocation('All locations')
    setMethod('All formats')
  }

  return (
    <div className="min-h-screen bg-[#f9fbfd] text-[#0b293b]">
      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#081632] text-white">
          <div className="absolute inset-0">
            <Image
              src={heroPhoto}
              alt="Professionals taking part in an executive training session"
              className="h-full w-full object-cover object-center opacity-40"
              width={1600}
              height={900}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#081632] via-[#081632]/90 to-[#081632]/50" />
            <div className="hero-grid absolute inset-0 opacity-25" />
          </div>

          <div className="page-shell relative py-10 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#e2bd68] sm:text-xs">
                <Icon name="spark" className="h-4 w-4" /> Global professional development
              </p>
              <h1 className="mt-3 font-display text-[26px] font-semibold leading-[1.14] tracking-[-.03em] text-balance sm:mt-4 sm:text-[48px] lg:text-[58px]">
                Empowering professionals.{' '}
                <span className="text-[#e2bd68]">Elevating performance.</span>
              </h1>
              <p className="mt-3.5 max-w-2xl text-sm leading-6 text-white/75 sm:mt-6 sm:text-lg sm:leading-7">
                Practitioner-led corporate training and executive programmes built for professionals
                and organisations worldwide.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href="/courses"
                  className="btn-primary w-full px-5 py-3 text-sm sm:w-auto sm:px-6 sm:py-3.5"
                >
                  Explore all {courses.length} courses <Icon name="arrow" className="h-4 w-4" />
                </Link>
                <Link
                  href="/inquiry"
                  className="btn-secondary w-full px-5 py-3 text-sm sm:w-auto sm:px-6 sm:py-3.5"
                >
                  Request corporate training
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Integrated Hero Search Bar (clean flow, zero overlap) */}
        <section className="page-shell relative z-10 -mt-6 sm:-mt-9">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              scrollTo('courses')
            }}
            className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-[0_18px_45px_rgba(8,22,50,.12)] sm:p-4"
          >
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.1fr_1fr_auto]">
              <label className="search-field">
                <span className="search-label">
                  <Icon name="search" className="h-3.5 w-3.5" /> Course or topic
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Leadership, Finance, AI, Oil & Gas..."
                />
              </label>
              <label className="search-field">
                <span className="search-label">Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="All categories">All categories</option>
                  {categories
                    .filter((c) => c.count > 0)
                    .map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="search-field">
                <span className="search-label">
                  <Icon name="pin" className="h-3.5 w-3.5" /> Location
                </span>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="All locations">All locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="btn-primary min-h-[52px] w-full px-6 text-sm lg:min-h-[56px] lg:w-auto"
                aria-label="Search courses"
              >
                <Icon name="search" className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </section>

        {/* Trust & Standards Strip */}
        <section className="page-shell pt-8 sm:pt-12">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-8 sm:gap-6 sm:pb-10 lg:grid-cols-4">
            {[
              ['ISO 9001:2015', 'Quality certified', 'shield'],
              ['40+', 'Global destinations', 'globe'],
              ['12 delegates', 'Max cohort size', 'users'],
              ['30 days', 'Post-course support', 'calendar'],
            ].map(([big, small, icon]) => (
              <div key={big} className="flex items-center gap-2 sm:gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7f2e8] text-[#96691e] sm:h-11 sm:w-11">
                  <Icon name={icon as IconName} className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#0b293b] sm:text-base">
                    {big}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 sm:text-xs">{small}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Course Catalogue Organised by Category */}
        <section id="courses" className="page-shell section-pad scroll-mt-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Featured training programmes</p>
              <h2 className="section-title mt-2">Find the programme that moves you forward.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              Explore curated highlights by subject category, filter across all {courses.length}{' '}
              programmes, or open any category to browse its full curriculum.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 grid gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="filter-control"
              placeholder="Filter by course title or keyword..."
              aria-label="Filter by course title or keyword"
            />
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-control"
            >
              <option value="All categories">All categories</option>
              {categories
                .filter((c) => c.count > 0)
                .map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
            </select>
            <select
              aria-label="Filter by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-control"
            >
              <option value="All locations">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by format"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="filter-control"
            >
              <option value="All formats">All formats</option>
              {availableFormats.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-bold text-[#96691e] hover:border-[#96691e] hover:bg-[#fbf6eb]"
              >
                Reset
              </button>
            )}
          </div>

          {/* Interactive Category Quick-Browse Tabs */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => {
                setCategory('All categories')
                setShowAllCategories(false)
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                category === 'All categories' && !showAllCategories
                  ? 'bg-[#081632] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#96691e] hover:text-[#96691e]'
              }`}
            >
              Featured Highlights
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory('All categories')
                setShowAllCategories(true)
              }}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                category === 'All categories' && showAllCategories
                  ? 'bg-[#081632] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#96691e] hover:text-[#96691e]'
              }`}
            >
              All Categories ({categories.length})
            </button>
            {categories
              .filter((c) => c.count > 0)
              .map((cat) => (
                <button
                  type="button"
                  key={cat.slug}
                  onClick={() => {
                    setCategory(cat.name)
                    setShowAllCategories(false)
                  }}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    category === cat.name
                      ? 'bg-[#081632] text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-[#96691e] hover:text-[#96691e]'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 text-xs text-slate-500 sm:mt-4 sm:pb-3">
            <p className="font-semibold text-[#0b293b] tabular-nums">
              {hasActiveFilter
                ? `Showing ${filtered.length} matching ${filtered.length === 1 ? 'programme' : 'programmes'} across ${numberedGroups.length} ${numberedGroups.length === 1 ? 'category' : 'categories'}`
                : `Showing 4 featured categories (${courses.length} total programmes across ${categories.length} categories)`}
            </p>
            <Link href="/courses" className="font-bold text-[#96691e] hover:underline">
              View All {courses.length} Courses →
            </Link>
          </div>

          {/* Grouped Category Sections */}
          {displayedGroups.length > 0 ? (
            <div className="mt-5 space-y-7 sm:mt-8 sm:space-y-10">
              {displayedGroups.map((group) => (
                <section key={group.catName} aria-labelledby={`cat-${group.slug}`}>
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-2 sm:mb-4 sm:pb-2.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3
                        id={`cat-${group.slug}`}
                        className="font-display text-base font-semibold text-[#081632] sm:text-xl"
                      >
                        {group.catName}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500 tabular-nums sm:text-xs">
                        {group.courses.length}{' '}
                        {group.courses.length === 1 ? 'programme' : 'programmes'}
                      </span>
                    </div>
                    <Link
                      href={`/categories/${group.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#96691e] hover:underline sm:text-xs"
                    >
                      View all {group.totalInCategory} courses{' '}
                      <Icon name="arrow" className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
                    {group.visibleCourses.map(({ course, number: courseNum }) => (
                      <article
                        key={course.slug}
                        className="course-card group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 sm:text-[11px]">
                            <span className="truncate font-semibold text-[#96691e] tabular-nums">
                              Programme {courseNum} · {course.category}
                            </span>
                            <span className="shrink-0 rounded bg-[#fbf6eb] px-1.5 py-0.5 text-[10px] font-semibold text-[#96691e]">
                              {HOME_STATUS_LABELS[course.status] || course.status}
                            </span>
                          </div>
                          <h4 className="mt-1.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-[#081632] sm:mt-2.5 sm:text-[17px]">
                            <Link href={`/courses/${course.slug}`} className="hover:text-[#96691e]">
                              {course.title}
                            </Link>
                          </h4>
                        </div>

                        <div className="mt-2.5 sm:mt-4">
                          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 border-y border-slate-100 py-2 text-[11px] text-slate-600 sm:gap-x-3 sm:gap-y-2 sm:py-3 sm:text-xs">
                            <span className="flex items-center gap-1.5 truncate">
                              <Icon name="clock" className="h-3.5 w-3.5 shrink-0 text-[#96691e]" />
                              <span className="truncate tabular-nums">{course.duration}</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-[#96691e]" />
                              <span className="truncate">{course.location}</span>
                            </span>
                            <span className="col-span-2 flex items-center justify-between gap-2 truncate tabular-nums">
                              <span className="flex min-w-0 items-center gap-1.5 truncate">
                                <Icon
                                  name="calendar"
                                  className="h-3.5 w-3.5 shrink-0 text-[#96691e]"
                                />
                                <span className="truncate">
                                  Next:{' '}
                                  <strong className="font-semibold text-[#0b293b]">
                                    {course.date}
                                  </strong>
                                </span>
                              </span>
                              <span className="shrink-0 text-[10px] font-medium text-slate-500">
                                {course.formats.join(' · ') || course.method}
                                {course.sessionCount > 1 ? ` (${course.sessionCount})` : ''}
                              </span>
                            </span>
                          </div>

                          <Link
                            href={`/courses/${course.slug}`}
                            className="mt-2.5 flex items-center justify-between text-xs font-bold text-[#0b293b] group-hover:text-[#96691e] sm:mt-3"
                          >
                            <span>View Details</span>
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50 transition group-hover:bg-[#96691e] group-hover:text-white sm:h-8 sm:w-8">
                              <Icon name="arrow" className="h-3.5 w-3.5" />
                            </span>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p className="font-display text-xl font-semibold">No exact matches found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Try clearing your filters or ask our AI Training Advisor for personalised guidance.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={clearFilters} className="btn-outline">
                  Clear all filters
                </button>
                <button
                  type="button"
                  onClick={() => openAdvisorWithQuestion(query || undefined)}
                  className="btn-primary"
                >
                  Ask AI Advisor
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/courses" className="btn-primary w-full sm:w-auto">
              View All {courses.length} Courses <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/categories" className="btn-outline w-full sm:w-auto">
              Browse all {categories.length} categories
            </Link>
          </div>
        </section>

        {/* Areas of Expertise (All 20 Categories) */}
        <section className="bg-[#f7f2e8]">
          <div className="page-shell section-pad">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Areas of expertise</p>
                <h2 className="section-title mt-2">Training built around your industry.</h2>
              </div>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#96691e] hover:underline sm:text-sm"
              >
                View all {categories.length} categories <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="category-tile group justify-between"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#96691e] tabular-nums">{i + 1}</span>
                      <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                        {cat.count > 0 ? `${cat.count} courses` : 'Custom delivery'}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold leading-snug text-[#081632] sm:text-lg">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition group-hover:text-[#96691e]">
                    Explore category <Icon name="arrow" className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Corporate Training Solutions */}
        <section id="solutions" className="page-shell section-pad scroll-mt-20">
          <div className="overflow-hidden rounded-3xl bg-[#081632] text-white">
            <div className="grid items-stretch lg:grid-cols-2">
              <div className="p-6 sm:p-10 lg:p-14">
                <p className="eyebrow text-[#e2bd68]">Corporate training solutions</p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.12] tracking-[-.025em] sm:text-4xl">
                  Capability designed around your organisation.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:leading-7">
                  From focused executive workshops to organisation-wide academies, our specialists
                  build practical learning experiences around your people, priorities, and
                  performance goals.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    'In-house training',
                    'Bespoke programmes',
                    'Executive workshops',
                    'Live online delivery',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm font-semibold">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#96691e]">
                        <Icon name="shield" className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/inquiry" className="btn-primary">
                    Build your programme <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                  <Link href="/corporate-training" className="btn-secondary">
                    Corporate solutions
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-full">
                <Image
                  src={solutionPhoto}
                  alt="A team collaborating during a tailored workplace training session"
                  className="absolute inset-0 h-full w-full object-cover"
                  width={1400}
                  height={900}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081632]/90 via-[#081632]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/15 bg-[#081632]/85 p-4 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#e2bd68]">
                    Our difference
                  </p>
                  <p className="mt-1.5 font-display text-sm leading-snug text-white sm:text-base">
                    Every programme closes a specific capability gap and supports measurable
                    improvement back at work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Training */}
        <section className="border-y border-slate-200 bg-white">
          <div className="page-shell section-pad">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
              <div>
                <p className="eyebrow">Upcoming training</p>
                <h2 className="section-title mt-2">Your next step, already scheduled.</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                  Plan ahead with confirmed classroom and live online programmes across leading
                  global business destinations.
                </p>
                <Link href="/courses" className="btn-outline mt-6">
                  View full schedule <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
              <div>
                {upcomingCourses.map((course) => {
                  const dateParts = course.date.split(' ')
                  return (
                    <div key={course.slug} className="upcoming-row">
                      <div className="w-12 shrink-0 text-center tabular-nums sm:w-14">
                        <b className="block font-display text-xl text-[#96691e] sm:text-2xl">
                          {dateParts[0]}
                        </b>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {dateParts[1]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-sm font-semibold text-[#081632] sm:text-base">
                          <Link href={`/courses/${course.slug}`} className="hover:text-[#96691e]">
                            {course.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {course.location} · {course.duration} · {course.method}
                        </p>
                      </div>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 transition hover:border-[#96691e] hover:bg-[#96691e] hover:text-white sm:h-10 sm:w-10"
                        aria-label={`View ${course.title}`}
                      >
                        <Icon name="arrow" className="h-4 w-4" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Why Elevoris */}
        <section id="about" className="page-shell section-pad scroll-mt-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative">
              <Image
                src="/images/elevoris/about-training.jpg"
                alt="Professionals learning together in a bright modern office"
                className="aspect-[6/5] w-full rounded-2xl object-cover sm:rounded-3xl"
                width={1200}
                height={1000}
              />
              <div className="mt-4 rounded-2xl bg-[#96691e] p-4 text-white shadow-lg sm:mt-0 sm:absolute sm:bottom-5 sm:right-5 sm:max-w-[230px] sm:p-5">
                <p className="font-display text-2xl font-semibold sm:text-3xl">40+</p>
                <p className="mt-1 text-xs leading-5 text-white/90">
                  destinations across Europe, the GCC, Africa, Asia, and beyond.
                </p>
              </div>
            </div>
            <div>
              <p className="eyebrow">Why Elevoris</p>
              <h2 className="section-title mt-2">Learning that performs in the real world.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:mt-5 sm:leading-7">
                We are a global training and consulting firm committed to learning outcomes that
                translate directly into improved professional performance and organisational
                capability.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  [
                    'Practitioner-led expertise',
                    'Learn from seasoned professionals with deep, current industry experience.',
                  ],
                  [
                    'Deliberately small cohorts',
                    'A maximum of 12 delegates enables meaningful facilitator engagement.',
                  ],
                  [
                    'Practical from day one',
                    'Real scenarios, case studies, and applied learning—not theory alone.',
                  ],
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-3.5">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f7f2e8] text-[#96691e]">
                      <Icon name="shield" className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#081632]">{title}</h3>
                      <p className="mt-0.5 text-xs leading-5 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn-outline mt-6">
                About Elevoris <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* International Locations */}
        <section className="bg-[#f7f2e8]">
          <div className="page-shell section-pad">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">International locations</p>
                <h2 className="section-title mt-2">Train where business happens.</h2>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-xs font-bold text-[#96691e] hover:underline sm:text-sm"
                href="/locations"
              >
                Explore all locations <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {locations.map((loc, index) => (
                <Link
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-[#96691e] hover:shadow-md sm:p-5"
                  href={`/courses?city=${encodeURIComponent(loc)}`}
                  key={loc}
                >
                  <span className="text-[11px] font-bold text-[#96691e] tabular-nums">
                    {index + 1}
                  </span>
                  <h3 className="mt-2 font-display text-sm font-semibold leading-snug text-[#081632] sm:mt-4 sm:text-xl">
                    {loc}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                    View training options
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Delegate Testimonial */}
        <section className="page-shell section-pad">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Delegate experience</p>
            <blockquote className="mt-4 font-display text-xl font-medium leading-relaxed text-[#081632] sm:mt-6 sm:text-3xl">
              “The curriculum was industry-focused and well-structured. The mentors were
              approachable and always ready to clear doubts.”
            </blockquote>
            <p className="mt-4 text-xs font-bold text-slate-500">Yuyen S. · IT Consultant</p>
          </div>
        </section>

        {/* Interactive AI Training Advisor Showcase */}
        <section className="bg-[#081632] text-white">
          <div className="page-shell grid items-center gap-8 py-14 sm:py-16 lg:grid-cols-[1fr_.9fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#e2bd68]">
                <Icon name="spark" className="h-4 w-4" /> AI Training Advisor
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-4xl">
                Find the right programme through a guided conversation.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                Ask about course options, compare delivery formats, explore international locations,
                or request tailored corporate recommendations grounded in verified Elevoris data.
              </p>
              <button
                type="button"
                onClick={() => openAdvisorWithQuestion()}
                className="btn-primary mt-6"
              >
                Open AI Training Advisor <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#e2bd68]">
                Click a question to start
              </p>
              <div className="mt-3 space-y-2.5">
                {[
                  'Which leadership courses are available in Dubai?',
                  'Recommend live online finance or AI programmes.',
                  'I need tailored corporate training for a 10-person team.',
                ].map((q) => (
                  <button
                    type="button"
                    onClick={() => openAdvisorWithQuestion(q)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-xs font-medium text-white/90 transition hover:border-[#e2bd68] hover:bg-white/10"
                    key={q}
                  >
                    <span>{q}</span>
                    <Icon name="arrow" className="h-4 w-4 shrink-0 text-[#e2bd68]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Band */}
        <section className="border-b border-slate-200 bg-[#fbf6eb]">
          <div className="page-shell flex flex-col items-start justify-between gap-6 py-12 sm:py-14 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">Develop your team</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#081632] sm:text-3xl">
                Let’s turn ambition into capability.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Contact our advisors at{' '}
                <a
                  className="font-bold text-[#96691e] hover:underline"
                  href="mailto:info@elevoris.com"
                >
                  info@elevoris.com
                </a>{' '}
                or request a tailored proposal online.
              </p>
            </div>
            <Link href="/inquiry" className="btn-primary w-full sm:w-auto">
              Request a proposal <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
