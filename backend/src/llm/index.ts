import { env } from '../config/env';
import { reviewWithMock } from './mock';
import { reviewWithOpenAI } from './openai';

export async function reviewCodeLLM(input: { code: string; language?: string }) {
  if (env.LLM_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
    return reviewWithOpenAI({ code: input.code, language: input.language, model: env.OPENAI_MODEL, apiKey: env.OPENAI_API_KEY });
  }
  // default mock
  return reviewWithMock(input);
}
