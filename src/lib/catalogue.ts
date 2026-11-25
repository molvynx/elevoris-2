import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import type { BlogPost } from '@/payload-types'

export type CatalogueCategory = {
  id: string | number
  name: string
  slug: string
  description?: string | null
  parent?: string | number | CatalogueCategory | null
  image?:
    | { url?: string | null; alt?: string | null; width?: number | null; height?: number | null }
    | string
    | number
    | null
  migrationStatus?: string | null
}

export type CatalogueSchedule = {
  dates: string
  startDate?: string | null
  endDate?: string | null
  venue: string
  duration?: string | null
  fee?: string | null
  code?: string | null
  scope?: string | null
  quarter?: string | null
  format?: string | null
}

export type CatalogueCourse = {
  id: string | number
  title: string
  slug: string
  category: string | number | CatalogueCategory
  subcategory?: string | number | CatalogueCategory | null
  code?: string | null
  status: string
  migrationStatus: string
  sourceUrl?: string | null
  image?:
    | { url?: string | null; alt?: string | null; width?: number | null; height?: number | null }
    | string
    | number
    | null
  overview?: string | null
  whyChoose?: Array<{ text: string }> | null
  objectives?: Array<{ text: string }> | null
  learningOutcomes?: Array<{ text: string }> | null
  audience?: Array<{ text: string }> | null
  prerequisites?: Array<{ text: string }> | null
  deliveryApproach?: Array<{ text: string }> | null
  syllabus?: string | null
  organisationalImpact?: Array<{ text: string }> | null
  personalImpact?: Array<{ text: string }> | null
  assessmentAndCertification?: string | null
  generalNotes?: Array<{ text: string }> | null
  formats?: string[] | null
  schedules?: CatalogueSchedule[] | null
  brochureUrl?: string | null
  seo?: { title?: string | null; description?: string | null } | null
}

export type CourseCardData = {
  slug: string
  title: string
  category: string
  categorySlug: string
  subcategory: string
  status: string
  migrationStatus: string
  overview: string
  venue: string
  duration: string
  date: string
  dateISO: string
  format: string
  fee: string
  venues: string[]
  formats: string[]
  durations: string[]
  dateISOs: string[]
  sessionCount: number
  upcomingSessions: Array<{
    dates: string
    venue: string
    format: string
    duration: string
    fee: string
  }>
  image?: { url: string; alt: string; width: number; height: number }
}

type RawSchedule = {
  dates?: string
  venue?: string
  duration?: string
  fees?: string
  fee?: string
  code?: string
  scope?: string
  quarter?: string
}

type RawCategory = {
  name: string
  slug: string
  sourceUrl?: string
  description?: string | null
}

type RawCourse = {
  title: string
  slug: string
  category: string
  sourceUrl?: string
  migrationStatus?: string
  overview?: string | null
  whyChoose?: string[] | null
  audience?: string[] | null
  objectives?: string[] | null
  deliveryApproach?: string[] | null
  syllabus?: string | null
  expectedOutcomes?: string[] | null
  organisationalImpact?: string[] | null
  personalImpact?: string[] | null
  brochureUrl?: string | null
  schedules?: RawSchedule[] | null
}

type RawInventory = {
  categories?: RawCategory[]
  courses?: RawCourse[]
}

const MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

function parseStartDateISO(datesStr: string): string | null {
  const match = datesStr.match(/(\d{1,2})\s+([A-Za-z]{3})(?:\s+(\d{4}))?/)
  if (!match) return null
  const day = match[1].padStart(2, '0')
  const month = MONTHS[match[2].toLowerCase()]
  if (!month) return null
  const yearMatch = datesStr.match(/\b(20\d{2})\b/)
  const year = match[3] || yearMatch?.[1] || '2026'
  return `${year}-${month}-${day}`
}

