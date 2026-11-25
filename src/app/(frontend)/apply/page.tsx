import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getPublicCourses } from '@/lib/catalogue'
import { PageHero, SiteFooter } from '../SiteChrome'
import CourseApplicationForm, { type ApplicationCourseOption } from './CourseApplicationForm'

export const metadata: Metadata = {
  title: 'Apply for Course',
  description:
    'Complete your Elevoris training application with your selected course and preferred scheduled session.',
  alternates: { canonical: '/apply' },
}

export default async function ApplyPage() {
  const courses = await getPublicCourses()

  const courseOptions: ApplicationCourseOption[] = courses.map((item) => ({
    slug: item.slug,
    title: item.title,
    category:
      item.category && typeof item.category === 'object'
        ? item.category.name
        : 'Professional Training',
    sessions: (item.schedules ?? []).map((s) =>
      [s.dates, s.venue, s.duration, s.format].filter(Boolean).join(' · '),
    ),
  }))

  return (
    <>
      <main>
        <PageHero
          eyebrow="Course application"
          title="Apply for an Elevoris programme."
          intro="Confirm your selected programme, preferred scheduled session, and delegate details. Review your application details cleanly before submitting to the Elevoris team."
        />
        <section className="page-shell section-pad">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-12">
            <div>
              <p className="eyebrow">Registration guidance</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[#081632] sm:text-3xl">
                Personalised delegate onboarding.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:leading-7">
                Select any verified Elevoris course and session. Cohorts are capped at a maximum of{' '}
                <strong>12 delegates</strong> to preserve direct facilitator interaction.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold text-[#081632]">Need direct assistance?</p>
                <div className="mt-3 space-y-2.5 text-sm">
                  <a
                    className="block font-bold text-[#96691e] hover:underline"
                    href="mailto:info@elevoris.com"
                  >
                    info@elevoris.com
                  </a>
                  <a
                    className="inline-flex items-center gap-2 font-bold text-[#147a3f] hover:underline"
                    href="https://wa.me/447405900092"
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp Elevoris (+44 7405 900 092)
                  </a>
                </div>
              </div>
              <div className="mt-5">
                <Link href="/courses" className="text-xs font-bold text-[#96691e] hover:underline">
                  ← Return to all {courses.length} training courses
                </Link>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="min-h-96 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  Loading course application…
                </div>
              }
            >
              <CourseApplicationForm courses={courseOptions} />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
