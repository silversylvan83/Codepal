'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Copy, WrapText, Type, SunMedium, Moon, Sparkles } from 'lucide-react';
import { reviewCode } from '@/lib/api';
import type { editor as MonacoEditorNS } from 'monaco-editor';

const Editor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[55vh] rounded-xl border bg-white/60 dark:bg-slate-900/60" />
    ),
  }
);

// Backend response shape (only what we read here)
type ReviewResponse = {
  improvedSnippet?: string;
  review?: string;
  summary?: string;
  comments?: unknown;
  patch?: string;
};

function stripCodeFence(s: string) {
  if (!s) return '';
  const m = s.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/);
  return m ? m[1].trim() : s.trim();
}

function errorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return String((e as any).message ?? 'Unknown error');
  }
  return 'Unknown error';
}

export default function CodeDiff({
  original,           // used as the source we send to the API
  modified,           // initial improved snippet (if caller already has one)
  language = 'javascript',
}: {
  original: string;
  modified: string;
  language?: string;
}) {
  const [wrap, setWrap] = useState<'off' | 'on'>('off');
  const [theme, setTheme] = useState<'light' | 'vs-dark'>('light');
  const [fontSize, setFontSize] = useState(13);
  const [loading, setLoading] = useState(false);

  // editorContent holds ONLY the improved snippet
  const [editorContent, setEditorContent] = useState<string>(stripCodeFence(modified || ''));

  // keep editorContent in sync if parent passes a new "modified"
  useEffect(() => {
    setEditorContent(stripCodeFence(modified || ''));
  }, [modified]);

  // Sync Monaco theme with site theme (optional)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'vs-dark' : 'light');
  }, []);

  const options: MonacoEditorNS.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontLigatures: true,
      automaticLayout: true,
      wordWrap: wrap,
      fontSize,
    }),
    [wrap, fontSize]
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(editorContent || '');
    } catch {
      // ignore
    }
  }

  async function runReview() {
    try {
      setLoading(true);
      const resp: ReviewResponse = await reviewCode({ code: original, language });
      const improved = stripCodeFence(resp?.improvedSnippet || '');
      if (improved) {
        setEditorContent(improved);
      } else {
        console.warn('Review completed but improvedSnippet was empty.');
      }
    } catch (e: unknown) {
      console.error('Review failed:', errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={runReview}
            disabled={loading || !original?.trim()}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
            title="Generate improved snippet"
          >
            <Sparkles className={`h-3.5 w-3.5 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Reviewing…' : 'Improve'}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFontSize(Number(e.target.value))
              }
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
            onClick={copyCode}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800"
            title="Copy improved code"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[55vh]">
        <Editor value={editorContent} language={language} theme={theme} options={options} />
      </div>
    </div>
  );
}
