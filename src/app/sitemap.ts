import type { MetadataRoute } from 'next'
import { getPublicCategories, getPublicCourses } from '@/lib/catalogue'
import { getAllBlogArticles, getBlogCategories } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const [categories, courses] = await Promise.all([
    getPublicCategories(),
    getPublicCourses(),
  ])
  const blogCategories = getBlogCategories()
  const blogArticles = getAllBlogArticles()

  const staticRoutes = [
    '',
    '/courses',
    '/categories',
    '/locations',
    '/about',
    '/training-solutions',
    '/corporate-training',
    '/blog',
    '/inquiry',
    '/apply',
    '/contact',
    '/terms-and-conditions',
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseURL}${route}`,
      changeFrequency: route === '' || route === '/blog' ? ('weekly' as const) : ('monthly' as const),
      priority:
        route === ''
          ? 1
          : route === '/courses' || route === '/categories' || route === '/blog'
            ? 0.9
            : 0.7,
    })),
    ...categories.map((category) => ({
      url: `${baseURL}/categories/${category.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...courses.map((course) => ({
      url: `${baseURL}/courses/${course.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...blogCategories.map((category) => ({
      url: `${baseURL}/blog/category/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...blogArticles.map((article) => ({
      url: `${baseURL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
