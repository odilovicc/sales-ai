# 🤖 Telegram Lead Bot - Автоматический сбор лидов



Готовое к продакшену решение для автоматического сбора лидов из Telegram каналов с использованием локального AI (Ollama + Llama 3.2).Готовое к продакшену решение для автоматического сбора лидов из Telegram каналов с использованием локального AI (Ollama + Llama 3.2).



## 📋 Возможности



- ✅ **Userbot на GramJS** - Полноценный клиент Telegram (аналог Telethon для TypeScript)- ✅ **Userbot на GramJS** - Полноценный клиент Telegram (аналог Telethon для TypeScript)

- ✅ **Мониторинг каналов** - Отслеживание новых сообщений в режиме реального времени- ✅ **Мониторинг каналов** - Отслеживание новых сообщений в режиме реального времени

- ✅ **AI фильтрация** - Интеллектуальная квалификация лидов через локальный LLM (Llama 3.2)- ✅ **AI фильтрация** - Интеллектуальная квалификация лидов через локальный LLM

- ✅ **Экспорт в Excel** - Автоматическое сохранение в `leads.xlsx` с 7 колонками- ✅ **Экспорт в Excel** - Автоматическое сохранение в leads.xlsx

- ✅ **Google Sheets интеграция** - Синхронизация лидов с проверкой дубликатов по телефону- ✅ **Google Sheets интеграция** - Синхронизация лидов с проверкой дубликатов

- ✅ **Локальный AI** - Ollama + Llama 3.2 (бесплатно, работает оффлайн, приватно)- ✅ **Локальный AI** - Ollama + Llama 3.2 (бесплатно, работает оффлайн)

- ✅ **Защита от дубликатов** - Кэширование и проверка по телефону + имени- ✅ **Защита от дубликатов** - Проверка по номеру телефона

- ✅ **Поддержка фото** - Анализ подписей к фотографиям- ✅ **Поддержка фото** - Анализ подписей к фотографиям

- ✅ **Кликабельные ссылки** - Прямые ссылки на сообщения в Excel- ✅ **Настраиваемость** - Гибкая конфигурация через .env

- ✅ **Настраиваемость** - Гибкая конфигурация через `.env`

## 🏗 Architecture

## 🏗 Архитектура

```

```┌─────────────────────────────────────────────────────────────┐

┌─────────────────────────────────────────────────────────────┐│                     Telegram Bot                            │

│                  Telegram Lead Bot                           ││                                                             │

│                                                              ││  ┌──────────────┐      ┌──────────────┐                   │

│  ┌──────────────┐      ┌──────────────┐                    ││  │   Telegram   │─────▶│   GramJS     │                   │

│  │   Telegram   │─────▶│   GramJS     │                    ││  │   Channels   │      │   Client     │                   │

│  │   Channels   │      │   Client     │                    ││  └──────────────┘      └───────┬──────┘                   │

│  └──────────────┘      └───────┬──────┘                    ││                                 │                           │

│                                 │                            ││                                 ▼                           │

│                                 ▼                            ││                        ┌────────────────┐                  │

│                        ┌────────────────┐                   ││                        │  Message       │                  │

│                        │  Message       │                   ││                        │  Processing    │                  │

│                        │  Processing    │                   ││                        └────────┬───────┘                  │

│                        └────────┬───────┘                   ││                                 │                           │

│                                 │                            ││                                 ▼                           │

│                                 ▼                            ││                        ┌────────────────┐                  │

│                        ┌────────────────┐                   ││                        │   Ollama       │◀─── llama3.2    │

│                        │   Ollama       │◀─── llama3.2     ││                        │   (Local LLM)  │     (Local)     │

│                        │   (Local LLM)  │     (Local)      ││                        └────────┬───────┘                  │

│                        └────────┬───────┘                   ││                                 │                           │

│                                 │                            ││                                 ▼                           │

