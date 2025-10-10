import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/server/env';
import { connectDB } from '@/lib/server/db';
import { reviewCodeLLM } from '@/lib/server/llm';
import { improveCodeLLM } from '@/lib/server/llm/improve';
import { parseGeminiReview } from '@/lib/server/utils/parseGeminiReview';
import { ReviewModel } from '@/lib/server/models/Review';
import { HistoryModel } from '@/lib/server/models/History';

export const runtime = 'nodejs';
// If you’re on Hobby, you effectively get ~10s. Keep our own timeout below that.
export const dynamic = 'force-dynamic';
export const maxDuration = 20;

type ReviewLevel = 'bug' | 'performance' | 'readability' | 'security' | 'info';
type ReviewComment = { line: number; level: ReviewLevel; message: string };

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}_timeout_${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code: string | undefined = body?.code;
    const language: string | undefined = body?.language;
    const snippetId: string | undefined = body?.snippetId;
    const save: boolean = body?.save !== false; // default true

    if (typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Missing "code"' }, { status: 400 });
    }

    // Launch a *fast* improvement in parallel so we can fall back quickly.
    const improveFast = improveCodeLLM({
      code,
      language,
      model: env.LLM_MODEL,
      apiKey: env.GEMINI_API_KEY,
    }).catch(() => code);

    // Hard-timeout the “full review” so the function never exceeds Vercel’s limit.
    let reviewText = '';
    try {
      reviewText = await withTimeout(
        reviewCodeLLM({ code, language }),
        8500, // keep below hobby 10s wall, adjust if your plan is higher
        'review'
      );
    } catch {
      // Degraded path: return improved snippet only
      const improvedSnippet = await withTimeout(improveFast, 2000, 'improve');
      return NextResponse.json({
        review: 'Timed out; returning improved snippet.',
        summary: '',
        comments: [] as ReviewComment[],
        improvedSnippet,
        id: null,
        saved: false,
      });
    }

    // Parse the review text (no network)
    let summary = '';
    let comments: ReviewComment[] = [];
    let improvedSnippet = '';
    try {
      const parsed = parseGeminiReview(reviewText);
      summary = parsed.summary ?? '';
      comments = Array.isArray(parsed.comments) ? parsed.comments as ReviewComment[] : [];
      improvedSnippet = parsed.improvedSnippet ?? '';
    } catch {
      // ignore parse errors; we’ll still return reviewText
    }

    // If the model didn’t include an improved snippet, use the fast one we started earlier.
    if (!improvedSnippet) {
      try {
        improvedSnippet = await withTimeout(improveFast, 2000, 'improve');
      } catch {
        improvedSnippet = code; // absolute fallback
      }
    }

    // Save only if requested (and connect just-in-time to avoid cold-start costs on timeouts)
    let reviewDocId: string | null = null;
    if (save) {
      await connectDB(); // should be a cached singleton in your db helper
      const reviewDoc = await new ReviewModel({
        snippetId: snippetId || undefined,
        language,
        code,
        review: reviewText,
        summary,
        comments,
        improvedSnippet,
        provider: env.LLM_PROVIDER,
        model: env.LLM_MODEL,
      }).save();
      reviewDocId = reviewDoc._id.toString();

      // best-effort history (don’t block the response)
      void new HistoryModel({
        snippetId: snippetId || undefined,
        reviewId: reviewDocId || undefined,
        language,
        code,
        review: reviewText,
        summary,
        comments,
        improvedSnippet,
        provider: env.LLM_PROVIDER,
        model: env.LLM_MODEL,
      }).save().catch(() => {});
    }

    return NextResponse.json({
      review: reviewText,
      summary,
      comments,
      improvedSnippet,
      id: reviewDocId,
      saved: Boolean(reviewDocId),
    });
  } catch (e) {
    const msg = (e as Error)?.message ?? 'Unknown';
    return NextResponse.json({ error: 'Failed to review code', details: msg }, { status: 500 });
  }
}
