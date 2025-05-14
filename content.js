// content.js
console.log("✅ gemma-translator content.js loaded");

let btn = null;

// Удалить кнопку, если она уже есть
function removeButton() {
  if (btn) {
    btn.remove();
    btn = null;
  }
}

// Создать мини-кнопку над выделенным текстом
function showTranslateButton(x, y) {
  removeButton();

  btn = document.createElement('img');
  btn.src = chrome.runtime.getURL('icon16.png');
  btn.id = 'gemma-trans-btn';
  Object.assign(btn.style, {
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    zIndex: 2147483647
  });
  document.body.appendChild(btn);

  btn.addEventListener('click', onClickTranslate);
}

// Обработчик клика по кнопке
// content.js (фрагмент onClickTranslate)

async function onClickTranslate() {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text) { removeButton(); return; }
  
    // вместо прямого fetch — сообщение в background.js
    chrome.runtime.sendMessage(
      { type: 'translate-via-gemma', text },
      (response) => {
        if (response?.success) {
          const translated = response.translated;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(translated));
          sel.removeAllRanges();
        } else {
          console.error('Ошибка перевода:', response?.error);
        }
        removeButton();
      }
    );
  }
  
// Слушаем отпускание кнопки мыши
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text) {
      removeButton();
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    // Показываем кнопку чуть выше правого края выделения
    showTranslateButton(rect.right + window.scrollX - 12, rect.top + window.scrollY - 28);
  }, 10);
});

// Убираем кнопку, если кликнули куда-нибудь ещё
document.addEventListener('mousedown', (e) => {
  if (btn && !btn.contains(e.target)) {
    removeButton();
  }
});
