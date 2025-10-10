import { env } from '../env';
import { reviewWithGemini } from './gemini';
import { reviewWithMock } from './mock';

export function reviewCodeLLM(input: { code: string; language?: string }) {
  if (env.LLM_PROVIDER === 'gemini') {
    return reviewWithGemini({
      code: input.code,
      language: input.language,
      model: env.LLM_MODEL,
      apiKey: env.GEMINI_API_KEY,
    });
  }
  return reviewWithMock(input);
}
