// frontend/lib/api.ts
// Same-origin API calls (works in Vercel + local Next dev)
const toUrl = (p: string) => p;

const toQs = (params?: Record<string, string | number | boolean | undefined>) => {
  const sp = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const reviewCode = async (input: { code: string; language?: string }) => {
  const res = await fetch(toUrl('/api/reviews'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const listReviews = async () => {
  const res = await fetch(toUrl('/api/reviews'), { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getReviewHistory = async (params?: {
  limit?: number;
  skip?: number;
  language?: string;
}) => {
  const res = await fetch(toUrl(`/api/history${toQs(params)}`), { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getHistory = async (params?: {
  limit?: number;
  skip?: number;
  language?: string;
  includeCode?: boolean;
}) => {
  const res = await fetch(
    toUrl(
      `/api/history${toQs({
        limit: params?.limit,
        skip: params?.skip,
        language: params?.language,
        includeCode: params?.includeCode ? 1 : undefined,
      })}`
    ),
    { cache: 'no-store' }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history');
  return data;
};

export const getHistoryById = async (id: string) => {
  const res = await fetch(toUrl(`/api/history/${id}`), { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history item');
  return data;
};

export const deleteHistory = async (id: string) => {
  const res = await fetch(toUrl(`/api/history/${id}`), { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to delete history item');
  return data;
};

export const clearHistoryServer = async () => {
  const res = await fetch(toUrl('/api/history'), { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to clear history');
  return data;
};
