import 'dotenv/config';

const must = (k: string, fallback?: string) => {
  const v = process.env[k] ?? fallback;
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  LLM_PROVIDER: (process.env.LLM_PROVIDER ?? 'gemini').toLowerCase(),
  LLM_MODEL: process.env.LLM_MODEL ?? 'gemini-2.5-flash',
  GEMINI_API_KEY: must('GEMINI_API_KEY'),
  MONGODB_URI: must('MONGODB_URI'),
};
