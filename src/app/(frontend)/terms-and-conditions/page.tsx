import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Elevoris legal terms availability notice.',
  alternates: { canonical: '/terms-and-conditions' },
}

export default function TermsPage() {
  return (
    <>
      <main>
        <PageHero
          eyebrow="Legal information"
          title="Terms and Conditions."
          intro="Request the current official terms for bookings, payments, cancellations, and programme participation."
        />
        <section className="page-shell section-pad">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-[#fbf6eb] p-6 sm:rounded-3xl sm:p-10">
            <p className="eyebrow">Official documentation</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#081632] sm:text-3xl">
              Request the current Terms and Conditions
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-700 sm:leading-7">
              Please contact Elevoris to receive the current official Terms and Conditions
              applicable to your programme, location, and booking arrangement.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-700 sm:leading-7">
              Our team can also answer questions about registration, invoicing, programme changes,
              cancellations, and corporate bookings.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-amber-200/80 pt-5 text-xs font-bold">
              <a
                className="btn-primary w-full sm:w-auto"
                href="mailto:info@elevoris.com?subject=Elevoris%20Terms%20and%20Conditions%20Request"
              >
                Email info@elevoris.com <ArrowIcon className="h-3.5 w-3.5" />
              </a>
              <Link className="btn-outline w-full sm:w-auto" href="/contact">
                Contact Elevoris
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
