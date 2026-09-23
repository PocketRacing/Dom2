"use strict";

/* =========================
   AdultStars — app.js
========================= */

const $ = (selector) => document.querySelector(selector);

let profiles = JSON.parse(localStorage.getItem("adultstars_profiles") || "{}");
let favorites = JSON.parse(localStorage.getItem("adultstars_favorites") || "[]");

let settings = JSON.parse(localStorage.getItem("adultstars_settings") || "{}");

settings = {
  language: settings.language || "ru-RU",
  rate: Number(settings.rate) || 1,
  pitch: Number(settings.pitch) || 1,
  voice: settings.voice || "",
  style: settings.style || "friendly",
  ...settings
};

let currentName = null;
let currentChatName = null;

/* =========================
   Имена каталога
========================= */

const baseNames = [
  "Abella Danger",
  "Angela White",
  "Ariana Marie",
  "Asa Akira",
  "Autumn Falls",
  "Ava Addams",
  "Briana Banks",
  "Brandi Love",
  "Brooklyn Chase",
  "Carmen Caliente",
  "Casey Calvert",
  "Chanel Preston",
  "Cindy Starfall",
  "Dani Daniels",
  "Emily Willis",
  "Eva Elfie",
  "Gianna Dior",
  "Gina Valentina",
  "Jasmine Sherni",
  "Jenna Haze",
  "Jessa Rhodes",
  "Jessica Rizzo",
  "Jill Kassidy",
  "Julia Ann",
  "Kendra Lust",
  "Kenzie Reeves",
  "Kimmy Granger",
  "Lana Rhoades",
  "Lena Paul",
  "Lexi Luna",
  "Lily Ivy",
  "Mia Malkova",
  "Mia Melano",
  "Molly Little",
  "Monica Bellucci",
  "Mia Khalifa",
  "Nina North",
  "Nicole Aniston",
  "Nikki Benz",
  "Olivia Austin",
  "Piper Perri",
  "Riley Reid",
  "Romi Rain",
  "Sasha Grey",
  "Scarlett Sage",
  "Sky Bri",
  "Sophie Dee",
  "Stoya",
  "Sybil Stallone",
  "Tori Black",
  "Vanna Bardot",
  "Victoria June",
  "Whitney Wright",
  "Wifey",
  "Abby Lee Brazil",
  "Adriana Chechik",
  "Alexis Texas",
  "Allie Haze",
  "Amarna Miller",
  "Amy Anderssen",
  "Anna Bell Peaks",
  "April O'Neil",
  "Aubrey Kate",
  "Bella Rolland",
  "Blake Blossom",
  "Bonnie Rotten",
  "Bunny Colby",
  "Charlotte Sartre",
  "Christen Courtney",
  "Clara Mia",
  "Cory Chase",
  "Daisy Stone",
  "Elsa Jean",
  "Emma Hix",
  "Erin Everheart",
  "Gia Derza",
  "Harley Dean",
  "Isiah Maxwell",
  "Jade Kush",
  "Jayden Cole",
  "Jillian Janson",
  "Kali Roses",
  "Katrina Jade",
  "Kira Noir",
  "Kylie Page",
  "Lacey Lennon",
  "Lauren Phillips",
  "Lexi Lore",
  "Mackenzie Moss",
  "Madison Ivy",
  "Mandy Muse",
  "Marley Brinx",
  "Natalia Starr",
  "Nikki Hill",
  "Penny Barber",
  "Rachel Starr",
  "Sarah Vandella",
  "Valentina Nappi",
  "Veronica Avluv"
];

