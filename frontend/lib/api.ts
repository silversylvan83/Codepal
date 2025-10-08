const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function reviewCode(input: { code: string; language?: string }) {
  const res = await fetch(`${API}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listReviews() {
  const res = await fetch(`${API}/api/reviews`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function getReviewHistory(params?: { limit?: number; skip?: number; language?: string }) {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API}/api/history${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function getHistory(params?: { limit?: number; skip?: number; language?: string; includeCode?: boolean }) {
  const qs = new URLSearchParams({
    ...(params?.limit ? { limit: String(params.limit) } : {}),
    ...(params?.skip ? { skip: String(params.skip) } : {}),
    ...(params?.language ? { language: params.language } : {}),
    ...(params?.includeCode ? { includeCode: '1' } : {}),
  }).toString();

  const res = await fetch(`${API}/api/history${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history');
  return data;
}

export async function getHistoryById(id: string) {
  const res = await fetch(`${API}/api/history/${id}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history item');
  return data;
}

export async function deleteHistory(id: string) {
  const res = await fetch(`${API}/api/history/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to delete history item');
  return data;
}

export async function clearHistoryServer() {
  const res = await fetch(`${API}/api/history`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to clear history');
  return data;
}