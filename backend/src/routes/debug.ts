// src/routes/debug.ts
import { Router } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';

const router = Router();

router.get('/db', async (_req, res) => {
  res.json({
    mongooseState: mongoose.connection.readyState, // 1 means connected
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
  });
});

router.post('/save', async (_req, res) => {
  try {
    const doc = await Review.create({
      code: 'debug code',
      review: 'debug review',
      summary: 'debug summary',
      comments: [],
      provider: 'debug',
      model: 'debug',
    });
    res.json({ ok: true, id: doc._id });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

export default router;
