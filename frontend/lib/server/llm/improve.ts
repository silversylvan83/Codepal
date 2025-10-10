import { GoogleGenerativeAI } from '@google/generative-ai';

const alias = (m?: string) =>
  (m?.toLowerCase() === 'gemini-1.5-pro' ? 'gemini-1.5-pro-latest'
  : m?.toLowerCase() === 'gemini-1.5-flash' ? 'gemini-1.5-flash-latest'
  : m ?? 'gemini-2.5-flash');

function stripFence(s: string) {
  const m = s?.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/);
  return m ? m[1].trim() : (s || '').trim();
}

export async function improveCodeLLM({
  code, language, model, apiKey,
}: { code: string; language?: string; model: string; apiKey: string }) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: alias(model) });

  const prompt = `Rewrite the following ${language || 'code'} to be more robust, readable, secure, and performant.
Return ONLY code, no comments or fences.

${code}
`;
  const res = await gemini.generateContent(prompt);
  const raw = typeof res.response.text === 'function'
    ? res.response.text()
    : String((res)?.response?.text ?? '');
  return stripFence(raw) || code;
}
