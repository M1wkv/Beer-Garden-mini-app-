function hideAllScreens() {
  elements.home.classList.add("hidden");
  elements.menuScreen.classList.add("hidden");
  elements.contactsScreen.classList.add("hidden");
  elements.reservationScreen.classList.add("hidden");
  elements.cartScreen.classList.add("hidden");
}

function showScreen(screenName, title) {
  hideAllScreens();
  elements[screenName].classList.remove("hidden");
  elements.header.textContent = title;
  previousScreen = screenName;
}

function openMenu() {
  currentAPI = MENU_API;
  openMenuScreen("Меню");
}

function openBar() {
  currentAPI = BAR_API;
  openMenuScreen("Барное меню");
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
}
