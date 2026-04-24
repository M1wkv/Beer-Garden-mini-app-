function changeCount(name, delta) {
  const item = Object.values(menuData).flat().find((menuItem) => {
    return getField(menuItem, "name", "Name", "Название") === name;
  });

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
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.count, 0);

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
  let total = 0;
  elements.cartItems.replaceChildren();

  Object.keys(cart).forEach((name) => {
    const item = cart[name];
    const sum = item.count * item.price;
    total += sum;

    const row = document.createElement("div");
    row.className = "cart-item";

    const text = document.createElement("span");
    text.textContent = `${name} x${item.count} — ${sum} сум`;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => removeItem(name));

    row.append(text, remove);
    elements.cartItems.appendChild(row);
  });

  elements.total.textContent = `Итого: ${total} сум`;
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

function parsePrice(price) {
  return parseInt(String(price).replace(/\D/g, ""), 10) || 0;
}
