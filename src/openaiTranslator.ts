import OpenAI from "openai";

export async function streamTranslateGPT(
  apiKey: string,
  baseURL: string,
  model: string,
  htmlContent: string, // Изменено с text на htmlContent
  onParagraph: (paragraph: string) => void, // Теперь будет получать полный HTML
  onComplete: () => void,
  onError: (error: Error) => void
) {
  const openai = new OpenAI({ apiKey, baseURL });

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        // Обновленный системный промпт для перевода HTML
        { role: "system", content: "Ты - профессиональный переводчик. Переведи следующий HTML-код на русский язык, сохраняя всю оригинальную HTML-структуру, теги, атрибуты и форматирование. Переводи только текстовое содержимое внутри тегов. Не добавляй никаких комментариев или объяснений, только переведенный HTML." },
        { role: "user", content: htmlContent + "\n\nНа русский, без комментариев." }, // Передаем HTML-контент напрямую
      ],
      stream: true,
    });

    let buffer = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta?.content;
      if (!delta) continue;

      buffer += delta;
    }

    // После завершения стрима, шлём весь накопленный HTML как один "абзац"
    if (buffer.trim()) {
      onParagraph(buffer);
    }

    onComplete();

  } catch (error) {
    console.error("Error during OpenAI stream:", error);
    onError(error as Error);
  }
}

