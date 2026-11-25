import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublicCourses } from '@/lib/catalogue'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'International Training Locations',
  description:
    'Explore Elevoris professional training locations across Europe, the Middle East, Africa and Asia.',
}

function locationID(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default async function LocationsPage() {
  const courses = await getPublicCourses()
  const counts = new Map<string, number>()
  for (const course of courses) {
    for (const schedule of course.schedules ?? []) {
      const venue = schedule.venue.trim()
      counts.set(venue, (counts.get(venue) || 0) + 1)
    }
  }
  const trainingLocations = [...counts].sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      <main>
        <PageHero
          eyebrow="International training locations"
          title="Learn somewhere worth travelling to."
          intro="Train in leading business destinations across Europe, the GCC, Africa and Asia—or join from anywhere through live online delivery."
        />
        <section className="page-shell section-pad">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trainingLocations.map(([location, count], index) => (
              <article
                id={locationID(location)}
                className="group scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#96691e] hover:shadow-lg sm:p-6"
                key={location}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#96691e]">
                    {location.toLowerCase() === 'live/online'
                      ? 'Digital classroom'
                      : 'Training destination'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    {index + 1}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-[#081632] sm:mt-6 sm:text-2xl">
                  {location}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 tabular-nums">
                  {count} verified {count === 1 ? 'schedule' : 'schedules'}
                </p>
                <Link
                  className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[#96691e] hover:underline sm:mt-6"
                  href={`/courses?city=${encodeURIComponent(location)}`}
                >
                  Find training <ArrowIcon className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-[#081632] text-white">
          <div className="page-shell grid items-center gap-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-10">
            <div>
              <p className="eyebrow text-[#e2bd68]">In-house delivery</p>
              <h2 className="mt-3 font-display text-2xl font-semibold sm:text-4xl">
                We can come to you.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70 sm:mt-4 sm:leading-7">
                Elevoris delivers location-independent corporate programmes across the GCC, Africa,
                Europe, Asia, North America and beyond.
              </p>
            </div>
            <div className="lg:text-right">
              <Link className="btn-primary w-full sm:w-auto" href="/inquiry">
                Request corporate training <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
