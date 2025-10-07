'use client'
import { useState } from 'react';
import Topbar from '@/components/Topbar';
import CodeDiff from '@/components/CodeDiff';
import ReviewPanel from '@/components/ReviewPanel';
import { reviewCode } from '@/lib/api';

export default function ReviewPage() {
  const [code, setCode] = useState(`function add(a,b){return a+b}`)
  const [lang, setLang] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [comments, setComments] = useState<{line:number;level:string;message:string}[]>([])
  const [patch, setPatch] = useState<string>('')

  async function run() {
    try {
      setLoading(true)
      const out = await reviewCode({ code, language: lang })
      setSummary(out.summary || '')
      setComments(out.comments || [])
      setPatch(out.patch || '')
    } catch (e: any) {
      alert(e.message || 'Failed to review')
    } finally {
      setLoading(false)
    }
  }

  // naive: show original if no patch
  const modified = patch ? applyUnified(code, patch) : code

  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="rounded-xl border bg-white p-3">
          <label className="block text-sm font-medium mb-1">Language</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option>javascript</option><option>typescript</option><option>python</option><option>java</option><option>go</option>
          </select>

          <label className="block text-sm font-medium mt-3 mb-1">Code</label>
          <textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full h-48 border rounded p-2 font-mono text-sm" />
          <button onClick={run} disabled={loading} className="mt-3 rounded-lg bg-blue-600 text-white px-4 py-2">{loading ? 'Reviewing…' : 'Review Code'}</button>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2"><CodeDiff original={code} modified={modified} language={lang} /></div>
          <ReviewPanel summary={summary} comments={comments} />
        </div>
      </div>
    </div>
  );
}

// tiny inline patch applier for unified diffs (very naive)
function applyUnified(original: string, patch: string) {
  try {
    // extremely simplified: if patch is empty, return original
    if (!patch.trim()) return original;
    // in real app, use 'diff' library; here we fallback to original for safety
    return original;
  } catch { return original; }
}
