let layoutMetricsReady = false;

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getViewportHeight() {
  return tg?.viewportStableHeight || tg?.viewportHeight || window.visualViewport?.height || window.innerHeight;
}

function getViewportWidth() {
  return window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth;
}

function applyLayoutMetrics() {
  const width = getViewportWidth() || 390;
  const height = getViewportHeight() || 844;
  const appWidth = Math.min(width, 430);
  const widthScale = appWidth / 390;
  const heightScale = height / 844;
  const shortScreenScale = height < 700 ? Math.min(widthScale, heightScale) : widthScale;
  const layoutScale = clampNumber(widthScale, 0.82, 1.1);
  const textScale = clampNumber(widthScale, 0.86, 1.08);
  const verticalScale = clampNumber(shortScreenScale, 0.82, 1.08);
  const root = document.documentElement;
  const setPx = (name, value) => {
    root.style.setProperty(name, `${Math.round(value * 100) / 100}px`);
  };

  setPx("--app-height", height);
  setPx("--app-width", appWidth);
  setPx("--edge", 18 * layoutScale);
  setPx("--edge-double", 36 * layoutScale);
  setPx("--edge-negative", -18 * layoutScale);
  setPx("--header-top", 48 * verticalScale);
  setPx("--header-bottom", 17 * verticalScale);
  setPx("--menu-top", 160 * verticalScale);
  setPx("--screen-top", 126 * verticalScale);
  setPx("--header-font", 31 * textScale);
  setPx("--title-font", 15.5 * textScale);
  setPx("--small-font", 9.5 * textScale);
  setPx("--cart-font", 31 * textScale);
  setPx("--card-radius", 16 * layoutScale);
  setPx("--floating-offset", 24 * verticalScale);
  setPx("--floating-height", 60 * layoutScale);
  setPx("--home-grid-offset", 45 * verticalScale);
  setPx("--home-grid-gap", 7 * layoutScale);
  setPx("--header-row-gap", 10 * layoutScale);
  setPx("--header-row-height", 44 * layoutScale);
  setPx("--header-shortcut-height", 32 * layoutScale);
  setPx("--header-shortcut-icon", 16 * layoutScale);
  setPx("--screen-bottom", 86 * verticalScale);
  setPx("--back-size", 44 * layoutScale);
  setPx("--back-icon", 32 * layoutScale);
  setPx("--home-screen-bottom", 45 * verticalScale);
  setPx("--home-hero-height", 531 * verticalScale);
  setPx("--home-hero-view-height", height * 0.62);
  setPx("--home-hero-min", 316 * verticalScale);
  setPx("--dots-gap", 11 * layoutScale);
  setPx("--dots-margin-top", -23 * verticalScale);
  setPx("--dots-margin-bottom", 19 * verticalScale);
  setPx("--dot-size", 7 * layoutScale);
  setPx("--dot-active-width", 37 * layoutScale);
  setPx("--content-width", 354 * layoutScale);
  setPx("--tile-wide-height", 47 * layoutScale);
  setPx("--contacts-top", 20 * verticalScale);
  setPx("--collapsed-menu-top", 17 * verticalScale);
  setPx("--scroll-bottom", 166 * verticalScale);
  setPx("--tile-height", 86 * layoutScale);
  setPx("--tile-padding-y", 14 * layoutScale);
  setPx("--tile-padding-x", 11 * layoutScale);
  setPx("--tile-span-top", 7 * layoutScale);
  setPx("--category-gap", 9 * layoutScale);
  setPx("--category-top", 12 * verticalScale);
  setPx("--category-height", 27 * layoutScale);
  setPx("--category-padding", 13 * layoutScale);
  setPx("--thin-border", Math.max(1, 1.5 * layoutScale));
  setPx("--menu-gap", 10 * verticalScale);
  setPx("--card-gap", 12 * layoutScale);
  setPx("--card-min-height", 46 * layoutScale);
  setPx("--card-padding-y", 10 * verticalScale);
  setPx("--description-top", 4 * verticalScale);
  setPx("--action-gap", 4 * layoutScale);
  setPx("--counter-gap", 7 * layoutScale);
  setPx("--counter-width", 86 * layoutScale);
  setPx("--counter-height", 23 * layoutScale);
  setPx("--counter-single-height", 24 * layoutScale);
  setPx("--option-width", 43 * layoutScale);
  setPx("--option-height", 24 * layoutScale);
  setPx("--option-padding-y", 4 * layoutScale);
  setPx("--option-padding-x", 8 * layoutScale);
  setPx("--option-hit-y", -10 * layoutScale);
  setPx("--option-hit-x", -6 * layoutScale);
  setPx("--btn-size", 20 * layoutScale);
  setPx("--btn-hit-y", -24 * layoutScale);
  setPx("--btn-hit-small", -8 * layoutScale);
  setPx("--btn-hit-large", -32 * layoutScale);
  setPx("--minus-icon", 9 * layoutScale);
  setPx("--plus-icon", 10 * layoutScale);
  setPx("--cart-gap", 22 * layoutScale);
  setPx("--floating-padding-y", 14 * layoutScale);
  setPx("--floating-padding-x", 22 * layoutScale);
  setPx("--cart-icon-size", 36 * layoutScale);
  setPx("--form-gap", 11 * verticalScale);
  setPx("--form-top", 12 * verticalScale);
  setPx("--form-label-gap", 7 * layoutScale);
  setPx("--form-label-font", 12 * textScale);
  setPx("--form-field-padding", 12 * layoutScale);
  setPx("--form-field-radius", 12 * layoutScale);
  setPx("--form-field-font", 16 * textScale);
  setPx("--textarea-height", 74 * layoutScale);
  setPx("--submit-height", 45 * layoutScale);
  setPx("--submit-radius", 14 * layoutScale);
  setPx("--submit-font", 14 * textScale);
  setPx("--status-height", 15 * layoutScale);
  setPx("--status-top", 11 * verticalScale);
  setPx("--order-list-offset", -7 * verticalScale);
  setPx("--total-gap", 18 * layoutScale);
  setPx("--total-padding-y", 12 * layoutScale);
  setPx("--total-padding-x", 22 * layoutScale);
  setPx("--total-label-width", 86 * layoutScale);
  scheduleHomeCartOffsetUpdate?.();
}

function initLayoutMetrics() {
  if (layoutMetricsReady) {
    applyLayoutMetrics();
    return;
  }

  layoutMetricsReady = true;
  applyLayoutMetrics();
  document.fonts?.ready?.then(() => scheduleHomeCartOffsetUpdate?.());
  window.visualViewport?.addEventListener("resize", applyLayoutMetrics);
  window.addEventListener("resize", applyLayoutMetrics);
  window.addEventListener("load", () => scheduleHomeCartOffsetUpdate?.());
  window.addEventListener("orientationchange", () => {
    setTimeout(applyLayoutMetrics, 250);
  });
}

function initTelegram() {
  if (!tg) {
    applyLayoutMetrics();
    return;
  }

  const setAppHeight = () => {
    applyLayoutMetrics();
  };

  const isDesktopPlatform = () => {
    return ["tdesktop", "weba", "webk", "macos", "windows", "linux"].includes(tg.platform);
  };

  const openFullscreen = () => {
    if (isDesktopPlatform()) {
      return;
    }

    tg.expand();

    if (tg.isVersionAtLeast?.("8.0") && !tg.isFullscreen) {
      tg.requestFullscreen?.();
    }
  };

  tg.ready();
  tg.setHeaderColor?.("#050505");
  tg.setBackgroundColor?.("#050505");
  tg.setBottomBarColor?.("#050505");
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
}