function categoryImageFor(slug: string, name: string) {
  const lower = `${slug} ${name}`.toLowerCase()
  let url = '/images/elevoris/corporate-training.jpg'
  if (lower.includes('ai') || lower.includes('analytics')) url = '/images/elevoris/course-ai.jpg'
  else if (
    lower.includes('finance') ||
    lower.includes('banking') ||
    lower.includes('budget') ||
    lower.includes('tax') ||
    lower.includes('treasury')
  )
    url = '/images/elevoris/course-finance.jpg'
  else if (lower.includes('oil') || lower.includes('energy') || lower.includes('hse'))
    url = '/images/elevoris/course-energy.jpg'
  else if (lower.includes('procurement') || lower.includes('supply') || lower.includes('port'))
    url = '/images/elevoris/course-procurement.jpg'
  else if (lower.includes('contract') || lower.includes('risk') || lower.includes('forensic'))
    url = '/images/elevoris/course-contracts.jpg'
  else if (
    lower.includes('leadership') ||
    lower.includes('diplomacy') ||
    lower.includes('communication') ||
    lower.includes('hr') ||
    lower.includes('project')
  )
    url = '/images/elevoris/course-leadership.jpg'

  return {
    url,
    alt: `${name} professional training`,
    width: 1200,
    height: 800,
  }
}

function toTextArray(items?: string[] | null): Array<{ text: string }> | null {
  if (!items?.length) return null
  return items.filter((text) => typeof text === 'string' && text.trim()).map((text) => ({ text }))
}

let cachedData: {
  categories: CatalogueCategory[]
  courses: CatalogueCourse[]
} | null = null

