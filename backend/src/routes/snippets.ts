import { Router } from 'express';
import { Snippet } from '../models/Snippet';

const router = Router();

// Create
router.post('/', async (req, res) => {
  try {
    const { code, language, title } = req.body || {};
    if (!code) return res.status(400).json({ error: 'code is required' });
    const doc = await Snippet.create({ code, language, title });
    res.json(doc);
  } catch (e) {
    console.error('[snippets:create]', e);
    res.status(500).json({ error: 'failed to create snippet' });
  }
});

// List
router.get('/', async (_req, res) => {
  const list = await Snippet.find().sort({ createdAt: -1 }).limit(50);
  res.json(list);
});

// Read
router.get('/:id', async (req, res) => {
  const doc = await Snippet.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });
  res.json(doc);
});

export default router;
