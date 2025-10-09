// serverless wrapper for Express app in Vercel
import serverless from 'serverless-http';
import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// cache one DB connect across cold starts
let dbReady = globalThis._dbReady;
if (!dbReady) dbReady = globalThis._dbReady = connectDB();

const app = createApp();
const handler = serverless(app);

// Vercel will call this default export for ALL /api/* requests
export default async function vercelHandler(req, res) {
  // ensure DB is ready
  await dbReady;
  return handler(req, res);
}
