function initTelegram() {
  if (!tg) {
    return;
  }

  const setAppHeight = () => {
    const height = tg.viewportStableHeight || tg.viewportHeight || window.visualViewport?.height || window.innerHeight;

    if (height) {
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    }
  };

  const openFullscreen = () => {
    tg.expand();

    if (tg.isVersionAtLeast?.("8.0") && !tg.isFullscreen) {
      tg.requestFullscreen?.();
    }
  };

  tg.ready();
  tg.setHeaderColor?.("#0f0f0f");
  tg.setBackgroundColor?.("#0f0f0f");
  tg.setBottomBarColor?.("#0f0f0f");
  tg.disableVerticalSwipes?.();

  setAppHeight();
  openFullscreen();

  [250, 700, 1500].forEach((delay) => {
    setTimeout(() => {
      setAppHeight();
      openFullscreen();
    }, delay);
  });

  tg.onEvent?.("viewportChanged", setAppHeight);
  tg.onEvent?.("fullscreenChanged", setAppHeight);
  window.visualViewport?.addEventListener("resize", setAppHeight);
  window.addEventListener("resize", setAppHeight);
}
