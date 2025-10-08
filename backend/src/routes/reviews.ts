// src/routes/reviews.ts
import { Router } from 'express';
import { reviewCodeLLM } from '../llm';
import { Review } from '../models/Review';
import { env } from '../config/env';
import mongoose from 'mongoose';
import { parseGeminiReview } from '../utils/parseGeminiReview'; // if you added it; else remove parsing
import { History } from '../models/History';
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

    // 1️⃣ Generate review text from LLM
    const reviewText = await reviewCodeLLM({ code, language });
    console.log('[reviews] got review length=', reviewText?.length);

    // 2️⃣ Parse Gemini response (optional)
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

    // 3️⃣ Save Review (optional)
    let reviewDocId: string | null = null;
    if (save) {
      try {
        const reviewDoc = await Review.create({
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
        reviewDocId = reviewDoc._id.toString();
        console.log('[reviews] saved review', reviewDocId);
      } catch (e: any) {
        console.error('[reviews] save failed:', e?.message || e);
        return res.status(500).json({ error: 'DB save failed', details: e?.message || String(e) });
      }
    }

    // 4️⃣ Save to History (always)
    try {
      const hist = await History.create({
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
      });
      console.log('[history] saved entry', hist._id.toString());
    } catch (e: any) {
      console.error('[history] save failed:', e?.message || e);
    }

    // 5️⃣ Respond
    res.json({
      review: reviewText,
      summary,
      comments,
      improvedSnippet,
      id: reviewDocId,
      saved: Boolean(reviewDocId),
    });
  } catch (err: any) {
    console.error('[reviews] error:', err);
    res.status(500).json({
      error: 'Failed to review code',
      details: env.NODE_ENV !== 'production' ? err?.message || String(err) : undefined,
    });
  }
});

export default router;
