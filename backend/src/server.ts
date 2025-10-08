// src/server.ts
import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function main() {
  await connectDB(); // <-- connect first
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
