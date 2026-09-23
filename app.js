// =====================================
// ADULTSTARS — APP.JS
// =====================================

let currentActress = null;
let currentPage = "catalog";

let customActresses = JSON.parse(
  localStorage.getItem("customActresses") || "[]"
);

let favorites = JSON.parse(
  localStorage.getItem("favorites") || "[]"
);

let profiles = JSON.parse(
  localStorage.getItem("profiles") || "{}"
);

let settings = JSON.parse(
  localStorage.getItem("settings") || "{}"
);


// =====================================
// ОБЩИЕ ФУНКЦИИ
// =====================================

function allActresses() {
  return [...new Set([...actresses, ...customActresses])];
}

function esc(text = "") {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function initials(name) {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function saveAll() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem(
    "customActresses",
    JSON.stringify(customActresses)
  );
  localStorage.setItem("settings", JSON.stringify(settings));
}

function getProfile(name) {
  if (!profiles[name]) {
    profiles[name] = {
      name,
      photo: "",
      description: "",
      debut: "",
      collaborations: "",
      websites: "",
      country: "",
      interests: "",
      greeting: `Привет! Это виртуальный профиль ${name}.`,
      messages: [],
      videos: []
    };
  }

  if (!profiles[name].messages) {
    profiles[name].messages = [];
  }

  if (!profiles[name].videos) {
    profiles[name].videos = [];
  }

  return profiles[name];
}


// =====================================
// НАВИГАЦИЯ
// =====================================

function showPage(page) {
  currentPage = page;

  document.querySelectorAll(".page").forEach(element => {
    element.classList.add("hidden");
    element.classList.remove("active");
  });

  const target = document.getElementById(page + "Page");

  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
  }

  if (page === "catalog") renderCatalog();
  if (page === "favorites") renderFavorites();
  if (page === "challenges") renderChallenges();
  if (page === "preferences") renderPreferences();
}


// =====================================
// КАРТОЧКИ
// =====================================

function createCard(name) {
  const profile = getProfile(name);
  const favorite = favorites.includes(name);

  const card = document.createElement("article");
  card.className = "actress-card";

  const photo = profile.photo
    ? `<img src="${esc(profile.photo)}" alt="${esc(name)}">`
    : `<span>${esc(initials(name))}</span>`;

  card.innerHTML = `
    <div class="card-photo">
      ${photo}
    </div>

    <div class="card-info">
      <div class="card-name">
        ${esc(name)}
      </div>

      <div class="card-actions">
        <button onclick="openProfile('${esc(name)}')">
          Профиль
        </button>

        <button
          class="favorite-button ${favorite ? "active" : ""}"
          onclick="toggleFavorite('${esc(name)}')">
          ${favorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  `;

  return card;
}

function renderCatalog(list = allActresses()) {
  const grid = document.getElementById("actressesGrid");

  if (!grid) return;

  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-message">
        Ничего не найдено
      </div>
    `;
    return;
  }

  list.forEach(name => {
    grid.appendChild(createCard(name));
  });
}

function renderFavorites() {
  const grid = document.getElementById("favoritesGrid");

  if (!grid) return;

  grid.innerHTML = "";

  const list = allActresses().filter(name =>
    favorites.includes(name)
  );

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-message">
        Избранное пока пустое ⭐
      </div>
    `;
    return;
  }

  list.forEach(name => {
    grid.appendChild(createCard(name));
  });
}

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter(item => item !== name);
  } else {
    favorites.push(name);
  }

  saveAll();

  if (currentPage === "favorites") {
    renderFavorites();
  } else {
    renderCatalog();
  }
}

function searchActresses() {
  const input = document.getElementById("searchInput");
  const query = input.value.toLowerCase().trim();

  const result = allActresses().filter(name =>
    name.toLowerCase().includes(query)
  );

  renderCatalog(result);
}


// =====================================
// ПРОФИЛЬ
// =====================================

function openProfile(name) {
  currentActress = name;
  showPage("profile");
  renderProfile(name);
}

