# LLM Chromium Translator

---
A simple demonstration, spanish to russian

![image](https://github.com/user-attachments/assets/40d4dd3d-1d5c-4ab1-8a44-c47308dfc47a)
![image](https://github.com/user-attachments/assets/d7b47dd2-9c7e-4892-ab3c-603c4ae08866)


  
### 🇬🇧 English

LM Studio Translator is a browser extension that allows you to translate text on web pages using a large language model (LLM). While it supports local models via LM Studio for maximum privacy, it is recommended to use it with [OpenRouter](https://openrouter.ai/) for better performance and a wider selection of models.

#### Features

*   **Flexible Backend**: Supports both local models via LM Studio and cloud models via OpenRouter.
*   **Privacy-Focused**: Your data remains private when using a local model.
*   **Custom Model Support**: Works with any model compatible with the OpenAI API format.
*   **Easy to Use**: Select text on any page, and a translation button will appear nearby.

#### Installation

**Recommended: From Release**

1.  Go to the [Releases](https://github.com/krakotay/my-translator/releases) page.
2.  Download the latest `.7z` file, unpack it
3.  Open Chrome, navigate to `chrome://extensions/`, enable developer mode and Load unpacked.
![image](https://github.com/user-attachments/assets/c7644ede-63cd-4d64-b74d-a48207694a44)

**From Source**

1.  Download the extension files (or clone the repository).
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" in the top right corner.
4.  Click "Load unpacked" and select the `dist` folder from the project directory.

#### Configuration

The extension can be configured to work with different backends.

**OpenRouter**

1.  Get your API key from [OpenRouter](https://openrouter.ai/).
2.  Open the extension's options page.
3.  Enable OpenRouter and enter your API key.
4.  Set the model name. The author's choice is `google/gemini-2.5-flash-lite-preview-06-17`.

---

### 🇷🇺 Русский

LM Studio Translator — это браузерное расширение для перевода текста на веб-страницах с помощью большой языковой модели (LLM). Хотя оно поддерживает локальные модели через LM Studio для максимальной конфиденциальности, рекомендуется использовать его с [OpenRouter](https://openrouter.ai/) для лучшей производительности и более широкого выбора моделей.

#### Возможности

*   **Гибкий бэкенд**: Поддерживает как локальные модели через LM Studio, так и облачные через OpenRouter.
*   **Конфиденциальность**: Ваши данные остаются приватными при использовании локальной модели.
*   **Поддержка своих моделей**: Работает с любой моделью, совместимой с форматом OpenAI API.
*   **Простота в использовании**: Выделите текст на любой странице, и рядом появится кнопка для перевода.

#### Установка

**Рекомендуемый способ: Из релиза**

1.  Перейдите на страницу [Релизы](https://github.com/krakotay/my-translator/releases).
2.  Скачайте последний `.7z` file, распакуйте
3.  В Chrome перейдите по `chrome://extensions/`, включие режим разработки и загрузите всю папку.
![image](https://github.com/user-attachments/assets/c7644ede-63cd-4d64-b74d-a48207694a44)

**Из исходного кода**

1.  Скачайте файлы расширения (или клонируйте репозиторий).
2.  Откройте Chrome и перейдите по адресу `chrome://extensions/`.
3.  Включите "Режим разработчика" в правом верхнем углу.
4.  Нажмите "Загрузить распакованное расширение" и выберите папку `dist` из каталога проекта.

#### Настройка

Расширение можно настроить для работы с разными бэкендами.

**OpenRouter**

1.  Получите ваш API-ключ на [OpenRouter](https://openrouter.ai/).
2.  Откройте страницу настроек расширения.
3.  Включите OpenRouter в Options/Настройках и введите ваш API-ключ.
4.  Укажите имя модели. Выбор автора: `google/gemini-2.5-flash-lite-preview-06-17`.
