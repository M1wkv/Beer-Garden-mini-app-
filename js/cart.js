function changeCount(name, delta) {
  const item = findMenuItemByName(name);

  if (!item) {
    return;
  }

  if (!cart[name]) {
    cart[name] = {
      count: 0,
      price: 0
    };
  }

  cart[name].count += delta;
  cart[name].price = parsePrice(getField(item, "price", "Price", "Цена"));

  if (cart[name].count <= 0) {
    delete cart[name];
  } else if (cart[name].count > 10) {
    cart[name].count = 10;
  }

  updateCartCount();
  updateMenuCardCounter(name);

  if (document.body.dataset.screen === "cartScreen") {
    updateOrderCard(name);
  }
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.count, 0);
  document.body.classList.toggle("cart-visible", total > 0);

  if (total > 0) {
    elements.cartBtn.classList.add("show");
    elements.cartCount.textContent = total;

    elements.cartBtn.classList.add("bounce");
    setTimeout(() => elements.cartBtn.classList.remove("bounce"), 300);
  } else {
    elements.cartBtn.classList.remove("show");
    elements.cartCount.textContent = "0";
  }
}

function openCart() {
  hideAllScreens();
  elements.cartScreen.classList.remove("hidden");
  elements.headerTitle.textContent = "Ваш заказ";
  document.body.classList.remove("header-hidden");
  setCurrentScreen("cartScreen");

  renderCart();
}

function goBackFromCart() {
  elements.cartScreen.classList.add("hidden");

  if (previousScreen === "home") {
    goHome();
    return;
  }

  elements.menuScreen.classList.remove("hidden");
  elements.headerTitle.textContent = currentAPI === BAR_API ? "Барное меню" : "Меню";
  previousScreen = "menuScreen";
  document.body.classList.remove("header-hidden");
  setCurrentScreen("menuScreen");
}

function renderCart() {
  elements.cartItems.className = "order-list";
  elements.cartItems.replaceChildren();

  Object.keys(cart).forEach((name) => {
    elements.cartItems.appendChild(createOrderCard(name));
  });

  renderOrderTotal(getOrderTotal());
}

function createOrderCard(name) {
  const item = findMenuItemByName(name);
  const cartItem = cart[name];
  const description = item ? getField(item, "description").trim() : "";

  const card = document.createElement("article");
  card.className = "card order-card";
  card.dataset.itemName = name;

  const info = document.createElement("div");
  info.className = "card-info";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = name;

  info.appendChild(title);

  if (description) {
    const descriptionText = document.createElement("div");
    descriptionText.className = "card-description";
    descriptionText.textContent = description;
    info.appendChild(descriptionText);
  }

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const priceText = document.createElement("div");
  priceText.className = "card-price";
  priceText.textContent = `${formatPrice(cartItem.price)} сум`;

  actions.append(priceText, createCounter(name, cartItem.count));
  card.append(info, actions);
  return card;
}

function updateOrderCard(name) {
  const card = Array.from(elements.cartItems.querySelectorAll(".order-card")).find((item) => {
    return item.dataset.itemName === name;
  });

  if (!cart[name]) {
    card?.remove();
    renderOrderTotal(getOrderTotal());
    return;
  }

  if (!card) {
    elements.cartItems.appendChild(createOrderCard(name));
    renderOrderTotal(getOrderTotal());
    return;
  }

  const countText = card.querySelector(".count-value");
  if (countText) {
    countText.textContent = cart[name].count;
  }

  renderOrderTotal(getOrderTotal());
}

function renderOrderTotal(total) {
  elements.total.replaceChildren();

  const icon = document.createElement("img");
  icon.className = "order-total-icon";
  icon.src = "./icons/basket.svg";
  icon.alt = "";

  const label = document.createElement("span");
  label.className = "order-total-label";
  label.textContent = "Сумма заказа";

  const amount = document.createElement("span");
  amount.className = "order-total-amount";
  amount.textContent = formatPrice(total);

  elements.total.append(icon, label, amount);
}

function removeItem(name) {
  delete cart[name];

  updateCartCount();
  renderCart();

  const activeCategory = getActiveCategory();
  if (activeCategory) {
    showCategory(activeCategory);
  }
}

function getOrderTotal() {
  return Object.values(cart).reduce((sum, item) => {
    return sum + item.count * item.price;
  }, 0);
}

function parsePrice(price) {
  return parseInt(String(price).replace(/\D/g, ""), 10) || 0;
}

function formatPrice(price) {
  return String(price || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function findMenuItemByName(name) {
  return Object.values(menuData).flat().find((menuItem) => {
    return getField(menuItem, "name", "Name", "Название") === name;
  });
}
