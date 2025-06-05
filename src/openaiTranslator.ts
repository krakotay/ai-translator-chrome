import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
const TranslateEvent = z.object({
    fullTranslate: z.string(),
    comments: z.string(),
});
  
export async function translateGPT(apiKey: string, baseURL: string, model: string, text: string) {
    const openai = new OpenAI({apiKey, baseURL});


    const completion = await openai.chat.completions.parse({
      model: model,
      messages: [
        { role: "system", content: "Переведи текст ниже целиком, как есть." },
        { role: "user", content: text + "\n\nНа русский язык" },
      ],
      response_format: zodResponseFormat(TranslateEvent, "event"),
      temperature: 0.1
    });
    console.log(completion)
    const translate = completion.choices[0].message.parsed;
    return translate
}

