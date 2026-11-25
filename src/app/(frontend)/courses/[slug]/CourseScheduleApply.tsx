'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CatalogueSchedule } from '@/lib/catalogue'
import { ArrowIcon } from '../../SiteChrome'

export function formatSessionLabel(schedule: CatalogueSchedule): string {
  const parts = [schedule.dates, schedule.venue]
  if (schedule.duration) parts.push(schedule.duration)
  if (schedule.format) parts.push(schedule.format)
  return parts.join(' · ')
}

export default function CourseScheduleApply({
  courseSlug,
  courseTitle,
  schedules,
  statusLabel,
  brochureUrl,
}: {
  courseSlug: string
  courseTitle: string
  schedules: CatalogueSchedule[]
  statusLabel: string
  brochureUrl?: string | null
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectedSchedule = schedules[selectedIndex]
  const brochureHref =
    brochureUrl && (/^https?:\/\//i.test(brochureUrl) || brochureUrl.startsWith('/'))
      ? brochureUrl
      : null
  const applyHref = selectedSchedule
    ? `/apply?course=${encodeURIComponent(courseSlug)}&session=${encodeURIComponent(
        formatSessionLabel(selectedSchedule),
      )}`
    : `/apply?course=${encodeURIComponent(courseSlug)}`

  return (
    <>
      <div
        data-advisor-zone="apply"
        className="rounded-2xl bg-[#081632] p-5 text-white shadow-[0_18px_45px_rgba(8,22,50,.14)] sm:p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#e2bd68]">
          Course registration
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl">
          Apply for this course
        </h2>
        <p className="mt-2 text-xs leading-6 text-white/75 sm:mt-2.5">
          Status: <strong className="text-[#e2bd68]">{statusLabel}</strong>
        </p>
        {selectedSchedule ? (
          <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-3 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#e2bd68]">
              Selected session
            </p>
            <p className="mt-1 font-semibold text-white tabular-nums">{selectedSchedule.dates}</p>
            <p className="mt-0.5 text-white/75">
              {selectedSchedule.venue}
              {selectedSchedule.duration ? ` · ${selectedSchedule.duration}` : ''}
              {selectedSchedule.format ? ` · ${selectedSchedule.format}` : ''}
            </p>
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white/75">
            Schedule to be announced. You can submit an application for upcoming or customized team
            dates.
          </p>
        )}

        <Link
          href={applyHref}
          data-advisor-protected="apply"
          className="btn-primary mt-5 w-full transition active:scale-[0.99]"
        >
          Apply for Course <ArrowIcon />
        </Link>

        <Link
          data-advisor-protected="apply"
          className="mt-2.5 flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-4 text-xs font-bold text-white transition hover:border-[#e2bd68] hover:bg-white/10 sm:mt-3"
          href={`/inquiry?course=${encodeURIComponent(courseTitle)}`}
        >
          Request a corporate proposal
        </Link>

        {brochureHref && (
          <a
            className="mt-2.5 flex min-h-11 items-center justify-center rounded-xl border border-[#e2bd68]/45 px-4 text-xs font-bold text-[#e2bd68] hover:border-[#e2bd68] hover:bg-white/5 sm:mt-3"
            href={brochureHref}
            target="_blank"
            rel="noreferrer"
          >
            Download official brochure
          </a>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-xs">
          <a
            href="https://wa.me/447405900092"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#25D366] hover:underline"
          >
            WhatsApp Advisor
          </a>
          <a
            href="mailto:info@elevoris.com"
            className="font-semibold text-white/80 hover:text-[#e2bd68]"
          >
            info@elevoris.com
          </a>
        </div>
      </div>

      {/* Scheduled Sessions Selector */}
      <div
        id="scheduled-sessions"
        data-advisor-zone="apply"
        className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-[#081632] sm:text-2xl">
            Scheduled sessions
          </h2>
          {schedules.length > 0 && (
            <span className="text-[11px] font-bold text-[#96691e] tabular-nums">
              {schedules.length} {schedules.length === 1 ? 'session' : 'sessions'}
            </span>
          )}
        </div>
        {schedules.length ? (
          <>
            <p className="mt-1.5 text-xs text-slate-500">
              Select a session below to pre-fill your course application:
            </p>
            <div className="mt-3.5 max-h-[380px] space-y-2.5 overflow-y-auto pr-1 sm:mt-4 sm:max-h-[420px]">
              {schedules.map((schedule, index) => {
                const isSelected = index === selectedIndex
                return (
                  <button
                    key={`${schedule.dates}-${schedule.venue}-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-xl border p-3 text-left transition sm:p-3.5 ${
                      isSelected
                        ? 'border-[#96691e] bg-[#fbf6eb] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-[#d8c294] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#081632] tabular-nums sm:text-sm">
                        {schedule.dates}
                      </p>
                      <span
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                          isSelected ? 'border-[#96691e] bg-[#96691e]' : 'border-slate-300'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {schedule.venue}
                      {schedule.duration ? ` · ${schedule.duration}` : ''}
                      {schedule.format ? ` · ${schedule.format}` : ''}
                    </p>
                    {(schedule.code || schedule.scope || schedule.quarter) && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {[schedule.code, schedule.scope, schedule.quarter]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs font-bold text-[#96691e] tabular-nums">
                      {schedule.fee || 'Request a Quote'}
                    </p>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Schedule to be announced. Customized corporate delivery is available on request.
          </p>
        )}
      </div>

      {/* Sticky Mobile Apply Bar */}
      <div
        data-advisor-protected="apply"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2.5 shadow-[0_-8px_24px_rgba(8,22,50,.08)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#081632]">{courseTitle}</p>
            <p className="truncate text-[11px] text-slate-500 tabular-nums">
              {selectedSchedule
                ? `${selectedSchedule.dates} · ${selectedSchedule.venue}`
                : 'Schedule to be announced.'}
            </p>
          </div>
          <Link
            href={applyHref}
            className="btn-primary min-h-10 shrink-0 whitespace-nowrap px-3.5 py-2 text-xs"
          >
            Apply for Course
          </Link>
        </div>
      </div>
    </>
  )
}
