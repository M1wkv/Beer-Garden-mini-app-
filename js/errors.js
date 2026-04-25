let isReportingError = false;

function getErrorPayload(eventName, error, meta = {}) {
  const message = error?.message || String(error || "Unknown error");
  const stack = error?.stack || "";
  const user = tg?.initDataUnsafe?.user;

  return {
    event: eventName,
    message,
    stack,
    meta,
    screen: document.body.dataset.screen,
    userId: user?.id || null,
    username: user?.username || null,
    platform: tg?.platform || navigator.platform,
    userAgent: navigator.userAgent,
    url: window.location.href,
    createdAt: new Date().toISOString()
  };
}

function reportClientError(eventName, error, meta = {}) {
  if (!BACKEND_BASE_URL || isReportingError) {
    return;
  }

  isReportingError = true;

  fetch(new URL("/api/log-error", BACKEND_BASE_URL).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getErrorPayload(eventName, error, meta)),
    keepalive: true
  })
    .catch(() => {})
    .finally(() => {
      isReportingError = false;
    });
}

function initErrorLogging() {
  window.addEventListener("error", (event) => {
    reportClientError("client_error", event.error || event.message, {
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportClientError("unhandled_rejection", event.reason);
  });
}
