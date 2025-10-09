import { GoogleGenerativeAI } from '@google/generative-ai';

function stripCodeFence(s: string): string {
  if (!s) return '';
  // remove ```lang\n ... \n``` or ``` ... ```
  const m = s.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/);
  return m ? m[1].trim() : s.trim();
}

// optional: normalize some common model names
const modelAlias = (m?: string) => {
  const id = (m || '').toLowerCase();
  if (id === 'gemini-1.5-pro') return 'gemini-1.5-pro-latest';
  if (id === 'gemini-1.5-flash') return 'gemini-1.5-flash-latest';
  if (id === 'gemini-2.5-flash') return 'gemini-2.5-flash'; // current name
  return m || 'gemini-2.5-flash';
};

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
  const gemini = genAI.getGenerativeModel({ model: modelAlias(model) });

  const prompt = `You are a senior ${language || 'software'} engineer.
Rewrite the following code to be more robust, readable, secure, and performant.
Keep the same external behavior and signatures.
Return ONLY the improved code. Do NOT include any commentary or markdown fences.

Original ${language || 'code'}:
${code}
`;

  const res = await gemini.generateContent(prompt);

  // response.text is a function: text(): string
  const raw =
    typeof res.response.text === 'function'
      ? res.response.text()
      : String((res as any)?.response?.text ?? '');

  const cleaned = stripCodeFence(raw);
  return cleaned || '';
}
