import 'dotenv/config';

const must = (k: string, fallback?: string) => {
  const v = process.env[k] ?? fallback;
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: must('MONGODB_URI', 'mongodb://127.0.0.1:27017/codepal'),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim()),
  // LLM
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'mock',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};
