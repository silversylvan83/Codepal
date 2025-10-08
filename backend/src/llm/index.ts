import { env } from '../config/env';
import { reviewWithMock } from './mock';
import { reviewWithGemini } from '../llm/gemini.ts';

export async function reviewCodeLLM(input: { code: string; language?: string }) {
  switch (env.LLM_PROVIDER) {
    case 'gemini':
      return reviewWithGemini({
        code: input.code,
        language: input.language,
        model: env.LLM_MODEL,
        apiKey: env.GEMINI_API_KEY,
      });
    default:
      return reviewWithMock(input);
  }
}
