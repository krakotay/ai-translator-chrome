import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const Popup = () => {
  const [cloudMode, setCloudMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel'], result => {
      setCloudMode(!!result.cloudMode);
      setApiKey(result.openrouterApiKey || '');
      setModelName(result.openrouterModel || '');
    });
  }, []);

  useEffect(() => {
    const display = cloudMode ? '' : 'none';
    const el = document.getElementById('cloudSettings');
    if (el) el.style.display = display;
  }, [cloudMode]);

  const save = () => {
    chrome.storage.local.set({
      cloudMode,
      openrouterApiKey: apiKey,
      openrouterModel: modelName,
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
          <label htmlFor="cloudMode">Использовать облачный перевод (OpenRouter)</label>
        </div>
      </div>
      <div className="section" id="cloudSettings" style={{ display: cloudMode ? '' : 'none' }}>
        <label htmlFor="apiKey">OpenRouter API-ключ:</label>
        <input
          type="text"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Введите API-ключ"
        />
        <label htmlFor="modelName">Название модельки:</label>
        <input
          type="text"
          id="modelName"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="например, google/gemma-3-27b-it:free"
        />
      </div>
      <button id="saveBtn" onClick={save}>Сохранить</button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Popup />);
