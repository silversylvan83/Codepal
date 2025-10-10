// frontend/lib/api.ts
// Same-origin only. Never talk to localhost in production.
// This file intentionally ignores NEXT_PUBLIC_API_URL to prevent accidental leaks.

const sanitize = (path: string) => {
  // If someone passed an absolute URL, force it back to relative.
  try {
    const u = new URL(path);
    // Keep only pathname + search + hash
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    // Not an absolute URL; ensure it starts with '/'
    return path.startsWith('/') ? path : `/${path}`;
  }
};

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

const apiFetch = (path: string, init?: RequestInit) =>
  fetch(sanitize(path), init);

export const reviewCode = async (input: { code: string; language?: string }) => {
  const res = await apiFetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const listReviews = async () => {
  const res = await apiFetch('/api/reviews', { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getReviewHistory = async (params?: {
  limit?: number;
  skip?: number;
  language?: string;
}) => {
  const res = await apiFetch(`/api/history${toQs(params)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getHistory = async (params?: {
  limit?: number;
  skip?: number;
  language?: string;
  includeCode?: boolean;
}) => {
  const res = await apiFetch(
    `/api/history${toQs({
      limit: params?.limit,
      skip: params?.skip,
      language: params?.language,
      includeCode: params?.includeCode ? 1 : undefined,
    })}`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history');
  return data;
};

export const getHistoryById = async (id: string) => {
  const res = await apiFetch(`/api/history/${id}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch history item');
  return data;
};

export const deleteHistory = async (id: string) => {
  const res = await apiFetch(`/api/history/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to delete history item');
  return data;
};

export const clearHistoryServer = async () => {
  const res = await apiFetch('/api/history', { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to clear history');
  return data;
};
