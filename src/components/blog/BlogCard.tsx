import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatBlogDate, getBlogCategoryBySlug, type BlogArticle } from '@/lib/blog'

export default function BlogCard({ article }: { article: BlogArticle }) {
  const category = getBlogCategoryBySlug(article.categorySlug)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#c79a3c] hover:shadow-[0_14px_32px_rgba(8,22,50,0.08)]">
      <Link
        href={`/blog/${article.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#081632] to-[#13294b]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={article.featuredImage}
          alt={article.featuredImageAlt}
          width={960}
          height={600}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500">
          <Link
            href={`/blog/category/${article.categorySlug}`}
            className="font-bold uppercase tracking-[0.12em] text-[#96691e] hover:underline"
          >
            {category?.name ?? article.categorySlug}
          </Link>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt} className="tabular-nums">
            {formatBlogDate(article.publishedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{article.readingTimeMinutes} min read</span>
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-[#081632] sm:text-xl">
          <Link
            href={`/blog/${article.slug}`}
            className="transition hover:text-[#96691e] focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#081632]">{article.author.name}</p>
            <p className="truncate text-[11px] text-slate-500">{article.author.role}</p>
          </div>
          <Link
            href={`/blog/${article.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-bold text-[#96691e] transition group-hover:translate-x-0.5 hover:underline whitespace-nowrap"
          >
            Read article <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
