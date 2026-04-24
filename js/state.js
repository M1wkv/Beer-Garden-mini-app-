const MENU_API = "https://opensheet.elk.sh/1aM-b8gNRiDYoRxXYAybXe-cA4RLPybxaOYPkJUVLlfw/Menu";
const BAR_API = "https://opensheet.elk.sh/1aM-b8gNRiDYoRxXYAybXe-cA4RLPybxaOYPkJUVLlfw/Bar";

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
