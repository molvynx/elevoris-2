import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'About Elevoris',
  description:
    'Learn about Elevoris practitioner-led training, global delivery, quality standards and professional learning approach.',
}

export default function AboutPage() {
  return (
    <>
      <main>
        <PageHero
          eyebrow="About Elevoris"
          title="Learning that performs in the real world."
          intro="Elevoris is a global training and consulting firm delivering high-quality, practitioner-led programmes to professionals worldwide."
        />
        <section className="page-shell section-pad">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <Image
              className="aspect-[6/5] w-full rounded-2xl object-cover sm:rounded-[28px]"
              src="/images/elevoris/about-training.jpg"
              alt="Professionals learning together in a modern office"
              width={1200}
              height={1000}
            />
            <div>
              <p className="eyebrow">Our mission</p>
              <h2 className="section-title mt-2">Capability with measurable impact.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:mt-5 sm:leading-7">
                We are committed to learning outcomes that translate directly into improved
                professional performance and organisational capability. Every programme is designed
                to close a specific capability gap and support meaningful improvement back at work.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
                {[
                  ['40+', 'Global destinations'],
                  ['12', 'Maximum delegates'],
                  ['30 days', 'Post-programme support'],
                  ['ISO 9001', 'Quality certified'],
                ].map(([value, label]) => (
                  <div className="rounded-2xl bg-[#f7f2e8] p-4 sm:p-5" key={label}>
                    <p className="font-display text-xl font-semibold text-[#96691e] sm:text-2xl">
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="quality" className="bg-[#f7f2e8]">
          <div className="page-shell section-pad">
            <div className="mb-8 max-w-2xl">
              <p className="eyebrow">Why choose Elevoris</p>
              <h2 className="section-title mt-2">A higher standard of professional learning.</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  'Industry-focused',
                  'Programmes shaped around real-world standards and current industry demands.',
                ],
                [
                  'Expert-led',
                  'Experienced practitioners bring deep domain expertise to every cohort.',
                ],
                [
                  'Globally relevant',
                  'Curriculum aligned with international practice and evolving markets.',
                ],
                [
                  'Practical approach',
                  'Applied learning through real scenarios, discussion and case work.',
                ],
                [
                  'Flexible formats',
                  'Classroom, live online and in-house delivery for working professionals.',
                ],
                [
                  'Small cohorts',
                  'A maximum of 12 delegates supports meaningful facilitator engagement.',
                ],
                [
                  'Ongoing support',
                  'Thirty days of post-programme facilitator support is included.',
                ],
                ['Quality assured', 'ISO 9001:2015 quality management certification.'],
              ].map(([title, text], index) => (
                <div className="bg-white p-5 sm:p-7" key={title}>
                  <span className="text-xs font-bold text-[#96691e] tabular-nums">{index + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-[#081632] sm:mt-5 sm:text-xl">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:leading-6">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="page-shell section-pad">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Delegate experience</p>
            <blockquote className="mt-5 font-display text-xl font-medium leading-relaxed text-[#081632] sm:mt-6 sm:text-3xl">
              “The curriculum was industry-focused and well-structured. The mentors were
              approachable and always ready to clear doubts.”
            </blockquote>
            <p className="mt-4 text-xs font-bold text-slate-500">Yuyen S. · IT Consultant</p>
            <Link className="btn-primary mt-7 sm:mt-8" href="/courses">
              Explore programmes <ArrowIcon />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
