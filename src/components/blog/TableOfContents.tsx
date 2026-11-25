'use client'

import { useState } from 'react'
import { ChevronDown, List } from 'lucide-react'
import type { TocHeading } from '@/lib/blog'

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!headings.length) return null

  return (
    <>
      {/* Mobile / Tablet Collapsible TOC */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold text-[#081632]"
        >
          <span className="inline-flex items-center gap-2">
            <List className="h-4 w-4 text-[#96691e]" aria-hidden="true" />
            Table of Contents
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#96691e] transition ${mobileOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {mobileOpen && (
          <nav aria-label="Article table of contents" className="mt-3 border-t border-slate-100 pt-3">
            <ol className="space-y-2 text-xs">
              {headings.map((item) => (
                <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-0.5 leading-5 transition hover:text-[#96691e] ${
                      item.level === 2 ? 'font-semibold text-[#081632]' : 'text-slate-600'
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Desktop Sticky TOC */}
      <aside className="hidden lg:block" aria-label="Article contents">
        <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <List className="h-4 w-4 text-[#96691e]" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#081632]">
              In this article
            </p>
          </div>
          <nav aria-label="Table of contents" className="mt-4">
            <ol className="space-y-2.5 text-[13px]">
              {headings.map((item) => (
                <li key={item.id} className={item.level === 3 ? 'pl-3.5' : ''}>
                  <a
                    href={`#${item.id}`}
                    className={`block leading-5 transition hover:text-[#96691e] ${
                      item.level === 2 ? 'font-semibold text-[#081632]' : 'text-slate-500'
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </aside>
    </>
  )
}