/* =========================
   Вспомогательные функции
========================= */

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeURL(url = "") {
  const value = String(url).trim();

  if (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  return "";
}

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function saveAll() {
  localStorage.setItem(
    "adultstars_profiles",
    JSON.stringify(profiles)
  );

  localStorage.setItem(
    "adultstars_favorites",
    JSON.stringify(favorites)
  );

  localStorage.setItem(
    "adultstars_settings",
    JSON.stringify(settings)
  );
}

function defaultProfile(name) {
  return {
    name,
    photo: "",
    description:
      "Виртуальная карточка профиля. Информация может быть изменена вручную.",
    country: "Не указано",
    debut: "Не указано",
    collaborations: "Не указано",
    websites: [],
    videos: [],
    tags: ["18+", "профиль", "виртуальная карточка"],
    chat: [],
    custom: false
  };
}

function getProfile(name) {
  if (!profiles[name]) {
    profiles[name] = defaultProfile(name);
    saveAll();
  }

  return profiles[name];
}

function allActresses() {
  const names = [...new Set([
    ...baseNames,
    ...Object.keys(profiles)
  ])];

  return names.map((name) => getProfile(name));
}

/* =========================
   Навигация
========================= */

function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const target = $(`#${pageName}`);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  if (pageName === "catalogPage") renderCatalog();
  if (pageName === "favoritesPage") renderFavorites();
  if (pageName === "preferencesPage") renderPreferences();
  if (pageName === "challengesPage") renderChallenges();
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    showPage(pageButton.dataset.page);
  }
});

/* =========================
   Карточки
========================= */

function createCard(profile) {
  const isFavorite = favorites.includes(profile.name);

  const card = document.createElement("article");
  card.className = "card";

  const photo = safeURL(profile.photo);

  card.innerHTML = `
    <div class="card-photo">
      ${
        photo
          ? `<img src="${escapeHTML(photo)}" alt="${escapeHTML(profile.name)}">`
          : `<span>${escapeHTML(initials(profile.name))}</span>`
      }
    </div>

    <div class="card-body">
      <h3>${escapeHTML(profile.name)}</h3>

      <p class="muted">
        ${escapeHTML(profile.country || "Страна не указана")}
      </p>

      <div class="card-buttons">
        <button class="primary open-profile">
          Профиль
        </button>

        <button class="secondary favorite-button">
          ${isFavorite ? "★" : "☆"}
        </button>
      </div>
    </div>
  `;

  card
    .querySelector(".open-profile")
    .addEventListener("click", () => {
      openProfile(profile.name);
    });

  card
    .querySelector(".favorite-button")
    .addEventListener("click", () => {
      toggleFavorite(profile.name);
    });

  return card;
}

function renderCatalog(list = allActresses()) {
  const container = $("#catalogGrid");

  if (!container) return;

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `
      <p class="empty-message">
        Ничего не найдено.
      </p>
    `;

    return;
  }

  list.forEach((profile) => {
    container.appendChild(createCard(profile));
  });
}

function renderFavorites() {
  const container = $("#favoritesGrid");

  if (!container) return;

  const list = allActresses().filter((profile) =>
    favorites.includes(profile.name)
  );

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = `
      <p class="empty-message">
        В избранном пока ничего нет.
      </p>
    `;

    return;
  }

  list.forEach((profile) => {
    container.appendChild(createCard(profile));
  });
}

function toggleFavorite(name) {
  if (favorites.includes(name)) {
    favorites = favorites.filter((item) => item !== name);
  } else {
    favorites.push(name);
  }

  saveAll();
  renderCatalog();
  renderFavorites();
}

function searchActresses(value) {
  const query = String(value).toLowerCase().trim();

  const result = allActresses().filter((profile) =>
    profile.name.toLowerCase().includes(query)
  );

  renderCatalog(result);
}

/* =========================
   Профиль
========================= */

