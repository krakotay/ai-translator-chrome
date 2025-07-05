import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const Popup = () => {
  const openOptionsPage = () => {
    chrome.tabs.create({ url: 'options.html' });
  };

  return (
    <div>
      <button onClick={openOptionsPage}>Options</button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Popup />);
