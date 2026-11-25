import type { CatalogueCategory, CatalogueCourse } from './catalogue'

export type NavCategoryCourseLink = {
  title: string
  slug: string
}

export type NavCategorySubcategory = {
  name: string
  slug: string
  courses: NavCategoryCourseLink[]
}

export type NavCategoryItem = {
  name: string
  slug: string
  count: number
  subcategories: NavCategorySubcategory[]
  courses: NavCategoryCourseLink[]
}

function categoryId(value: CatalogueCourse['category'] | CatalogueCourse['subcategory']) {
  return value && typeof value === 'object'
    ? String(value.id)
    : value == null
      ? null
      : String(value)
}

export function buildCategoriesNav(
  categories: CatalogueCategory[],
  courses: CatalogueCourse[],
): NavCategoryItem[] {
  const childrenByParent = new Map<string, CatalogueCategory[]>()
  for (const category of categories) {
    const parentId =
      category.parent && typeof category.parent === 'object'
        ? String(category.parent.id)
        : category.parent == null
          ? null
          : String(category.parent)
    if (!parentId) continue
    const children = childrenByParent.get(parentId) ?? []
    children.push(category)
    childrenByParent.set(parentId, children)
  }

  return categories
    .filter((category) => !category.parent)
    .map((category) => {
      const directCourses = courses
        .filter((course) => categoryId(course.category) === String(category.id))
        .map(({ title, slug }) => ({ title, slug }))
        .sort((a, b) => a.title.localeCompare(b.title))
      const subcategories = (childrenByParent.get(String(category.id)) ?? [])
        .map((subcategory) => ({
          name: subcategory.name,
          slug: subcategory.slug,
          courses: courses
            .filter((course) => categoryId(course.subcategory) === String(subcategory.id))
            .map(({ title, slug }) => ({ title, slug }))
            .sort((a, b) => a.title.localeCompare(b.title)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      const subcategoryCourses = subcategories.flatMap((subcategory) => subcategory.courses)

      return {
        name: category.name,
        slug: category.slug,
        count: directCourses.length,
        subcategories,
        courses: directCourses.length ? directCourses : subcategoryCourses,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
