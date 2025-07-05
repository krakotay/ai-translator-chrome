// content.ts — узловой перевод ✓2025-07-05
console.log('✅ gemma-translator content.ts loaded');
const script = document.createElement('script');
script.src = chrome.runtime.getURL('marked.min.js');
document.head.appendChild(script);

/******************** 1. Переменные-состояния ********************/
let uiBtn: HTMLImageElement | null = null;       // плавающая иконка
let activeBlock: HTMLElement | null = null;      // выбранный блочный DOM-элемент
let textInfos: {
  node: Text;
  original: string;
}[] = [];                                        // карта индексов → Text-ноды

/******************** 2. Утилиты ********************/
const DELIM = "␟";                               // должен совпадать с background

// Проходит по всему поддереву и собирает видимые Text-ноды
function collectVisibleTextNodes(root: Node) {
  const out: { node: Text; original: string }[] = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;

        const el = node.parentElement as HTMLElement | null;
        if (!el) return NodeFilter.FILTER_REJECT;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  while (walker.nextNode()) {
    const n = walker.currentNode as Text;
    out.push({ node: n, original: n.nodeValue! });
  }
  return out;
}

// Ищем ближайший «блочный» контейнер
function findClosestBlockElement(node: Node) {
  let cur: Node | null = node;
  while (cur && cur !== document.body) {
    if (
      cur.nodeType === Node.ELEMENT_NODE &&
      ["block", "flex", "grid", "list-item", "table", "table-row", "table-cell"].includes(
        getComputedStyle(cur as Element).display
      )
    ) {
      return cur as HTMLElement;
    }
    cur = cur.parentNode;
  }
  return null;
}

/******************** 3. UI-кнопка перевода ********************/
function removeBtn() {
  uiBtn?.remove();
  uiBtn = null;
}
function showBtn(x: number, y: number) {
  removeBtn();
  uiBtn = document.createElement("img");
  uiBtn.src = chrome.runtime.getURL("icon16.png");
  Object.assign(uiBtn.style, {
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    width: "24px",
    height: "24px",
    cursor: "pointer",
    zIndex: "2147483647",
  } as CSSStyleDeclaration);
  document.body.appendChild(uiBtn);
  uiBtn.addEventListener("click", onTranslateClick);
}

/******************** 4. Основная логика перевода ********************/
async function onTranslateClick() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  // 4.1 Блок
  const block = findClosestBlockElement(range.commonAncestorContainer);
  if (!block) return;
  activeBlock = block;
  block.style.backgroundColor = "yellow";

  // 4.2 Сбор текстовых узлов
  textInfos = collectVisibleTextNodes(block);
  if (textInfos.length === 0) {
    block.style.backgroundColor = "";
    return;
  }
  const payload = textInfos.map((t) => t.original);

  // 4.3 Отправляем массив строк
  chrome.runtime.sendMessage({
    type: "translate-via-ai",
    texts: payload,
  });

  removeBtn();
}

/******************** 5. Приём сообщений от background ********************/
chrome.runtime.onMessage.addListener((msg) => {
  if (!activeBlock) return;

  switch (msg.type) {
    case "translated-chunk": {
      const { idx, text } = msg as { idx: number; text: string };
      if (textInfos[idx]) textInfos[idx].node.nodeValue = text;
      break;
    }
    case "translation-complete": {
      activeBlock.style.backgroundColor = "";
      activeBlock = null;
      textInfos = [];
      break;
    }
    case "translation-error": {
      const span = document.createElement("span");
      span.style.color = "red";
      span.textContent = `Ошибка перевода: ${msg.error}`;
      activeBlock.appendChild(span);
      break;
    }
  }
});

/******************** 6. Слушатели выделения ********************/
document.addEventListener("mouseup", (e) => {
  if (uiBtn && e.target === uiBtn) return; // клик по иконке
  setTimeout(() => {
    const sel = window.getSelection();
    const txt = sel?.toString().trim();
    if (!txt || !sel) {
      removeBtn();
      return;
    }
    // не показывать над input/textarea
    const ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA)$/.test(ae.tagName)) {
      removeBtn();
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    showBtn(rect.right + window.scrollX - 12, rect.top + window.scrollY - 28);
  }, 10);
});

document.addEventListener("mousedown", (e) => {
  if (uiBtn && !uiBtn.contains(e.target as Node)) removeBtn();
});
