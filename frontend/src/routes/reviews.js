// src/routes/reviews.js
import { Router } from "express";
import { reviewCodeLLM } from "../llm/index.js";
import { Review } from "../models/Review.js";
import { History } from "../models/History.js";
import { env } from "../config/env.js";
import { parseGeminiReview } from "../utils/parseGeminiReview.js";
import { improveCodeLLM } from "../llm/improve.js";

const router = Router();

// ---- config knobs (env overrides) ----
const TIME_BUDGET_MS = Number(process.env.REVIEW_TIMEOUT_MS || 8500); // keep < Vercel limit
const MAX_CODE_CHARS = Number(process.env.MAX_CODE_CHARS || 100_000);

// Race a promise against a timer; throws a 504-ish error on timeout
function withTimeout(promise, ms, label = "operation") {
  return Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${label}_timeout_${ms}ms`)), ms)
    ),
  ]);
}

router.post("/", async (req, res) => {
  try {
    const { code, language, snippetId, save = true } = req.body || {};

    // validate input early
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: 'Missing "code" in request body' });
    }
    if (code.length > MAX_CODE_CHARS) {
      return res.status(413).json({
        error: "payload_too_large",
        message: `Code exceeds limit of ${MAX_CODE_CHARS} characters`,
      });
    }

    // 1) Generate review text within a strict time budget
    let reviewText = "";
    try {
      reviewText = await withTimeout(
        // If your reviewCodeLLM supports a signal/abort, thread it in here.
        reviewCodeLLM({ code, language }),
        TIME_BUDGET_MS,
        "review"
      );
    } catch (e) {
      // Return cleanly instead of letting the function hang until platform timeout
      return res.status(504).json({
        error: "model_timeout",
        message: String(e?.message || e),
      });
    }

    // 2) Parse best-effort: summary, comments, improvedSnippet
    let summary = "";
    let comments = [];
    let improvedSnippet = "";
    try {
      const parsed = parseGeminiReview ? parseGeminiReview(reviewText) : null;
      if (parsed) {
        summary = parsed.summary || "";
        comments = Array.isArray(parsed.comments) ? parsed.comments : [];
        improvedSnippet = parsed.improvedSnippet || "";
      }
    } catch (e) {
      // parsing is optional; do not fail the request
      console.warn("[reviews] parse skipped/failed:", e?.message || e);
    }

    // 3) Fallback improved snippet if parser didn’t yield one (still timeboxed)
    if (!improvedSnippet) {
      try {
        improvedSnippet = await withTimeout(
          improveCodeLLM({
            code,
            language,
            model: env.LLM_MODEL || "gemini-2.5-flash",
            apiKey: env.GEMINI_API_KEY,
          }),
          Math.max(2000, Math.floor(TIME_BUDGET_MS / 2)), // quicker fallback
          "improve"
        );
      } catch (e) {
        console.error("[reviews] improveCodeLLM failed:", e?.message || e);
        // last resort: echo original code so UI shows something useful
        improvedSnippet = code;
      }
    }

    // 4) Save Review (optional)
    let reviewDocId = null;
    if (save) {
      try {
        const reviewDoc = await new Review({
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
      } catch (e) {
        console.error("[reviews] save failed:", e?.message || e);
        return res
          .status(500)
          .json({ error: "DB save failed", details: e?.message || String(e) });
      }
    }

    // 5) Save History (best-effort; do not block response)
    try {
      await new History({
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
      }).save();
    } catch (e) {
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
  } catch (err) {
    res.status(500).json({
      error: "Failed to review code",
      details:
        env.NODE_ENV !== "production" ? err?.message || String(err) : undefined,
    });
  }
});

export default router;
