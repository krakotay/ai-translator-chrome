console.log('🔄 background service worker started');

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log('🛰️ background received message', msg);

  if (msg.type !== 'translate-via-gemma') {
    return;
  }

  chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel'], (settings) => {
    const useCloud = !!settings.cloudMode && settings.openrouterApiKey && settings.openrouterModel;
    if (useCloud) {
      const url = 'https://openrouter.ai/api/v1/chat/completions';
      const escapedText = JSON.stringify(msg.text).slice(1, -1);
      const body = JSON.stringify({
        model: settings.openrouterModel,
        messages: [
          {
            role: 'user',
            content: `Переведи этот текст\n\`\`\`\n${escapedText}\n\`\`\`\nНа русский язык как есть. Текст полностью в MD-блоке. return ТОЛЬКО чистый перевод, без комментариев!`
          }
        ],
        max_tokens: 512,
        temperature: 0.1
      });
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openrouterApiKey}`,
          'HTTP-Referer': '',
          'X-Title': ''
        },
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
          console.error('⚠️ OpenRouter fetch failed', err);
          sendResponse({ success: false, error: err.message });
        });
    } else {
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
        temperature: 0.1
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
    }
  });

  return true;
});
