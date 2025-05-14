// background.js
console.log('🔄 background service worker started');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('🛰️ background received message', msg);

  if (msg.type !== 'translate-via-gemma') {
    // не наш формат — никак не отвечаем
    return;
  }

  // говорим Chrome: держи порт открытым до sendResponse
  const url = 'http://localhost:7860/v1/chat/completions';
  const body = JSON.stringify({
    model: 'gemma-3-12B-it-qat-GGUF',
    messages: [
      {
        role: 'user',
        content: `Переведи этот текст\n\`\`\`\n${msg.text}\n\`\`\`\nНа русский язык. Текст в MD-блоке.`
      }
    ],
    max_tokens: 512,
    temperature: 0.0
  });

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })
  .then(resp => {
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  })
  .then(json => {
    const raw = json.choices?.[0]?.message?.content?.trim() || '🚫 Ошибка';
    const match = raw.match(/```[^\n]*\n([\s\S]*?)```/);
    const translated = match ? match[1].trim() : raw;
    sendResponse({ success: true, translated });
  })
  .catch(err => {
    console.error('⚠️ background fetch failed', err);
    sendResponse({ success: false, error: err.message });
  });

  // важно! вернуть true СРАЗУ, а не внутри then/catch
  return true;
});