│                                 ▼                            ││                        ┌────────────────┐                  │

│                        ┌────────────────┐                   ││                        │  Lead Filter   │                  │

│                        │  Lead Filter   │                   ││                        │  & Extract     │                  │

│                        │  & Validation  │                   ││                        └────────┬───────┘                  │

│                        └────────┬───────┘                   ││                                 │                           │

│                                 │                            ││                                 ▼                           │

│                    ┌────────────┴────────────┐              ││                        ┌────────────────┐                  │

│                    ▼                         ▼              ││                        │  Excel Export  │─────▶ leads.xlsx│

│           ┌────────────────┐      ┌──────────────────┐     ││                        └────────────────┘                  │

│           │  Excel Export  │      │  Google Sheets   │     │└─────────────────────────────────────────────────────────────┘

│           │  leads.xlsx    │      │  Integration     │     │```

│           └────────────────┘      └──────────────────┘     │

└─────────────────────────────────────────────────────────────┘## 🎯 Lead Qualification Criteria

```

The LLM analyzes messages for companies in the following sectors:

## 🎯 Критерии квалификации лидов

- Биохимия (Biochemistry)

LLM анализирует сообщения и ищет компании в следующих секторах:- Производство воды (Water production)

- Производство снеков (Snack production)

- **Биохимия** - Бытовая химия, моющие средства- Продажа кешью, орехов, сухофруктов (Cashew, nuts, dried fruits sales)

- **Снеки** - Производство снеков, кукурузные палочки, чипсы- Смежные FMCG товары (Related FMCG products)

- **Вода** - Производство воды, напитков

- **Кешью** - Орехи, сухофрукты, кешью## 🚀 Quick Start



**Строгие 4 категории** - Другие категории не принимаются### Prerequisites



