import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'Training Solutions',
  description:
    'Explore Elevoris classroom, live online, in-house and tailored corporate training solutions.',
  alternates: { canonical: '/training-solutions' },
}

const solutions = [
  {
    id: 'classroom',
    title: 'Classroom programmes',
    text: 'Practitioner-led learning in global business destinations, designed for focused cohorts and applied professional development.',
  },
  {
    id: 'live-online',
    title: 'Live online training',
    text: 'Interactive facilitator-led programmes for delegates who need the structure of a live classroom with remote access.',
  },
  {
    id: 'in-house',
    title: 'In-house delivery',
    text: 'Bring Elevoris facilitation to your organisation and align delivery with your team, location and operational priorities.',
  },
  {
    id: 'bespoke',
    title: 'Tailored corporate programmes',
    text: 'Discuss a programme shaped around your organisation’s capability goals, preferred dates and delivery requirements.',
  },
]

export default function TrainingSolutionsPage() {
  return (
    <>
      <main>
        <PageHero
          eyebrow="Training solutions"
          title="Flexible delivery. Rigorous professional learning."
          intro="Choose classroom, live online or in-house delivery, or speak with Elevoris about a programme tailored to your organisation."
        />
        <section className="page-shell section-pad">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            {solutions.map((solution, index) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(7,19,41,.05)] sm:rounded-3xl sm:p-8"
                id={solution.id}
                key={solution.id}
              >
                <p className="eyebrow tabular-nums">Solution {index + 1}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-[#081632] sm:text-3xl">
                  {solution.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7">
                  {solution.text}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary w-full sm:w-auto" href="/corporate-training">
              Corporate training <ArrowIcon />
            </Link>
            <Link className="btn-outline w-full sm:w-auto" href="/inquiry">
              Request a proposal
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
