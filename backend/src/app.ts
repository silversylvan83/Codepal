import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import reviews from './routes/reviews.js';
import snippets from './routes/snippets.js';

const app = express();

const origins = new Set(env.CORS_ORIGINS);
app.use(cors({
  origin(origin, cb) { if (!origin || origins.has(origin)) return cb(null, true); return cb(null, false); },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ ok: true, name: 'CodePal API' }));

app.use('/api/reviews', rateLimit({ windowMs: 60_000, max: 30 }), reviews);
app.use('/api/snippets', snippets);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal error' });
});

export default app;
