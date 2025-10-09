import { env } from '../config/env.js';
import { reviewWithMock } from './mock.js';
import { reviewWithGemini } from './gemini.js';

export async function reviewCodeLLM(input) {
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
