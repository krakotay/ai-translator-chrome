console.log('✅ gemma-translator content.ts loaded');

const script = document.createElement('script');
script.src = chrome.runtime.getURL('marked.min.js');
document.head.appendChild(script);

let btn: HTMLImageElement | null = null;
let activeTranslationTarget: HTMLElement | null = null;
let originalSelection: Selection | null = null;
let isFirstTranslatedParagraph: boolean = true;
let originalElementsToTranslate: HTMLElement[] = [];
let originalTexts: string[] = [];
let currentParagraphIndex: number = 0;

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (!activeTranslationTarget) return;

  switch (msg.type) {
    case 'translated-paragraph':
      // msg.paragraph теперь содержит переведенный HTML
      if (activeTranslationTarget) {
        activeTranslationTarget.innerHTML = msg.paragraph;
        // После вставки перевода, убираем желтый фон
        activeTranslationTarget.style.backgroundColor = '';
      }
      break;

    case 'translation-complete':
      if (activeTranslationTarget.parentElement) {
        const parent = activeTranslationTarget.parentElement;
        while (activeTranslationTarget.firstChild) {
          parent.insertBefore(activeTranslationTarget.firstChild, activeTranslationTarget);
        }
        parent.removeChild(activeTranslationTarget);
      }
      activeTranslationTarget = null;
      originalSelection?.removeAllRanges();
      removeButton();
      break;

    case 'translation-error':
      const errorSpan = document.createElement('span');
      errorSpan.style.color = 'red';
      errorSpan.textContent = `Ошибка перевода: ${msg.error}`;
      activeTranslationTarget.appendChild(errorSpan);
      break;
  }
});

function removeButton() {
  if (btn) {
    btn.remove();
    btn = null;
  }
}

function showTranslateButton(x: number, y: number) {
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
    zIndex: '2147483647'
  } as CSSStyleDeclaration);
  document.body.appendChild(btn);

  btn.addEventListener('click', onClickTranslate);
}

async function onClickTranslate() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  originalSelection = sel;
  const range = sel.getRangeAt(0).cloneRange();

  // Извлекаем HTML-содержимое из выделения
  const extractedContents = range.extractContents();
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(extractedContents);
  const htmlContent = tempDiv.innerHTML; // Это HTML для отправки на перевод

  if (!htmlContent.trim()) { removeButton(); return; } // Проверяем, не пустое ли содержимое

  // Создаем контейнер для перевода (желтая подсветка)
  const container = document.createElement('div');
  container.className = 'gemma-translation-container';
  container.style.backgroundColor = 'yellow';
  
  // Вставляем контейнер обратно в документ на место оригинального выделения
  range.insertNode(container);
  
  // Устанавливаем innerHTML контейнера в оригинальное HTML-содержимое
  container.innerHTML = htmlContent; // Отображаем оригинальный HTML с желтым фоном

  activeTranslationTarget = container;
  isFirstTranslatedParagraph = true; // Сбрасываем флаг для нового перевода

  // Отправляем HTML-содержимое на перевод
  chrome.runtime.sendMessage({ type: 'translate-via-gemma', text: htmlContent });

  removeButton();
}

document.addEventListener('mouseup', (e) => {
  // Ignore clicks on our own button
  if (btn && e.target === btn) return;

  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || !sel) {
      removeButton();
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    // Do not show button if the selection is inside an input or textarea
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        removeButton();
        return;
    }
    showTranslateButton(rect.right + window.scrollX - 12, rect.top + window.scrollY - 28);
  }, 10);
});

document.addEventListener('mousedown', (e) => {
  if (btn && !btn.contains(e.target as Node)) {
    removeButton();
  }
});
