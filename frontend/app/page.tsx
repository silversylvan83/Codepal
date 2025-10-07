'use client'

import Link from 'next/link'
import { Code2, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 px-6">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Code2 className="text-blue-600 dark:text-blue-400" size={28} />
          <h1 className="text-3xl font-bold tracking-tight">CodePal</h1>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
          Your friendly AI-powered code reviewer — get instant feedback on your
          code quality, style, and best practices.
        </p>

        <Link
          href="/review"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl transition"
        >
          <Sparkles size={18} />
          Start Reviewing Code
        </Link>

        <div className="mt-10 text-sm text-slate-500">
          Built with <span className="text-blue-500">MERN + OpenAI</span>
        </div>
      </div>
    </main>
  )
}
