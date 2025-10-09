import { GoogleGenerativeAI } from '@google/generative-ai';

function stripCodeFence(s: string): string {
  if (!s) return '';
  // remove ```lang ... ``` fences if present
  const m = s.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/);
  if (m) return m[1].trim();
  return s.trim();
}

export async function improveCodeLLM({
  code,
  language,
  model,
  apiKey,
}: {
  code: string;
  language?: string;
  model: string;
  apiKey: string;
}): Promise<string> {
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model });

  // Prompt tightly: ask for code-only output; no commentary.
  const prompt = `You are a senior ${language || 'software'} engineer.
Rewrite the following code to be more robust, readable, secure, and performant.
Keep the same external behavior and signatures.
Return ONLY the improved code. Do NOT include any commentary or markdown fences.

Original ${language || 'code'}:
${code}
`;

  const res = await gemini.generateContent(prompt);
  const text = (res.response.text?.() || res.response.text || '').trim();
  return stripCodeFence(text);
}
