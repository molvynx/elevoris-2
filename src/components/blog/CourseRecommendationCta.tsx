import Link from 'next/link'
import { ArrowRight, CalendarCheck2, Compass } from 'lucide-react'
import { getPublicCourses, toCourseCard, type CourseCardData } from '@/lib/catalogue'

export default async function CourseRecommendationCta({
  courseSlugs,
  heading = 'Recommended Elevoris Programmes',
  intro = 'Apply these frameworks directly with small-cohort, practitioner-led programmes delivered worldwide and Live Online.',
}: {
  courseSlugs?: string[]
  heading?: string
  intro?: string
}) {
  const allCourses = await getPublicCourses()
  const matched = (courseSlugs ?? [])
    .map((slug) => allCourses.find((course) => course.slug === slug))
    .filter((course): course is NonNullable<typeof course> => Boolean(course))

  const selected: CourseCardData[] = (
    matched.length > 0 ? matched.slice(0, 3) : allCourses.slice(0, 3)
  ).map(toCourseCard)

  return (
    <section
      aria-labelledby="course-cta-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(8,22,50,0.05)] sm:rounded-3xl sm:p-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Turn insight into capability</p>
          <h2
            id="course-cta-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-[#081632] sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-2.5 max-w-2xl text-sm leading-6 text-slate-600">{intro}</p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link href="/courses" className="btn-primary whitespace-nowrap">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Explore Courses
          </Link>
          <Link href="/inquiry" className="btn-outline whitespace-nowrap">
            <CalendarCheck2 className="h-4 w-4 text-[#96691e]" aria-hidden="true" />
            Book a Free Consultation
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {selected.map((course) => (
          <Link
            key={course.slug}
            href={`/courses/${course.slug}`}
            className="group flex flex-col rounded-xl border border-slate-200 bg-[#f9fbfd] p-4 transition hover:-translate-y-0.5 hover:border-[#c79a3c] hover:bg-white sm:p-5"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#96691e]">
              {course.category}
            </p>
            <h3 className="mt-2 font-display text-base font-semibold leading-snug text-[#081632] group-hover:text-[#96691e] sm:text-lg">
              {course.title}
            </h3>
            <p className="mt-2 text-xs text-slate-500 tabular-nums">
              {course.duration} · {course.format}
              {course.sessionCount > 0 ? ` · ${course.sessionCount} sessions` : ''}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-bold text-[#96691e] group-hover:underline">
              View programme <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
        <span>Planning bespoke in-house delivery for a team of 6 or more?</span>
        <Link href="/contact" className="font-bold text-[#96691e] hover:underline">
          Contact Elevoris advisors →
        </Link>
      </div>
    </section>
  )
}
