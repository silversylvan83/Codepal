import { Router } from 'express';
import { z } from 'zod';
import Snippet from '../models/Snippet';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().optional(),
      language: z.string().optional(),
      content: z.string().min(1).max(200_000)
    }).parse(req.body);

    const doc = await Snippet.create(data);
    res.json(doc);
  } catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try {
    const list = await Snippet.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(list);
  } catch (e) { next(e); }
});

export default router;
