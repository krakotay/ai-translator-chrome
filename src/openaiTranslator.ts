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
Ты – Chrome-переводчик. Получишь текст, где строки
разделены символом ${delim} (U+241F). Верни перевод в
точно таком же формате, без комментариев и кода.
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
