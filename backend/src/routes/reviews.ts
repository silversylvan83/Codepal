import { Router } from "express";
import { reviewCodeLLM } from "../llm";
import { Review } from "../models/Review";
import { env } from "../config/env";
const router = Router();
/** POST /api/reviews * body: { code: string; language?: string; save?: boolean; snippetId?: string } */ router.post(
  "/",
  async (req, res) => {
    try {
      const { code, language, save, snippetId } = req.body || {};
      if (typeof code !== "string" || !code.trim()) {
        return res
          .status(400)
          .json({ error: 'Missing "code" in request body' });
      }
      const review = await reviewCodeLLM({ code, language });
      if (save) {
        const doc = await Review.create({
          snippetId: snippetId || undefined,
          language,
          code,
          review,
          provider: env.LLM_PROVIDER,
          model: env.LLM_MODEL,
        });
        return res.json({ review, id: doc._id });
      }
      res.json({ review });
    } catch (err: any) {
      console.error("[reviews] error:", err);
      res.status(500).json({ error: "Failed to review code" });
    }
  }
);
export default router;
