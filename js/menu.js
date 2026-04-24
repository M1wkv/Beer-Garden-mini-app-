async function loadData(api) {
  try {
    elements.categories.replaceChildren();
    elements.menu.textContent = "Загрузка...";

    const response = await fetch(api);
    if (!response.ok) {
      throw new Error("Не удалось загрузить меню");
    }

    const data = await response.json();
    menuData = groupMenuByCategory(data);

    const firstCategory = Object.keys(menuData)[0];
    renderCategories();

    if (firstCategory) {
      showCategory(firstCategory);
    } else {
      elements.menu.textContent = "Меню пока пустое";
    }
  } catch (error) {
    console.error(error);
    elements.categories.replaceChildren();
    elements.menu.textContent = "Не удалось загрузить меню. Попробуйте позже.";
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
  const name = getField(item, "name", "Name", "Название") || "Без названия";
  const price = getField(item, "price", "Price", "Цена") || "0";
  const description = getField(item, "description", "Description", "desc", "Описание") || "Свежий микс зелени с легкой заправкой.";
  const hasDescription = Boolean(getField(item, "description").trim());
  const count = cart[name]?.count || 0;

  const card = document.createElement("article");
  card.className = "card";
  card.dataset.itemName = name;
  card.addEventListener("click", (event) => {
    if (event.target.closest(".btn") || (cart[name]?.count || 0) > 0) {
      return;
    }

    changeCount(name, 1);
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

  if (hasDescription) {
    info.appendChild(descriptionText);
  }

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const priceText = document.createElement("div");
  priceText.className = "card-price";
  priceText.textContent = `${formatMenuPrice(price)} сум`;

  actions.append(priceText, createCounter(name, count));
  card.append(info, actions);
  return card;
}

function createCounter(name, count) {
  const counter = document.createElement("div");
  counter.className = count === 0 ? "counter single" : "counter";

  if (count === 0) {
    counter.appendChild(createCountButton("+", () => changeCount(name, 1)));
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
  button.addEventListener("click", onClick);
  return button;
}

function updateMenuCardCounter(name) {
  const card = Array.from(elements.menu.querySelectorAll(".card")).find((item) => {
    return item.dataset.itemName === name;
  });

  if (!card) {
    return;
  }

  const counter = card.querySelector(".counter");
  const count = cart[name]?.count || 0;

  if (!counter) {
    return;
  }

  if (count > 0 && !counter.classList.contains("single")) {
    const countText = counter.querySelector(".count-value");
    if (countText) {
      countText.textContent = count;
    }
    return;
  }

  counter.replaceWith(createCounter(name, count));
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

function getField(item, ...keys) {
  const key = keys.find((field) => item[field] !== undefined && item[field] !== null);
  return key ? String(item[key]) : "";
}
