// content.js
console.log("✅ gemma-translator content.js loaded");

// Подключаем marked.js
const script = document.createElement('script');
script.src = chrome.runtime.getURL('marked.min.js');
document.head.appendChild(script);

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

  // Разбиваем на абзацы по двум и более переводам строки
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) {
    // Если один абзац — переводим как раньше
    chrome.runtime.sendMessage(
      { type: 'translate-via-gemma', text },
      (response) => {
        if (response?.success) {
          const translated = response.translated;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          let html = translated;
          if (window.marked) html = marked.parse(translated);
          const frag = range.createContextualFragment(html);
          range.insertNode(frag);
          sel.removeAllRanges();
        } else {
          console.error('Ошибка перевода:', response?.error);
        }
        removeButton();
      }
    );
    return;
  }

  // Несколько абзацев: переводим по одному, вставляем в контейнер
  const range = sel.getRangeAt(0);
  // Создаём временный контейнер
  const container = document.createElement('span');
  container.id = 'insert-translated-here';
  range.deleteContents();
  range.insertNode(container);

  (async () => {
    for (let i = 0; i < paragraphs.length; ++i) {
      const para = paragraphs[i];
      // eslint-disable-next-line no-await-in-loop
      const translated = await new Promise(resolve => {
        chrome.runtime.sendMessage(
          { type: 'translate-via-gemma', text: para },
          (response) => {
            if (response?.success) {
              let html = response.translated;
              if (window.marked) html = marked.parse(html);
              resolve(html);
            } else {
              resolve('<span style="color:red">Ошибка перевода</span>');
            }
          }
        );
      });
      const frag = document.createRange().createContextualFragment(translated);
      container.appendChild(frag);
      // Добавляем разделитель между абзацами, кроме последнего
      if (i < paragraphs.length - 1) {
        container.appendChild(document.createElement('br'));
        container.appendChild(document.createElement('br'));
      }
    }
    // Разворачиваем контейнер (заменяем контейнер его содержимым)
    const parent = container.parentNode;
    while (container.firstChild) {
      parent.insertBefore(container.firstChild, container);
    }
    parent.removeChild(container);
    sel.removeAllRanges();
    removeButton();
  })();
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
