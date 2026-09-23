let currentActress = null;
let currentPage = "catalog";


// ===============================
// НАВИГАЦИЯ
// ===============================

function showPage(page) {
  currentPage = page;

  document.querySelectorAll(".page").forEach(el => {
    el.classList.add("hidden");
    el.classList.remove("active");
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


// ===============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ===============================

function initials(name) {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function saveFavorites() {
  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );
}

function saveProfiles() {
  localStorage.setItem(
    "profiles",
    JSON.stringify(profiles)
  );
}

function getProfile(name) {
  if (!profiles[name]) {
    profiles[name] = {
      name,
      photo: "",
      description: "Описание пока не добавлено.",
      debut: "Не указано",
      collaborations: "Не указано",
      websites: "",
      country: "Не указано",
      interests: "Не указано",
      style: "Дружелюбный",
      greeting: `Привет! Это виртуальный профиль ${name}.`,
      messages: []
    };
  }

  return profiles[name];
}


// ===============================
// КАРТОЧКИ
// ===============================

function createCard(name) {
  const profile = getProfile(name);
  const isFavorite = favorites.includes(name);

  const card = document.createElement("article");

  card.className = "actress-card";

  const photo = profile.photo
    ? `<img src="${profile.photo}" alt="${name}">`
    : `<span>${initials(name)}</span>`;

  card.innerHTML = `
    <div class="card-photo">
      ${photo}
    </div>

    <div class="card-info">
      <div class="card-name">${name}</div>

      <div class="card-actions">
        <button onclick="openProfile('${name.replace(/'/g, "\\'")}')">
          Профиль
        </button>

        <button
          class="favorite-button ${isFavorite ? "active" : ""}"
          onclick="toggleFavorite('${name.replace(/'/g, "\\'")}')">
          ${isFavorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  `;

  return card;
}

function renderCatalog(list = actresses) {
  const grid = document.getElementById("actressesGrid");

  if (!grid) return;

  grid.innerHTML = "";

  if (list.length === 0) {
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

  const list = actresses.filter(name =>
    favorites.includes(name)
  );

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-message">
        Пока нет избранных профилей ⭐
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

  saveFavorites();

  if (currentPage === "favorites") {
    renderFavorites();
  } else {
    renderCatalog();
  }
}


// ===============================
// ПОИСК
// ===============================

function searchActresses() {
  const input = document.getElementById("searchInput");

  if (!input) return;

  const query = input.value.toLowerCase().trim();

  const result = actresses.filter(name =>
    name.toLowerCase().includes(query)
  );

  renderCatalog(result);
}


// ===============================
// ПРОФИЛЬ
// ===============================

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
    ? `<img src="${profile.photo}" alt="${name}">`
    : `<span>${initials(name)}</span>`;

  container.innerHTML = `
    <div class="profile-box">

      <div class="profile-photo">
        ${photo}
      </div>

      <h2>${name}</h2>

      <div class="notice">
        Виртуальный профиль. Данные можно изменить вручную.
      </div>

      <label>Фотография из галереи</label>

      <input
        type="file"
        accept="image/*"
        onchange="uploadPhoto(event, '${name.replace(/'/g, "\\'")}')"
      >

      <label>Или URL фотографии</label>

      <input
        id="photoUrl"
        value="${profile.photo}"
        placeholder="https://..."
      >

      <label>Описание</label>

      <textarea id="description">${profile.description}</textarea>

      <label>Дебют</label>

      <input id="debut" value="${profile.debut}">

      <label>Коллаборации</label>

      <textarea id="collaborations">${profile.collaborations}</textarea>

      <label>Сайты</label>

      <input id="websites" value="${profile.websites}">

      <label>Страна</label>

      <input id="country" value="${profile.country}">

      <label>Интересы</label>

      <textarea id="interests">${profile.interests}</textarea>

      <label>Приветствие виртуального чата</label>

      <textarea id="greeting">${profile.greeting}</textarea>

      <div class="profile-buttons">

        <button class="primary-btn"
                onclick="saveProfile('${name.replace(/'/g, "\\'")}')">
          💾 Сохранить
        </button>

        <button class="secondary-btn"
                onclick="generateDescription('${name.replace(/'/g, "\\'")}')">
          🎲 Рандомное описание
        </button>

        <button class="secondary-btn"
                onclick="openChat('${name.replace(/'/g, "\\'")}')">
          💬 Открыть чат
        </button>

        <button class="secondary-btn"
                onclick="toggleFavorite('${name.replace(/'/g, "\\'")}')">
          ⭐ Избранное
        </button>

      </div>

    </div>
  `;
}

function saveProfile(name) {
  const profile = getProfile(name);

  profile.photo = document.getElementById("photoUrl").value;
  profile.description = document.getElementById("description").value;
  profile.debut = document.getElementById("debut").value;
  profile.collaborations = document.getElementById("collaborations").value;
  profile.websites = document.getElementById("websites").value;
  profile.country = document.getElementById("country").value;
  profile.interests = document.getElementById("interests").value;
  profile.greeting = document.getElementById("greeting").value;

  saveProfiles();

  alert("Профиль сохранён!");

  renderProfile(name);
  renderCatalog();
}

function uploadPhoto(event, name) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    getProfile(name).photo = e.target.result;

    saveProfiles();
    renderProfile(name);
    renderCatalog();
  };

  reader.readAsDataURL(file);
}

function generateDescription(name) {
  const descriptions = [
    "Виртуальное описание: спокойная, общительная и дружелюбная.",
    "Виртуальное описание: любит общение, музыку и интересные разговоры.",
    "Виртуальное описание: открыта к новым темам и лёгкому общению.",
    "Виртуальное описание: предпочитает уважительный и позитивный диалог."
  ];

  const profile = getProfile(name);

  profile.description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  saveProfiles();
  renderProfile(name);
}


// ===============================
// ВИРТУАЛЬНЫЙ ЧАТ
// ===============================

function openChat(name) {
  currentActress = name;

  showPage("chat");
  renderChat(name);
}

function renderChat(name) {
  const profile = getProfile(name);
  const container = document.getElementById("chatContent");

  if (!container) return;

  if (!profile.messages) {
    profile.messages = [];
  }

  let messagesHTML = "";

  profile.messages.forEach(message => {
    messagesHTML += `
      <div class="message ${message.user ? "user" : "bot"}">
        ${message.text}
      </div>
    `;
  });

  if (profile.messages.length === 0) {
    messagesHTML = `
      <div class="message bot">
        ${profile.greeting}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="chat-box">

      <div class="chat-title">
        💬 ${name}
      </div>

      <div class="notice">
        Это виртуальный чат, а не переписка с реальным человеком.
      </div>

      <div class="chat-messages" id="chatMessages">
        ${messagesHTML}
      </div>

      <div class="chat-input-area">

        <input
          id="chatInput"
          placeholder="Напиши сообщение..."
          onkeydown="if(event.key === 'Enter') sendMessage()"
        >

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
                onclick="clearChat('${name.replace(/'/g, "\\'")}')">
          🗑 Очистить
        </button>

      </div>

    </div>
  `;
}

function sendMessage() {
  const input = document.getElementById("chatInput");

  if (!input || !currentActress) return;

  const text = input.value.trim();

  if (!text) return;

  const profile = getProfile(currentActress);

  profile.messages.push({
    user: true,
    text: text
  });

  const replies = [
    "Привет! Рада пообщаться 😊",
    "Интересная тема! Расскажи подробнее.",
    "Спасибо за сообщение!",
    "Давай поговорим об этом.",
    "Звучит интересно!",
    "Как прошёл твой день?",
    "Хорошо, я тебя поняла.",
    "Можешь рассказать об этом подробнее?"
  ];

  const reply =
    replies[Math.floor(Math.random() * replies.length)];

  profile.messages.push({
    user: false,
    text: reply
  });

  saveProfiles();

  input.value = "";

  renderChat(currentActress);
}

function clearChat(name) {
  const profile = getProfile(name);

  profile.messages = [];

  saveProfiles();
  renderChat(name);
}

function speakLastMessage() {
  const profile = getProfile(currentActress);

  if (!profile.messages.length) return;

  const lastMessage =
    profile.messages[profile.messages.length - 1];

  const speech = new SpeechSynthesisUtterance(
    lastMessage.text
  );

  speech.lang = "ru-RU";
  speech.rate = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(speech);
}


// ===============================
// РАНДОМНАЯ АКТРИСА
// ===============================

function randomActress() {
  const randomIndex =
    Math.floor(Math.random() * actresses.length);

  const name = actresses[randomIndex];

  openProfile(name);
}


// ===============================
// ЧЕЛЛЕНДЖИ
// ===============================

function renderChallenges() {
  const container =
    document.getElementById("challengesContent");

  if (!container) return;

  const challenges = [
    {
      title: "💬 Начать разговор",
      text: "Напиши виртуальному персонажу приветствие."
    },
    {
      title: "⭐ Добавить в избранное",
      text: "Выбери один профиль для быстрого доступа."
    },
    {
      title: "🎲 Случайный выбор",
      text: "Открой случайный профиль."
    },
    {
      title: "📝 Заполнить профиль",
      text: "Добавь описание и интересы."
    }
  ];

  container.innerHTML = challenges.map(challenge => `
    <div class="challenge-card">
      <h3>${challenge.title}</h3>
      <p>${challenge.text}</p>
    </div>
  `).join("");
}


// ===============================
// ПРЕДПОЧТЕНИЯ
// ===============================

function renderPreferences() {
  const container =
    document.getElementById("preferencesContent");

  if (!container) return;

  const settings =
    JSON.parse(localStorage.getItem("settings") || "{}");

  container.innerHTML = `
    <div class="preference-card">

      <h3>Стиль общения</h3>

      <select id="chatStyle">
        <option ${settings.style === "friendly" ? "selected" : ""}>
          Дружелюбный
        </option>

        <option ${settings.style === "calm" ? "selected" : ""}>
          Спокойный
        </option>

        <option ${settings.style === "funny" ? "selected" : ""}>
          Весёлый
        </option>
      </select>

    </div>

    <div class="preference-card">

      <h3>Скорость голоса</h3>

      <input
        type="range"
        id="voiceRate"
        min="0.5"
        max="2"
        step="0.1"
        value="${settings.rate || 1}"
      >

    </div>

    <button class="primary-btn"
            onclick="saveSettings()">
      💾 Сохранить настройки
    </button>
  `;
}

function saveSettings() {
  const style = document.getElementById("chatStyle").value;
  const rate = document.getElementById("voiceRate").value;

  localStorage.setItem(
    "settings",
    JSON.stringify({
      style,
      rate
    })
  );

  alert("Настройки сохранены!");
}


// ===============================
// ЗАПУСК
// ===============================

renderCatalog();
