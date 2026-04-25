const SHEET_ID = "1aM-b8gNRiDYoRxXYAybXe-cA4RLPybxaOYPkJUVLlfw";
const MENU_API = `https://opensheet.elk.sh/${SHEET_ID}/Menu`;
const BAR_API = `https://opensheet.elk.sh/${SHEET_ID}/Bar`;
const BACKEND_BASE_URL = window.BG_BACKEND_BASE_URL || "";
const MENU_STORAGE_KEY = "bg-mini-app-menu-cache-v1";
const CART_STORAGE_KEY = "bg-mini-app-cart-v1";
const MENU_SECTIONS = {
  [MENU_API]: "menu",
  [BAR_API]: "bar"
};

let menuData = {};
let cart = {};
let currentAPI = MENU_API;
let previousScreen = "home";

const tg = window.Telegram?.WebApp;

const elements = {
  header: document.getElementById("header"),
  home: document.getElementById("home"),
  menuScreen: document.getElementById("menuScreen"),
  contactsScreen: document.getElementById("contactsScreen"),
  reservationScreen: document.getElementById("reservationScreen"),
  cartScreen: document.getElementById("cartScreen"),
  headerTitle: document.getElementById("headerTitle"),
  headerBack: document.getElementById("headerBack"),
  headerBarShortcut: document.getElementById("headerBarShortcut"),
  headerMenuShortcut: document.getElementById("headerMenuShortcut"),
  categories: document.getElementById("categories"),
  menu: document.getElementById("menu"),
  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  cartItems: document.getElementById("cartItems"),
  total: document.getElementById("total"),
  reservationName: document.getElementById("reservationName"),
  reservationPhone: document.getElementById("reservationPhone"),
  reservationDate: document.getElementById("reservationDate"),
  reservationTime: document.getElementById("reservationTime"),
  reservationGuests: document.getElementById("reservationGuests"),
  reservationComment: document.getElementById("reservationComment"),
  reservationStatus: document.getElementById("reservationStatus")
};
