import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicCourse, getPublicCourses, type CatalogueCourse } from '@/lib/catalogue'
import { getSiteURL } from '@/lib/site-url'
import InquiryForm from '../../InquiryForm'
import { ArrowIcon, SiteFooter } from '../../SiteChrome'
import CourseScheduleApply from './CourseScheduleApply'

const statusLabels: Record<string, string> = {
  upcoming: 'Upcoming',
  'currently-available': 'Currently Available',
  'fully-booked': 'Fully Booked',
  'not-currently-scheduled': 'Not Currently Scheduled',
  'customized-training-available': 'Customized Training Available',
}

function categoryName(value: CatalogueCourse['category']) {
  return value && typeof value === 'object' ? value.name : 'Professional Training'
}

function textItems(items: Array<{ text: string }> | null | undefined) {
  return (items ?? []).filter((item) => item.text?.trim())
}

function BulletSection({
  title,
  items,
}: {
  title: string
  items: Array<{ text: string }> | null | undefined
}) {
  const safeItems = textItems(items)
  if (!safeItems.length) return null
  return (
    <section className="border-t border-slate-200 pt-7 sm:pt-10">
      <h2 className="font-display text-xl font-semibold text-[#081632] sm:text-2xl lg:text-3xl">
        {title}
      </h2>
      <ul className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
        {safeItems.map((item, index) => (
          <li
            className="flex gap-3 text-sm leading-6 text-slate-600 sm:gap-4 sm:leading-7"
            key={`${title}-${index}`}
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#96691e]" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function generateStaticParams() {
  const courses = await getPublicCourses()
  return courses.map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const course = await getPublicCourse((await params).slug)
  if (!course) return {}
  const description =
    course.seo?.description || course.overview || `Explore ${course.title} with Elevoris.`
  return {
    title: course.seo?.title || course.title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title: course.title, description },
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const course = await getPublicCourse((await params).slug)
  if (!course) notFound()

  const allCourses = await getPublicCourses()
  const category = categoryName(course.category)
  const categorySlug =
    course.category && typeof course.category === 'object' ? course.category.slug : ''
  const categoryId =
    course.category && typeof course.category === 'object' ? course.category.id : course.category
  const related = allCourses
    .filter((item) => {
      const itemCategory =
        item.category && typeof item.category === 'object' ? item.category.id : item.category
      return item.slug !== course.slug && itemCategory === categoryId
    })
    .slice(0, 3)
  const schedules = course.schedules ?? []
  const image =
    course.image && typeof course.image === 'object' && course.image.url ? course.image : null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.overview || undefined,
    provider: {
      '@type': 'Organization',
      name: 'Elevoris',
      url: getSiteURL(),
    },
    hasCourseInstance: schedules.map((schedule) => ({
      '@type': 'CourseInstance',
      courseMode: schedule.format || undefined,
      startDate: schedule.startDate || undefined,
      endDate: schedule.endDate || undefined,
      location: schedule.venue,
    })),
  }

  const durationsSummary =
    [...new Set(schedules.map((s) => (s.duration || '').trim()).filter(Boolean))].join(', ') ||
    'Customized duration available'
  const formatsSummary =
    [
      ...new Set(
        schedules.map(
          (s) =>
            s.format ||
            (s.venue.trim().toLowerCase() === 'live/online' ? 'Live Online' : 'Classroom'),
        ),
      ),
    ].join(' · ') || 'Classroom & Live Online'
  const venuesList = [...new Set(schedules.map((s) => s.venue.trim()).filter(Boolean))]
  const locationsSummary = venuesList.length
    ? venuesList.join(', ')
    : 'Global classroom, Live Online & In-house'

  return (
    <>
      <main className="pb-20 lg:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll('<', '\\u003c') }}
        />
        <section className="relative overflow-hidden bg-[#081632] text-white">
          {image && (
            <Image
              className="absolute inset-0 h-full w-full object-cover opacity-25"
              src={image.url!}
              alt=""
              width={image.width || 1600}
              height={image.height || 900}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#081632] via-[#081632]/95 to-[#081632]/55" />
          <div className="page-shell relative py-10 sm:py-20 lg:py-24">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#e2bd68]">
              <Link className="hover:underline" href="/courses">
                ← All programmes
              </Link>
              {categorySlug && (
                <>
                  <span className="text-white/30">/</span>
                  <Link className="hover:underline" href={`/categories/${categorySlug}`}>
                    {category}
                  </Link>
                </>
              )}
            </div>
            {!categorySlug && (
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[.16em] text-[#e2bd68] sm:mt-5">
                {category}
              </p>
            )}
            <h1 className="mt-3 max-w-4xl font-display text-[24px] font-semibold leading-[1.15] tracking-[-.03em] sm:mt-4 sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            {course.overview && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75 sm:mt-6 sm:text-base sm:leading-7">
                {course.overview}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/15 pt-4 text-xs font-semibold text-white/85 sm:mt-6 sm:gap-x-5 sm:pt-5">
              <span>
                Status:{' '}
                <strong className="text-[#e2bd68]">
                  {statusLabels[course.status] || course.status}
                </strong>
              </span>
              {course.code && (
                <span className="tabular-nums">
                  Code: <strong className="text-white">{course.code}</strong>
                </span>
              )}
              <span className="tabular-nums">
                Schedules:{' '}
                <strong className="text-white">
                  {schedules.length > 0
                    ? `${schedules.length} confirmed`
                    : 'Schedule to be announced.'}
                </strong>
              </span>
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-3.5 text-xs sm:mt-6 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#e2bd68]">
                  Duration
                </p>
                <p className="mt-1 font-semibold text-white">{durationsSummary}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#e2bd68]">
                  Training format
                </p>
                <p className="mt-1 font-semibold text-white">{formatsSummary}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#e2bd68]">
                  Available locations
                </p>
                <p className="mt-1 line-clamp-2 font-medium text-white/90">{locationsSummary}</p>
              </div>
              <div className="flex items-center lg:justify-end">
                <Link
                  href={`/apply?course=${encodeURIComponent(course.slug)}`}
                  data-advisor-protected="apply"
                  className="btn-primary min-h-10 w-full px-4 py-2 text-xs lg:w-auto"
                >
                  Apply for Course <ArrowIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell section-pad">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <div className="space-y-8 sm:space-y-10">
              {course.migrationStatus === 'partially-migrated' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                  Additional programme information is available from our training team. Contact{' '}
                  <a className="font-bold underline" href="mailto:info@elevoris.com">
                    info@elevoris.com
                  </a>{' '}
                  for the complete course outline and registration guidance.
                </div>
              )}
              <BulletSection title="Why choose this course?" items={course.whyChoose} />
              <BulletSection title="Learning objectives" items={course.objectives} />
              <BulletSection title="Learning outcomes" items={course.learningOutcomes} />
              <BulletSection title="Who should attend" items={course.audience} />
              <BulletSection title="Prerequisites" items={course.prerequisites} />
              <BulletSection title="Course delivery approach" items={course.deliveryApproach} />
              {course.syllabus && (
                <section className="border-t border-slate-200 pt-7 sm:pt-10">
                  <h2 className="font-display text-xl font-semibold text-[#081632] sm:text-2xl lg:text-3xl">
                    Complete course syllabus
                  </h2>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:mt-5 sm:p-8">
                    {course.syllabus.split('\n').map((line, index) => {
                      const value = line.trim()
                      if (!value) return null
                      const isModule = /^(?:MODULE|DAY|PART|UNIT)\s+\d+/i.test(value)
                      const isBullet =
                        value.startsWith('•') || value.startsWith('- ') || value.startsWith('* ')
                      return isModule ? (
                        <h3
                          className="mt-6 first:mt-0 text-xs font-bold uppercase tracking-[.16em] text-[#96691e] sm:mt-7"
                          key={index}
                        >
                          {value}
                        </h3>
                      ) : isBullet ? (
                        <p
                          className="mt-2 pl-4 text-sm leading-6 text-slate-600 sm:mt-2.5 sm:pl-5 sm:leading-7"
                          key={index}
                        >
                          <span className="-ml-4 mr-2.5 text-[#96691e] sm:-ml-5 sm:mr-3">•</span>
                          {value.replace(/^[•\-*]\s*/, '')}
                        </p>
                      ) : (
                        <h4
                          className="mt-2.5 font-display text-base font-semibold text-[#081632] sm:text-xl"
                          key={index}
                        >
                          {value}
                        </h4>
                      )
                    })}
                  </div>
                </section>
              )}
              <BulletSection title="Organisational impact" items={course.organisationalImpact} />
              <BulletSection title="Personal impact" items={course.personalImpact} />
              {course.assessmentAndCertification && (
                <section className="border-t border-slate-200 pt-7 sm:pt-10">
                  <h2 className="font-display text-xl font-semibold text-[#081632] sm:text-2xl lg:text-3xl">
                    Assessment and certification
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7">
                    {course.assessmentAndCertification}
                  </p>
                </section>
              )}
              <BulletSection title="General notes" items={course.generalNotes} />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
              <CourseScheduleApply
                courseSlug={course.slug}
                courseTitle={course.title}
                schedules={schedules}
                statusLabel={statusLabels[course.status] || course.status}
                brochureUrl={course.brochureUrl}
              />
            </aside>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-[#f7f2e8]">
            <div className="page-shell section-pad">
              <p className="eyebrow">Continue exploring</p>
              <h2 className="section-title mt-2">Related programmes.</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#96691e] sm:p-6"
                    href={`/courses/${item.slug}`}
                    key={item.slug}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#96691e]">
                      {categoryName(item.category)}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-[#081632] sm:text-xl">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-[#081632] text-white" data-advisor-zone="apply">
          <div className="page-shell flex flex-col items-start justify-between gap-5 py-8 sm:flex-row sm:items-center sm:py-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e2bd68]">
                Ready to join this programme?
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">
                Apply for {course.title}
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Select your preferred session in the schedule panel or continue with tailored dates.
              </p>
            </div>
            <Link
              href={`/apply?course=${encodeURIComponent(course.slug)}`}
              data-advisor-protected="apply"
              className="btn-primary w-full shrink-0 sm:w-auto"
            >
              Apply for Course <ArrowIcon />
            </Link>
          </div>
        </section>

        <section className="page-shell section-pad">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center sm:mb-8">
              <p className="eyebrow">Course enquiry</p>
              <h2 className="section-title mt-2">Let’s discuss your place.</h2>
            </div>
            <InquiryForm
              defaultCourse={course.title}
              courseOptions={allCourses.map((item) => ({ slug: item.slug, title: item.title }))}
              locationOptions={[
                ...new Set(
                  allCourses.flatMap((item) =>
                    (item.schedules ?? []).map((schedule) => schedule.venue.trim()),
                  ),
                ),
              ].sort()}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
