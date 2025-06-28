console.log('🔄 background service worker started');

import { streamTranslateGPT } from "./openaiTranslator";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('🛰️ background received message', msg);

  if (msg.type !== 'translate-via-gemma') {
    return;
  }

  const tabId = sender.tab?.id;
  if (!tabId) {
    console.error("Could not get tab ID.");
    sendResponse({ success: false, error: "Could not get tab ID." });
    return;
  }

  chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel', 'systemPrompt'], (settings) => {
    const useCloud = !!settings.cloudMode && settings.openrouterApiKey && settings.openrouterModel;
    var escapedText = JSON.stringify(msg.text).slice(1, -1);
    var apiKey = 'lm-studio';
    var baseURL = 'http://localhost:7860/v1/chat/completions';

    if (useCloud) {
      baseURL = 'https://openrouter.ai/api/v1';
      apiKey = settings.openrouterApiKey;
    }

    const onParagraph = (paragraph: string) => {
      chrome.tabs.sendMessage(tabId, {
        type: 'translated-paragraph',
        paragraph: paragraph,
      });
    };

    const onComplete = () => {
      chrome.tabs.sendMessage(tabId, { type: 'translation-complete' });
    };

    const onError = (error: Error) => {
      chrome.tabs.sendMessage(tabId, {
        type: 'translation-error',
        error: error.message,
      });
    };

    streamTranslateGPT(
      apiKey,
      baseURL,
      settings.openrouterModel || 'gemma-3-12B-it-qat-GGUF',
      settings.systemPrompt,
      escapedText,
      onParagraph,
      onComplete,
      onError
    ).catch(err => {
      console.error('⚠️ background stream initiation failed', err);
      onError(err);
    });
  });

  return true;
});
