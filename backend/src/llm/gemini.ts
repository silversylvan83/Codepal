import { GoogleGenerativeAI } from "@google/generative-ai";

// normalize older model names
const modelAlias = (m?: string) => {
  const id = (m || "").toLowerCase();
  if (id === "gemini-1.5-pro") return "gemini-1.5-pro-latest";
  if (id === "gemini-1.5-flash") return "gemini-1.5-flash-latest";
  if (id === "gemini-2.5-flash") return "gemini-2.5-flash";
  return m || "gemini-2.5-flash";
};

export async function reviewWithGemini({
  code,
  language,
  model,
  apiKey,
}: {
  code: string;
  language?: string;
  model: string;
  apiKey: string;
}) {
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const gemini = genAI.getGenerativeModel({ model: modelAlias(model) });

  const prompt = `You are a senior ${language || "software"} engineer.
Review the following ${language || "code"} and provide:
- Bugs and fixes
- Performance/memory optimizations
- Readability & best-practice improvements
- Security issues (if any)
Then include an improved snippet.

Code:
\`\`\`${language || "text"}
${code}
\`\`\``;

  try {
    const res = await gemini.generateContent(prompt);

    // response.text is a function: text(): string
    const text =
      typeof res.response.text === "function"
        ? res.response.text()
        : String((res as any)?.response?.text ?? "");

    const out = text?.trim();
    return out && out.length > 0 ? out : "Gemini did not return a review.";
  } catch (err: any) {
    console.error("[Gemini error]", err?.status, err?.statusText, err?.message);
    throw err;
  }
}
