import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getBlogArticlesByCategory,
  getBlogCategories,
  getBlogCategoryBySlug,
} from '@/lib/blog'
import { getSiteURL } from '@/lib/site-url'
import { SiteFooter } from '../../../SiteChrome'
import BlogBreadcrumbs from '@/components/blog/BlogBreadcrumbs'
import BlogCard from '@/components/blog/BlogCard'
import BlogNewsletter from '@/components/blog/BlogNewsletter'
import CourseRecommendationCta from '@/components/blog/CourseRecommendationCta'

export async function generateStaticParams() {
  return getBlogCategories().map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = getBlogCategoryBySlug(slug)
  if (!category) return {}

  const canonical = `/blog/category/${category.slug}`
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: category.seoTitle,
      description: category.seoDescription,
      url: canonical,
      images: ['/images/elevoris/about-training.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.seoTitle,
      description: category.seoDescription,
      images: ['/images/elevoris/about-training.jpg'],
    },
  }
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getBlogCategoryBySlug(slug)
  if (!category) notFound()

  const allCategories = getBlogCategories()
  const articles = getBlogArticlesByCategory(category.slug)
  const siteUrl = getSiteURL()
  const canonicalUrl = `${siteUrl}/blog/category/${category.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: category.seoTitle,
        description: category.seoDescription,
        url: canonicalUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
          { '@type': 'ListItem', position: 3, name: category.name, item: canonicalUrl },
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
        {/* Category Hero */}
        <section className="relative overflow-hidden bg-[#081632] py-10 text-white sm:py-16 lg:py-20">
          <div className="hero-grid absolute inset-0 opacity-30" />
          <div className="page-shell relative">
            <BlogBreadcrumbs
              dark
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { label: category.name },
              ]}
            />
            <p className="eyebrow text-[#e2bd68]">Blog category</p>
            <h1 className="mt-2.5 max-w-4xl font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-balance sm:mt-4 sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:mt-5 sm:text-base sm:leading-7">
              {category.description}
            </p>

            {/* Category Switcher */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/15 pt-5">
              <Link
                href="/blog"
                className="inline-flex min-h-9 items-center rounded-lg border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white/85 transition hover:border-[#e2bd68] hover:text-[#e2bd68] whitespace-nowrap"
              >
                All Topics
              </Link>
              {allCategories.map((item) => {
                const isCurrent = item.slug === category.slug
                return (
                  <Link
                    key={item.slug}
                    href={`/blog/category/${item.slug}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`inline-flex min-h-9 items-center rounded-lg px-3.5 text-xs font-bold whitespace-nowrap transition ${
                      isCurrent
                        ? 'bg-[#c79a3c] text-[#081632]'
                        : 'border border-white/20 bg-white/5 text-white/90 hover:border-[#e2bd68] hover:text-[#e2bd68]'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Category Articles */}
        <section className="page-shell section-pad">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600 tabular-nums">
              <strong className="text-[#081632]">{articles.length}</strong>{' '}
              {articles.length === 1 ? 'article' : 'articles'} in {category.name}
            </p>
            <Link href="/blog" className="text-xs font-bold text-[#96691e] hover:underline">
              ← Back to all Elevoris articles
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <BlogCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <h2 className="font-display text-2xl font-semibold text-[#081632]">
                New articles coming soon in {category.name}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
                Explore our full editorial archive or browse verified Elevoris training courses.
              </p>
              <Link href="/blog" className="btn-primary mt-6">
                View all articles
              </Link>
            </div>
          )}
        </section>

        {/* Category Course Recommendations */}
        <section className="page-shell pb-12 sm:pb-16">
          <CourseRecommendationCta
            courseSlugs={category.recommendedCourseSlugs}
            heading={`Relevant Elevoris courses for ${category.name}`}
            intro="Bridge insight and execution with upcoming small-cohort programmes aligned to this topic."
          />
        </section>

        {/* Newsletter */}
        <section className="page-shell pb-14 sm:pb-20">
          <BlogNewsletter defaultTopic={category.name} />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
