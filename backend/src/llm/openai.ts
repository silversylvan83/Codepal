import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import OpenAI from 'openai';

export async function reviewWithOpenAI(input: { code: string; language?: string; model: string; apiKey: string; }) {
  const client = new OpenAI({ apiKey: input.apiKey });
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: `You are an expert code reviewer.
Return JSON with keys: summary (string), comments (array of {line,level,message}), patch (unified diff as string).` },
    { role: 'user', content: `Language: ${input.language || 'plain'}\nCode:\n---\n${input.code}\n---` }
  ];
  const resp = await client.chat.completions.create({ model: input.model, messages, temperature: 0.2, response_format: { type: 'json_object' } as any });
  const raw = resp.choices[0]?.message?.content || '{}';
  return JSON.parse(raw);
}
