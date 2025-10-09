// dev-server.mjs
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import next from 'next';

import reviewsRouter from './src/routes/reviews.js';
import snippetsRouter from './src/routes/snippets.js';
import historyRouter from './src/routes/history.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== 'production';
const PORT = Number(process.env.PORT );

(async function main() {
  // 1) DB once
  await connectDB();

  // 2) Next
  const nextApp = next({ dev, dir: __dirname });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  // 3) One Express server
  const server = express();
  server.use(express.json({ limit: '1mb' }));
  server.use(express.urlencoded({ extended: true }));

  // API (same-origin)
  server.use('/api/reviews', reviewsRouter);
  server.use('/api/snippets', snippetsRouter);
  server.use('/api/history', historyRouter);

  // Optional health
  server.get('/api', (_req, res) => {
    res.json({
      ok: true,
      provider: env.LLM_PROVIDER,
      model: env.LLM_MODEL,
      time: new Date().toISOString(),
    });
  });

  // 4) Everything else -> Next
  // EXPRESS 5 FIX: don't use "*"; use a regex or a bare .use()
  // server.all('*', (req, res) => handle(req, res));              // ❌ causes "Missing parameter name"
  server.all(/.*/, (req, res) => handle(req, res));                // ✅ regex works
  // or: server.use((req, res) => handle(req, res));               // ✅ also fine

  server.listen(PORT, () => {
    console.log(`[dev] Single-port server on http://localhost:${PORT}`);
  });
})().catch((err) => {
  console.error('[dev] fatal:', err);
  process.exit(1);
});
