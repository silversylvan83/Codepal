// frontend/lib/history.ts
export type HistoryItem = {
  id: string
  code: string
  language: string
  createdAt: number
  summary?: string
}

const KEY = 'codepal:history'
const MAX = 50

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as HistoryItem[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'> & { summary?: string }) {
  if (typeof window === 'undefined') return
  const now: HistoryItem = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...item,
  }
  const list = [now, ...getHistory()].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(list))
  // also store the “last used” snippet for quick reopen from /review
  localStorage.setItem('codepal:last', JSON.stringify({ code: now.code, language: now.language }))
}

export function clearHistory() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function removeHistory(id: string) {
  if (typeof window === 'undefined') return
  const list = getHistory().filter((x) => x.id !== id)
  localStorage.setItem(KEY, JSON.stringify(list))
}
