import 'dotenv/config';

const must = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT ),

  // MongoDB connection
  MONGODB_URI: must(
    'MONGODB_URI',
    'mongodb+srv://vaishnavisanya28_db_user:YELoCWk4OlD9z5yl@cluster0.hlkduio.mongodb.net/'
  ),

  // LLM (Gemini-only)
  LLM_PROVIDER: (process.env.LLM_PROVIDER ).toLowerCase(),
  GEMINI_API_KEY: must('GEMINI_API_KEY'),
  LLM_MODEL: process.env.LLM_MODEL ,
};
