function hideAllScreens() {
  elements.home.classList.add("hidden");
  elements.menuScreen.classList.add("hidden");
  elements.contactsScreen.classList.add("hidden");
  elements.reservationScreen.classList.add("hidden");
  elements.cartScreen.classList.add("hidden");
}

function setCurrentScreen(screenName) {
  document.body.dataset.screen = screenName;
  document.body.classList.remove("header-hidden");
  updateHeaderShortcut(screenName);
}

function showScreen(screenName, title) {
  hideAllScreens();
  elements[screenName].classList.remove("hidden");
  elements.headerTitle.textContent = title;
  previousScreen = screenName;
  setCurrentScreen(screenName);
}

function openMenu() {
  currentAPI = MENU_API;
  openMenuScreen("Меню");
}

function openBar() {
  currentAPI = BAR_API;
  openMenuScreen("Бар");
}

function openMenuScreen(title) {
  showScreen("menuScreen", title);
  loadData(currentAPI);
}

function openContacts() {
  showScreen("contactsScreen", "Контакты");
}

function openReservation() {
  showScreen("reservationScreen", "Бронирование");
}

function goHome() {
  showScreen("home", "Главное меню");
  scheduleHomeCartOffsetUpdate?.();
}

function updateHeaderShortcut(screenName = document.body.dataset.screen) {
  if (!elements.headerBarShortcut || !elements.headerMenuShortcut) {
    return;
  }

  const showBarShortcut = screenName === "menuScreen" && currentAPI === MENU_API;
  const showMenuShortcut = screenName === "menuScreen" && currentAPI === BAR_API;
  elements.headerBarShortcut.classList.toggle("hidden", !showBarShortcut);
  elements.headerMenuShortcut.classList.toggle("hidden", !showMenuShortcut);
}

function handleHeaderBack() {
  if (document.body.dataset.screen === "cartScreen") {
    goBackFromCart();
    return;
  }

  goHome();
}

function initViewportGuards() {
  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();
      },
      { passive: false }
    );
  });

  let lastTouchEnd = 0;

  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 320) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    },
    { passive: false }
  );

  document.addEventListener(
    "dblclick",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );
}

function initHeaderAutoHide() {
  let lastScrollTop = 0;

  elements.menuScreen.addEventListener(
    "scroll",
    () => {
      if (document.body.dataset.screen !== "menuScreen") {
        return;
      }

      const scrollTop = elements.menuScreen.scrollTop;
      const delta = scrollTop - lastScrollTop;

      if (scrollTop < 12 || delta < -8) {
        document.body.classList.remove("header-hidden");
      } else if (delta > 8) {
        document.body.classList.add("header-hidden");
      }

      lastScrollTop = Math.max(scrollTop, 0);
    },
    { passive: true }
  );
}
