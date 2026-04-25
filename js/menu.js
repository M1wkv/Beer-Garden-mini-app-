const selectedVariants = {};
const menuCache = {};
let lastLoadId = 0;

async function loadData(api) {
  const loadId = ++lastLoadId;

  try {
    Object.keys(selectedVariants).forEach((key) => delete selectedVariants[key]);
    elements.categories.replaceChildren();
    elements.menu.textContent = "Загрузка...";

    const items = await fetchMenuData(api);

    if (loadId !== lastLoadId) {
      return;
    }

    menuData = groupMenuByCategory(items);
    syncCartWithMenuData();

    const firstCategory = Object.keys(menuData)[0];
    renderCategories();

    if (firstCategory) {
      showCategory(firstCategory);
    } else {
      elements.menu.textContent = "Меню пока пустое";
    }
  } catch (error) {
    console.error(error);
    reportClientError("menu_load_failed", error, {
      api,
      screen: document.body.dataset.screen
    });
    elements.categories.replaceChildren();
    elements.menu.textContent = "Не удалось загрузить меню. Попробуйте позже.";
  }
}

async function fetchMenuData(api) {
  const section = MENU_SECTIONS[api];

  if (BACKEND_BASE_URL && section) {
    const storedMenu = getStoredMenu(section);

    try {
      const backendUrl = new URL("/api/menu", BACKEND_BASE_URL);
      backendUrl.searchParams.set("section", section);

      if (storedMenu?.version) {
        backendUrl.searchParams.set("version", storedMenu.version);
      }

      const response = await fetch(backendUrl.toString(), {
        headers: storedMenu?.version ? { "If-None-Match": storedMenu.version } : {}
      });

      if (response.status === 304 && storedMenu?.items) {
        menuCache[api] = storedMenu.items;
        return storedMenu.items;
      }

      if (!response.ok) {
        throw new Error("Menu backend request failed");
      }

      const payload = await response.json();
      const items = normalizeMenuItems(payload.items);
      menuCache[api] = items;
      saveStoredMenu(section, {
        version: payload.version,
        updatedAt: payload.updatedAt,
        items
      });
      return items;
    } catch (error) {
      reportClientError("menu_backend_failed", error, { section });

      if (storedMenu?.items) {
        menuCache[api] = storedMenu.items;
        return storedMenu.items;
      }
    }
  }

  if (!menuCache[api]) {
    const response = await fetch(api);
    if (!response.ok) {
      throw new Error("Не удалось загрузить меню");
    }

    menuCache[api] = normalizeMenuItems(await response.json());
  }

  return menuCache[api];
}

function normalizeMenuItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(isValidMenuItem);
}

function isValidMenuItem(item) {
  const name = getField(item, "name", "Name", "Название").trim();
  const category = getField(item, "category", "Category", "Категория").trim();
  const price = getField(item, "price 1", "Price 1", "Цена 1").trim();

  return Boolean(name && category && parsePrice(price));
}

