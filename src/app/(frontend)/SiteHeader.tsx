import { getPublicCategories, getPublicCourses } from '@/lib/catalogue'
import { buildCategoriesNav } from '@/lib/categories-nav'
import SiteHeaderClient from './SiteHeaderClient'

export default async function SiteHeader() {
  const [categories, courses] = await Promise.all([getPublicCategories(), getPublicCourses()])
  const navigation = buildCategoriesNav(categories, courses)

  return <SiteHeaderClient navigation={navigation} totalCourseCount={courses.length} />
}
