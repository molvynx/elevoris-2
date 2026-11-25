'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { CourseCardData } from '@/lib/catalogue'
import { ArrowIcon } from './SiteChrome'

const statusLabels: Record<string, string> = {
  upcoming: 'Upcoming',
  'currently-available': 'Currently Available',
  'fully-booked': 'Fully Booked',
  'not-currently-scheduled': 'Not Currently Scheduled',
  'customized-training-available': 'Customized Training Available',
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CourseExplorer({
  courses,
  lockedCategory,
}: {
  courses: CourseCardData[]
  lockedCategory?: string
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(lockedCategory || 'All categories')
  const [location, setLocation] = useState('All locations')
  const [format, setFormat] = useState('All formats')
  const [duration, setDuration] = useState('All durations')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [subcategory, setSubcategory] = useState('All subcategories')
  const [sort, setSort] = useState('title-asc')
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categories = useMemo(
    () => [...new Set(courses.map((course) => course.category))].sort(),
    [courses],
  )
  const locations = useMemo(
    () => [...new Set(courses.flatMap((course) => course.venues))].sort(),
    [courses],
  )
  const formats = useMemo(
    () => [...new Set(courses.flatMap((course) => course.formats))].sort(),
    [courses],
  )
  const durations = useMemo(
    () =>
      [...new Set(courses.flatMap((course) => course.durations))].sort((a, b) => {
        const na = parseInt(a, 10)
        const nb = parseInt(b, 10)
        return Number.isNaN(na) || Number.isNaN(nb) ? a.localeCompare(b) : na - nb
      }),
    [courses],
  )
  const subcategories = useMemo(
    () => [...new Set(courses.map((course) => course.subcategory).filter(Boolean))].sort(),
    [courses],
  )

  const activeCategory = lockedCategory || category

  const filtered = useMemo(
    () =>
      courses
        .filter(
          (course) =>
            `${course.title} ${course.overview} ${course.category} ${course.subcategory}`
              .toLowerCase()
              .includes(query.trim().toLowerCase()) &&
            (activeCategory === 'All categories' || course.category === activeCategory) &&
            (subcategory === 'All subcategories' || course.subcategory === subcategory) &&
            (location === 'All locations' || course.venues.includes(location)) &&
            (format === 'All formats' || course.formats.includes(format)) &&
            (duration === 'All durations' || course.durations.includes(duration)) &&
            (status === 'All statuses' || course.status === status) &&
            (!date || course.dateISOs.some((value) => value >= date)),
        )
        .sort((a, b) =>
          sort === 'title-desc'
            ? b.title.localeCompare(a.title)
            : sort === 'date'
              ? (a.dateISO || '9999').localeCompare(b.dateISO || '9999')
              : a.title.localeCompare(b.title),
        ),
    [courses, query, activeCategory, subcategory, location, format, duration, status, date, sort],
  )

  const numberedGroups = useMemo(() => {
    const map = new Map<string, { slug: string; list: CourseCardData[] }>()
    for (const course of filtered) {
      const existing = map.get(course.category)
      if (existing) {
        existing.list.push(course)
      } else {
        map.set(course.category, {
          slug: course.categorySlug || toSlug(course.category),
          list: [course],
        })
      }
    }
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
    let counter = 0
    return sorted.map(([catName, group]) => ({
      catName,
      slug: group.slug,
      items: group.list.map((course) => {
        counter += 1
        return { course, number: counter }
      }),
    }))
  }, [filtered])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedLocation = params.get('city')
    const requestedCategory = params.get('category')
    const requestedFormat = params.get('format')
    const requestedQuery = params.get('q')

    if (requestedLocation) {
      const match = locations.find(
        (value) => value.trim().toLowerCase() === requestedLocation.trim().toLowerCase(),
      )
      if (match) setLocation(match)
    }
    if (!lockedCategory && requestedCategory) {
      const match = categories.find(
        (value) => value.trim().toLowerCase() === requestedCategory.trim().toLowerCase(),
      )
      if (match) setCategory(match)
    }
    if (requestedFormat) {
      const match = formats.find(
        (value) => value.trim().toLowerCase() === requestedFormat.trim().toLowerCase(),
      )
      if (match) setFormat(match)
    }
    if (requestedQuery) {
      setQuery(requestedQuery)
    }
  }, [locations, categories, formats, lockedCategory])

  const activeFilters = [
    !lockedCategory && category !== 'All categories',
    subcategory !== 'All subcategories',
    location !== 'All locations',
    format !== 'All formats',
    duration !== 'All durations',
    status !== 'All statuses',
    Boolean(date),
  ].filter(Boolean).length

  function clearFilters() {
    setQuery('')
    if (!lockedCategory) setCategory('All categories')
    setSubcategory('All subcategories')
    setLocation('All locations')
    setFormat('All formats')
    setDuration('All durations')
    setStatus('All statuses')
    setDate('')
  }

  function renderCard(course: CourseCardData, number: number) {
    const statusLabel = statusLabels[course.status] || course.status
    const isAvailable = course.status === 'currently-available' || course.status === 'upcoming'

    return (
      <article
        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(3,33,52,.04)] transition hover:-translate-y-0.5 hover:border-[#d9bd83] hover:shadow-[0_14px_32px_rgba(3,33,52,.09)]"
        key={course.slug}
      >
        {/* Desktop / Tablet Card Visual Banner */}
        <div className="relative hidden overflow-hidden sm:block sm:h-40">
          {course.image ? (
            <Image
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={course.image.url}
              alt={course.image.alt}
              width={course.image.width}
              height={course.image.height}
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-[#081632] via-[#14264a] to-[#9b7229]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081632]/75 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-semibold text-white">
            <span className="tabular-nums">Course {number}</span>
            <span>{statusLabel}</span>
          </div>
        </div>

        {/* Compact Mobile Top Accent Strip (<640px only so search results never fill an entire phone viewport per card) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#081632]/[0.03] px-3 py-1.5 text-[10px] font-bold sm:hidden">
          <span className="text-[#081632] tabular-nums">Course {number}</span>
          <span
            className={`rounded-md px-1.5 py-0.5 ${
              isAvailable ? 'bg-[#fbf6eb] text-[#96691e]' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between p-3 sm:p-5">
          <div>
            <p className="truncate text-[10px] font-bold text-[#96691e] sm:text-[11px]">
              {course.category}
            </p>
            <h2 className="mt-1 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-[#081632] sm:mt-1.5 sm:text-lg">
              <Link href={`/courses/${course.slug}`} className="hover:text-[#96691e]">
                {course.title}
              </Link>
            </h2>
          </div>

          <div className="mt-2.5 sm:mt-4">
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 border-y border-slate-100 py-2 text-[11px] text-slate-600 sm:gap-2.5 sm:py-3 sm:text-xs">
              <span>
                <b className="block text-[9px] uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  Duration
                </b>
                <span className="mt-0.5 block truncate font-semibold text-[#0b293b] tabular-nums">
                  {course.durations.length > 1
                    ? `${course.durations.slice(0, 2).join(', ')}${course.durations.length > 2 ? '…' : ''}`
                    : course.duration}
                </span>
              </span>
              <span>
                <b className="block text-[9px] uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  Format
                </b>
                <span className="mt-0.5 block truncate font-semibold text-[#0b293b]">
                  {course.formats.join(' · ') || course.format}
                </span>
              </span>
              <span className="col-span-2">
                <b className="block text-[9px] uppercase tracking-wider text-slate-400 sm:text-[10px]">
                  {course.upcomingSessions.length > 0
                    ? `Upcoming sessions (${course.sessionCount})`
                    : 'Scheduled sessions'}
                </b>
                {course.upcomingSessions.length > 0 ? (
                  <ul className="mt-0.5 space-y-0.5 text-[11px] leading-4 text-[#0b293b] sm:mt-1 sm:space-y-1">
                    {course.upcomingSessions.slice(0, 2).map((session, idx) => (
                      <li
                        key={idx}
                        className={`${
                          idx === 1 ? 'hidden sm:flex' : 'flex'
                        } items-center justify-between gap-2 truncate tabular-nums`}
                      >
                        <span className="truncate font-semibold">{session.dates}</span>
                        <span className="shrink-0 text-slate-500">{session.venue}</span>
                      </li>
                    ))}
                    {course.sessionCount > 1 && (
                      <li className="text-[10px] font-semibold text-[#96691e] sm:hidden">
                        + {course.sessionCount - 1} more verified{' '}
                        {course.sessionCount - 1 === 1 ? 'session' : 'sessions'}
                      </li>
                    )}
                    {course.sessionCount > 2 && (
                      <li className="hidden text-[10px] font-semibold text-[#96691e] sm:block">
                        + {course.sessionCount - 2} more verified sessions
                      </li>
                    )}
                  </ul>
                ) : (
                  <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                    Schedule to be announced.
                  </span>
                )}
              </span>
            </div>

            <Link
              className="mt-2.5 flex items-center justify-between text-xs font-bold text-[#0b293b] group-hover:text-[#96691e] sm:mt-3"
              href={`/courses/${course.slug}`}
            >
              <span>View Details</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50 transition group-hover:bg-[#96691e] group-hover:text-white sm:h-8 sm:w-8">
                <ArrowIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <div
        id="catalog"
        className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_10px_30px_rgba(3,33,52,.05)] sm:p-4"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#96691e] sm:left-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              aria-label="Search courses"
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#f7f9fb] pl-9 pr-3 text-xs font-semibold outline-none focus:border-[#c79a3c] focus:bg-[#fbf6eb] sm:h-11 sm:pl-10 sm:pr-4 sm:text-sm"
              placeholder={
                lockedCategory
                  ? `Search courses in ${lockedCategory}...`
                  : 'Search by course name, keyword, or category...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            aria-expanded={filtersOpen}
            className="relative flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-[#355465] sm:h-11 sm:min-w-11 sm:px-3.5 lg:hidden"
            onClick={() => setFiltersOpen((value) => !value)}
            type="button"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#96691e] px-1 text-[10px] text-white tabular-nums sm:h-5 sm:min-w-5">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        <div
          className={`${filtersOpen ? 'grid' : 'hidden'} mt-2.5 gap-2.5 border-t border-slate-100 pt-2.5 sm:mt-3 sm:grid-cols-2 sm:gap-3 sm:pt-3 lg:grid lg:grid-cols-4`}
        >
          {!lockedCategory && (
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
              Category
              <select
                aria-label="Category"
                className="filter-control mt-1 w-full sm:mt-1.5"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All categories</option>
                {categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          )}
          {subcategories.length > 0 && (
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
              Subcategory
              <select
                aria-label="Subcategory"
                className="filter-control mt-1 w-full sm:mt-1.5"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                <option>All subcategories</option>
                {subcategories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          )}
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Location
            <select
              aria-label="Location"
              className="filter-control mt-1 w-full sm:mt-1.5"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>All locations</option>
              {locations.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Training format
            <select
              aria-label="Training format"
              className="filter-control mt-1 w-full sm:mt-1.5"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option>All formats</option>
              {formats.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Duration
            <select
              aria-label="Duration"
              className="filter-control mt-1 w-full sm:mt-1.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option>All durations</option>
              {durations.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Course status
            <select
              aria-label="Course status"
              className="filter-control mt-1 w-full sm:mt-1.5"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Sort results
            <select
              aria-label="Sort courses"
              className="filter-control mt-1 w-full sm:mt-1.5"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="title-asc">A–Z</option>
              <option value="title-desc">Z–A</option>
              <option value="date">Next available date</option>
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            Available from
            <input
              aria-label="Course date from"
              className="filter-control mt-1 w-full sm:mt-1.5"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 sm:mt-6 sm:gap-3">
        <p className="text-xs font-semibold text-[#0b293b] tabular-nums sm:text-sm">
          {filtered.length} {filtered.length === 1 ? 'programme' : 'programmes'} found
          {!lockedCategory && numberedGroups.length > 1
            ? ` across ${numberedGroups.length} categories`
            : ''}
        </p>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {!lockedCategory && numberedGroups.length > 1 && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold sm:text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`rounded-md px-2.5 py-1 transition sm:px-3 sm:py-1.5 ${
                  viewMode === 'grouped'
                    ? 'bg-[#081632] text-white'
                    : 'text-slate-600 hover:text-[#081632]'
                }`}
              >
                By category
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-2.5 py-1 transition sm:px-3 sm:py-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-[#081632] text-white'
                    : 'text-slate-600 hover:text-[#081632]'
                }`}
              >
                All grid
              </button>
            </div>
          )}
          {(activeFilters > 0 || query) && (
            <button
              type="button"
              className="min-h-8 px-2 text-xs font-bold text-[#96691e] hover:underline sm:min-h-9"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center sm:mt-8 sm:py-14">
          <h2 className="font-display text-lg font-semibold sm:text-2xl">No exact matches found</h2>
          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Clear the filters or ask the AI Training Advisor for help.
          </p>
          <button type="button" onClick={clearFilters} className="btn-outline mt-4 sm:mt-5">
            Reset filters
          </button>
        </div>
      ) : !lockedCategory && viewMode === 'grouped' && numberedGroups.length > 1 ? (
        <div className="mt-5 space-y-7 sm:mt-8 sm:space-y-10">
          {numberedGroups.map((group) => (
            <section key={group.catName}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2 sm:mb-4 sm:pb-2.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="font-display text-base font-semibold text-[#081632] sm:text-xl">
                    {group.catName}
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 tabular-nums sm:text-xs">
                    {group.items.length} {group.items.length === 1 ? 'programme' : 'programmes'}
                  </span>
                </div>
                <Link
                  href={`/categories/${group.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#96691e] hover:underline sm:text-xs"
                >
                  Category page <ArrowIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {group.items.map(({ course, number }) => renderCard(course, number))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filtered.map((course, idx) => renderCard(course, idx + 1))}
        </div>
      )}
    </>
  )
}
