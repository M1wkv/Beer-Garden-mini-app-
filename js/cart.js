function changeCount(key, delta, item = null, optionIndex = 1) {
  const sourceItem = item || findMenuItemByCartKey(key);

  if (!sourceItem && !cart[key]) {
    return;
  }

  const name = cart[key]?.name || getItemName(sourceItem);
  const selectedOption = cart[key]?.optionIndex || optionIndex;

  if (!cart[key]) {
    cart[key] = {
      count: 0,
      price: 0,
      name,
      optionIndex: selectedOption,
      description: getItemDescription(sourceItem, selectedOption)
    };
  }

  cart[key].count += delta;

  if (sourceItem) {
    cart[key].price = parsePrice(getItemPrice(sourceItem, cart[key].optionIndex));
  }

  if (cart[key].count <= 0) {
    delete cart[key];
  } else if (cart[key].count > 10) {
    cart[key].count = 10;
  }

  saveCart();
  updateCartCount();
  updateMenuCardCounter(key, name);

  if (document.body.dataset.screen === "cartScreen") {
    updateOrderCard(key);
  }
}

function updateCartCount(shouldAnimate = true) {
  const total = Object.values(cart).reduce((sum, item) => sum + item.count, 0);
  document.body.classList.toggle("cart-visible", total > 0);

  if (total > 0) {
    elements.cartBtn.classList.add("show");
    elements.cartCount.textContent = total;

    if (shouldAnimate && document.body.dataset.screen !== "cartScreen") {
      elements.cartBtn.classList.add("bounce");
      setTimeout(() => elements.cartBtn.classList.remove("bounce"), 300);
    }
  } else {
    elements.cartBtn.classList.remove("show");
    elements.cartCount.textContent = "0";
  }

  updateHomeCartOffset(total > 0);
}

function updateHomeCartOffset(isVisible = Object.values(cart).some((item) => item.count > 0)) {
  if (!elements.cartBtn) {
    return;
  }

  requestAnimationFrame(() => {
    const homeGrid = document.querySelector(".home-grid");

    if (!homeGrid) {
      return;
    }

    if (!isVisible) {
      homeGrid.style.removeProperty("bottom");
      return;
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const cartStyle = getComputedStyle(elements.cartBtn);
    const cartHeight = elements.cartBtn.offsetHeight || parseFloat(rootStyle.getPropertyValue("--floating-height")) || 60;
    const cartBottom = parseFloat(cartStyle.bottom) || 0;
    const gridGap = parseFloat(rootStyle.getPropertyValue("--home-grid-gap")) || 7;
    const nextBottom = cartBottom + cartHeight + gridGap;

    document.documentElement.style.setProperty("--home-grid-cart-bottom", `${nextBottom}px`);
    homeGrid.style.setProperty("bottom", `${nextBottom}px`);
  });
}

function openCart() {
  hideAllScreens();
  elements.cartScreen.classList.remove("hidden");
  elements.headerTitle.textContent = "Блокнот заказа";
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
  elements.headerTitle.textContent = currentAPI === BAR_API ? "Бар" : "Меню";
  previousScreen = "menuScreen";
  document.body.classList.remove("header-hidden");
  setCurrentScreen("menuScreen");
}

function renderCart() {
  elements.cartItems.className = "order-list";
  elements.cartItems.replaceChildren();

  Object.keys(cart).forEach((key) => {
    elements.cartItems.appendChild(createOrderCard(key));
  });

  renderOrderTotal(getOrderTotal());
}

function createOrderCard(key) {
  const cartItem = cart[key];
  const item = findMenuItemByCartKey(key);
  const description = cartItem.description || (item ? getItemDescription(item, cartItem.optionIndex || 1) : "");
  const hasVariants = item ? hasSecondPrice(item) : false;

  const card = document.createElement("article");
  card.className = hasVariants ? "card order-card variant-card" : "card order-card";
  card.dataset.cartKey = key;

  const info = document.createElement("div");
  info.className = "card-info";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = cartItem.name || key;

  info.appendChild(title);

  if (hasVariants) {
    info.appendChild(createOrderVariantOptions(key, item));
  } else if (description) {
    const descriptionText = document.createElement("div");
    descriptionText.className = "card-description";
    descriptionText.textContent = description;
    info.appendChild(descriptionText);
  }

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const priceText = document.createElement("div");
  priceText.className = "card-price";
  priceText.textContent = formatPrice(cartItem.price);

  actions.append(priceText, createCounter(key, cartItem.count));
  card.append(info, actions);
  return card;
}

function createOrderVariantOptions(key, item) {
  const options = document.createElement("div");
  options.className = "variant-options";
  options.append(createOrderOptionButton(key, item, 1), createOrderOptionButton(key, item, 2));
  return options;
}

function createOrderOptionButton(key, item, optionIndex) {
  const button = document.createElement("button");
  button.className = cart[key]?.optionIndex === optionIndex ? "option-btn active" : "option-btn";
  button.type = "button";
  button.textContent = getItemDescription(item, optionIndex) || "+";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    switchOrderVariant(key, item, optionIndex);
  });
  return button;
}