function renderProfile(name) {
  const profile = getProfile(name);
  const container = document.getElementById("profileContent");

  if (!container) return;

  const photo = profile.photo
    ? `<img src="${esc(profile.photo)}" alt="${esc(name)}">`
    : `<span>${esc(initials(name))}</span>`;

  const videos = profile.videos.map((video, index) => `
    <div class="challenge-card">
      <p>${esc(video.title || "Видео")}</p>
      <a href="${esc(video.url)}"
         target="_blank"
         rel="noopener noreferrer">
        Открыть видео
      </a>
      <button
        class="secondary-btn"
        onclick="deleteVideo('${esc(name)}', ${index})">
        Удалить
      </button>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="profile-box">

      <div class="profile-photo">
        ${photo}
      </div>

      <h2>${esc(name)}</h2>

      <div class="notice">
        Виртуальный профиль. Информация редактируется вручную.
      </div>

      <label>Фото из галереи</label>
      <input
        type="file"
        accept="image/*"
        onchange="uploadPhoto(event, '${esc(name)}')">

      <label>URL фотографии</label>
      <input id="photoUrl"
             value="${esc(profile.photo)}"
             placeholder="https://...">

      <label>Описание</label>
      <textarea id="description">${esc(profile.description)}</textarea>

      <label>Дебют</label>
      <input id="debut" value="${esc(profile.debut)}">

      <label>Коллаборации</label>
      <textarea id="collaborations">${esc(profile.collaborations)}</textarea>

      <label>Сайты</label>
      <input id="websites" value="${esc(profile.websites)}">

      <label>Страна</label>
      <input id="country" value="${esc(profile.country)}">

      <label>Интересы</label>
      <textarea id="interests">${esc(profile.interests)}</textarea>

      <label>Приветствие бота</label>
      <textarea id="greeting">${esc(profile.greeting)}</textarea>

      <div class="profile-buttons">
        <button class="primary-btn"
                onclick="saveProfile('${esc(name)}')">
          💾 Сохранить
        </button>

        <button class="secondary-btn"
                onclick="generateDescription('${esc(name)}')">
          🎲 Описание
        </button>

        <button class="secondary-btn"
                onclick="openChat('${esc(name)}')">
          💬 Чат
        </button>

        <button class="secondary-btn"
                onclick="openVideoForm('${esc(name)}')">
          🎬 Добавить видео
        </button>
      </div>

      <h3 style="margin-top:25px;">🎬 Видео</h3>

      <div id="videoList">
        ${videos || `<p>Видео пока не добавлены.</p>`}
      </div>

      <div class="profile-buttons">
        <button class="secondary-btn"
                onclick="toggleFavorite('${esc(name)}')">
          ⭐ Избранное
        </button>

        ${
          customActresses.includes(name)
            ? `<button class="secondary-btn"
                       onclick="deleteCustomCard('${esc(name)}')">
                 🗑 Удалить карточку
               </button>`
            : ""
        }
      </div>

    </div>
  `;
}

function saveProfile(name) {
  const profile = getProfile(name);

  profile.photo = document.getElementById("photoUrl").value;
  profile.description = document.getElementById("description").value;
  profile.debut = document.getElementById("debut").value;
  profile.collaborations =
    document.getElementById("collaborations").value;
  profile.websites = document.getElementById("websites").value;
  profile.country = document.getElementById("country").value;
  profile.interests = document.getElementById("interests").value;
  profile.greeting = document.getElementById("greeting").value;

  saveAll();
  renderProfile(name);
  renderCatalog();

  alert("Профиль сохранён!");
}

function uploadPhoto(event, name) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Выбери изображение.");
    return;
  }

  const reader = new FileReader();

  reader.onload = event => {
    getProfile(name).photo = event.target.result;
    saveAll();
    renderProfile(name);
    renderCatalog();
  };

  reader.readAsDataURL(file);
}

function generateDescription(name) {
  const descriptions = [
    "Спокойный и дружелюбный виртуальный профиль.",
    "Любит интересные разговоры и новые темы.",
    "Предпочитает уважительное и позитивное общение.",
    "Виртуальный персонаж с индивидуальными настройками."
  ];

  const profile = getProfile(name);

  profile.description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  saveAll();
  renderProfile(name);
}


// =====================================
// СОЗДАНИЕ СОБСТВЕННОЙ КАРТОЧКИ
// =====================================

function openCreateCard() {
  const name = prompt("Введите имя новой карточки:");

  if (!name || !name.trim()) return;

  const cleanName = name.trim();

  if (allActresses().includes(cleanName)) {
    alert("Такая карточка уже существует.");
    return;
  }

  customActresses.push(cleanName);
  getProfile(cleanName);

  saveAll();
  renderCatalog();

  openProfile(cleanName);
}

