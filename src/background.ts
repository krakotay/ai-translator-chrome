'use strict';
console.log('🔄 background service worker started');

import { translateJoined } from "./openaiTranslator";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "translate-via-ai") return;

  const { texts } = msg as { texts: string[] };
  const tabId = sender.tab?.id;
  if (!tabId) return sendResponse({ ok: false, error: 'no-tab' });

  // настроечки из storage
  chrome.storage.local.get(
    ['cloudMode', 'openrouterApiKey', 'openrouterModel', 'targetLanguagePrompt'],
    (settings) => {
      const useCloud = !!settings.cloudMode && settings.openrouterApiKey && settings.openrouterModel;
      const apiKey = useCloud ? settings.openrouterApiKey : 'lm-studio';
      const baseURL = useCloud ? 'https://openrouter.ai/api/v1'
        : 'http://localhost:7860/v1/chat/completions';
      const model = useCloud ? settings.openrouterModel
        : 'gemma-3-12B-it-qat-GGUF';
      const targetLanguagePrompt = settings.targetLanguagePrompt || 'Переведи на русский';

      /* ---------- перевод ---------- */
      const DELIM = '␟';                         // U+241F
      const joined = texts.join(DELIM);

      translateJoined(
        apiKey,
        baseURL,
        model,
        joined,
        DELIM,
        targetLanguagePrompt,
        /* onChunk */(idx, line) => {
          chrome.tabs.sendMessage(tabId, {
            type: 'translated-chunk',
            idx,
            text: line,
          });
        },
        /* onComplete */() => {
          chrome.tabs.sendMessage(tabId, { type: 'translation-complete' });
        },
        /* onError   */(err) => {
          chrome.tabs.sendMessage(tabId, {
            type: 'translation-error',
            error: err.message,
          });
        }
      );
    }
  );

  return true; // keep the message channel open (async)
});