**Обязательные поля для лида:**- [Bun](https://bun.sh) installed

- Название компании (не страна/город!)- Telegram account

- Номер телефона- API credentials from https://my.telegram.org/apps

- Одна из 4 категорий- [Ollama](https://ollama.com) installed with Llama 3.2 model



## 🚀 Быстрый старт### Installation



### Требования1. **Clone or navigate to the project:**

   ```bash

- [Bun](https://bun.sh) установлен   cd /Users/notprxgrammer/personal-projects/bot-ai

- Аккаунт Telegram   ```

- API credentials с https://my.telegram.org/apps

- [Ollama](https://ollama.com) с моделью Llama 3.22. **Install dependencies:**

   ```bash

### Установка за 5 минут   bun install

   ```

1. **Установите зависимости:**

   ```bash3. **Setup Ollama (see [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for details):**

   bun install   ```bash

   ```   # Install Ollama

   curl -fsSL https://ollama.com/install.sh | sh

2. **Настройте Ollama:**   

   ```bash   # Start Ollama server

   # Установка Ollama (macOS/Linux)   ollama serve

   curl -fsSL https://ollama.com/install.sh | sh   

      # Download Llama 3.2 model

   # Запуск сервера (в отдельном терминале)   ollama pull llama3.2

   ollama serve   ```

   

   # Скачивание модели Llama 3.24. **Configure environment variables:**

   ollama pull llama3.2   ```bash

   ```   cp .env.example .env

   ```

3. **Настройте `.env`:**   

   ```env   Edit `.env` and fill in your credentials:

   # Telegram API (получить на my.telegram.org/apps)   ```env

   API_ID=1234567   API_ID=your_api_id

   API_HASH=your_hash_here   API_HASH=your_api_hash

   PHONE_NUMBER=+998901234567   PHONE_NUMBER=+1234567890

      CHANNELS=@channel1,@channel2

   # Каналы для мониторинга (через запятую)   ```

   CHANNELS=@UZB_Oziq_Ovqat,@Diler_UZB,@dillerlar_uz

   5. **Run the userbot:**

   # Настройки бота   ```bash

   ANALYZE_HISTORY=false        # Анализировать историю при старте?   bun run index.ts

   HISTORY_LIMIT=50             # Сколько сообщений анализировать   ```

   MIN_MESSAGE_LENGTH=20        # Минимальная длина сообщения

   HISTORY_DELAY=1000           # Задержка между сообщениями (мс)## 📁 Project Structure

   CHANNEL_DELAY=2000           # Задержка между каналами (мс)

   ``````

bot-ai/

4. **Запустите бота:**├── index.ts                    # Main entry point

   ```bash├── package.json               # Dependencies and scripts

   bun start├── tsconfig.json             # TypeScript configuration

   ```├── .env.example              # Environment template

├── .gitignore               # Git ignore rules

5. **Введите код из SMS** при первом запуске├── README.md                # This file

└── src/

Готово! Бот начнет мониторинг и сохранять лиды в `leads.xlsx`    ├── config/

    │   └── index.ts         # Configuration management

## 📁 Структура проекта    ├── services/

    │   ├── telegram.ts      # GramJS client & operations

```    │   ├── llm.ts          # LLM integration

bot-ai/    │   └── excel.ts        # Excel export functionality

├── index.ts                       # Точка входа    ├── types/

├── package.json                   # Зависимости    │   └── index.ts        # TypeScript interfaces

├── .env                          # Конфигурация    └── utils/

├── leads.xlsx                    # Excel с лидами (создается автоматически)        └── logger.ts       # Logging utilities

├── google-credentials.json       # Credentials для Google Sheets (опционально)```

│

└── src/## 🔧 Configuration

    ├── config/

    │   └── index.ts              # Управление конфигурацией### Telegram API Credentials

    ├── services/

    │   ├── telegram.ts           # Telegram клиент (GramJS)1. Go to https://my.telegram.org/apps

    │   ├── llm.ts                # LLM интеграция (Ollama)2. Create a new application

    │   ├── excel.ts              # Excel экспорт3. Copy `api_id` and `api_hash`

    │   └── googleSheets.ts       # Google Sheets интеграция4. Add them to your `.env` file

    ├── types/

    │   └── index.ts              # TypeScript типы### LLM Configuration

    └── utils/

        └── logger.ts             # Цветной логгерThe project uses **Ollama** with **Llama 3.2** model running locally. No API keys needed!

```

**Make sure Ollama is running before starting the bot:**

## 📝 Команды```bash

ollama serve

### Основные```



```bashFor detailed Ollama setup instructions, see [OLLAMA_SETUP.md](OLLAMA_SETUP.md).

# Запуск бота

bun start**Benefits of using local Ollama:**

- 🚀 Faster response times (no network latency)

# Режим разработки (с авто-перезагрузкой)- 💰 Free - no API costs

bun run dev- 🔒 Privacy - data stays on your computer

- 🔄 Works offline

# Тест подключения к Ollama

bun run test:ollama### Channels Configuration



# Тест Google Sheets подключенияAdd channels to monitor in one of two ways:

bun run test:google

1. **Environment variable** (recommended):

# Синхронизация лидов в Google Sheets   ```env

bun run sync:google   CHANNELS=@channel1,@channel2,https://t.me/channel3

```   ```



## 📊 Структура Excel файла2. **Code** - Edit `src/config/index.ts`:

   ```typescript

Лиды автоматически сохраняются в `leads.xlsx` со следующими колонками:   export const DEFAULT_CHANNELS: string[] = [

     '@example_channel',

| Колонка | Описание | Пример |     'https://t.me/another_channel',

|---------|----------|--------|   ];

| **Name** | Название компании | OKEY, Bravo, BIOLIFE |   ```

| **Phone** | Номер телефона | +998901234567 |

| **Category** | Категория (4 типа) | Снеки, Биохимия, Вода, Кешью |## 📊 Excel Output

| **Channel** | Источник (канал) | @UZB_Oziq_Ovqat |

| **MessageLink** | Кликабельная ссылка | https://t.me/channel/123 |Leads are automatically saved to `leads.xlsx` with the following columns:

| **OriginalMessage** | Исходный текст | Полный текст сообщения |

| **Date** | Дата добавления | 28.11.2024, 14:30:25 || Имя | Телефон | Категория | Оригинальное сообщение | Дата добавления |

|-----|---------|-----------|------------------------|-----------------|

**Файл создается автоматически** при первом лиде и обновляется в реальном времени.| Company name | Phone | Category | Original message text | Timestamp |



## 🎛 Конфигурация ботаThe file is created automatically on the first lead and updated in real-time.



### Основные настройки (.env)## 🔍 How It Works



#### ANALYZE_HISTORY1. **Initialization** - Client connects to Telegram using your credentials

**Тип:** `true` / `false`  2. **Authentication** - You enter the code sent to your phone

**По умолчанию:** `false`3. **Channel Joining** - Automatically joins specified channels (with rate limiting)

4. **Message Listening** - Monitors all new messages in real-time

Анализировать ли историю сообщений при запуске:5. **LLM Analysis** - Each message is sent to LLM for qualification

- `true` - при запуске бот проанализирует последние N сообщений6. **Lead Extraction** - LLM returns structured data (name, phone, category)

- `false` - только новые сообщения после запуска (рекомендуется)7. **Excel Export** - Qualified leads are saved to Excel automatically



```env## 🛡️ Error Handling

ANALYZE_HISTORY=true   # Анализировать историю

ANALYZE_HISTORY=false  # Только новые (рекомендуется)The userbot includes comprehensive error handling:

```

- **Rate Limiting** - Automatic delays when joining channels

#### HISTORY_LIMIT- **Reconnection** - Auto-reconnect on connection loss

**Тип:** число  - **Graceful Shutdown** - Clean disconnect on Ctrl+C

**По умолчанию:** `50`  - **Error Logging** - Detailed logs for debugging

**Рекомендуется:** `20-100`- **Session Persistence** - Saves session to avoid re-authentication



Сколько последних сообщений анализировать из каждого канала:## 📝 Scripts



```env```bash

HISTORY_LIMIT=20   # Быстрый запуск# Run the userbot

HISTORY_LIMIT=50   # Баланс (рекомендуется)bun run start

HISTORY_LIMIT=100  # Глубокий анализ

```# Run with auto-reload (development)

bun run dev

#### MIN_MESSAGE_LENGTH

**Тип:** число  # Test Ollama connection

**По умолчанию:** `20`bun run test:ollama



Минимальная длина сообщения (короткие игнорируются):# Sync leads to Google Sheets

bun run sync:google

```env```

MIN_MESSAGE_LENGTH=15  # Менее строго

MIN_MESSAGE_LENGTH=20  # По умолчанию## 🔄 Google Sheets Integration

MIN_MESSAGE_LENGTH=30  # Более строго

```Автоматическая синхронизация лидов из `leads.xlsx` в Google Sheets с проверкой на дубликаты.



#### HISTORY_DELAY### Быстрая настройка:

**Тип:** число (миллисекунды)  

**По умолчанию:** `1000`1. **Создайте Service Account** в Google Cloud Console

2. **Скачайте JSON ключ** и сохраните как `google-credentials.json`

Задержка между обработкой сообщений (чтобы не перегружать Ollama):3. **Предоставьте доступ** к таблице Service Account email

4. **Запустите синхронизацию**:

```env   ```bash

HISTORY_DELAY=500   # Быстрее   bun run sync:google

HISTORY_DELAY=1000  # Баланс (рекомендуется)   ```

HISTORY_DELAY=2000  # Медленнее, безопаснее

```**Подробная инструкция**: См. [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)



#### CHANNEL_DELAY### Возможности:

**Тип:** число (миллисекунды)  

**По умолчанию:** `2000`- ✅ Автоматическая проверка на дубликаты (по имени + телефону)

- ✅ Конвертация категорий (Биохимия → Bioximiya, Снеки → Snacks)

Задержка между каналами при анализе истории:- ✅ Полная валидация данных перед добавлением

- ✅ Подробная статистика после синхронизации

```env- ✅ Поддержка batch-обработки больших объемов

CHANNEL_DELAY=1000  # Быстрее

CHANNEL_DELAY=2000  # По умолчанию## 🔐 Security Notes

CHANNEL_DELAY=3000  # Медленнее

```- ⚠️ **Never commit `.env`** - Contains sensitive credentials

- ⚠️ **Session files** - Keep `*.session` files private

### 🎯 Рекомендуемые конфигурации- ⚠️ **API Keys** - Protect your LLM API keys

- ⚠️ **Rate Limits** - Respect Telegram's rate limits to avoid bans

**Быстрый режим (только новые):**

```env## 🐛 Troubleshooting

ANALYZE_HISTORY=false

MIN_MESSAGE_LENGTH=20### "Missing required environment variable"

```- Check that all variables in `.env` are set

- Ensure `.env` file is in the project root

**Стандартный режим:**

```env### "Authentication failed"

ANALYZE_HISTORY=true- Verify `API_ID` and `API_HASH` are correct

HISTORY_LIMIT=50- Check that phone number includes country code (+)

MIN_MESSAGE_LENGTH=20

HISTORY_DELAY=1000### "FLOOD_WAIT" error

CHANNEL_DELAY=2000- Telegram rate limit triggered

```- The bot will automatically wait and retry

- Consider reducing the number of channels to join at once

**Глубокий анализ:**

```env### LLM not working

ANALYZE_HISTORY=true- Verify `LLM_API_KEY` and `LLM_API_URL` are correct

HISTORY_LIMIT=100- Check the `callLLM()` function matches your provider's API

MIN_MESSAGE_LENGTH=15- Review logs for API error messages

HISTORY_DELAY=1500

CHANNEL_DELAY=3000## 🧪 Testing

```

For testing without LLM API, use the mock function:

**Для слабого компьютера:**

```env```typescript

ANALYZE_HISTORY=true// In src/services/telegram.ts, replace:

HISTORY_LIMIT=20const llmResponse = await parseMessageThroughLLM(messageText);

MIN_MESSAGE_LENGTH=25

HISTORY_DELAY=2000// With:

CHANNEL_DELAY=3000import { mockLLM } from './llm';

```const llmResponse = await mockLLM(messageText);

```

## 🔄 Google Sheets интеграция

## 📚 Dependencies

### Быстрая настройка (5 минут)

- **telegram** (GramJS) - Telegram client library

1. **Создайте Service Account** в [Google Cloud Console](https://console.cloud.google.com):- **exceljs** - Excel file generation

   - Создайте проект- **input** - Interactive CLI input

   - Включите Google Sheets API- **bun** - JavaScript runtime

   - Создайте Service Account

   - Скачайте JSON ключ## 📄 License



2. **Сохраните ключ** как `google-credentials.json` в корне проектаMIT



3. **Дайте доступ к таблице:**## 🤝 Contributing

   - Откройте файл `google-credentials.json`

   - Скопируйте email из поля `client_email`This is a production-ready template. Customize it for your specific needs:

   - Откройте вашу Google таблицу

   - Нажмите "Share" → вставьте email → дайте права "Editor"1. Adjust LLM prompts in `src/services/llm.ts`

2. Modify lead criteria

4. **Запустите синхронизацию:**3. Add custom filtering logic

   ```bash4. Extend Excel columns

   bun run sync:google5. Add database integration

   ```

## ⚡ Performance Tips

### Структура Google Sheets (A-I колонки)

- **Rate Limiting** - Adjust delays in `joinChannels()` based on account age

| Колонка | Название | Описание |- **Message Filtering** - Add pre-filtering before LLM to reduce API calls

|---------|----------|----------|- **Batch Processing** - Consider batching messages for LLM analysis

| A | Lead Name | Название компании |- **Caching** - Cache LLM responses for similar messages

| B | Contact name | Контактное лицо |

| C | Position | Должность |## 📞 Support

| D | Tr | Транзакция |

| E | Phone number | Номер телефона |For issues:

| F | Industry Category | FMCG (всегда) |1. Check logs for error messages

| G | Industry Name | Snacks, Bioximiya, drinks |2. Verify configuration

| H | Location | Toshkent |3. Review Telegram API documentation

| **I** | **Imported Locally** | **YES** (для лидов из Excel) |4. Check GramJS documentation: https://gram.js.org



### Проверка дубликатов---



Система проверяет дубликаты **ТОЛЬКО по номеру телефона**:**Built with ❤️ using Bun, TypeScript, and GramJS**


- ✅ Один телефон = один лид
- ✅ Нормализация телефонов (`+998 90 123 45 67` → `+998901234567`)
- ✅ Защита от опечаток в названиях компаний
- ✅ Локальное кэширование для быстрой проверки

**Примеры дубликатов:**
```
+998 90 123 45 67  = +998901234567 ✅
998-90-123-45-67   = 998901234567  ✅
+998 (90) 123-45-67 = +998901234567 ✅
```

### Конвертация категорий

| Русский (Excel) | Английский (Google Sheets) |
|-----------------|---------------------------|
| Биохимия | Bioximiya |
| Снеки | Snacks |
| Вода | drinks |
| Кешью | snacks |

### Статистика синхронизации

```
═══════════════════════════════════════════
           SYNCHRONIZATION RESULTS         
═══════════════════════════════════════════
📊 Total leads in Excel:    500
✅ Successfully added:       48
⚠️  Duplicates (skipped):    452
❌ Failed to add:            0
═══════════════════════════════════════════
```

## 🔍 Как это работает

1. **Инициализация** - Подключение к Telegram с вашими credentials
2. **Аутентификация** - Ввод кода из SMS (только первый раз)
3. **Сохранение сессии** - Создается `SESSION_STRING` в `.env`
4. **Мониторинг каналов** - Отслеживание новых сообщений в реальном времени
5. **Анализ через LLM** - Каждое сообщение отправляется в Ollama
6. **Извлечение данных** - LLM возвращает структурированные данные
7. **Проверка дубликатов** - Кэширование по телефону + имени
8. **Сохранение** - Автоматическое добавление в Excel с кликабельной ссылкой

### Обработка фотографий

Бот анализирует подписи к фотографиям:
```
📸 Фото с подписью → Извлекается текст → Анализ LLM → Сохранение лида
```

## 🛡️ Защита и безопасность

### Обработка ошибок

- ✅ **Rate limiting** - Автоматические задержки
- ✅ **Reconnection** - Авто-переподключение при разрыве
- ✅ **Graceful shutdown** - Корректное отключение (Ctrl+C)
- ✅ **Подробное логирование** - Цветные логи для отладки
- ✅ **Сохранение сессии** - Не нужно вводить код повторно

### Безопасность

- ⚠️ **Никогда не коммитьте `.env`** - Содержит приватные ключи
- ⚠️ **Файлы сессий** - Держите `*.session` в секрете
- ⚠️ **Google credentials** - `google-credentials.json` в `.gitignore`
- ⚠️ **Rate limits** - Соблюдайте лимиты Telegram

## 🐛 Решение проблем

### "Missing required environment variable"
- Проверьте что все переменные в `.env` заполнены
- Убедитесь что `.env` файл в корне проекта

### "Authentication failed"
- Проверьте правильность `API_ID` и `API_HASH`
- Телефон должен быть с кодом страны (+998...)

### "FLOOD_WAIT" ошибка
- Telegram rate limit сработал
- Бот автоматически подождет и повторит
- Уменьшите количество каналов или увеличьте задержки

### Ollama не работает
- Убедитесь что Ollama запущен: `ollama serve`
- Проверьте что модель скачана: `ollama pull llama3.2`
- Проверьте логи на наличие ошибок
- Проверьте подключение: `bun run test:ollama`

### LLM неправильно извлекает данные
- Проверьте примеры в `src/services/llm.ts`
- LLM обучен на примерах: OKEY → Снеки, BIOLIFE → Биохимия
- Убедитесь что категория одна из 4: Биохимия, Снеки, Вода, Кешью

### Excel файл пустой
- Проверьте что лиды соответствуют критериям (телефон + категория)
- Посмотрите логи: `[28.11.2025] ✓ Lead saved to ./leads.xlsx`
- Убедитесь что сообщения достаточно длинные (MIN_MESSAGE_LENGTH)

### Google Sheets: "Permission denied"
- Убедитесь что Service Account email добавлен в "Share"
- Права должны быть "Editor", не "Viewer"
- Подождите 1-2 минуты после предоставления доступа
- Проверьте подключение: `bun run test:google`

## 💡 Советы по производительности

1. **Первый запуск** - Используйте `ANALYZE_HISTORY=true` и `HISTORY_LIMIT=50-100`
2. **Постоянная работа** - Отключите историю `ANALYZE_HISTORY=false`
3. **Медленный компьютер** - Увеличьте задержки, уменьшите `HISTORY_LIMIT`
4. **Быстрый компьютер** - Можно уменьшить задержки до 500мс
5. **Много каналов** - Увеличьте `CHANNEL_DELAY` до 3000-5000мс
6. **Фильтрация** - Увеличьте `MIN_MESSAGE_LENGTH` чтобы пропускать короткие сообщения

## 📚 Зависимости

```json
{
  "telegram": "^2.25.14",    // GramJS - Telegram клиент
  "exceljs": "^4.4.0",       // Excel файлы
  "ollama": "^0.6.3",        // Ollama API клиент
  "googleapis": "^166.0.0",  // Google Sheets API
  "input": "^1.0.1"          // Интерактивный ввод
}
```

## 🔧 Техническая информация

### Ollama Setup

**Установка (macOS):**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Установка (Linux):**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Установка (Windows):**
Скачайте с [ollama.com](https://ollama.com)

**Запуск сервера:**
```bash
# В отдельном терминале
ollama serve
```

**Скачивание модели:**
```bash
ollama pull llama3.2
```

**Проверка:**
```bash
# Список моделей
ollama list

# Тест модели
ollama run llama3.2
```

**Порт по умолчанию:** `http://localhost:11434`

### Структура сессии Telegram

После первого запуска создается `SESSION_STRING` в `.env`:
```env
SESSION_STRING=1AgAOMTQ5LjE1NC4xNjcuNTEBu7/yxhKih3...
```

Этот string позволяет боту автоматически подключаться без повторного ввода кода.

**⚠️ Важно:** Никогда не делитесь SESSION_STRING - это полный доступ к вашему аккаунту!

## 📄 Лицензия

MIT - Используйте свободно для личных и коммерческих целей

## 🙏 Благодарности

Построено с использованием:
- [Bun](https://bun.sh) - Быстрый JavaScript runtime
- [GramJS](https://gram.js.org) - Telegram клиент для TypeScript
- [Ollama](https://ollama.com) - Локальный LLM
- [ExcelJS](https://github.com/exceljs/exceljs) - Excel файлы
- [Google Sheets API](https://developers.google.com/sheets/api) - Интеграция с Google

---

**Версия:** 1.2.0  
**Последнее обновление:** 30 ноября 2024  
**Автор:** @notprxgrammer

**Построено с ❤️ используя Bun, TypeScript, и GramJS**