function deleteCustomCard(name) {
  if (!customActresses.includes(name)) return;

  if (!confirm("Удалить эту карточку?")) return;

  customActresses = customActresses.filter(item => item !== name);

  delete profiles[name];
  favorites = favorites.filter(item => item !== name);

  saveAll();
  showPage("catalog");
}


// =====================================
// ВИДЕО ПО ССЫЛКЕ
// =====================================

function openVideoForm(name) {
  const title = prompt("Название видео:");

  if (title === null) return;

  const url = prompt("Вставь ссылку на видео:");

  if (!url || !url.startsWith("http")) {
    alert("Нужна корректная ссылка.");
    return;
  }

  const profile = getProfile(name);

  profile.videos.push({
    title: title || "Видео",
    url
  });

  saveAll();
  renderProfile(name);
}

function deleteVideo(name, index) {
  const profile = getProfile(name);

  profile.videos.splice(index, 1);

  saveAll();
  renderProfile(name);
}


// =====================================
// ВИРТУАЛЬНЫЙ ЧАТ
// =====================================

function openChat(name) {
  currentActress = name;
  showPage("chat");
  renderChat(name);
}

function renderChat(name) {
  const profile = getProfile(name);
  const container = document.getElementById("chatContent");

  if (!container) return;

  let messages = profile.messages.map(message => `
    <div class="message ${message.user ? "user" : "bot"}">
      ${esc(message.text)}
    </div>
  `).join("");

  if (!messages) {
    messages = `
      <div class="message bot">
        ${esc(profile.greeting)}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="chat-box">

      <div class="chat-title">
        💬 ${esc(name)}
      </div>

      <div class="notice">
        Это виртуальный бот, а не реальный человек.
      </div>

      <div class="chat-messages" id="chatMessages">
        ${messages}
      </div>

      <div class="chat-input-area">
        <input
          id="chatInput"
          placeholder="Напиши сообщение..."
          onkeydown="if(event.key === 'Enter') sendMessage()">

        <button onclick="sendMessage()">
          Отправить
        </button>
      </div>

      <div class="profile-buttons">
        <button class="secondary-btn"
                onclick="speakLastMessage()">
          🔊 Озвучить
        </button>

        <button class="secondary-btn"
                onclick="clearChat('${esc(name)}')">
          🗑 Очистить
        </button>
      </div>

    </div>
  `;
}


// =====================================
// СЛОВАРЬ БОТА
// =====================================

const botDictionary = [
  {
    keys: ["привет", "здравствуй", "хай"],
    answers: [
      "Привет! 😊 Как у тебя дела?",
      "Рада тебя видеть в виртуальном чате!",
      "Привет! О чём поговорим?"
    ]
  },
  {
    keys: ["как дела", "как ты"],
    answers: [
      "У меня всё хорошо. А как твой день?",
      "Спасибо, что спрашиваешь! Расскажи о себе.",
      "Всё отлично. Чем сегодня занимался?"
    ]
  },
  {
    keys: ["музыка", "песня"],
    answers: [
      "Какую музыку ты обычно слушаешь?",
      "Интересно! У тебя есть любимая песня?"
    ]
  },
  {
    keys: ["игра", "играть", "майнкрафт", "гта"],
    answers: [
      "Во что ты сейчас играешь?",
      "Игры — отличная тема для разговора!",
      "Расскажи о своей любимой игре."
    ]
  },
  {
    keys: ["пока", "до свидания"],
    answers: [
      "До встречи! 😊",
      "Хорошего дня!",
      "Буду ждать следующего разговора."
    ]
  }
];

function getBotReply(text) {
  const normalized = text.toLowerCase();

  for (const item of botDictionary) {
    if (item.keys.some(key => normalized.includes(key))) {
      return item.answers[
        Math.floor(Math.random() * item.answers.length)
      ];
    }
  }

  const defaultReplies = [
    "Интересно! Расскажи подробнее.",
    "Я тебя поняла. Что ты думаешь об этом?",
    "Продолжай, мне интересно.",
    "Давай поговорим об этом спокойнее.",
    "Спасибо за сообщение!"
  ];

  return defaultReplies[
    Math.floor(Math.random() * defaultReplies.length)
  ];
}

function sendMessage() {
  const input = document.getElementById("chatInput");

  if (!input || !currentActress) return;

  const text = input.value.trim();

  if (!text) return;

  const profile = getProfile(currentActress);

  profile.messages.push({
    user: true,
    text
  });

  profile.messages.push({
    user: false,
    text: getBotReply(text)
  });

  saveAll();

  input.value = "";
  renderChat(currentActress);
}

function clearChat(name) {
  if (!confirm("Очистить историю чата?")) return;

  getProfile(name).messages = [];

  saveAll();
  renderChat(name);
}


// =====================================
// ГОЛОС
// =====================================

function speakLastMessage() {
  const profile = getProfile(currentActress);

  if (!profile.messages.length) return;

  const message =
    profile.messages[profile.messages.length - 1];

  const speech = new SpeechSynthesisUtterance(message.text);

  speech.lang = settings.language || "ru-RU";
  speech.rate = Number(settings.rate || 1);
  speech.pitch = Number(settings.pitch || 1);

  speechSynthesis.cancel();
  speechSynthesis.speak(speech);
}


// =====================================
// РАНДОМ
// =====================================

function randomActress() {
  const list = allActresses();

  if (!list.length) return;

  const name = list[Math.floor(Math.random() * list.length)];

  openProfile(name);
}


// =====================================
// ЧЕЛЛЕНДЖИ
// =====================================

function renderChallenges() {
  const container =
    document.getElementById("challengesContent");

  if (!container) return;

  container.innerHTML = `
    <div class="challenge-card">
      <h3>💬 Начать разговор</h3>
      <p>Открой профиль и отправь сообщение боту.</p>
    </div>

    <div class="challenge-card">
      <h3>⭐ Избранное</h3>
      <p>Добавь понравившуюся карточку в избранное.</p>
    </div>

    <div class="challenge-card">
      <h3>🎲 Рандом</h3>
      <p>Открой случайный профиль.</p>
    </div>

    <div class="challenge-card">
      <h3>🎬 Видео</h3>
      <p>Добавь ссылку на видео в профиль.</p>
    </div>
  `;
}


// =====================================
// НАСТРОЙКИ
// =====================================

function renderPreferences() {
  const container =
    document.getElementById("preferencesContent");

  if (!container) return;

  container.innerHTML = `
    <div class="preference-card">
      <h3>Стиль общения</h3>

      <select id="chatStyle">
        <option value="friendly">Дружелюбный</option>
        <option value="calm">Спокойный</option>
        <option value="funny">Весёлый</option>
      </select>
    </div>

    <div class="preference-card">
      <h3>Язык голоса</h3>

      <select id="voiceLanguage">
        <option value="ru-RU">Русский</option>
        <option value="en-US">English</option>
        <option value="de-DE">Deutsch</option>
      </select>
    </div>

    <div class="preference-card">
      <h3>Скорость речи</h3>

      <input
        type="range"
        id="voiceRate"
        min="0.5"
        max="2"
        step="0.1"
        value="${settings.rate || 1}">
    </div>

    <div class="preference-card">
      <h3>Высота голоса</h3>

      <input
        type="range"
        id="voicePitch"
        min="0.5"
        max="2"
        step="0.1"
        value="${settings.pitch || 1}">
    </div>

    <button class="primary-btn"
            onclick="saveSettings()">
      💾 Сохранить
    </button>
  `;
}

function saveSettings() {
  settings = {
    style: document.getElementById("chatStyle").value,
    language: document.getElementById("voiceLanguage").value,
    rate: document.getElementById("voiceRate").value,
    pitch: document.getElementById("voicePitch").value
  };

  saveAll();

  alert("Настройки сохранены!");
}


// =====================================
// ДОБАВЛЯЕМ КНОПКУ СОЗДАНИЯ КАРТОЧКИ
// =====================================

function addCreateButton() {
  const page = document.getElementById("catalogPage");

  if (!page || document.getElementById("createCardButton")) {
    return;
  }

  const button = document.createElement("button");

  button.id = "createCardButton";
  button.className = "primary-btn";
  button.textContent = "➕ Создать карточку";
  button.style.marginBottom = "15px";
  button.onclick = openCreateCard;

  page.insertBefore(button, page.children[1]);
}


// =====================================
// ЗАПУСК
// =====================================

addCreateButton();
renderCatalog();
