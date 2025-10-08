'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Code2, Moon, SunMedium } from 'lucide-react'

export default function Topbar() {
  const [dark, setDark] = useState(false)

  // simple, dependency-free theme toggle
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved ? saved === 'dark' : prefersDark
    setDark(initial)
    document.documentElement.classList.toggle('dark', initial)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="sticky top-0 z-30 border-b bg-white/80 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur px-4">
      <div className="max-w-6xl mx-auto h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Code2 size={18} />
          </span>
          <span className="font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            CodePal
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link href="/review" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Review
          </Link>
          <Link href="/history" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            History
          </Link>
        </nav>

        <button
          onClick={toggleTheme}
          className="h-9 w-9 grid place-items-center rounded-lg border border-slate-200 bg-white/70 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {dark ? <SunMedium size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  )
}
