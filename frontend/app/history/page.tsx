'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Copy, Trash2, Search, ChevronDown } from 'lucide-react'
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

// robust copy helper with fallback
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    ta.style.left = '-9999px'
    ta.setAttribute('readonly', 'true')
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [lang, setLang] = useState<(typeof LANGS)[number]>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch from backend history endpoint
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await getReviewHistory({ limit: 50 })
        if (mounted) setItems(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [])
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
    if (lang !== 'all') data = data.filter((x) => (x.language ?? '').toLowerCase() === lang)
    const s = q.trim().toLowerCase()
    if (s) {
      data = data.filter((x) => {
        const summary = (x.summary ?? '').toLowerCase()
        const code = (x.code ?? '').toLowerCase()
        const language = (x.language ?? '').toLowerCase()
        const model = (x.model ?? '').toLowerCase()
        const provider = (x.provider ?? '').toLowerCase()
        const created = (x.createdAt ? new Date(x.createdAt).toLocaleString() : '').toLowerCase()
        return (
          summary.includes(s) ||
          code.includes(s) ||
          language.includes(s) ||
          model.includes(s) ||
          provider.includes(s) ||
          created.includes(s)
        )
      })
    }
    return data
  }, [items, q, lang])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/10" />
        <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-600/10" />
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Title */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Review history
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {loading ? 'Loading…' : `Your last ${items.length} server-side reviews`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <Link ...>Go to Review</Link> */}
            <button
              disabled={!items.length || loading}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          </div>
        </header>

        {/* Filters (sticky, on top of results) */}
        <section className="sticky top-2 z-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-3 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <label className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search in summary, code, language, model…"
                className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </label>

            <div className="flex items-center gap-2">
              <div className="relative">
                <details className="group">
                  <summary className="list-none inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    Language: <span className="font-medium">{lang}</span>
                    <ChevronDown className="h-4 w-4 opacity-70 group-open:rotate-180 transition" />
                  </summary>
                  {/* make sure menu overlays cards; use high z-index */}
                  <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700 shadow-lg overflow-hidden">
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
        </section>

        {/* List */}
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-3 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-16 rounded bg-slate-200/70 dark:bg-slate-800/80" />
                  <div className="h-4 w-24 rounded bg-slate-200/70 dark:bg-slate-800/80" />
                </div>
                <div className="mt-3 h-28 rounded bg-slate-200/70 dark:bg-slate-800/80" />
                <div className="mt-3 h-8 rounded bg-slate-200/70 dark:bg-slate-800/80" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 text-center text-sm text-slate-600 dark:text-slate-400">
            No history yet. Run a review from the{' '}
            <Link className="text-blue-600 hover:underline dark:text-blue-400" href="/review">
              Review
            </Link>{' '}
            page.
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide rounded-md border px-2 py-0.5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {item.language || 'unknown'}
                    </span>
                    {item.provider && (
                      <span className="text-[10px] rounded-md px-2 py-0.5 bg-blue-600/10 text-blue-700 dark:text-blue-300">
                        {item.provider}
                      </span>
                    )}
                    {item.model && (
                      <span className="text-[10px] rounded-md px-2 py-0.5 bg-indigo-600/10 text-indigo-700 dark:text-indigo-300">
                        {item.model}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {item.code ? (
                  <pre className="mt-2 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-xl p-2 overflow-hidden max-h-40 whitespace-pre-wrap border border-slate-200/70 dark:border-slate-800/70">
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
                    {/* Copy SUMMARY (API response) */}
                    <button
                      className="text-xs rounded-lg border px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 disabled:opacity-50"
                      title={item.summary ? 'Copy summary' : 'No summary to copy'}
                      disabled={!item.summary}
                      onClick={async () => {
                        if (!item.summary) return
                        const ok = await copyText(item.summary)
                        if (ok) {
                          setCopiedId(item.id)
                          setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1200)
                        }
                      }}
                      aria-live="polite"
                    >
                      <Copy className="h-3.5 w-3.5 inline-block mr-1" />
                      {copiedId === item.id ? 'Copied!' : 'Copy'}
                    </button>

                    <Link
                      href="/review"
                      className="text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 shadow-sm"
                      title="Open in Review"
                    >
                      Open in Review
                    </Link>
                  </div>

                  <button
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
      </main>
    </div>
  )
}
