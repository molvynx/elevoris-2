import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import {
  formatBlogDate,
  getAllBlogArticles,
  getBlogCategories,
  getBlogCategoryBySlug,
  getFeaturedBlogArticle,
} from '@/lib/blog'
import { getSiteURL } from '@/lib/site-url'
import { SiteFooter } from '../SiteChrome'
import BlogBreadcrumbs from '@/components/blog/BlogBreadcrumbs'
import BlogDirectory from '@/components/blog/BlogDirectory'
import BlogNewsletter from '@/components/blog/BlogNewsletter'
import CourseRecommendationCta from '@/components/blog/CourseRecommendationCta'

export const metadata: Metadata = {
  title: 'Elevoris Blog — Career Growth, Certifications & Corporate Training Insights',
  description:
    'Practitioner-led articles on career progression, executive certifications, corporate L&D strategy, and applied study techniques from Elevoris.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: 'Elevoris Blog — Career Growth, Certifications & Corporate Training Insights',
    description:
      'Practitioner-led articles on career progression, executive certifications, corporate L&D strategy, and applied study techniques from Elevoris.',
    url: '/blog',
    images: ['/images/elevoris/hero-training.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevoris Blog — Career Growth, Certifications & Corporate Training Insights',
    description:
      'Practitioner-led articles on career progression, executive certifications, corporate L&D strategy, and applied study techniques.',
    images: ['/images/elevoris/hero-training.jpg'],
  },
}

export default function BlogPage() {
  const articles = getAllBlogArticles()
  const categories = getBlogCategories()
  const featured = getFeaturedBlogArticle()
  const featuredCategory = getBlogCategoryBySlug(featured.categorySlug)
  const siteUrl = getSiteURL()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Elevoris Blog & Executive Insights',
        description:
          'Practitioner-led articles on career progression, executive certifications, corporate L&D strategy, and applied study techniques.',
        url: `${siteUrl}/blog`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c') }}
      />
      <main>
        {/* Editorial Hero */}
        <section className="relative overflow-hidden bg-[#081632] py-10 text-white sm:py-16 lg:py-20">
          <div className="hero-grid absolute inset-0 opacity-30" />
          <div className="page-shell relative">
            <BlogBreadcrumbs
              dark
              items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
            />
            <p className="eyebrow text-[#e2bd68]">Elevoris Editorial &amp; Practitioner Insights</p>
            <h1 className="mt-2.5 max-w-4xl font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-balance sm:mt-4 sm:text-4xl lg:text-5xl">
              Practical perspectives for stronger leadership &amp; professional capability.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:mt-5 sm:text-base sm:leading-7">
              Research-backed frameworks from Elevoris faculty and advisors on career growth,
              accredited certifications, corporate training strategy, and study habits that transfer
              directly to the workplace.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-white/15 pt-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e2bd68]">
                Browse categories:
              </span>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="inline-flex min-h-9 items-center rounded-lg border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white/90 transition hover:border-[#e2bd68] hover:text-[#e2bd68] whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article Spotlight */}
        <section aria-labelledby="featured-article-heading" className="page-shell pt-10 sm:pt-14">
          <p id="featured-article-heading" className="eyebrow mb-4">
            Featured guide
          </p>
          <article className="grid items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(8,22,50,0.06)] sm:rounded-3xl lg:grid-cols-[1.1fr_1fr]">
            <Link
              href={`/blog/${featured.slug}`}
              className="relative block min-h-[240px] overflow-hidden bg-gradient-to-br from-[#081632] to-[#13294b] lg:min-h-full"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={featured.featuredImage}
                alt={featured.featuredImageAlt}
                width={1200}
                height={800}
                priority
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
              />
            </Link>

            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
                  <Link
                    href={`/blog/category/${featured.categorySlug}`}
                    className="font-bold uppercase tracking-[0.12em] text-[#96691e] hover:underline"
                  >
                    {featuredCategory?.name ?? featured.categorySlug}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <time dateTime={featured.publishedAt} className="tabular-nums">
                    {formatBlogDate(featured.publishedAt)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{featured.readingTimeMinutes} min read</span>
                </div>

                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-[-0.025em] text-[#081632] text-balance sm:text-3xl">
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="transition hover:text-[#96691e]"
                  >
                    {featured.title}
                  </Link>
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">
                  {featured.excerpt}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-sm font-semibold text-[#081632]">{featured.author.name}</p>
                  <p className="text-xs text-slate-500">{featured.author.role}</p>
                </div>
                <Link href={`/blog/${featured.slug}`} className="btn-primary whitespace-nowrap">
                  Read featured guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Interactive Search, Category Filters & Article Grid */}
        <section aria-labelledby="all-articles-heading" className="page-shell section-pad">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Knowledge archive</p>
              <h2 id="all-articles-heading" className="section-title mt-1.5 text-[#081632]">
                All Elevoris articles &amp; guides
              </h2>
            </div>
          </div>

          <BlogDirectory articles={articles} categories={categories} />
        </section>

        {/* Course Recommendation CTA */}
        <section className="page-shell pb-12 sm:pb-16">
          <CourseRecommendationCta
            courseSlugs={featured.relatedCourseSlugs}
            heading="Turn reading into certified workplace capability."
            intro="Explore our most requested leadership, finance, compliance, and AI programmes—each capped at 12 delegates with 30 days of facilitator support."
          />
        </section>

        {/* Newsletter Subscription */}
        <section className="page-shell pb-14 sm:pb-20">
          <BlogNewsletter />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
