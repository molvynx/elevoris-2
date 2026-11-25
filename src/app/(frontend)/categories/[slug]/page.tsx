import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPublicCategories,
  getPublicCategory,
  getPublicCourses,
  toCourseCard,
} from '@/lib/catalogue'
import CourseExplorer from '../../CourseExplorer'
import { PageHero, SiteFooter } from '../../SiteChrome'

export async function generateStaticParams() {
  const categories = await getPublicCategories()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const category = await getPublicCategory((await params).slug)
  if (!category) return {}
  return {
    title: category.name,
    description:
      category.description || `Explore Elevoris ${category.name} professional training courses.`,
    alternates: { canonical: `/categories/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const category = await getPublicCategory((await params).slug)
  if (!category) notFound()
  const allCourses = await getPublicCourses()
  const allCategories = await getPublicCategories()
  const childCategories = allCategories.filter((item) => {
    const parent = item.parent && typeof item.parent === 'object' ? item.parent.id : item.parent
    return parent === category.id
  })
  const courses = allCourses.filter((course) => {
    const parent =
      course.category && typeof course.category === 'object' ? course.category.id : course.category
    const subcategory =
      course.subcategory && typeof course.subcategory === 'object'
        ? course.subcategory.id
        : course.subcategory
    return parent === category.id || subcategory === category.id
  })

  return (
    <>
      <main>
        <PageHero
          eyebrow="Course category"
          title={category.name}
          intro={
            category.description ||
            'Explore verified Elevoris programmes in this professional development category.'
          }
        />
        <section className="page-shell section-pad">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#96691e] hover:underline sm:text-sm"
            >
              ← Back to all course categories
            </Link>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {courses.length} {courses.length === 1 ? 'programme' : 'programmes'}
            </span>
          </div>
          {childCategories.length > 0 && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:mb-8 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#96691e]">
                Subcategories
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {childCategories.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.slug}`}
                    className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-[#f8fafc] px-3 text-xs font-bold text-[#081632] transition hover:border-[#96691e] hover:text-[#96691e]"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {courses.length ? (
            <CourseExplorer courses={courses.map(toCourseCard)} lockedCategory={category.name} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-20">
              <h2 className="font-display text-xl font-semibold sm:text-3xl">
                No currently scheduled courses in this category.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:mt-4">
                Schedule to be announced. Customized in-house and bespoke corporate training options
                remain available on request.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-6">
                <Link href="/inquiry" className="btn-primary text-xs sm:text-sm">
                  Request customized training
                </Link>
                <Link href="/categories" className="btn-outline text-xs sm:text-sm">
                  Browse all categories
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
