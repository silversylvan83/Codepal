/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useMemo, useState } from 'react'

type Comment = { line: number; level: 'info' | 'warn' | 'error' | string; message: string }

export default function ReviewPanel({
  summary,
  comments = [],
}: {
  summary?: string
  comments?: Comment[]
}) {
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all')

  const counts = useMemo(() => {
    const base = { info: 0, warn: 0, error: 0 }
    for (const c of comments) {
      if (c.level === 'warn') base.warn++
      else if (c.level === 'error') base.error++
      else base.info++
    }
    return base
  }, [comments])

  const filtered = useMemo(() => {
    if (filter === 'all') return comments
    return comments.filter((c) => (c.level as any) === filter)
  }, [comments, filter])

  const pill = (kind: 'info' | 'warn' | 'error') =>
    `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
      kind === 'error'
        ? 'bg-rose-100 text-rose-700'
        : kind === 'warn'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-slate-100 text-slate-700'
    }`

  return (
    <aside className="space-y-3">
      {/* Summary */}
      <section className="rounded-xl border p-3 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Summary</h3>
        </div>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {summary?.trim() ? summary : 'No summary available yet.'}
        </p>
      </section>

      {/* Comments */}
      <section className="rounded-xl border p-3 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Comments</h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              className={`rounded-lg border px-2.5 py-1 ${filter === 'all' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} dark:border-slate-700`}
              onClick={() => setFilter('all')}
            >
              All ({comments.length})
            </button>
            <button
              className={`rounded-lg border px-2.5 py-1 ${filter === 'info' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} dark:border-slate-700`}
              onClick={() => setFilter('info')}
            >
              Info <span className="ml-1">{counts.info}</span>
            </button>
            <button
              className={`rounded-lg border px-2.5 py-1 ${filter === 'warn' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} dark:border-slate-700`}
              onClick={() => setFilter('warn')}
            >
              Warn <span className="ml-1">{counts.warn}</span>
            </button>
            <button
              className={`rounded-lg border px-2.5 py-1 ${filter === 'error' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} dark:border-slate-700`}
              onClick={() => setFilter('error')}
            >
              Error <span className="ml-1">{counts.error}</span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed p-4 text-sm text-slate-500 dark:border-slate-700">
            No comments to display for this filter.
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {filtered.map((c, i) => (
              <li key={i} className="text-sm leading-5">
                <span className={pill((c.level as any) || 'info')}>L{c.line}</span>
                <span className="ml-2">{c.message}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
