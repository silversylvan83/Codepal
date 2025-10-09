// src/routes/history.js
import { Router } from 'express';
import { History } from '../models/History.js';

const router = Router();

/** GET /api/history
 *  Query: ?limit=20&skip=0&language=javascript&includeCode=1
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const language = (req.query.language || '').trim() || undefined;
    const includeCode = String(req.query.includeCode || '') === '1';

    const filter = { deletedAt: null };
    if (language) filter.language = language;

    const selectFields = [
      '_id',
      'language',
      includeCode ? 'code' : undefined, // optional heavy field
      'summary',
      'review',
      'createdAt',
      'model',
      'provider',
    ]
      .filter(Boolean)
      .join(' ');

    const [items, total] = await Promise.all([
      History.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(selectFields)
        .lean(),
      History.countDocuments(filter),
    ]);

    res.json({
      total,
      count: items.length,
      items: items.map((h) => ({
        id: String(h._id),
        language: h.language,
        summary:
          h.summary ??
          (typeof h.review === 'string' ? h.review.slice(0, 200) : '') ??
          '',
        code: includeCode ? h.code : undefined,
        createdAt: h.createdAt,
        model: h.model,
        provider: h.provider,
      })),
    });
  } catch (err) {
    console.error('[history] list error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/** GET /api/history/:id -> full snapshot */
router.get('/:id', async (req, res) => {
  try {
    const doc = await History.findById(req.params.id);
    if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: String(doc._id),
      language: doc.language,
      code: doc.code,
      review: doc.review,
      summary: doc.summary,
      comments: doc.comments,
      improvedSnippet: doc.improvedSnippet,
      createdAt: doc.createdAt,
      model: doc.model,
      provider: doc.provider,
    });
  } catch (err) {
    console.error('[history] get error:', err);
    res.status(500).json({ error: 'Failed to fetch history item' });
  }
});

/** DELETE /api/history/:id -> soft delete */
router.delete('/:id', async (req, res) => {
  try {
    const doc = await History.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'Not found' });
    if (!doc.deletedAt) {
      doc.deletedAt = new Date();
      await doc.save();
    }
    res.json({ ok: true, id: String(doc._id) });
  } catch (err) {
    console.error('[history] delete error:', err);
    res.status(500).json({ ok: false, error: 'Failed to delete history item' });
  }
});

/** DELETE /api/history -> bulk clear (soft delete all) */
router.delete('/', async (_req, res) => {
  try {
    const r = await History.updateMany({ deletedAt: null }, { $set: { deletedAt: new Date() } });
    res.json({ ok: true, updated: r.modifiedCount || 0 });
  } catch (err) {
    console.error('[history] bulk delete error:', err);
    res.status(500).json({ ok: false, error: 'Failed to clear history' });
  }
});

export default router;
