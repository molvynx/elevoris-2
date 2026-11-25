import ElevorisHome from './ElevorisHome'
import { getPublicCategories, getPublicCourses, toCourseCard } from '@/lib/catalogue'

export default async function HomePage() {
  const [catalogue, categoryRecords] = await Promise.all([
    getPublicCourses(),
    getPublicCategories(),
  ])

  const cards = catalogue.map((course) => {
    const card = toCourseCard(course)
    const categorySlug =
      course.category && typeof course.category === 'object'
        ? course.category.slug
        : card.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return {
      slug: card.slug,
      title: card.title,
      category: card.category,
      categorySlug: card.categorySlug || categorySlug,
      status: card.status,
      sessionCount: card.sessionCount,
      duration: card.duration,
      location: card.venue,
      method: card.format,
      formats: card.formats,
      venues: card.venues,
      date: card.date,
      dateISO: card.dateISO,
    }
  })

  const countByCategory = new Map<string, number>()
  for (const card of cards) {
    countByCategory.set(card.category, (countByCategory.get(card.category) || 0) + 1)
  }

  return (
    <ElevorisHome
      courses={cards}
      categories={categoryRecords.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? null,
        count: countByCategory.get(cat.name) || 0,
      }))}
      locations={[...new Set(cards.flatMap((course) => course.venues))]
        .filter((loc) => loc && loc !== 'Contact us')
        .sort()}
    />
  )
}
