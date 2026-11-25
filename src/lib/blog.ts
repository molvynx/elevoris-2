import { BLOG_ARTICLES, BLOG_CATEGORIES } from '@/data/blog-posts'

export type BlogCategorySlug =
  | 'career-growth'
  | 'certifications'
  | 'corporate-training'
  | 'study-tips'

export type BlogCategory = {
  id: string
  name: string
  slug: BlogCategorySlug
  description: string
  seoTitle: string
  seoDescription: string
  recommendedCourseSlugs: string[]
}

export type BlogAuthor = {
  id: string
  name: string
  role: string
  credentials: string
  bio: string
  initials: string
}

export type BlogFaqItem = {
  question: string
  answer: string
}

export type BlogContentBlock =
  | {
      type: 'heading'
      level: 2 | 3
      id: string
      text: string
    }
  | {
      type: 'paragraph'
      text: string
    }
  | {
      type: 'list'
      ordered?: boolean
      items: string[]
    }
  | {
      type: 'callout'
      title: string
      body: string
    }
  | {
      type: 'quote'
      quote: string
      attribution: string
    }
  | {
      type: 'table'
      caption?: string
      headers: string[]
      rows: string[][]
    }

export type BlogArticle = {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string
  featuredImageAlt: string
  featuredImageCaption?: string
  categorySlug: BlogCategorySlug
  author: BlogAuthor
  publishedAt: string
  updatedAt: string
  readingTimeMinutes: number
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  relatedSlugs: string[]
  relatedCourseSlugs: string[]
  faqs: BlogFaqItem[]
  featured: boolean
  blocks: BlogContentBlock[]
}

export type TocHeading = {
  id: string
  text: string
  level: 2 | 3
}

export function getBlogCategories(): BlogCategory[] {
  return BLOG_CATEGORIES
}

export function getBlogCategoryBySlug(slug: string): BlogCategory | null {
  return BLOG_CATEGORIES.find((cat) => cat.slug === slug) ?? null
}

export function getAllBlogArticles(): BlogArticle[] {
  return [...BLOG_ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getFeaturedBlogArticle(): BlogArticle {
  const articles = getAllBlogArticles()
  return articles.find((article) => article.featured) ?? articles[0]
}

export function getBlogArticleBySlug(slug: string): BlogArticle | null {
  return BLOG_ARTICLES.find((article) => article.slug === slug) ?? null
}

export function getBlogArticlesByCategory(categorySlug: BlogCategorySlug): BlogArticle[] {
  return getAllBlogArticles().filter((article) => article.categorySlug === categorySlug)
}

export function getRelatedBlogArticles(article: BlogArticle, limit = 3): BlogArticle[] {
  const explicit = article.relatedSlugs
    .map((slug) => getBlogArticleBySlug(slug))
    .filter((item): item is BlogArticle => Boolean(item && item.slug !== article.slug))

  if (explicit.length >= limit) return explicit.slice(0, limit)

  const seen = new Set([article.slug, ...explicit.map((item) => item.slug)])
  const sameCategory = getAllBlogArticles().filter(
    (item) => !seen.has(item.slug) && item.categorySlug === article.categorySlug,
  )
  const fallback = getAllBlogArticles().filter((item) => !seen.has(item.slug))

  return [...explicit, ...sameCategory, ...fallback].slice(0, limit)
}

export function extractTableOfContents(article: BlogArticle): TocHeading[] {
  return article.blocks
    .filter((block): block is Extract<BlogContentBlock, { type: 'heading' }> => block.type === 'heading')
    .map((heading) => ({
      id: heading.id,
      text: heading.text,
      level: heading.level,
    }))
}

export function formatBlogDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
