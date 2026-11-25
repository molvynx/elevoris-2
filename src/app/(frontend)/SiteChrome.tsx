import Link from 'next/link'
import Image from 'next/image'

const logo = '/images/elevoris/elevoris-logo.png'

export function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[#081632] text-white">
      <div className="page-shell grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
        <div className="col-span-2 lg:col-span-1">
          <Image
            src={logo}
            alt="Elevoris — Elevate Your Excellence"
            className="h-12 w-auto object-contain sm:h-14"
            width={157}
            height={119}
          />
          <p className="mt-3 max-w-xs text-xs leading-6 text-white/60 sm:mt-4">
            Premium, practitioner-led training for professionals and organisations worldwide.
          </p>
        </div>
        <div>
          <h3 className="footer-title">Courses</h3>
          <Link className="footer-link" href="/courses">
            Course Finder
          </Link>
          <Link className="footer-link" href="/categories">
            Course Categories
          </Link>
          <Link className="footer-link" href="/apply">
            Apply for Course
          </Link>
          <Link className="footer-link" href="/courses#catalog">
            Training Calendar
          </Link>
          <Link className="footer-link" href="/locations">
            Locations
          </Link>
          <Link className="footer-link" href="/training-solutions">
            Training Solutions
          </Link>
        </div>
        <div>
          <h3 className="footer-title">Elevoris</h3>
          <Link className="footer-link" href="/about">
            About Us
          </Link>
          <Link className="footer-link" href="/about#quality">
            Quality &amp; Certifications
          </Link>
          <Link className="footer-link" href="/corporate-training">
            Corporate Training
          </Link>
          <Link className="footer-link" href="/contact">
            Contact Us
          </Link>
          <Link className="footer-link" href="/blog">
            Insights
          </Link>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <h3 className="footer-title">Get in touch</h3>
          <a className="footer-link font-medium text-white/80" href="mailto:info@elevoris.com">
            info@elevoris.com
          </a>
          <a className="footer-link" href="tel:+447405900092">
            +44 7405 900 092
          </a>
          <a
            className="footer-link font-bold text-[#e2bd68]"
            href="https://wa.me/447405900092"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Elevoris
          </a>
          <Link className="footer-link" href="/terms-and-conditions">
            Terms and Conditions
          </Link>
          <Link
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#e2bd68] hover:underline"
            href="/inquiry"
          >
            Send an enquiry <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell flex flex-col gap-1.5 py-5 text-[11px] text-white/45 sm:flex-row sm:justify-between">
          <p>© 2026 Elevoris. All rights reserved.</p>
          <p>ISO 9001:2015 quality management certified</p>
        </div>
      </div>
    </footer>
  )
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string
  title: string
  intro: string
}) {
  return (
    <section className="relative overflow-hidden bg-[#081632] py-10 text-white sm:py-16 lg:py-20">
      <div className="hero-grid absolute inset-0 opacity-30" />
      <div className="page-shell relative">
        <p className="eyebrow text-[#e2bd68]">{eyebrow}</p>
        <h1 className="mt-2.5 max-w-4xl font-display text-[26px] font-semibold leading-[1.14] tracking-[-.03em] sm:mt-4 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:mt-5 sm:text-base sm:leading-7">
          {intro}
        </p>
      </div>
    </section>
  )
}
