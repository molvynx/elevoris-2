'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, X } from 'lucide-react'
import type { BlogArticle, BlogCategory, BlogCategorySlug } from '@/lib/blog'
import BlogCard from './BlogCard'

const INITIAL_PAGE_SIZE = 6
const LOAD_MORE_STEP = 6

export default function BlogDirectory({
  articles,
  categories,
}: {
  articles: BlogArticle[]
  categories: BlogCategory[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | BlogCategorySlug>('all')
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const cat = params.get('category') as BlogCategorySlug | null
    if (q) setSearchQuery(q)
    if (cat && categories.some((item) => item.slug === cat)) {
      setActiveCategory(cat)
    }
  }, [categories])

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return articles.filter((article) => {
      if (activeCategory !== 'all' && article.categorySlug !== activeCategory) {
        return false
      }
      if (!q) return true
      const categoryName = categories.find((c) => c.slug === article.categorySlug)?.name ?? ''
      const blockText = article.blocks
        .map((block) => {
          if (block.type === 'paragraph' || block.type === 'heading') return block.text
          if (block.type === 'callout') return `${block.title} ${block.body}`
          if (block.type === 'quote') return block.quote
          if (block.type === 'list') return block.items.join(' ')
          if (block.type === 'table') return [...block.headers, ...block.rows.flat()].join(' ')
          return ''
        })
        .join(' ')
      const haystack = [
        article.title,
        article.excerpt,
        article.author.name,
        categoryName,
        blockText,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [articles, categories, activeCategory, searchQuery])

  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const hasMore = visibleArticles.length < filteredArticles.length

  function selectCategory(next: 'all' | BlogCategorySlug) {
    setActiveCategory(next)
    setVisibleCount(INITIAL_PAGE_SIZE)
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setVisibleCount(INITIAL_PAGE_SIZE)
  }

  function clearFilters() {
    setSearchQuery('')
    setActiveCategory('all')
    setVisibleCount(INITIAL_PAGE_SIZE)
  }

  return (
    <div>
      {/* Search & Category Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(8,22,50,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <label htmlFor="blog-search-input" className="sr-only">
              Search Elevoris articles
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="blog-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search articles, topics, or authors…"
              className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-10 pr-10 text-sm font-medium text-[#081632] placeholder:text-slate-400 focus:border-[#c79a3c] focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-[#081632]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter articles by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => selectCategory('all')}
              aria-pressed={activeCategory === 'all'}
              className={`min-h-10 rounded-lg px-3.5 text-xs font-bold whitespace-nowrap shrink-0 transition ${
                activeCategory === 'all'
                  ? 'bg-[#081632] text-white'
                  : 'border border-slate-200 bg-[#f8fafc] text-[#081632] hover:border-[#c79a3c] hover:text-[#96691e]'
              }`}
            >
              All Topics ({articles.length})
            </button>
            {categories.map((cat) => {
              const count = articles.filter((item) => item.categorySlug === cat.slug).length
              const isSelected = activeCategory === cat.slug
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => selectCategory(cat.slug)}
                  aria-pressed={isSelected}
                  className={`min-h-10 rounded-lg px-3.5 text-xs font-bold whitespace-nowrap shrink-0 transition ${
                    isSelected
                      ? 'bg-[#081632] text-[#e2bd68]'
                      : 'border border-slate-200 bg-[#f8fafc] text-[#081632] hover:border-[#c79a3c] hover:text-[#96691e]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Category Hub Links & Results Count */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs text-slate-600">
          <p className="tabular-nums">
            Showing <strong className="text-[#081632]">{visibleArticles.length}</strong> of{' '}
            <strong className="text-[#081632]">{filteredArticles.length}</strong>{' '}
            {filteredArticles.length === 1 ? 'article' : 'articles'}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Topic hubs:
            </span>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="font-semibold text-[#96691e] hover:underline whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Article Grid or Empty State */}
      {visibleArticles.length > 0 ? (
        <>
          <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
                className="btn-outline min-h-11 bg-white px-6 text-sm text-[#081632]"
              >
                Load more articles ({filteredArticles.length - visibleArticles.length} remaining)
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center sm:py-16">
          <h3 className="font-display text-xl font-semibold text-[#081632] sm:text-2xl">
            No matching articles found
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            Try clearing your search term or switching category filters, or explore our verified
            professional training catalogue directly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={clearFilters} className="btn-primary">
              Reset filters
            </button>
            <Link href="/courses" className="btn-outline">
              Explore courses
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
