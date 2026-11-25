import InquiryForm from '../InquiryForm'
import type { Metadata } from 'next'
import { PageHero, SiteFooter } from '../SiteChrome'
import { getPublicCourses } from '@/lib/catalogue'

export const metadata: Metadata = {
  title: 'International Training Inquiry',
  description:
    'Request verified availability and pricing for Elevoris classroom, online, in-house and bespoke corporate training.',
}

export default async function InquiryPage() {
  const courses = await getPublicCourses()
  const locations = [
    ...new Set(
      courses.flatMap((course) =>
        (course.schedules ?? []).map((schedule) => schedule.venue.trim()),
      ),
    ),
  ].sort()
  return (
    <>
      <main>
        <PageHero
          eyebrow="International customer inquiry"
          title="Tell us what your team needs."
          intro="Share your learning goals, location and budget. Our team will confirm availability and provide a verified quotation in your preferred currency."
        />
        <section className="page-shell section-pad">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-12">
            <div>
              <p className="eyebrow">Speak with Elevoris</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[#081632] sm:text-3xl">
                A global team, ready to help.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:leading-7">
                We support individual delegates and organisations across Europe, the GCC, Africa,
                Asia, North America and beyond.
              </p>
              <div className="mt-6 space-y-3 text-sm">
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
                  WhatsApp Business (+44 7405 900 092)
                </a>
              </div>
              <div className="mt-6 rounded-2xl bg-[#f7f2e8] p-5 sm:mt-8 sm:p-6">
                <p className="text-xs font-bold text-[#081632]">What happens next?</p>
                <ol className="mt-3 space-y-2.5 text-xs leading-5 text-slate-600">
                  <li>1. We review your requirements.</li>
                  <li>2. An advisor confirms the best-fit options.</li>
                  <li>3. You receive verified availability and pricing.</li>
                </ol>
              </div>
            </div>
            <InquiryForm
              courseOptions={courses.map((course) => ({ slug: course.slug, title: course.title }))}
              locationOptions={locations}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
