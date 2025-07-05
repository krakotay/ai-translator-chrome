import OpenAI from "openai";

/**
 * Перевод склеенного текста (строки разделены ␟) одной LLM-запросом
 * и раздача результата порциями через коллбэки.
 */
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
You are a Chrome translator. You will receive text where lines
are separated by the ${delim} symbol (U+241F). Return the translation in
exactly the same format, without comments and code.
  `.trim();

  try {
    const { choices } = await openai.chat.completions.create({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: '```\n' + joined + "\n```\n\n" + targetLanguagePrompt },
      ],
    });

    const translated = choices[0].message.content!.trim().replaceAll('```', '');
    console.log('✅ translated', translated);
    translated.split(delim).forEach((t, idx) => onChunk(idx, t));
    onComplete();
  } catch (e) {
    onError(e as Error);
  }
}