function openProfile(name) {
  currentName = name;

  const profile = getProfile(name);
  const container = $("#profileContent");

  if (!container) return;

  const photo = safeURL(profile.photo);

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-photo">
        ${
          photo
            ? `<img src="${escapeHTML(photo)}" alt="${escapeHTML(name)}">`
            : `<span>${escapeHTML(initials(name))}</span>`
        }
      </div>

      <div>
        <h2>${escapeHTML(profile.name)}</h2>
        <p class="muted">
          ${escapeHTML(profile.country || "Страна не указана")}
        </p>
      </div>
    </div>

    <div class="profile-buttons">
      <button class="primary" id="editProfileButton">
        Редактировать
      </button>

      <button class="secondary" id="photoButton">
        Изменить фото
      </button>

      <button class="secondary" id="deletePhotoButton">
        Удалить фото
      </button>

      <button class="secondary" id="chatProfileButton">
        Открыть чат
      </button>
    </div>

    <section class="profile-section">
      <h3>Описание</h3>
      <p>${escapeHTML(profile.description)}</p>
    </section>

    <section class="profile-section">
      <h3>Информация</h3>
      <p><b>Страна:</b> ${escapeHTML(profile.country)}</p>
      <p><b>Дебют:</b> ${escapeHTML(profile.debut)}</p>
      <p><b>Коллаборации:</b> ${escapeHTML(profile.collaborations)}</p>
    </section>

    <section class="profile-section">
      <h3>Сайты</h3>
      <div id="websitesList"></div>
    </section>

    <section class="profile-section">
      <h3>Видео</h3>
      <div id="videosList"></div>
    </section>
  `;

  const websitesList = $("#websitesList");
  const videosList = $("#videosList");

  if (profile.websites.length) {
    profile.websites.forEach((url) => {
      const safe = safeURL(url);

      if (!safe) return;

      websitesList.innerHTML += `
        <p>
          <a href="${escapeHTML(safe)}"
             target="_blank"
             rel="noopener noreferrer">
             Открыть сайт
          </a>
        </p>
      `;
    });
  } else {
    websitesList.innerHTML = `<p class="muted">Ссылок пока нет.</p>`;
  }

  if (profile.videos.length) {
    profile.videos.forEach((url) => {
      const safe = safeURL(url);

      if (!safe) return;

      videosList.innerHTML += `
        <p>
          <a href="${escapeHTML(safe)}"
             target="_blank"
             rel="noopener noreferrer">
             Открыть видео
          </a>
        </p>
      `;
    });
  } else {
    videosList.innerHTML = `<p class="muted">Видео пока нет.</p>`;
  }

  $("#editProfileButton").addEventListener("click", () => {
    editProfile(name);
  });

  $("#photoButton").addEventListener("click", () => {
    uploadPhoto(name);
  });

  $("#deletePhotoButton").addEventListener("click", () => {
    profile.photo = "";
    saveAll();
    openProfile(name);
  });

  $("#chatProfileButton").addEventListener("click", () => {
    openChat(name);
  });

  showPage("profilePage");
}

/* =========================
   Редактирование профиля
========================= */

function editProfile(name) {
  const profile = getProfile(name);

  const description = prompt(
    "Описание профиля:",
    profile.description
  );

  if (description !== null) {
    profile.description = description;
  }

  const country = prompt(
    "Страна:",
    profile.country
  );

  if (country !== null) {
    profile.country = country;
  }

  const debut = prompt(
    "Дебют:",
    profile.debut
  );

  if (debut !== null) {
    profile.debut = debut;
  }

  const collaborations = prompt(
    "Коллаборации:",
    profile.collaborations
  );

  if (collaborations !== null) {
    profile.collaborations = collaborations;
  }

  const website = prompt(
    "Добавить сайт. Оставь пустым, если не нужно:"
  );

  if (website && safeURL(website)) {
    profile.websites.push(website);
  }

  const video = prompt(
    "Добавить ссылку на видео. Оставь пустым, если не нужно:"
  );

  if (video && safeURL(video)) {
    profile.videos.push(video);
  }

  saveAll();
  openProfile(name);
}

function uploadPhoto(name) {
  const profile = getProfile(name);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      profile.photo = reader.result;
      saveAll();
      openProfile(name);
    };

    reader.readAsDataURL(file);
  });

  input.click();
}

function generateDescription(name) {
  const profile = getProfile(name);

  const descriptions = [
    "Виртуальный профиль с дружелюбным стилем общения.",
    "Карточка создана для личной коллекции и заметок.",
    "Профиль с возможностью добавления своих описаний и ссылок.",
    "Виртуальная анкета с настройками общения.",
    "Профиль для каталога AdultStars."
  ];

  profile.description =
    descriptions[Math.floor(Math.random() * descriptions.length)];

  saveAll();
  openProfile(name);
}

/* =========================
   Создание своей карточки
========================= */

function createCustomProfile() {
  const name = prompt("Введите имя для новой карточки:");

  if (!name || !name.trim()) return;

  const cleanName = name.trim();

  if (profiles[cleanName] || baseNames.includes(cleanName)) {
    alert("Такая карточка уже существует.");
    return;
  }

  profiles[cleanName] = {
    ...defaultProfile(cleanName),
    custom: true
  };

  saveAll();
  renderCatalog();
  openProfile(cleanName);
}

function addCreateButton() {
  const container = $("#catalogActions");

  if (!container) return;

  container.innerHTML = `
    <button class="primary" id="createProfileButton">
      + Создать карточку
    </button>
  `;

  $("#createProfileButton").addEventListener(
    "click",
    createCustomProfile
  );
}

/* =========================
   Чат
========================= */

function openChat(name) {
  currentChatName = name;

  const profile = getProfile(name);
  const container = $("#chatContent");

  if (!container) return;

  if (!Array.isArray(profile.chat)) {
    profile.chat = [];
  }

  container.innerHTML = `
    <div class="chat-header">
      <h2>Чат с ${escapeHTML(name)}</h2>
      <p class="muted">
        Виртуальный собеседник. Ответы генерируются автоматически.
      </p>
    </div>

    <div id="messagesList" class="messages-list"></div>

    <div class="chat-form">
      <input
        id="chatInput"
        type="text"
        placeholder="Напиши сообщение..."
      >

      <button class="primary" id="sendChatButton">
        Отправить
      </button>

      <button class="secondary" id="speakChatButton">
        🔊
      </button>
    </div>
  `;

  renderMessages();

  $("#sendChatButton").addEventListener(
    "click",
    sendChatMessage
  );

  $("#speakChatButton").addEventListener(
    "click",
    speakLastMessage
  );

  $("#chatInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendChatMessage();
    }
  });

  showPage("chatPage");
}

function renderMessages() {
  const container = $("#messagesList");

  if (!container || !currentChatName) return;

  const profile = getProfile(currentChatName);

  container.innerHTML = "";

  if (!profile.chat.length) {
    container.innerHTML = `
      <div class="message bot">
        Привет! Это виртуальный чат. Можем поговорить
        об интересах, общении, границах и настроениях.
      </div>
    `;
  }

  profile.chat.forEach((message) => {
    const item = document.createElement("div");

    item.className =
      message.author === "user"
        ? "message user"
        : "message bot";

    item.textContent = message.text;

    container.appendChild(item);
  });

  container.scrollTop = container.scrollHeight;
}

function generateChatReply(text) {
  const message = text.toLowerCase();

  if (
    message.includes("привет") ||
    message.includes("здравств")
  ) {
    return "Привет! Рада пообщаться. Как проходит твой день?";
  }

  if (
    message.includes("как дела") ||
    message.includes("настроен")
  ) {
    return "У меня всё виртуально хорошо. А какое у тебя сейчас настроение?";
  }

  if (
    message.includes("отношен") ||
    message.includes("любов")
  ) {
    return "В отношениях важны уважение, честность, доверие и согласие обоих людей.";
  }

  if (
    message.includes("границ") ||
    message.includes("соглас")
  ) {
    return "Личные границы нужно обсуждать спокойно. Согласие должно быть добровольным и взаимным.";
  }

  if (
    message.includes("18+") ||
    message.includes("интим") ||
    message.includes("секс")
  ) {
    return "Такие темы можно обсуждать нейтрально: через уважение, безопасность, согласие и комфорт.";
  }

  if (
    message.includes("скуча") ||
    message.includes("груст")
  ) {
    return "Жаль, что тебе грустно. Хочешь рассказать, что произошло?";
  }

  if (
    message.includes("спасибо") ||
    message.includes("благодар")
  ) {
    return "Пожалуйста! Мне приятно продолжать разговор.";
  }

  const replies = [
    "Интересная мысль. Расскажешь подробнее?",
    "Я тебя услышала. Что ты думаешь об этом сам?",
    "Давай обсудим это спокойно.",
    "Понимаю. А что для тебя здесь самое важное?",
    "Хорошо, продолжай. Мне интересно.",
    "Думаю, стоит учитывать чувства и границы обоих людей."
  ];

  return replies[
    Math.floor(Math.random() * replies.length)
  ];
}

function sendChatMessage() {
  const input = $("#chatInput");

  if (!input || !currentChatName) return;

  const text = input.value.trim();

  if (!text) return;

  const profile = getProfile(currentChatName);

  profile.chat.push({
    author: "user",
    text,
    date: new Date().toISOString()
  });

  const reply = generateChatReply(text);

  profile.chat.push({
    author: "bot",
    text: reply,
    date: new Date().toISOString()
  });

  input.value = "";

  saveAll();
  renderMessages();
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    alert("Озвучивание не поддерживается этим браузером.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = settings.language;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;

  const voices = speechSynthesis.getVoices();

  if (settings.voice) {
    const voice = voices.find(
      (item) => item.name === settings.voice
    );

    if (voice) {
      utterance.voice = voice;
    }
  }

  speechSynthesis.speak(utterance);
}

function speakLastMessage() {
  if (!currentChatName) return;

  const profile = getProfile(currentChatName);

  const lastMessage = [...profile.chat]
    .reverse()
    .find((message) => message.author === "bot");

  if (lastMessage) {
    speakText(lastMessage.text);
  }
}

/* =========================
   Настройки
========================= */

function renderPreferences() {
  const container = $("#preferencesContent");

  if (!container) return;

  const voices = "speechSynthesis" in window
    ? speechSynthesis.getVoices()
    : [];

  container.innerHTML = `
    <h2>Настройки</h2>

    <label>
      Стиль общения
      <select id="styleSetting">
        <option value="friendly">Дружелюбный</option>
        <option value="calm">Спокойный</option>
        <option value="short">Короткие ответы</option>
      </select>
    </label>

    <label>
      Язык озвучивания
      <select id="languageSetting">
        <option value="ru-RU">Русский</option>
        <option value="en-US">English</option>
        <option value="de-DE">Deutsch</option>
      </select>
    </label>

    <label>
      Скорость речи
      <input
        id="rateSetting"
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value="${settings.rate}"
      >
    </label>

    <label>
      Высота голоса
      <input
        id="pitchSetting"
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value="${settings.pitch}"
      >
    </label>

    <label>
      Голос
      <select id="voiceSetting">
        <option value="">Автоматический</option>
        ${voices.map((voice) => `
          <option value="${escapeHTML(voice.name)}">
            ${escapeHTML(voice.name)}
          </option>
        `).join("")}
      </select>
    </label>

    <button class="primary" id="savePreferencesButton">
      Сохранить настройки
    </button>
  `;

  $("#styleSetting").value = settings.style;
  $("#languageSetting").value = settings.language;
  $("#voiceSetting").value = settings.voice;

  $("#savePreferencesButton").addEventListener(
    "click",
    () => {
      settings.style = $("#styleSetting").value;
      settings.language = $("#languageSetting").value;
      settings.rate = Number($("#rateSetting").value);
      settings.pitch = Number($("#pitchSetting").value);
      settings.voice = $("#voiceSetting").value;

      saveAll();

      alert("Настройки сохранены.");
    }
  );
}

/* =========================
   Челленджи
========================= */

function renderChallenges() {
  const container = $("#challengesContent");

  if (!container) return;

  const challenges = [
    "Написать доброжелательное приветствие.",
    "Задать собеседнику три интересных вопроса.",
    "Рассказать о любимой игре.",
    "Обсудить личные границы.",
    "Придумать совместный план на выходные.",
    "Рассказать о своей мечте.",
    "Поделиться любимым фильмом.",
    "Придумать виртуальное путешествие."
  ];

  const challenge =
    challenges[Math.floor(Math.random() * challenges.length)];

  container.innerHTML = `
    <h2>Челлендж дня</h2>

    <div class="challenge-card">
      <p>${escapeHTML(challenge)}</p>

      <button class="primary" id="newChallengeButton">
        Новый челлендж
      </button>
    </div>
  `;

  $("#newChallengeButton").addEventListener(
    "click",
    renderChallenges
  );
}

/* =========================
   Поиск
========================= */

const searchInput = $("#searchInput");

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    searchActresses(event.target.value);
  });
}

/* =========================
   Случайный профиль
========================= */

const randomButton = $("#randomButton");

if (randomButton) {
  randomButton.addEventListener("click", () => {
    const list = allActresses();

    if (!list.length) return;

    const randomProfile =
      list[Math.floor(Math.random() * list.length)];

    openProfile(randomProfile.name);
  });
}

/* =========================
   Инициализация
========================= */

if ("speechSynthesis" in window) {
  speechSynthesis.addEventListener("voiceschanged", () => {
    if ($("#preferencesPage")?.classList.contains("active")) {
      renderPreferences();
    }
  });
}

addCreateButton();
renderCatalog();
