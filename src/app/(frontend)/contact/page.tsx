import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Elevoris for course selection, international training support and corporate training proposals.',
}

export default function ContactPage() {
  return (
    <>
      <main>
        <PageHero
          eyebrow="Contact Elevoris"
          title="Start a conversation with our team."
          intro="Whether you are selecting a programme, planning corporate training or arranging international travel, our advisors are ready to help."
        />
        <section className="page-shell section-pad">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['General enquiries', 'info@elevoris.com', 'mailto:info@elevoris.com', false],
              ['Telephone', '+44 7405 900 092', 'tel:+447405900092', false],
              ['WhatsApp Business', 'Message Elevoris', 'https://wa.me/447405900092', true],
              ['Training proposal', 'Submit your requirements', '/inquiry', false],
            ].map(([title, value, href, external]) => (
              <div
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                key={String(title)}
              >
                <div>
                  <p className="eyebrow">{title}</p>
                  <h2 className="mt-3 font-display text-lg font-semibold text-[#081632] sm:mt-4 sm:text-xl">
                    {value}
                  </h2>
                </div>
                {external ? (
                  <a
                    className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[#96691e] hover:underline"
                    href={String(href)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Message on WhatsApp <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[#96691e] hover:underline"
                    href={String(href)}
                  >
                    Get in touch <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl bg-[#081632] text-white sm:mt-12 sm:rounded-[28px]">
            <div className="grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:gap-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e2bd68]">
                  International support
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                  Need help choosing a course?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                  Use the AI Training Advisor for immediate course guidance, or send your
                  requirements for a personalised response from our team.
                </p>
              </div>
              <Link className="btn-primary min-h-12 w-full sm:w-auto" href="/inquiry">
                Send an inquiry <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
