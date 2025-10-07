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
