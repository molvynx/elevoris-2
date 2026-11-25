import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export default function BlogBreadcrumbs({
  items,
  dark = false,
}: {
  items: BreadcrumbItem[]
  dark?: boolean
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 ${dark ? 'text-white/35' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`transition hover:underline ${
                    dark ? 'text-[#e2bd68] hover:text-white' : 'text-[#96691e] hover:text-[#081632]'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={`line-clamp-1 ${dark ? 'text-white/75' : 'text-slate-600'}`}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
