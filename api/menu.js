const crypto = require("crypto");

const SHEET_ID = "1aM-b8gNRiDYoRxXYAybXe-cA4RLPybxaOYPkJUVLlfw";
const CACHE_TTL_MS = 300000;
const SHEETS = {
  menu: "Menu",
  bar: "Bar"
};

const cache = {};

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, If-None-Match");
}

function parsePrice(price) {
  return parseInt(String(price || "").replace(/\D/g, ""), 10) || 0;
}

function getField(item, ...keys) {
  const key = keys.find((field) => item[field] !== undefined && item[field] !== null);
  return key ? String(item[key]) : "";
}

function isValidMenuItem(item) {
  const name = getField(item, "name", "Name", "Название").trim();
  const category = getField(item, "category", "Category", "Категория").trim();
  const price = getField(item, "price 1", "Price 1", "Цена 1").trim();

  return Boolean(name && category && parsePrice(price));
}

function buildVersion(items) {
  return crypto.createHash("sha256").update(JSON.stringify(items)).digest("hex").slice(0, 16);
}

function getClientVersion(req) {
  const version = req.query?.version;
  const etag = req.headers["if-none-match"];

  return String(version || etag || "").replace(/^W\//, "").replace(/"/g, "");
}

async function fetchSheet(section) {
  const sheetName = SHEETS[section];
  const response = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(sheetName)}`);

  if (!response.ok) {
    throw new Error(`OpenSheet request failed: ${response.status}`);
  }

  const rawItems = await response.json();
  const items = Array.isArray(rawItems) ? rawItems.filter(isValidMenuItem) : [];
  const version = buildVersion(items);

  return {
    version,
    items,
    updatedAt: new Date().toISOString(),
    expiresAt: Date.now() + CACHE_TTL_MS
  };
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const section = String(req.query?.section || "menu").toLowerCase();

  if (!SHEETS[section]) {
    res.status(400).json({ error: "Unknown menu section" });
    return;
  }

  try {
    if (!cache[section] || cache[section].expiresAt <= Date.now()) {
      cache[section] = await fetchSheet(section);
    }

    const payload = cache[section];
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.setHeader("ETag", `"${payload.version}"`);

    if (getClientVersion(req) === payload.version) {
      res.status(304).end();
      return;
    }

    res.status(200).json({
      version: payload.version,
      updatedAt: payload.updatedAt,
      items: payload.items
    });
  } catch (error) {
    res.status(502).json({
      error: "Menu source unavailable",
      message: error.message
    });
  }
};
