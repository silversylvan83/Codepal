import { Router } from 'express';
import { z } from 'zod';
import Review from '../models/Review';
import { reviewCodeLLM } from '../llm';

const router = Router();

const ReviewIn = z.object({
  code: z.string().min(1).max(100_000),
  language: z.string().optional()
});

router.post('/', async (req, res, next) => {
  try {
    const { code, language } = ReviewIn.parse(req.body);
    const out = await reviewCodeLLM({ code, language });
    const doc = await Review.create({
      language,
      model: process.env.LLM_PROVIDER || 'mock',
      ...out
    });
    res.json(doc);
  } catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try {
    const list = await Review.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json(list);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Review.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

export default router;
