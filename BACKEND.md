# Backend для меню и логов

В проект добавлены serverless-функции для Vercel:

- `api/menu.js` - берет данные из Google Sheets через OpenSheet, валидирует строки, кеширует ответ и возвращает `version`.
- `api/log-error.js` - принимает ошибки мини-аппа и отправляет их в Telegram-чат админа.

## Как подключить backend к мини-аппу

1. Задеплой проект на Vercel или другой хостинг, который поддерживает папку `api`.
2. В настройках backend-деплоя добавь переменные окружения:
   - `TELEGRAM_BOT_TOKEN` - токен твоего бота.
   - `TELEGRAM_ADMIN_CHAT_ID` - id Telegram-чата, куда слать ошибки.
3. В `index.html` перед `js/state.js` можно указать адрес backend:

```html
<script>
  window.BG_BACKEND_BASE_URL = "https://your-backend.vercel.app";
</script>
```

Если backend не указан, мини-апп продолжит грузить меню напрямую через OpenSheet.

## Что дает version

Backend возвращает короткий хеш данных меню. Клиент сохраняет меню и его `version` в `localStorage`. При следующей загрузке клиент отправляет версию backend-у. Если таблица не изменилась, backend отвечает `304`, и клиент берет меню из локального кеша без повторной передачи всей таблицы.
