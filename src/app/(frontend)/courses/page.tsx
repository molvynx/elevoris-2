import CourseExplorer from '../CourseExplorer'
import type { Metadata } from 'next'
import { PageHero, SiteFooter } from '../SiteChrome'
import { getPublicCourses, toCourseCard } from '@/lib/catalogue'

export const metadata: Metadata = {
  title: 'Training Courses',
  description:
    'Find Elevoris classroom and live online professional training by category, country, city, date and delivery format.',
}

export default async function CoursesPage() {
  const catalogue = await getPublicCourses()
  return (
    <>
      <main>
        <PageHero
          eyebrow="Course finder"
          title="Professional training for your next level of performance."
          intro="Search verified Elevoris programmes by subject, country, city, date and delivery format."
        />
        <section className="page-shell section-pad">
          <CourseExplorer courses={catalogue.map(toCourseCard)} />
        </section>
        <section className="bg-[#081632] text-white">
          <div className="page-shell flex flex-col justify-between gap-5 py-10 sm:py-14 md:flex-row md:items-center md:gap-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/60">
                Need a tailored recommendation?
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                Ask our AI Training Advisor.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/70">
              Use the advisor in the corner to compare courses, explore locations or narrow options
              around your interests and budget.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