function loadInventory(): { categories: CatalogueCategory[]; courses: CatalogueCourse[] } {
  if (cachedData) return cachedData

  const inventoryPath = path.join(process.cwd(), 'migration', 'elevoris-source-inventory.json')
  let raw: RawInventory = { categories: [], courses: [] }
  try {
    raw = JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) as RawInventory
  } catch (err) {
    console.warn('[catalogue] Could not read elevoris-source-inventory.json:', err)
  }

  const categoryMap = new Map<string, CatalogueCategory>()
  const categories: CatalogueCategory[] = (raw.categories ?? [])
    .map((cat, index) => {
      const item: CatalogueCategory = {
        id: `cat-${index + 1}`,
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? null,
        parent: null,
        image: categoryImageFor(cat.slug, cat.name),
        migrationStatus: 'successfully-migrated',
      }
      categoryMap.set(cat.name, item)
      return item
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const courses: CatalogueCourse[] = (raw.courses ?? [])
    .map((course, index) => {
      const cat = categoryMap.get(course.category) ?? {
        id: `cat-fallback-${index}`,
        name: course.category || 'Professional Training',
        slug: (course.category || 'professional-training')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }

      const schedules: CatalogueSchedule[] = (course.schedules ?? []).map((s) => {
        const venue = (s.venue || 'Contact us').trim()
        const isOnline = venue.toLowerCase() === 'live/online'
        return {
          dates: s.dates || 'Schedule to be announced.',
          startDate: s.dates ? parseStartDateISO(s.dates) : null,
          endDate: null,
          venue,
          duration: s.duration ?? null,
          fee: s.fees ?? s.fee ?? 'Request a Quote',
          code: s.code ?? null,
          scope: s.scope ?? null,
          quarter: s.quarter ?? null,
          format: isOnline ? 'Live Online' : 'Classroom',
        }
      })

      const formats = new Set<string>()
      for (const s of schedules) {
        if (s.format === 'Live Online') formats.add('live-online')
        else formats.add('classroom')
      }

      return {
        id: `course-${index + 1}`,
        title: course.title,
        slug: course.slug,
        category: cat,
        subcategory: null,
        code: schedules[0]?.code ?? null,
        status: schedules.length > 0 ? 'currently-available' : 'not-currently-scheduled',
        migrationStatus: course.migrationStatus || 'successfully-migrated',
        sourceUrl: course.sourceUrl ?? null,
        image: categoryImageFor(cat.slug, cat.name),
        overview: course.overview ?? null,
        whyChoose: toTextArray(course.whyChoose),
        objectives: toTextArray(course.objectives),
        learningOutcomes: toTextArray(course.expectedOutcomes),
        audience: toTextArray(course.audience),
        prerequisites: null,
        deliveryApproach: toTextArray(course.deliveryApproach),
        syllabus: course.syllabus ?? null,
        organisationalImpact: toTextArray(course.organisationalImpact),
        personalImpact: toTextArray(course.personalImpact),
        assessmentAndCertification: null,
        generalNotes: null,
        formats: [...formats],
        schedules,
        brochureUrl: course.brochureUrl ?? null,
        seo: {
          title: course.title,
          description: course.overview ? course.overview.slice(0, 160) : null,
        },
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  cachedData = { categories, courses }
  return cachedData
}

function populatedCategory(
  value: CatalogueCourse['category'] | CatalogueCourse['subcategory'],
): CatalogueCategory | null {
  return value && typeof value === 'object' ? value : null
}

function cardImage(course: CatalogueCourse): CourseCardData['image'] {
  if (!course.image || typeof course.image !== 'object' || !course.image.url) return undefined
  return {
    url: course.image.url,
    alt: course.image.alt || `Professional training for ${course.title}`,
    width: course.image.width || 1200,
    height: course.image.height || 800,
  }
}

export function toCourseCard(course: CatalogueCourse): CourseCardData {
  const sortedSchedules = (course.schedules ?? [])
    .slice()
    .sort((a, b) => (a.startDate || a.dates).localeCompare(b.startDate || b.dates))
  const schedule = sortedSchedules[0]
  const category = populatedCategory(course.category)
  const subcategory = populatedCategory(course.subcategory)
  const formats = course.formats ?? []
  const scheduleVenues = [
    ...new Set((course.schedules ?? []).map((item) => item.venue.trim()).filter(Boolean)),
  ]
  const scheduleDurations = [
    ...new Set(
      (course.schedules ?? []).map((item) => (item.duration || '').trim()).filter(Boolean),
    ),
  ]
  const scheduleFormats = [
    ...new Set(
      (course.schedules ?? [])
        .map(
          (item) =>
            item.format ||
            (item.venue.trim().toLowerCase() === 'live/online' ? 'Live Online' : 'Classroom'),
        )
        .filter(Boolean),
    ),
  ]
  const scheduleDates = (course.schedules ?? [])
    .map((item) => item.startDate || '')
    .filter(Boolean)
    .sort()

  const upcomingSessions = sortedSchedules.slice(0, 3).map((item) => ({
    dates: item.dates,
    venue: item.venue.trim(),
    format:
      item.format ||
      (item.venue.trim().toLowerCase() === 'live/online' ? 'Live Online' : 'Classroom'),
    duration: (item.duration || '').trim() || 'Contact us',
    fee: item.fee || 'Request a Quote',
  }))

  return {
    slug: course.slug,
    title: course.title,
    category: category?.name || 'Uncategorized',
    categorySlug: category?.slug || '',
    subcategory: subcategory?.name || '',
    status: course.status,
    migrationStatus: course.migrationStatus,
    overview: course.overview || '',
    venue: schedule?.venue.trim() || 'Contact us',
    duration: schedule?.duration || 'Contact us',
    date: schedule?.dates || 'Schedule to be announced.',
    dateISO: schedule?.startDate || '',
    format:
      schedule?.format ||
      (schedule
        ? schedule.venue.trim().toLowerCase() === 'live/online'
          ? 'Live Online'
          : 'Classroom'
        : '') ||
      (formats.includes('live-online')
        ? 'Live Online'
        : formats.includes('classroom')
          ? 'Classroom'
          : 'Contact us'),
    fee: schedule?.fee || 'Request a Quote',
    venues: scheduleVenues,
    formats: scheduleFormats,
    durations: scheduleDurations,
    dateISOs: scheduleDates,
    sessionCount: sortedSchedules.length,
    upcomingSessions,
    image: cardImage(course),
  }
}

export async function getPublicCategories(): Promise<CatalogueCategory[]> {
  return loadInventory().categories
}

export async function getPublicCourses(): Promise<CatalogueCourse[]> {
  return loadInventory().courses
}

export async function getPublicCourse(slug: string): Promise<CatalogueCourse | null> {
  return loadInventory().courses.find((course) => course.slug === slug) ?? null
}

export async function getPublicCategory(slug: string): Promise<CatalogueCategory | null> {
  return loadInventory().categories.find((category) => category.slug === slug) ?? null
}

export async function getPublicBlogPosts(): Promise<BlogPost[]> {
  return []
}

export async function getPublicBlogPost(_slug: string): Promise<BlogPost | null> {
  return null
}
