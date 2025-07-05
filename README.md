# LM Studio Translator

---


  
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
2.  Download the latest `.crx` file.
3.  Open Chrome, navigate to `chrome://extensions/`, and drag the downloaded file into the window to load the extension.

**From Source**

1.  Download the extension files (or clone the repository).
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" in the top right corner.
4.  Click "Load unpacked" and select the `dist` folder from the project directory.

#### Configuration

The extension can be configured to work with different backends.

**Recommended: OpenRouter**

1.  Get your API key from [OpenRouter](https://openrouter.ai/).
2.  Open the extension's options page.
3.  Enable OpenRouter and enter your API key.
4.  Set the model name. The author's choice is `google/gemini-2.5-flash-lite-preview-06-17`.

**Alternative: LM Studio**

1.  Make sure you have [LM Studio](https://lmstudio.ai/) installed and running.
2.  Load a model of your choice and start the local server.
3.  Open the extension's options page and set the correct API address (e.g., `http://localhost:1234/v1`) and model name.

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
2.  Скачайте последний `.crx` файл.
3.  Откройте Chrome, перейдите на страницу `chrome://extensions/` и загрузите расширение.

**Из исходного кода**

1.  Скачайте файлы расширения (или клонируйте репозиторий).
2.  Откройте Chrome и перейдите по адресу `chrome://extensions/`.
3.  Включите "Режим разработчика" в правом верхнем углу.
4.  Нажмите "Загрузить распакованное расширение" и выберите папку `dist` из каталога проекта.

#### Настройка

Расширение можно настроить для работы с разными бэкендами.

**Рекомендуемый способ: OpenRouter**

1.  Получите ваш API-ключ на [OpenRouter](https://openrouter.ai/).
2.  Откройте страницу настроек расширения.
3.  Включите OpenRouter в Options/Настройках и введите ваш API-ключ.
4.  Укажите имя модели. Выбор автора: `google/gemini-2.5-flash-lite-preview-06-17`.

**Альтернатива: LM Studio**

1.  Убедитесь, что у вас установлен и запущен [LM Studio](https://lmstudio.ai/).
2.  Загрузите нужную модель и запустите локальный сервер.
3.  Откройте страницу настроек расширения и укажите правильный адрес API (например, `http://localhost:1234/v1`) и название модели.
