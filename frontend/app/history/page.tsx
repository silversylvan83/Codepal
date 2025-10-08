'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Copy, Trash2, ArrowRight, Search, ChevronDown } from 'lucide-react'
import { getReviewHistory } from '@/lib/api'


const LANGS = ['all', 'javascript', 'typescript', 'python', 'java', 'go', 'csharp'] as const

export type HistoryItem = {
  id: string
  language?: string
  summary?: string
  code?: string
  createdAt: string
  model?: string
  provider?: string
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [lang, setLang] = useState<(typeof LANGS)[number]>('all')

  // fetch from backend history endpoint
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await getReviewHistory({ limit: 50 })
        // Shape expected from backend:
        // { total, count, items: [{ id, language, summary, createdAt, model, provider, (optional) code }] }
        if (mounted) setItems(Array.isArray(data?.items) ? data.items : [])
      } catch (e) {
        console.error('Failed to load history:', e)
        if (mounted) setItems([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    let data = items
    if (lang !== 'all') data = data.filter((x) => x.language === lang)
    if (q.trim()) {
      const s = q.toLowerCase()
      data = data.filter(
        (x) =>
          (x.summary && x.summary.toLowerCase().includes(s)) ||
          (x.code && x.code.toLowerCase().includes(s))
      )
    }
    return data
  }, [items, q, lang])

  // async function onClear() {
  //   try {
  //     await clearReviews() // DELETE /api/reviews
  //     setItems([])
  //   } catch (e) {
  //     console.error('Failed to clear history:', e)
  //     // optional: toast error
  //   }
  // }

  // async function onCopy(item: HistoryItem) {
  //   try {
  //     // prefer code if the endpoint provides it; else fetch the full doc
  //     let code = item.code
  //     if (!code) {
  //       const full = await getReviewById(item.id) // GET /api/reviews/:id
  //       code = full?.code || ''
  //     }
  //     if (!code) return
  //     await navigator.clipboard.writeText(code)
  //     // optional: toast success
  //   } catch (e) {
  //     console.error('Copy failed:', e)
  //   }
  // }

  // async function onRemove(id: string) {
  //   try {
  //     await deleteReview(id) // DELETE /api/reviews/:id
  //     setItems((prev) => prev.filter((x) => x.id !== id))
  //   } catch (e) {
  //     console.error('Failed to delete review:', e)
  //   }
  // }

  // async function onLoadToReview(item: HistoryItem) {
  //   try {
  //     // fetch full record to ensure we have code + language
  //     const full = await getReviewById(item.id) // GET /api/reviews/:id
  //     const code = full?.code || item.code || ''
  //     const language = full?.language || item.language || 'javascript'
  //     if (!code) return
  //     localStorage.setItem('codepal:last', JSON.stringify({ code, language }))
  //   } catch (e) {
  //     console.error('Failed to load detail:', e)
  //   }
  // }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">History</h1>
            <p className="text-sm text-slate-500">
              {loading ? 'Loading…' : `Your last ${items.length} server-side reviews`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
            >
              Go to Review
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              // onClick={onClear}
              disabled={!items.length || loading}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          </div>
        </header>

        {/* Controls */}
        <div className="rounded-xl border bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <label className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search in summary or code…"
                className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
              />
            </label>

            <div className="flex items-center gap-2">
              <div className="relative">
                <details className="group">
                  <summary className="list-none inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 cursor-pointer">
                    Language: <span className="font-medium">{lang}</span>
                    <ChevronDown className="h-4 w-4 opacity-70 group-open:rotate-180 transition" />
                  </summary>
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 shadow">
                    {LANGS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-6 text-center text-sm text-slate-500">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-6 text-center text-sm text-slate-500">
            No history yet. Run a review from the{' '}
            <Link className="text-blue-600 hover:underline" href="/review">
              Review
            </Link>{' '}
            page.
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="group rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-3 flex flex-col"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs rounded-md border px-2 py-0.5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                    {item.language || 'unknown'}
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Prefer summary if code isn't included in history payload */}
                {item.code ? (
                  <pre className="mt-2 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-lg p-2 overflow-hidden max-h-40 whitespace-pre-wrap">
                    {item.code.slice(0, 600)}
                    {item.code && item.code.length > 600 ? '…' : ''}
                  </pre>
                ) : (
                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-6">
                    {item.summary || '—'}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      // onClick={() => onCopy(item)}
                      className="text-xs rounded-lg border px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                      title="Copy code"
                      disabled={!item.code}
                    >
                      <Copy className="h-3.5 w-3.5 inline-block mr-1" />
                      Copy
                    </button>

                    <Link
                      href="/review"
                      // onClick={() => onLoadToReview(item)}
                      className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1"
                      title="Open in Review"
                    >
                      Open in Review
                    </Link>
                  </div>

                  <button
                    // onClick={() => onRemove(item.id)}
                    className="text-xs rounded-lg border px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 inline-block" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
