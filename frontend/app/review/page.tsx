'use client'

import { useMemo, useState } from 'react'
import Topbar from '@/components/Topbar'
import CodeDiff from '@/components/CodeDiff'
import ReviewPanel from '@/components/ReviewPanel'
import { reviewCode } from '@/lib/api'
import { Play, FileJson2, Sparkles, ChevronDown } from 'lucide-react'

type Comment = { line: number; level: string; message: string }

const SAMPLES: Record<string, { lang: string; code: string }> = {
  'JS add()': {
    lang: 'javascript',
    code: `function add(a,b){return a+b}`,
  },
  'TS utils': {
    lang: 'typescript',
    code: `export function clamp(value: number, min: number, max: number) {
  if (min > max) [min, max] = [max, min];
  return Math.min(Math.max(value, min), max);
}`,
  },
  'Python parse': {
    lang: 'python',
    code: `def parse_int(x):
    try:
        return int(x)
    except Exception:
        return None`,
  },
  'Go handler': {
    lang: 'go',
    code: `package api

import "net/http"

func Hello(w http.ResponseWriter, r *http.Request) {
  w.Write([]byte("hello"))
}`,
  },
}

const GOALS = ['readability', 'safety', 'performance', 'style'] as const

export default function ReviewPage() {
  const [code, setCode] = useState(SAMPLES['JS add()'].code)
  const [lang, setLang] = useState(SAMPLES['JS add()'].lang)
  const [goals, setGoals] = useState<string[]>(['readability', 'safety'])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [patch, setPatch] = useState('')

  const charCount = code.length
  const disabled = loading || !code.trim()

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  async function run() {
    try {
      setLoading(true)
      const out = await reviewCode({ code, language: lang })
      setSummary(out.summary || '')
      setComments(out.comments || [])
      setPatch(out.patch || '')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e:any) {
      alert(e?.message || 'Failed to review')
    } finally {
      setLoading(false)
    }
  }

  function loadSample(key: string) {
    const s = SAMPLES[key]
    setLang(s.lang)
    setCode(s.code)
    setSummary('')
    setComments([])
    setPatch('')
  }

  function clearAll() {
    setCode('')
    setSummary('')
    setComments([])
    setPatch('')
  }

  const modified = patch ? applyUnified(code, patch) : code

  const goalBadges = useMemo(
    () =>
      GOALS.map((g) => {
        const active = goals.includes(g)
        return (
          <button
            key={g}
            onClick={() => toggleGoal(g)}
            className={`rounded-full px-2.5 py-1 text-xs border transition ${
              active
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={`Optimize for ${g}`}
          >
            {g}
          </button>
        )
      }),
    [goals]
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Topbar />

      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Toolbar */}
        <div className="rounded-xl border bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur px-3 py-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Review settings</span>
              {/* Language */}
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="text-sm rounded-lg border px-2.5 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700"
                title="Language"
              >
                <option>javascript</option>
                <option>typescript</option>
                <option>python</option>
                <option>java</option>
                <option>go</option>
                <option>csharp</option>
              </select>

              {/* Goals */}
              <div className="hidden md:flex items-center gap-1">{goalBadges}</div>

              {/* Samples */}
              <div className="relative">
                <details className="group">
                  <summary className="list-none inline-flex items-center gap-1 text-sm rounded-lg border px-2.5 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700 cursor-pointer">
                    <FileJson2 className="h-4 w-4" />
                    Samples
                    <ChevronDown className="h-3.5 w-3.5 opacity-70 group-open:rotate-180 transition" />
                  </summary>
                  <div className="absolute z-20 mt-1 w-44 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 shadow">
                    {Object.keys(SAMPLES).map((k) => (
                      <button
                        key={k}
                        onClick={() => loadSample(k)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                disabled={!code}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
                title="Clear"
              >
                {/* <Broom className="h-4 w-4" /> */}
                Clear
              </button>
              <button
                onClick={run}
                disabled={disabled}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white ${
                  disabled ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title="Run review"
              >
                {loading ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
                {loading ? 'Reviewing…' : 'Review Code'}
              </button>
            </div>
          </div>

          {/* Mobile goals row */}
          <div className="mt-2 flex md:hidden flex-wrap gap-1">{goalBadges}</div>
        </div>

        {/* Editor card */}
        <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-3">
          <label className="block text-sm font-medium mb-1">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 border rounded-xl p-3 font-mono text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 resize-y"
            placeholder="Paste your code here…"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Language: <span className="font-medium text-slate-700 dark:text-slate-300">{lang}</span></span>
            <span className="tabular-nums">{charCount.toLocaleString()} chars</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CodeDiff original={code} modified={modified} language={lang} />
          </div>
          <ReviewPanel summary={summary} comments={comments} />
        </div>
      </main>
    </div>
  )
}

// tiny inline patch applier for unified diffs (very naive)
function applyUnified(original: string, patch: string) {
  try {
    if (!patch.trim()) return original
    // in real app, use a robust library (e.g., 'diff') to apply unified patches
    return original
  } catch {
    return original
  }
}
