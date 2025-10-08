// src/routes/reviews.ts
import { Router } from 'express';
import { reviewCodeLLM } from '../llm';
import { Review } from '../models/Review';
import { env } from '../config/env';
import mongoose from 'mongoose';
import { parseGeminiReview } from '../utils/parseGeminiReview'; // if you added it; else remove parsing

const router = Router();

/** POST /api/reviews
 * body: { code: string; language?: string; snippetId?: string; save?: boolean }
 */
router.post('/', async (req, res) => {
  try {
    const bodyPreview = JSON.stringify(req.body || {}).slice(0, 500);
    console.log('[reviews] incoming body:', bodyPreview);

    const { code, language, snippetId, save = true } = req.body || {};
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Missing "code" in request body' });
    }

    // Log mongoose state: 1=connected, 2=connecting, 0=disconnected, 3=disconnecting
    console.log('[reviews] mongoose readyState =', mongoose.connection.readyState);

    // 1) Get review from LLM
    const reviewText = await reviewCodeLLM({ code, language });
    console.log('[reviews] got review length=', reviewText?.length);

    // 2) (Optional) parse if you added parser; otherwise skip
    let summary = '';
    let comments: any[] = [];
    let improvedSnippet = '';
    try {
      const parsed = parseGeminiReview ? parseGeminiReview(reviewText) : null;
      if (parsed) {
        summary = parsed.summary || '';
        comments = Array.isArray(parsed.comments) ? parsed.comments : [];
        improvedSnippet = parsed.improvedSnippet || '';
      }
    } catch (e) {
      console.warn('[reviews] parse skipped/failed:', (e as any)?.message);
    }

    // 3) Save
    let docId: string | null = null;
    if (save) {
      try {
        const doc = await Review.create({
          snippetId: snippetId || undefined,
          language,
          code,
          review: reviewText,
          summary,
          comments,
          improvedSnippet,
          provider: env.LLM_PROVIDER,
          model: env.LLM_MODEL,
        });
        docId = doc._id.toString();
        console.log('[reviews] saved review', docId);
      } catch (e: any) {
        console.error('[reviews] save failed:', e?.message || e);
        if (env.NODE_ENV !== 'production') {
          return res.status(500).json({ error: 'DB save failed', details: e?.message || String(e) });
        }
        return res.status(500).json({ error: 'DB save failed' });
      }
    }

    // 4) Respond
    res.json({
      review: reviewText,
      summary,
      comments,
      improvedSnippet,
      id: docId,
      saved: Boolean(docId),
    });
  } catch (err: any) {
    console.error('[reviews] error:', err);
    if (env.NODE_ENV !== 'production') {
      return res.status(500).json({ error: 'Failed to review code', details: err?.message || String(err) });
    }
    res.status(500).json({ error: 'Failed to review code' });
  }
});
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const language = req.query.language as string | undefined;

    const filter = language ? { language } : {};

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('language summary createdAt model provider'); // only what’s needed in UI

    const total = await Review.countDocuments(filter);

    res.json({
      total,
      count: reviews.length,
      items: reviews.map((r) => ({
        id: r._id,
        language: r.language,
        summary: r.summary || r.review.slice(0, 200),
        createdAt: r.createdAt,
        model: r.model,
        provider: r.provider,
      })),
    });
  } catch (err: any) {
    console.error('[reviews] history error:', err);
    res.status(500).json({ error: 'Failed to fetch review history' });
  }
});
export default router;
