// Лабораторная работа №5. DOM и взаимодействие с элементами страницы
// Вариант 3. Тема "Спорт и активность" (управление достижениями)

// Ключи localStorage
const STORAGE_THEME_KEY = "lab5-theme";
const STORAGE_ACHIEVEMENTS_KEY = "lab5-achievements";

// Иконка-заглушка для новых достижений
const PLACEHOLDER_ICON = "assets/icons/medal-placeholder.svg";
const PLACEHOLDER_ALT = "Иконка-заглушка достижения";

// Длительность анимации удаления, совпадает с transition у .card в style.css
const FADE_DURATION = 400;

const MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
];

// ---------- Вспомогательные функции ----------

// Поиск элемента по id с проверкой существования
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error("Элемент не найден: #" + id);
    }
    return element;
}

// Чтение из localStorage. При ошибке (повреждённый JSON, запрет доступа) возвращает null
function loadFromStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? null : JSON.parse(value);
    } catch (error) {
        console.error("Не удалось прочитать данные из localStorage (" + key + "):", error);
        return null;
    }
}

// Запись в localStorage
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Не удалось сохранить данные в localStorage (" + key + "):", error);
    }
}

// "2025-09-14" -> "14 сентября 2025"
function formatDate(isoDate) {
    const parts = isoDate.split("-");
    return Number(parts[2]) + " " + MONTHS[Number(parts[1]) - 1] + " " + parts[0];
}

// Сегодняшняя дата в формате ДД.ММ.ГГГГ (подсказка в prompt)
function getTodayInput() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return day + "." + month + "." + today.getFullYear();
}

// "14.09.2025" -> "2025-09-14". Если формат неверный, возвращает null
function parseDateInput(input) {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input.trim());
    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    return match[3] + "-" + match[2] + "-" + match[1];
}

// ---------- Переключение темы ----------

function applyTheme(theme, button) {
    const isLight = theme === "light";
    document.body.classList.toggle("theme-light", isLight);
    document.body.classList.toggle("theme-dark", !isLight);

    if (button) {
        button.textContent = isLight ? "Тёмная тема" : "Светлая тема";
    }
}

function initTheme() {
    const button = getElement("theme-toggle");

    // Сохранённая тема применяется, даже если кнопки на странице нет
    const savedTheme = loadFromStorage(STORAGE_THEME_KEY);
    applyTheme(savedTheme === "light" ? "light" : "dark", button);

    if (!button) {
        return;
    }

    button.addEventListener("click", function () {
        const newTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
        applyTheme(newTheme, button);
        saveToStorage(STORAGE_THEME_KEY, newTheme);
    });
}

// ---------- Карточки достижений ----------

// Создание карточки: <div class="card"> с иконкой, заголовком, датой и кнопкой удаления
function createCard(achievement) {
    const card = document.createElement("div");
    card.className = "card";

    const icon = document.createElement("img");
    icon.setAttribute("src", achievement.icon || PLACEHOLDER_ICON);
    icon.setAttribute("alt", achievement.iconAlt || PLACEHOLDER_ALT);
    icon.setAttribute("width", "64");
    icon.setAttribute("height", "64");

    const title = document.createElement("h3");
    title.textContent = achievement.title;

    const time = document.createElement("time");
    time.setAttribute("datetime", achievement.date);
    time.textContent = formatDate(achievement.date);

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(time);

    if (achievement.description) {
        const description = document.createElement("p");
        description.textContent = achievement.description;
        card.appendChild(description);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "card-delete";
    deleteButton.textContent = "Удалить";
    card.appendChild(deleteButton);

    return card;
}

// Чтение данных карточки из DOM (для сохранения в localStorage)
function readCard(card) {
    const title = card.querySelector("h3");
    const time = card.querySelector("time");
    const icon = card.querySelector("img");
    const description = card.querySelector("p");

    if (!title || !time) {
        console.warn("Карточка пропущена: нет заголовка или даты", card);
        return null;
    }

    return {
        title: title.textContent.trim(),
        date: time.getAttribute("datetime"),
        icon: icon ? icon.getAttribute("src") : PLACEHOLDER_ICON,
        iconAlt: icon ? icon.getAttribute("alt") : PLACEHOLDER_ALT,
        description: description ? description.textContent.trim() : ""
    };
}

// Проверка записи из localStorage перед созданием карточки
function isValidAchievement(item) {
    return item !== null && typeof item === "object" &&
        typeof item.title === "string" && item.title !== "" &&
        typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date);
}

// Карточки, которые сейчас на странице (без тех, что исчезают)
function getActiveCards(container) {
    return container.querySelectorAll(".card:not(.fade-out)");
}

