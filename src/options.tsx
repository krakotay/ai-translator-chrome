import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const Options = () => {
  const [cloudMode, setCloudMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [status, setStatus] = useState('');
  const [systemPrompt, setSystemPrompt] = useState("Ты - профессиональный переводчик. Переведи следующий HTML-код на русский язык, сохраняя всю оригинальную HTML-структуру, теги, атрибуты и форматирование. Переводи только текстовое содержимое внутри тегов. Не добавляй никаких комментариев или объяснений, только переведенный HTML.");

  useEffect(() => {
    chrome.storage.local.get(['cloudMode', 'openrouterApiKey', 'openrouterModel', 'systemPrompt'], result => {
      setCloudMode(!!result.cloudMode);
      setApiKey(result.openrouterApiKey || '');
      setModelName(result.openrouterModel || '');
      setSystemPrompt(result.systemPrompt || '');
    });
  }, []);

  const save = () => {
    chrome.storage.local.set({
      cloudMode,
      openrouterApiKey: apiKey,
      openrouterModel: modelName,
      systemPrompt,
    }, () => {
      setStatus('Сохранено!');
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
          <label htmlFor="cloudMode">Использовать облачный перевод (OpenRouter)</label>
        </div>
      </div>
      {cloudMode && (
        <div className="section" id="cloudSettings">
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
          <label htmlFor="systemPrompt">Системный промпт:</label>
          <input
            type="text"
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Введите системный промпт"
          />
        </div>
      )}
      <button id="saveBtn" onClick={save}>Сохранить</button>
      <div id="status" style={{marginTop:10,color:'green'}}>{status}</div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Options />);
