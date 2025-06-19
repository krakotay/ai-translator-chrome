console.log('🔄 background service worker started');

import { translateGPT } from "./openaiTranslator";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log('🛰️ background received message', msg);

  if (msg.type !== 'translate-via-gemma') {
    return;
  }

  chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel'], async (settings) => {
    const useCloud = !!settings.cloudMode && settings.openrouterApiKey && settings.openrouterModel;
    var escapedText = JSON.stringify(msg.text).slice(1, -1);
    var apiKey = 'lm-studio';
    var baseURL = 'http://localhost:7860/v1/chat/completions';

    if (useCloud) {
      baseURL = 'https://openrouter.ai/api/v1';
      apiKey = settings.openrouterApiKey;
    }
    // console.log(apiKey, baseURL, settings.openrouterModel, escapedText)
    const resp = await translateGPT(apiKey, baseURL, settings.openrouterModel || 'gemma-3-12B-it-qat-GGUF', escapedText, msg.fullContext).catch(err => {
      console.error('⚠️ background fetch failed', err);
      sendResponse({ success: false, error: err.message });
    });

    if (!resp) return `Нет перевода!`;
    else {
      const translated = resp.fullTranslate.trim();
      sendResponse({ success: true, translated });
    }
  })

  return true;
});
