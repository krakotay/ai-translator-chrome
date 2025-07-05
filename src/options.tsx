import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const Options = () => {
  const [cloudMode, setCloudMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [status, setStatus] = useState('');
  const [targetLanguagePrompt, setTargetLanguagePrompt] = useState("Переведи на русский");

  useEffect(() => {
    chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel', 'targetLanguagePrompt'], result => {
      setCloudMode(!!result.cloudMode);
      setApiKey(result.openrouterApiKey || '');
      setModelName(result.openrouterModel || '');
      setTargetLanguagePrompt(result.targetLanguagePrompt || '');
    });
  }, []);

  const save = () => {
    chrome.storage.local.set({
      cloudMode,
      openrouterApiKey: apiKey,
      openrouterModel: modelName,
      targetLanguagePrompt,
    }, () => {
      setStatus('Saved!');
      setTimeout(() => setStatus(''), 1200);
    });
  };

  return (
    <div>
      <h2>Translator Settings</h2>
      <div className="section">
        <div className="switch">
          <input
            type="checkbox"
            id="cloudMode"
            checked={cloudMode}
            onChange={(e) => setCloudMode(e.target.checked)}
          />
          <label htmlFor="cloudMode">Use OpenRouter</label>
        </div>
      </div>
      {cloudMode && (
        <div className="section" id="cloudSettings">
          <label htmlFor="apiKey">OpenRouter API-key:</label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API-key"
          />
          <label htmlFor="modelName">Model name:</label>
          <input
            type="text"
            id="modelName"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="google/gemini-2.5-flash-lite-preview-06-17"
          />
          <label htmlFor="targetLanguagePrompt">System prompt:</label>
          <input
            type="text"
            id="targetLanguagePrompt"
            value={targetLanguagePrompt}
            onChange={(e) => setTargetLanguagePrompt(e.target.value)}
            placeholder="Enter system prompt"
          />
        </div>
      )}
      <button id="saveBtn" onClick={save}>Save</button>
      <div id="status" style={{marginTop:10,color:'green'}}>{status}</div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Options />);
