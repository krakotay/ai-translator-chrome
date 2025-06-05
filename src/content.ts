console.log('✅ gemma-translator content.ts loaded');

const script = document.createElement('script');
script.src = chrome.runtime.getURL('marked.min.js');
document.head.appendChild(script);

let btn: HTMLImageElement | null = null;

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
  const text = sel?.toString().trim();
  if (!text) { removeButton(); return; }

  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) {
    chrome.runtime.sendMessage(
      { type: 'translate-via-gemma', text },
      (response) => {
        if (response?.success) {
          const translated = response.translated;
          if (!sel) return;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          let html = translated;
          // @ts-ignore
          if ((window as any).marked) html = (window as any).marked.parse(translated);
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

  const range = sel.getRangeAt(0);
  const container = document.createElement('span');
  container.id = 'insert-translated-here';
  range.deleteContents();
  range.insertNode(container);

  (async () => {
    for (let i = 0; i < paragraphs.length; ++i) {
      const para = paragraphs[i];
      const translated = await new Promise<string>(resolve => {
        chrome.runtime.sendMessage(
          { type: 'translate-via-gemma', text: para },
          (response) => {
            if (response?.success) {
              let html = response.translated;
              // @ts-ignore
              if ((window as any).marked) html = (window as any).marked.parse(html);
              resolve(html);
            } else {
              resolve('<span style="color:red">Ошибка перевода</span>');
            }
          }
        );
      });
      const frag = document.createRange().createContextualFragment(translated);
      container.appendChild(frag);
      if (i < paragraphs.length - 1) {
        container.appendChild(document.createElement('br'));
        container.appendChild(document.createElement('br'));
      }
    }
    const parent = container.parentNode as Node;
    while (container.firstChild) {
      parent.insertBefore(container.firstChild, container);
    }
    parent.removeChild(container);
    sel.removeAllRanges();
    removeButton();
  })();
}

document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text) {
      removeButton();
      return;
    }
    if (!sel) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showTranslateButton(rect.right + window.scrollX - 12, rect.top + window.scrollY - 28);
  }, 10);
});

document.addEventListener('mousedown', (e) => {
  if (btn && !btn.contains(e.target as Node)) {
    removeButton();
  }
});
