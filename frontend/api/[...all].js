// api/[...all].js
import serverless from 'serverless-http';
import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

let dbReady = global._dbReady;
if (!dbReady) dbReady = global._dbReady = connectDB();

const app = createApp();
const handler = serverless(app);

export default async function api(req, res) {
  await dbReady;
  return handler(req, res);
}
