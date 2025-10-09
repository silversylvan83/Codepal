import { GoogleGenerativeAI } from '@google/generative-ai';

function stripCodeFence(s) {
  const input = s || '';
  // remove ```lang\n ... \n``` or ``` ... ```
  const match = input.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/);
  const inner = match?.[1];
  return (inner ?? input).trim();
}

// optional: normalize some common model names
const modelAlias = (m) => {
  const id = (m || '').toLowerCase();
  if (id === 'gemini-1.5-pro') return 'gemini-1.5-pro-latest';
  if (id === 'gemini-1.5-flash') return 'gemini-1.5-flash-latest';
  if (id === 'gemini-2.5-flash') return 'gemini-2.5-flash'; // current name
  return m || 'gemini-2.5-flash';
};

export async function improveCodeLLM({ code, language, model, apiKey }) {
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: modelAlias(model) });

  const prompt = `Rewrite the following code to be more robust, readable, secure, and performant.
Keep the same external behavior and signatures.
Return ONLY the improved code. Do NOT include any commentary or markdown fences.

Original ${language || 'code'}:
${code}
`;

  const res = await gemini.generateContent(prompt);

  // response.text is a function: text(): string
  const raw =
    typeof res.response?.text === 'function'
      ? res.response.text()
      : String(res?.response?.text ?? '');

  const cleaned = stripCodeFence(raw);
  return cleaned || '';
}
