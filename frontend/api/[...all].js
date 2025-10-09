// frontend/api/[...all].js
import serverless from 'serverless-http';
import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let dbReady = globalThis._dbReady;
if (!dbReady) dbReady = globalThis._dbReady = connectDB();

const expressApp = createApp();
const serverlessHandler = serverless(expressApp);

function setCors(res, origin) {
  if (!origin) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin'); // proper caching per origin
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
}

export default async function handler(req, res) {
  // Compute allowed origins (your deployed URL + optional override + local)
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const explicit = process.env.FRONTEND_ORIGIN || null;
  const allowed = new Set(
    [vercelUrl, explicit, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean)
  );

  const origin = req.headers.origin || '';
  if (origin && allowed.has(origin)) {
    setCors(res, origin);
  }

  // Preflight exit early
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  await dbReady;
  return serverlessHandler(req, res);
}
