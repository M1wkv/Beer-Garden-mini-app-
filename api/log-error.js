const RATE_WINDOW_MS = 60000;
const RATE_LIMIT = 30;
const buckets = {};

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return req.body;
}

function clip(value, maxLength = 700) {
  return String(value || "").slice(0, maxLength);
}

function getRateKey(req, payload) {
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  return `${ip}:${payload.userId || "guest"}`;
}

function isRateLimited(req, payload) {
  const key = getRateKey(req, payload);
  const now = Date.now();
  const bucket = buckets[key] || { count: 0, resetAt: now + RATE_WINDOW_MS };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_WINDOW_MS;
  }

  bucket.count += 1;
  buckets[key] = bucket;

  return bucket.count > RATE_LIMIT;
}

function formatMessage(payload) {
  const lines = [
    "Ошибка Mini App",
    `Событие: ${clip(payload.event, 120)}`,
    `Экран: ${clip(payload.screen, 120)}`,
    `Ошибка: ${clip(payload.message, 900)}`,
    `Время: ${clip(payload.createdAt, 120)}`,
    `Пользователь: ${clip(payload.userId || "нет данных", 120)}`,
    `Username: ${clip(payload.username || "нет данных", 120)}`,
    `Платформа: ${clip(payload.platform, 120)}`,
    `URL: ${clip(payload.url, 300)}`
  ];

  if (payload.meta && Object.keys(payload.meta).length) {
    lines.push(`Meta: ${clip(JSON.stringify(payload.meta), 900)}`);
  }

  if (payload.stack) {
    lines.push(`Stack: ${clip(payload.stack, 1400)}`);
  }

  return lines.join("\n");
}

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    return { skipped: true };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram request failed: ${response.status}`);
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = getBody(req);

  if (isRateLimited(req, payload)) {
    res.status(204).end();
    return;
  }

  try {
    await sendTelegramMessage(formatMessage(payload));
    res.status(204).end();
  } catch (error) {
    res.status(502).json({ error: "Telegram logging failed" });
  }
};
