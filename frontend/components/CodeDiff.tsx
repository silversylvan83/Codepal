'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Copy, Columns, WrapText, Type, SunMedium, Moon } from 'lucide-react'

const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { ssr: false, loading: () => <div className="h-[55vh] rounded-xl border bg-white/60 dark:bg-slate-900/60" /> }
)

export default function CodeDiff({
  original,
  modified,
  language = 'javascript',
}: {
  original: string
  modified: string
  language?: string
}) {
  const [sideBySide, setSideBySide] = useState(true)
  const [wrap, setWrap] = useState<'off' | 'on'>('off')
  const [theme, setTheme] = useState<'light' | 'vs-dark'>('light')
  const [fontSize, setFontSize] = useState(13)

  const containerRef = useRef<HTMLDivElement | null>(null)

  // Sync Monaco theme with site theme (optional)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'vs-dark' : 'light')
  }, [])

  const options = useMemo(
    () => ({
      renderSideBySide: sideBySide,
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontLigatures: true,
      automaticLayout: true,
      wordWrap: wrap,
      fontSize,
    }),
    [sideBySide, wrap, fontSize]
  )

  async function copyModified() {
    try {
      await navigator.clipboard.writeText(modified || '')
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSideBySide((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
            title="Toggle side-by-side"
          >
            <Columns className="h-3.5 w-3.5" />
            {sideBySide ? 'Side-by-side' : 'Inline'}
          </button>
          <button
            onClick={() => setWrap((w) => (w === 'off' ? 'on' : 'off'))}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
            title="Toggle word wrap"
          >
            <WrapText className="h-3.5 w-3.5" />
            {wrap === 'on' ? 'Wrap on' : 'Wrap off'}
          </button>
          <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white dark:bg-slate-900 dark:border-slate-700">
            <Type className="h-3.5 w-3.5" />
            <input
              type="range"
              min={11}
              max={18}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="h-1 w-24"
              aria-label="Font size"
            />
            <span className="tabular-nums">{fontSize}px</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setTheme((t) => (t === 'vs-dark' ? 'light' : 'vs-dark'))}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
            title="Editor theme"
          >
            {theme === 'vs-dark' ? <SunMedium className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === 'vs-dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={copyModified}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
            title="Copy modified code"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      </div>

      {/* Editor */}
      <div ref={containerRef} className="h-[55vh]">
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={theme}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options={options as any}
        />
      </div>
    </div>
  )
}
