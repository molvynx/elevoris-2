import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'Corporate Training',
  description:
    'Plan practitioner-led in-house and tailored corporate training with Elevoris for focused professional cohorts.',
  alternates: { canonical: '/corporate-training' },
}

export default function CorporateTrainingPage() {
  return (
    <>
      <main>
        <PageHero
          eyebrow="Corporate training"
          title="Build capability around the work that matters."
          intro="Elevoris supports organisations with practitioner-led, in-house and tailored training delivered around team priorities."
        />
        <section className="page-shell section-pad">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-10">
            <div>
              <p className="eyebrow">A focused learning partnership</p>
              <h2 className="section-title mt-3">Designed for practical organisational impact.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:leading-7">
                Programmes can be discussed for classroom, live online or in-house delivery.
                Elevoris uses practitioner-led facilitation, focused cohorts of up to 12
                participants and 30 days of post-programme facilitator support.
              </p>
            </div>
            <aside className="rounded-2xl bg-[#081632] p-6 text-white sm:rounded-3xl sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#e2bd68]">
                Start a conversation
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold sm:mt-4 sm:text-3xl">
                Tell us what success requires.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70 sm:mt-4 sm:leading-7">
                Share your objectives, audience, preferred location and dates for a verified
                proposal.
              </p>
              <Link className="btn-primary mt-6 w-full sm:w-auto" href="/inquiry">
                Request a proposal <ArrowIcon />
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
