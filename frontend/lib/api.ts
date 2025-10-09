// frontend/lib/api.ts
// Default to SAME-ORIGIN in prod. If you're running the API separately in local dev,
// create frontend/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:4000
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();

const url = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

function qs(params?: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export async function reviewCode(input: { code: string; language?: string }) {
  const res = await fetch(url('/api/reviews'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listReviews() {
  const res = await fetch(url('/api/reviews'), { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getReviewHistory(params?: {
  limit?: number;
  skip?: number;
  language?: string;
}) {
  const res = await fetch(url(`/api/history${qs(params)}`), { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getHistory(params?: {
  limit?: number;
  skip?: number;
  language?: string;
  includeCode?: boolean;
}) {
  const res = await fetch(url(`/api/history${qs({
    limit: params?.limit,
    skip: params?.skip,
    language: params?.language,
    includeCode: params?.includeCode ? 1 : undefined,
  })}`), { cache: 'no-store' });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history');
  return data;
}

export async function getHistoryById(id: string) {
  const res = await fetch(url(`/api/history/${id}`), { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history item');
  return data;
}

export async function deleteHistory(id: string) {
  const res = await fetch(url(`/api/history/${id}`), { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to delete history item');
  return data;
}

export async function clearHistoryServer() {
  const res = await fetch(url('/api/history'), { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to clear history');
  return data;
}
