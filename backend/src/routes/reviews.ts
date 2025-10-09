import { Router } from "express";
import mongoose from "mongoose";
import { reviewCodeLLM } from "../llm";
import { Review } from "../models/Review";
import { History } from "../models/History";
import { env } from "../config/env";
import { parseGeminiReview } from "../utils/parseGeminiReview"; // optional, as before
import { improveCodeLLM } from "../llm/improve"; // 👈 new

const router = Router();

router.post("/", async (req, res) => {
  try {
    const bodyPreview = JSON.stringify(req.body || {}).slice(0, 500);

    const { code, language, snippetId, save = true } = req.body || {};
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: 'Missing "code" in request body' });
    }

    // 1) Generate review (text)
    const reviewText = await reviewCodeLLM({ code, language });

    // 2) Parse (optional)
    let summary = "";
    let comments: any[] = [];
    let improvedSnippet = "";
    try {
      const parsed = parseGeminiReview ? parseGeminiReview(reviewText) : null;
      if (parsed) {
        summary = parsed.summary || "";
        comments = Array.isArray(parsed.comments) ? parsed.comments : [];
        improvedSnippet = parsed.improvedSnippet || "";
      }
    } catch (e) {
      console.warn("[reviews] parse skipped/failed:", (e as any)?.message);
    }

    // 3) Fallback: ensure improvedSnippet exists
    if (!improvedSnippet) {
      try {
        improvedSnippet = await improveCodeLLM({
          code,
          language,
          model: env.LLM_MODEL || "gemini-2.5-flash",
          apiKey: env.GEMINI_API_KEY,
        });
      } catch (e: any) {
        console.error("[reviews] improveCodeLLM failed:", e?.message || e);
        // final fallback: at least return original code, so UI shows something
        improvedSnippet = code;
      }
    }

    // 4) Save Review (optional)
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
      } catch (e: any) {
        console.error("[reviews] save failed:", e?.message || e);
        return res
          .status(500)
          .json({ error: "DB save failed", details: e?.message || String(e) });
      }
    }

    // 5) Save History (always or optional: gate behind `save`)
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
    } catch (e: any) {
      console.error("[history] save failed:", e?.message || e);
    }

    // 6) Respond
    res.json({
      review: reviewText,
      summary,
      comments,
      improvedSnippet,
      id: reviewDocId,
      saved: Boolean(reviewDocId),
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to review code",
      details:
        env.NODE_ENV !== "production" ? err?.message || String(err) : undefined,
    });
  }
});

export default router;
