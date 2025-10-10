import { GoogleGenerativeAI } from '@google/generative-ai';

const alias = (m?: string) => {
  const id = (m ?? '').toLowerCase();
  if (id === 'gemini-1.5-pro') return 'gemini-1.5-pro-latest';
  if (id === 'gemini-1.5-flash') return 'gemini-1.5-flash-latest';
  if (id === 'gemini-2.5-flash') return 'gemini-2.5-flash';
  return m ?? 'gemini-2.5-flash';
};

export async function reviewWithGemini({
  code, language, model, apiKey,
}: { code: string; language?: string; model: string; apiKey: string }) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: alias(model) });

  const prompt = `
Review the following ${language || 'code'} and provide:
- Bugs and fixes
- Performance/memory optimizations
- Readability & best-practice improvements
- Security issues (if any)
Then include an improved snippet.

\`\`\`${language || 'text'}
${code}
\`\`\`
`;
  const res = await gemini.generateContent(prompt);
  const text = typeof res.response.text === 'function'
    ? res.response.text()
    : String((res)?.response?.text ?? '');
  return text.trim() || 'No review generated.';
}
