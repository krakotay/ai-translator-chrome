'use strict';
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const Translation = z.object({
  chunks: z.array(z.string()),
});

export async function translateJoined(
  apiKey: string,
  baseURL: string,
  model: string,
  joined: string,                 // строки склеены ␟
  delim: string,
  targetLanguagePrompt: string,
  onChunk: (idx: number, text: string) => void,
  onComplete: () => void,
  onError: (err: Error) => void
) {
  const openai = new OpenAI({ apiKey, baseURL });

  const systemPrompt = `
You are a Chrome translator.

The user will send you a code block with several lines of text.
Each LINE in that code block is exactly ONE fragment, even if the line contains multiple sentences.

Your tasks:
- Translate every line separately.
- Keep the number of lines (fragments) exactly the same as in the input.
- Keep the order of lines exactly the same.

Return the result using the Translation schema:
- chunks: string[] where chunks[i] is the translation of line i from the input.

Do not add, remove, merge, split or reorder fragments/lines.
Do not include any explanations, comments or code outside of the JSON that matches the Translation schema.`.trim();
  try {
    const { choices } = await openai.chat.completions.parse({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: '```\n' + joined + "\n```\n\n" + targetLanguagePrompt },
      ],
      response_format: zodResponseFormat(Translation, 'translation'),
    }
    );

    const translated = choices[0].message.parsed;
    console.log('✅ translated', translated);
    translated?.chunks?.forEach((t: string, idx: number) => onChunk(idx, t));
    onComplete();
  } catch (e) {
    onError(e as Error);
  }
}
