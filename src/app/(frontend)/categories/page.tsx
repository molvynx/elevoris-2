import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPublicCategories, getPublicCourses } from '@/lib/catalogue'
import { ArrowIcon, PageHero, SiteFooter } from '../SiteChrome'

export const metadata: Metadata = {
  title: 'Course Categories',
  description:
    'Explore every Elevoris professional training category, including categories without currently scheduled courses.',
  alternates: { canonical: '/categories' },
}

export default async function CategoriesPage() {
  const [categories, courses] = await Promise.all([getPublicCategories(), getPublicCourses()])
  const countByCategory = new Map<string | number, number>()
  for (const course of courses) {
    const id =
      course.category && typeof course.category === 'object' ? course.category.id : course.category
    if (id != null) countByCategory.set(id, (countByCategory.get(id) || 0) + 1)
  }
  const topLevel = categories.filter((category) => !category.parent)

  return (
    <>
      <main>
        <PageHero
          eyebrow="Complete training catalogue"
          title="Explore every area of professional development."
          intro="Browse the full Elevoris category structure. Categories remain visible even when no public course is currently scheduled."
        />
        <section className="page-shell section-pad">
          {topLevel.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {topLevel.map((category, index) => {
                const count = countByCategory.get(category.id) || 0
                const children = categories.filter((item) => {
                  const parent =
                    item.parent && typeof item.parent === 'object' ? item.parent.id : item.parent
                  return parent === category.id
                })
                const image =
                  category.image && typeof category.image === 'object' && category.image.url
                    ? category.image
                    : null
                return (
                  <Link
                    className="group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#081632] p-5 text-white shadow-[0_8px_24px_rgba(3,33,52,.08)] transition hover:-translate-y-0.5 hover:border-[#96691e] hover:shadow-[0_18px_45px_rgba(3,33,52,.16)] sm:min-h-64 sm:p-6"
                    href={`/categories/${category.slug}`}
                    key={category.id}
                  >
                    {image && (
                      <Image
                        src={image.url!}
                        alt={image.alt || `${category.name} professional training`}
                        width={image.width || 1200}
                        height={image.height || 800}
                        className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-45"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#081632] via-[#081632]/85 to-[#081632]/45" />
                    <div className="relative flex items-center justify-between">
                      <span className="text-xs font-bold text-[#96691e] tabular-nums">
                        {index + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-white/70 tabular-nums">
                        {count > 0
                          ? `${count} ${count === 1 ? 'course' : 'courses'}`
                          : 'Custom delivery'}
                      </span>
                    </div>
                    <h2 className="relative mt-4 font-display text-xl font-semibold leading-tight text-white sm:mt-5 sm:text-2xl">
                      {category.name}
                    </h2>
                    <p className="relative mt-2.5 text-sm leading-6 text-white/75">
                      {category.description ||
                        (count
                          ? `${count} active professional training ${count === 1 ? 'course' : 'courses'} in this category.`
                          : 'No currently scheduled courses. Customized training options are available.')}
                    </p>
                    {children.length > 0 && (
                      <p className="relative mt-3 text-xs font-semibold text-white/55">
                        {children.length} {children.length === 1 ? 'subcategory' : 'subcategories'}
                      </p>
                    )}
                    <span className="relative mt-auto flex items-center justify-between pt-5 text-xs font-bold text-white group-hover:text-[#e2bd68] sm:text-sm">
                      Explore category
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f2e8] text-[#96691e] transition group-hover:bg-[#96691e] group-hover:text-white sm:h-10 sm:w-10">
                        <ArrowIcon className="h-4 w-4" />
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <h2 className="font-display text-3xl font-semibold">
                Course categories are being updated
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Please contact our team for current programme recommendations and tailored training
                options.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
