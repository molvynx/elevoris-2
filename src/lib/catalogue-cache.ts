import { revalidateTag } from 'next/cache'

export const COURSE_LIST_TAG = 'catalogue:courses'
export const CATEGORY_LIST_TAG = 'catalogue:categories'
export const BLOG_LIST_TAG = 'catalogue:blog'

export const courseDetailTag = (slug: string) => `catalogue:course:${slug}`
export const categoryDetailTag = (slug: string) => `catalogue:category:${slug}`
export const blogDetailTag = (slug: string) => `catalogue:blog:${slug}`

function revalidate(tags: Array<string | null | undefined>) {
  for (const tag of new Set(tags.filter((value): value is string => Boolean(value)))) {
    revalidateTag(tag, 'max')
  }
}

export function revalidateCourse(
  doc?: { slug?: string | null },
  previousDoc?: { slug?: string | null },
) {
  revalidate([
    COURSE_LIST_TAG,
    doc?.slug ? courseDetailTag(doc.slug) : null,
    previousDoc?.slug ? courseDetailTag(previousDoc.slug) : null,
  ])
}

export function revalidateCategory(
  doc?: { slug?: string | null },
  previousDoc?: { slug?: string | null },
) {
  revalidate([
    CATEGORY_LIST_TAG,
    COURSE_LIST_TAG,
    doc?.slug ? categoryDetailTag(doc.slug) : null,
    previousDoc?.slug ? categoryDetailTag(previousDoc.slug) : null,
  ])
}

export function revalidateBlogPost(
  doc?: { slug?: string | null },
  previousDoc?: { slug?: string | null },
) {
  revalidate([
    BLOG_LIST_TAG,
    doc?.slug ? blogDetailTag(doc.slug) : null,
    previousDoc?.slug ? blogDetailTag(previousDoc.slug) : null,
  ])
}

export function revalidateRelatedMedia() {
  revalidate([COURSE_LIST_TAG, BLOG_LIST_TAG])
}
