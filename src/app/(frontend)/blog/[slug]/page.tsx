import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Info, RefreshCw } from 'lucide-react'
import {
  extractTableOfContents,
  formatBlogDate,
  getAllBlogArticles,
  getBlogArticleBySlug,
  getBlogCategoryBySlug,
  getRelatedBlogArticles,
} from '@/lib/blog'
import { getSiteURL } from '@/lib/site-url'
import { SiteFooter } from '../../SiteChrome'
import BlogBreadcrumbs from '@/components/blog/BlogBreadcrumbs'
import BlogCard from '@/components/blog/BlogCard'
import BlogNewsletter from '@/components/blog/BlogNewsletter'
import CourseRecommendationCta from '@/components/blog/CourseRecommendationCta'
import ShareActions from '@/components/blog/ShareActions'
import TableOfContents from '@/components/blog/TableOfContents'

export async function generateStaticParams() {
  return getAllBlogArticles().map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticleBySlug(slug)
  if (!article) return {}

  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical: article.canonicalUrl },
    openGraph: {
      type: 'article',
      title: article.seoTitle,
      description: article.seoDescription,
      url: article.canonicalUrl,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 800,
          alt: article.featuredImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle,
      description: article.seoDescription,
      images: [article.featuredImage],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getBlogArticleBySlug(slug)
  if (!article) notFound()

  const category = getBlogCategoryBySlug(article.categorySlug)
  const headings = extractTableOfContents(article)
  const relatedArticles = getRelatedBlogArticles(article, 3)
  const siteUrl = getSiteURL()

  const jsonLdGraph: Array<Record<string, unknown>> = [
    {
      '@type': 'Article',
      headline: article.title,
      description: article.seoDescription,
      image: [`${siteUrl}${article.featuredImage}`],
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Person',
        name: article.author.name,
        jobTitle: article.author.role,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Elevoris',
        url: siteUrl,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${siteUrl}${article.canonicalUrl}`,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
        {
          '@type': 'ListItem',
          position: 3,
          name: category?.name ?? article.categorySlug,
          item: `${siteUrl}/blog/category/${article.categorySlug}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: article.title,
          item: `${siteUrl}${article.canonicalUrl}`,
        },
      ],
    },
  ]

  if (article.faqs.length > 0) {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: article.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLdGraph }).replaceAll(
            '<',
            '\\u003c',
          ),
        }}
      />

      <main>
        <article>
          {/* Article Header */}
          <header className="relative overflow-hidden bg-[#081632] py-10 text-white sm:py-16 lg:py-20">
            <div className="hero-grid absolute inset-0 opacity-25" />
            <div className="page-shell relative max-w-5xl">
              <BlogBreadcrumbs
                dark
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Blog', href: '/blog' },
                  {
                    label: category?.name ?? article.categorySlug,
                    href: `/blog/category/${article.categorySlug}`,
                  },
                  { label: article.title },
                ]}
              />

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-white/75">
                <Link
                  href={`/blog/category/${article.categorySlug}`}
                  className="font-bold uppercase tracking-[0.14em] text-[#e2bd68] hover:underline"
                >
                  {category?.name ?? article.categorySlug}
                </Link>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="h-3.5 w-3.5 text-[#e2bd68]" aria-hidden="true" />
                  {article.readingTimeMinutes} min read
                </span>
              </div>

              <h1 className="mt-3 max-w-4xl font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-balance sm:mt-4 sm:text-4xl lg:text-[46px]">
                {article.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/80 sm:mt-5 sm:text-lg sm:leading-8">
                {article.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/75">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e2bd68]/40 bg-[#0d2147] font-display text-xs font-bold text-[#e2bd68]"
                    aria-hidden="true"
                  >
                    {article.author.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{article.author.name}</p>
                    <p className="text-[11px] text-white/65">{article.author.role}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] sm:text-xs">
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Calendar className="h-3.5 w-3.5 text-[#e2bd68]" aria-hidden="true" />
                    Published:{' '}
                    <time dateTime={article.publishedAt} className="font-semibold text-white">
                      {formatBlogDate(article.publishedAt)}
                    </time>
                  </span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <RefreshCw className="h-3.5 w-3.5 text-[#e2bd68]" aria-hidden="true" />
                    Updated:{' '}
                    <time dateTime={article.updatedAt} className="font-semibold text-white">
                      {formatBlogDate(article.updatedAt)}
                    </time>
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image & Share Bar */}
          <div className="page-shell max-w-5xl pt-8 sm:pt-12">
            <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#081632] to-[#13294b] sm:rounded-3xl">
              <Image
                src={article.featuredImage}
                alt={article.featuredImageAlt}
                width={1400}
                height={800}
                priority
                referrerPolicy="no-referrer"
                className="aspect-[16/9] w-full object-cover"
              />
              {article.featuredImageCaption && (
                <figcaption className="border-t border-slate-200 bg-white px-5 py-3 text-xs italic text-slate-500">
                  {article.featuredImageCaption}
                </figcaption>
              )}
            </figure>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <ShareActions title={article.title} canonicalPath={article.canonicalUrl} />
              <Link
                href="/inquiry"
                className="text-xs font-bold text-[#96691e] hover:underline whitespace-nowrap"
              >
                Book a free training consultation →
              </Link>
            </div>
          </div>

          {/* Main Reading Grid: 70% Comfortable Reading Column + 30% Sticky TOC */}
          <div className="page-shell max-w-5xl py-10 sm:py-14">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
              <div className="min-w-0">
                {/* Mobile/Tablet TOC */}
                <TableOfContents headings={headings} />

                {/* Structured Editorial Content */}
                <div className="max-w-[70ch] space-y-6 text-[15px] leading-[1.78] text-slate-700 sm:text-base">
                  {article.blocks.map((block, index) => {
                    if (block.type === 'heading') {
                      if (block.level === 2) {
                        return (
                          <h2
                            key={`${block.id}-${index}`}
                            id={block.id}
                            className="scroll-mt-28 pt-5 font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-[#081632] sm:text-3xl"
                          >
                            {block.text}
                          </h2>
                        )
                      }
                      return (
                        <h3
                          key={`${block.id}-${index}`}
                          id={block.id}
                          className="scroll-mt-28 pt-2 font-display text-lg font-semibold leading-snug text-[#081632] sm:text-xl"
                        >
                          {block.text}
                        </h3>
                      )
                    }

                    if (block.type === 'paragraph') {
                      return <p key={index}>{block.text}</p>
                    }

                    if (block.type === 'list') {
                      const ListTag = block.ordered ? 'ol' : 'ul'
                      return (
                        <ListTag
                          key={index}
                          className={`space-y-2.5 pl-5 ${
                            block.ordered ? 'list-decimal' : 'list-disc'
                          } marker:font-semibold marker:text-[#96691e]`}
                        >
                          {block.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="pl-1">
                              {item}
                            </li>
                          ))}
                        </ListTag>
                      )
                    }

                    if (block.type === 'callout') {
                      return (
                        <aside
                          key={index}
                          className="my-6 rounded-2xl border border-amber-200/90 bg-[#fbf6eb] p-5 sm:p-6"
                        >
                          <div className="flex items-start gap-3">
                            <Info
                              className="mt-0.5 h-5 w-5 shrink-0 text-[#96691e]"
                              aria-hidden="true"
                            />
                            <div>
                              <p className="font-display text-base font-semibold text-[#081632]">
                                {block.title}
                              </p>
                              <p className="mt-1.5 text-sm leading-6 text-slate-700">{block.body}</p>
                            </div>
                          </div>
                        </aside>
                      )
                    }

                    if (block.type === 'quote') {
                      return (
                        <figure
                          key={index}
                          className="my-8 border-y border-slate-200 py-6 text-center sm:px-6 sm:py-8"
                        >
                          <blockquote className="font-display text-lg font-medium italic leading-relaxed text-[#081632] sm:text-xl">
                            “{block.quote}”
                          </blockquote>
                          <figcaption className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#96691e]">
                            {block.attribution}
                          </figcaption>
                        </figure>
                      )
                    }

                    if (block.type === 'table') {
                      return (
                        <div
                          key={index}
                          className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs sm:text-sm">
                              {block.caption && (
                                <caption className="border-b border-slate-100 bg-[#f9fbfd] px-4 py-3 text-left text-xs font-semibold text-slate-600">
                                  {block.caption}
                                </caption>
                              )}
                              <thead>
                                <tr className="border-b border-slate-200 bg-[#081632] text-white">
                                  {block.headers.map((header) => (
                                    <th
                                      key={header}
                                      scope="col"
                                      className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em]"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {block.rows.map((row, rowIdx) => (
                                  <tr key={rowIdx} className="hover:bg-[#f9fbfd]">
                                    {row.map((cell, cellIdx) => (
                                      <td
                                        key={cellIdx}
                                        className={`px-4 py-3 align-top leading-5 ${
                                          cellIdx === 0
                                            ? 'font-semibold text-[#081632]'
                                            : 'text-slate-600 tabular-nums'
                                        }`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    }

                    return null
                  })}
                </div>

                {/* FAQ Section */}
                {article.faqs.length > 0 && (
                  <section
                    aria-labelledby="article-faq-heading"
                    className="mt-12 border-t border-slate-200 pt-10"
                  >
                    <p className="eyebrow">Frequently asked questions</p>
                    <h2
                      id="article-faq-heading"
                      className="mt-2 font-display text-2xl font-semibold text-[#081632] sm:text-3xl"
                    >
                      Key questions answered
                    </h2>
                    <div className="mt-5 space-y-3">
                      {article.faqs.map((faq) => (
                        <details
                          key={faq.question}
                          className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-[#c79a3c]"
                        >
                          <summary className="cursor-pointer list-none font-display text-base font-semibold text-[#081632] marker:hidden">
                            <span className="flex items-start justify-between gap-4">
                              <span>{faq.question}</span>
                              <span className="shrink-0 text-sm font-bold text-[#96691e]">+</span>
                            </span>
                          </summary>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {/* Author Profile Card */}
                <section
                  aria-label="About the author"
                  className="mt-12 rounded-2xl border border-slate-200 bg-[#f7f2e8] p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#081632] font-display text-base font-bold text-[#e2bd68]"
                      aria-hidden="true"
                    >
                      {article.author.initials}
                    </span>
                    <div>
                      <p className="eyebrow">Written by</p>
                      <h2 className="mt-1 font-display text-xl font-semibold text-[#081632]">
                        {article.author.name}
                      </h2>
                      <p className="mt-0.5 text-xs font-semibold text-[#96691e]">
                        {article.author.role} · {article.author.credentials}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{article.author.bio}</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Desktop Sticky Table of Contents Rail */}
              <div className="hidden lg:block">
                <TableOfContents headings={headings} />
              </div>
            </div>
          </div>
        </article>

        {/* Course Recommendation CTA */}
        <section className="page-shell max-w-5xl pb-12 sm:pb-16">
          <CourseRecommendationCta
            courseSlugs={article.relatedCourseSlugs}
            heading="Continue with related Elevoris programmes"
            intro="Put the ideas from this guide into practice with upcoming classroom and Live Online cohorts."
          />
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section
            aria-labelledby="related-articles-heading"
            className="border-t border-slate-200 bg-[#f7f2e8]/60"
          >
            <div className="page-shell section-pad">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Continue reading</p>
                  <h2 id="related-articles-heading" className="section-title mt-1.5 text-[#081632]">
                    Related Elevoris articles
                  </h2>
                </div>
                <Link href="/blog" className="btn-outline bg-white">
                  View all articles
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.map((related) => (
                  <BlogCard key={related.id} article={related} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Subscription */}
        <section className="page-shell py-12 sm:py-16">
          <BlogNewsletter defaultTopic={category?.name ?? 'All Insights'} variant="navy" />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
