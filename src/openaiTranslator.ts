import OpenAI from "openai";

export async function streamTranslateGPT(
  apiKey: string,
  baseURL: string,
  model: string,
  text: string,
  onParagraph: (paragraph: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  const openai = new OpenAI({ apiKey, baseURL });

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Переведи этот текст\n```" },
        { role: "user", content: text + "\n```\n\nНа русский, без комментариев." },
      ],
      stream: true,
    });

    let buffer = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta?.content;
      if (!delta) continue;

      buffer += delta;

      // пока в буфере есть двойной перенос строки — режем абзацы
      let delimiterIndex;
      while ((delimiterIndex = buffer.indexOf("\n\n")) !== -1) {
        const paragraph = buffer.slice(0, delimiterIndex).trim();
        if (paragraph) {
          onParagraph(paragraph + "\n\n");
        }
        buffer = buffer.slice(delimiterIndex + 2);
      }
    }

    // после завершения стрима, если что-то осталось — шлём это как последний абзац
    const remaining = buffer.trim();
    if (remaining) {
      onParagraph(remaining);
    }

    onComplete();

  } catch (error) {
    console.error("Error during OpenAI stream:", error);
    onError(error as Error);
  }
}

