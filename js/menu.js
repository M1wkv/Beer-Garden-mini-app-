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
    const category = getField(item, "category", "Category").trim();
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
      showCategory(category);
    });

    if (index === 0) {
      categoryButton.classList.add("active");
    }

    elements.categories.appendChild(categoryButton);
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
  const name = getField(item, "name", "Name") || "Без названия";
  const price = getField(item, "price", "Price") || "0";
  const count = cart[name]?.count || 0;

  const card = document.createElement("article");
  card.className = "card";

  const info = document.createElement("div");

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = name;

  const priceText = document.createElement("div");
  priceText.className = "card-price";
  priceText.textContent = `${price} сум`;

  info.append(title, priceText);

  const counter = document.createElement("div");
  counter.className = "counter";

  if (count === 0) {
    counter.appendChild(createCountButton("+", () => changeCount(name, 1)));
  } else {
    const countText = document.createElement("span");
    countText.textContent = count;

    counter.append(
      createCountButton("-", () => changeCount(name, -1)),
      countText,
      createCountButton("+", () => changeCount(name, 1))
    );
  }

  card.append(info, counter);
  return card;
}

function createCountButton(text, onClick) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function getActiveCategory() {
  return document.querySelector(".category.active")?.textContent;
}

function getField(item, ...keys) {
  const key = keys.find((field) => item[field] !== undefined && item[field] !== null);
  return key ? String(item[key]) : "";
}
