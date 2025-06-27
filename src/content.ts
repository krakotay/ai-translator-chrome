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
      // activeTranslationTarget теперь является оригинальным элементом,
      // поэтому мы не должны его удалять из DOM.
      // Просто сбрасываем его и убираем кнопку.
      if (activeTranslationTarget) {
        // Убедимся, что подсветка убрана, если она еще есть
        activeTranslationTarget.style.backgroundColor = '';
      }
      activeTranslationTarget = null;
      originalSelection?.removeAllRanges(); // Сброс выделения
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

function findClosestBlockElement(node: Node): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== document.body) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      const display = window.getComputedStyle(element).display;
      if (display === 'block' || display === 'flex' || display === 'grid' || display === 'list-item' || display === 'table' || display === 'table-cell' || display === 'table-row') {
        return element;
      }
    }
    current = current.parentNode;
  }
  return null;
}

async function onClickTranslate() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0).cloneRange();
  
  // Находим ближайший блочный элемент, который содержит выделение
  const targetElement = findClosestBlockElement(range.commonAncestorContainer);

  if (!targetElement) {
    removeButton();
    console.warn("No suitable block element found for translation.");
    return;
  }

  // Применяем желтую подсветку к оригинальному элементу
  targetElement.style.backgroundColor = 'yellow';
  
  // Получаем HTML-содержимое оригинального элемента для отправки на перевод
  const htmlContentToSend = targetElement.innerHTML;

  if (!htmlContentToSend.trim()) {
    targetElement.style.backgroundColor = ''; // Убираем подсветку, если пусто
    removeButton();
    return;
  }

  activeTranslationTarget = targetElement; // Теперь activeTranslationTarget - это оригинальный элемент
  isFirstTranslatedParagraph = true; // Сбрасываем флаг для нового перевода

  // Отправляем HTML-содержимое на перевод
  chrome.runtime.sendMessage({ type: 'translate-via-gemma', text: htmlContentToSend });

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