function switchOrderVariant(currentKey, item, optionIndex) {
  const currentItem = cart[currentKey];
  const name = currentItem?.name || getItemName(item);
  const nextKey = getCartKey(item, optionIndex);

  if (!currentItem || currentKey === nextKey) {
    return;
  }

  const nextCount = currentItem.count;

  if (cart[nextKey]) {
    cart[nextKey].count = Math.min(cart[nextKey].count + nextCount, 10);
    cart[nextKey].price = parsePrice(getItemPrice(item, optionIndex));
    cart[nextKey].description = getItemDescription(item, optionIndex);
  } else {
    cart[nextKey] = {
      count: nextCount,
      price: parsePrice(getItemPrice(item, optionIndex)),
      name,
      optionIndex,
      description: getItemDescription(item, optionIndex)
    };
  }

  delete cart[currentKey];
  selectedVariants[name] = optionIndex;

  saveCart();
  updateCartCount();
  updateMenuCardCounter(currentKey, name);
  updateMenuCardCounter(nextKey, name);
  renderCart();
}

function updateOrderCard(key) {
  const card = Array.from(elements.cartItems.querySelectorAll(".order-card")).find((item) => {
    return item.dataset.cartKey === key;
  });

  if (!cart[key]) {
    card?.remove();
    renderOrderTotal(getOrderTotal());
    return;
  }

  if (!card) {
    elements.cartItems.appendChild(createOrderCard(key));
    renderOrderTotal(getOrderTotal());
    return;
  }

  const countText = card.querySelector(".count-value");
  if (countText) {
    countText.textContent = cart[key].count;
  }

  renderOrderTotal(getOrderTotal());
}

function renderOrderTotal(total) {
  const currentAmount = elements.total.querySelector(".order-total-amount");

  if (currentAmount) {
    currentAmount.textContent = formatPrice(total);
    return;
  }

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

function removeItem(key) {
  const name = cart[key]?.name || key;
  delete cart[key];

  saveCart();
  updateCartCount();
  renderCart();
  updateMenuCardCounter(key, name);
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
  return String(price || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function findMenuItemByCartKey(key) {
  const itemName = cart[key]?.name || String(key).split("::")[0];
  return findMenuItemByName(itemName);
}

function findMenuItemByName(name) {
  return Object.values(menuData).flat().find((menuItem) => {
    return getItemName(menuItem) === name;
  });
}

function restoreCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || {};
    cart = Object.entries(storedCart).reduce((safeCart, [key, item]) => {
      const count = Math.min(Math.max(parseInt(item?.count, 10) || 0, 0), 10);
      const price = parsePrice(item?.price);
      const name = String(item?.name || "").trim();

      if (!count || !name) {
        return safeCart;
      }

      safeCart[key] = {
        count,
        price,
        name,
        optionIndex: item?.optionIndex === 2 ? 2 : 1,
        description: String(item?.description || "").trim()
      };

      return safeCart;
    }, {});
  } catch (error) {
    cart = {};
    reportClientError("cart_restore_failed", error);
  }
}

function syncCartWithMenuData() {
  let changed = false;

  Object.keys(cart).forEach((key) => {
    const item = findMenuItemByCartKey(key);

    if (!item) {
      return;
    }

    const optionIndex = cart[key].optionIndex || 1;
    const nextPrice = parsePrice(getItemPrice(item, optionIndex));
    const nextDescription = getItemDescription(item, optionIndex);

    if (cart[key].price !== nextPrice || cart[key].description !== nextDescription) {
      cart[key].price = nextPrice;
      cart[key].description = nextDescription;
      changed = true;
    }
  });

  if (changed) {
    saveCart();
    updateCartCount();

    if (document.body.dataset.screen === "cartScreen") {
      renderCart();
    }
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    reportClientError("cart_save_failed", error);
  }
}
