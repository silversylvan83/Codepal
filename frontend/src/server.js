// src/server.js
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[server] listening on :${env.PORT}`);
    console.log(`[llm] provider=${env.LLM_PROVIDER} model=${env.LLM_MODEL}`);
  });
}

main().catch((err) => {
  console.error('[boot] fatal:', err);
  process.exit(1);
});