// Сохранение текущего списка карточек
function saveAchievements(container) {
    const achievements = [];
    getActiveCards(container).forEach(function (card) {
        const achievement = readCard(card);
        if (achievement) {
            achievements.push(achievement);
        }
    });
    saveToStorage(STORAGE_ACHIEVEMENTS_KEY, achievements);
}

// Восстановление карточек при загрузке страницы.
// Если в localStorage ничего нет, остаются карточки из HTML
function restoreAchievements(container) {
    const saved = loadFromStorage(STORAGE_ACHIEVEMENTS_KEY);
    if (saved === null) {
        return;
    }
    if (!Array.isArray(saved)) {
        console.error("Данные достижений в localStorage повреждены, показан список по умолчанию");
        return;
    }

    container.querySelectorAll(".card").forEach(function (card) {
        card.remove();
    });

    saved.forEach(function (item) {
        if (isValidAchievement(item)) {
            container.appendChild(createCard(item));
        } else {
            console.warn("Пропущена некорректная запись достижения:", item);
        }
    });
}

// Сообщение о пустом списке показывается через атрибут hidden
function updateEmptyMessage(container, emptyMessage) {
    if (emptyMessage) {
        emptyMessage.hidden = getActiveCards(container).length > 0;
    }
}

// Кнопка "Добавить достижение": название и дата через два prompt
function addAchievement(container, emptyMessage) {
    const titleInput = prompt("Название достижения:", "");
    if (titleInput === null) {
        console.log("Добавление достижения отменено");
        return;
    }

    const title = titleInput.trim();
    if (title === "") {
        alert("Название достижения не может быть пустым");
        return;
    }

    const dateInput = prompt("Дата достижения (ДД.ММ.ГГГГ):", getTodayInput());
    if (dateInput === null) {
        console.log("Добавление достижения отменено");
        return;
    }

    const date = parseDateInput(dateInput);
    if (!date) {
        alert("Неверная дата. Введите дату в формате ДД.ММ.ГГГГ, например 14.09.2025");
        return;
    }

    const card = createCard({
        title: title,
        date: date,
        icon: PLACEHOLDER_ICON,
        iconAlt: PLACEHOLDER_ALT,
        description: ""
    });
    container.appendChild(card);

    saveAchievements(container);
    updateEmptyMessage(container, emptyMessage);
    console.log("Добавлено достижение: " + title + " (" + date + ")");
}

// Удаление карточки: класс fade-out запускает анимацию, затем элемент удаляется из DOM
function removeCard(card, container, emptyMessage) {
    if (card.classList.contains("fade-out")) {
        return;
    }

    card.classList.add("fade-out");
    saveAchievements(container);
    updateEmptyMessage(container, emptyMessage);

    let removed = false;
    function finishRemoval() {
        if (!removed) {
            removed = true;
            card.remove();
        }
    }

    // transitionend всплывает и от кнопки внутри карточки, поэтому проверяется event.target
    function onTransitionEnd(event) {
        if (event.target === card) {
            card.removeEventListener("transitionend", onTransitionEnd);
            finishRemoval();
        }
    }

    card.addEventListener("transitionend", onTransitionEnd);
    // Запасной вариант, если transitionend не сработает
    setTimeout(finishRemoval, FADE_DURATION + 100);
}

function initAchievements() {
    const container = getElement("achievements-list");
    if (!container) {
        console.error("Управление достижениями недоступно: нет контейнера карточек");
        return;
    }

    const emptyMessage = getElement("achievements-empty");

    restoreAchievements(container);
    updateEmptyMessage(container, emptyMessage);

    const addButton = getElement("add-achievement");
    if (addButton) {
        addButton.addEventListener("click", function () {
            addAchievement(container, emptyMessage);
        });
    }

    // Один обработчик на контейнер для кнопок "Удалить" всех карточек, в том числе новых
    container.addEventListener("click", function (event) {
        const deleteButton = event.target.closest(".card-delete");
        if (!deleteButton) {
            return;
        }

        const card = deleteButton.closest(".card");
        if (!card) {
            console.error("Не найдена карточка для удаления");
            return;
        }

        removeCard(card, container, emptyMessage);
    });
}

// ---------- Скрытие и показ достижений ----------

function initAchievementsToggle() {
    const button = getElement("toggle-achievements");
    if (!button) {
        return;
    }

    button.addEventListener("click", function () {
        const container = document.getElementById("achievements-list");
        if (!container) {
            console.error("Нельзя скрыть достижения: контейнер #achievements-list не найден");
            return;
        }

        const collapsed = container.classList.toggle("collapsed");
        button.textContent = collapsed ? "Показать все достижения" : "Скрыть все достижения";
        button.setAttribute("aria-expanded", String(!collapsed));
    });
}

initTheme();
initAchievements();
initAchievementsToggle();