function getStoredMenus() {
  try {
    return JSON.parse(localStorage.getItem(MENU_STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function getStoredMenu(section) {
  return getStoredMenus()[section];
}

function saveStoredMenu(section, payload) {
  try {
    const storedMenus = getStoredMenus();
    storedMenus[section] = payload;
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(storedMenus));
  } catch (error) {
    reportClientError("menu_cache_save_failed", error, { section });
  }
}

function groupMenuByCategory(data) {
  return data.reduce((grouped, item) => {
    const category = getField(item, "category", "Category", "Категория").trim();
    if (!category) {
      return grouped;
    }

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(item);
    return grouped;
  }, {});
}

function renderCategories() {
  elements.categories.replaceChildren();

  Object.keys(menuData).forEach((category, index) => {
    const categoryButton = document.createElement("button");
    categoryButton.className = "category";
    categoryButton.type = "button";
    categoryButton.textContent = category;

    categoryButton.addEventListener("click", () => {
      document.querySelectorAll(".category").forEach((item) => {
        item.classList.remove("active");
      });

      categoryButton.classList.add("active");
      scrollCategoryToStart(categoryButton);
      showCategory(category);
    });

    if (index === 0) {
      categoryButton.classList.add("active");
    }

    elements.categories.appendChild(categoryButton);
  });
}

function scrollCategoryToStart(categoryButton) {
  const paddingLeft = parseFloat(getComputedStyle(elements.categories).paddingLeft) || 0;
  const nextLeft = Math.max(categoryButton.offsetLeft - paddingLeft, 0);

  elements.categories.scrollTo({
    left: nextLeft,
    behavior: "smooth"
  });
}

function showCategory(category) {
  elements.menu.replaceChildren();

  if (!category || !menuData[category]) {
    elements.menu.textContent = "Выберите категорию";
    return;
  }

  menuData[category].forEach((item) => {
    elements.menu.appendChild(createMenuCard(item));
  });
}

function createMenuCard(item) {
  const name = getItemName(item);
  const price = getItemPrice(item, 1) || "0";
  const description = getItemDescription(item, 1);
  const hasDescription = Boolean(description);
  const hasVariants = hasSecondPrice(item);
  const firstKey = getCartKey(item, 1);
  const count = cart[firstKey]?.count || 0;
  const selectedOption = getSelectedOption(item);

  const card = document.createElement("article");
  card.className = hasVariants ? "card variant-card" : "card";
  card.dataset.itemName = name;
  card.addEventListener("click", (event) => {
    if (hasVariants || event.target.closest(".btn, .option-btn") || (cart[firstKey]?.count || 0) > 0) {
      return;
    }

    changeCount(firstKey, 1, item, 1);
  });

  const info = document.createElement("div");
  info.className = "card-info";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = name;

  const descriptionText = document.createElement("div");
  descriptionText.className = "card-description";
  descriptionText.textContent = description;

  info.appendChild(title);

  if (hasVariants) {
    info.appendChild(createVariantOptions(item));
  } else if (hasDescription) {
    info.appendChild(descriptionText);
  }

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const priceText = document.createElement("div");
  priceText.className = "card-price";
  priceText.textContent = hasVariants && selectedOption
    ? formatMenuPrice(getItemPrice(item, selectedOption))
    : formatMenuPriceRange(item);

  const controls = createMenuControls(item, count);
  actions.append(priceText);
  if (controls) {
    actions.appendChild(controls);
  }
  card.append(info, actions);
  return card;
}

function createMenuControls(item, count) {
  if (!hasSecondPrice(item)) {
    return createCounter(getCartKey(item, 1), count, item, 1);
  }

  const selectedOption = getSelectedOption(item);
  if (!selectedOption) {
    return null;
  }

  const key = getCartKey(item, selectedOption);
  return createCounter(key, cart[key]?.count || 0, item, selectedOption);
}

function createVariantOptions(item) {
  const options = document.createElement("div");
  options.className = "variant-options";
  options.append(createVariantControl(item, 1), createVariantControl(item, 2));
  return options;
}

function createVariantControl(item, optionIndex) {
  return createOptionButton(item, optionIndex);
}

function createOptionButton(item, optionIndex) {
  const name = getItemName(item);
  const button = document.createElement("button");
  button.className = getSelectedOption(item) === optionIndex ? "option-btn active" : "option-btn";
  button.type = "button";
  button.textContent = getItemDescription(item, optionIndex) || "+";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    selectedVariants[name] = optionIndex;
    updateMenuCardCounter(getCartKey(item, optionIndex), name);
  });
  return button;
}

function createCounter(name, count, item = null, optionIndex = 1) {
  const counter = document.createElement("div");
  counter.className = count === 0 ? "counter single" : "counter";

  if (count === 0) {
    counter.appendChild(createCountButton("+", () => changeCount(name, 1, item, optionIndex)));
    return counter;
  }

  const countText = document.createElement("span");
  countText.className = "count-value";
  countText.textContent = count;

  counter.append(
    createCountButton("-", () => changeCount(name, -1)),
    countText,
    createCountButton("+", () => changeCount(name, 1))
  );

  return counter;
}

function createCountButton(text, onClick) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.dataset.action = text === "+" ? "add" : "remove";
  button.setAttribute("aria-label", text === "+" ? "Добавить" : "Уменьшить");

  const icon = document.createElement("img");
  icon.className = "btn-icon";
  icon.src = text === "+" ? "./icons/plus.svg" : "./icons/minus.svg";
  icon.alt = "";

  button.appendChild(icon);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

function updateMenuCardCounter(key, itemName) {
  const name = itemName || cart[key]?.name || key;
  const card = Array.from(elements.menu.querySelectorAll(".card")).find((item) => {
    return item.dataset.itemName === name;
  });

  if (!card) {
    return;
  }

  const menuItem = findMenuItemByName(name);
  const info = card.querySelector(".card-info");
  const actions = card.querySelector(".card-actions");
  const priceText = actions?.querySelector(".card-price");

  if (!menuItem || !actions || !priceText) {
    return;
  }

  const selectedOption = getSelectedOption(menuItem);
  priceText.textContent = hasSecondPrice(menuItem) && selectedOption
    ? formatMenuPrice(getItemPrice(menuItem, selectedOption))
    : formatMenuPriceRange(menuItem);

  const controls = createMenuControls(menuItem, cart[getCartKey(menuItem, 1)]?.count || 0);
  actions.replaceChildren(priceText);
  if (controls) {
    actions.appendChild(controls);
  }

  if (hasSecondPrice(menuItem) && info) {
    const oldOptions = info.querySelector(".variant-options");
    oldOptions?.replaceWith(createVariantOptions(menuItem));
  }
}

function getActiveCategory() {
  return document.querySelector(".category.active")?.textContent;
}

function formatMenuPrice(price) {
  const digits = String(price).replace(/\D/g, "");
  if (!digits) {
    return String(price).trim();
  }

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatMenuPriceRange(item) {
  const firstPrice = formatMenuPrice(getItemPrice(item, 1) || "0");
  const secondPrice = getItemPrice(item, 2);

  if (!secondPrice.trim()) {
    return firstPrice;
  }

  return `${firstPrice} / ${formatMenuPrice(secondPrice)}`;
}

function getItemName(item) {
  return getField(item, "name", "Name", "Название") || "Без названия";
}

function getItemPrice(item, optionIndex = 1) {
  if (optionIndex === 2) {
    return getField(item, "price 2", "Price 2", "Цена 2");
  }

  return getField(item, "price 1", "Price 1", "Цена 1");
}

function getItemDescription(item, optionIndex = 1) {
  if (optionIndex === 2) {
    return getField(item, "description 2", "Description 2", "Описание 2").trim();
  }

  return getField(item, "description 1", "Description 1", "Описание 1").trim();
}

function hasSecondPrice(item) {
  return Boolean(getItemPrice(item, 2).trim());
}

function getCartKey(item, optionIndex = 1) {
  const name = getItemName(item);
  return hasSecondPrice(item) ? `${name}::${optionIndex}` : name;
}

function getSelectedOption(item) {
  const name = getItemName(item);
  if (selectedVariants[name]) {
    return selectedVariants[name];
  }

  if (cart[getCartKey(item, 1)]?.count > 0) {
    return 1;
  }

  if (cart[getCartKey(item, 2)]?.count > 0) {
    return 2;
  }

  return null;
}

function getField(item, ...keys) {
  const key = keys.find((field) => item[field] !== undefined && item[field] !== null);
  return key ? String(item[key]) : "";
}
