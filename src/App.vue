<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { normalizeUrl, isValidUrl, isSelfUrl, getShortUrlForHash } from './utils/url_utils';
import { toHash, toUrl } from './utils/hash_utils';
import { loadFromStorage, saveToStorage } from './utils/storage_utils';
import History from './components/History.vue';
import LatestResult from "./components/LatestResult.vue";
import type { ShortenedItem } from "./models";

const STORAGE_KEY = 'vio_shortener_history';
const MAX_HISTORY_ITEMS = 20;

const inputUrl = ref('');
const errorMessage = ref('');
const redirectTarget = ref<string | null>(null);
const redirectCountdown = ref(3);
const isRedirecting = ref(false);
const history = ref<ShortenedItem[]>([]);

function loadHistory() {
  history.value = loadFromStorage<ShortenedItem[]>(STORAGE_KEY, []);
}

function saveHistory() {
  saveToStorage(STORAGE_KEY, history.value);
}

function handleShorten() {
  errorMessage.value = '';

  const formatted = normalizeUrl(inputUrl.value);
  if (!formatted) {
    errorMessage.value = 'Пожалуйста, введите URL';
    return;
  }

  if (!isValidUrl(formatted)) {
    errorMessage.value = 'Введен некорректный URL';
    return;
  }

  if (isSelfUrl(formatted)) {
    errorMessage.value = 'Нельзя сокращать ссылки на Vio!';
    return;
  }

  try {
    // Проверяем наличие кодируемого URL в истории
    const existingIndex = history.value.findIndex(
      item => item.originalUrl === formatted || item.originalUrl.toLowerCase() === formatted.toLowerCase()
    );

    if (existingIndex !== -1) {
      const [existingItem] = history.value.splice(existingIndex, 1);
      history.value.unshift(existingItem);
      saveHistory();
      inputUrl.value = '';
      return;
    }

    const hash = toHash(formatted);
    const shortUrl = getShortUrlForHash(hash);

    const newItem: ShortenedItem = {
      id: Date.now().toString(),
      originalUrl: formatted,
      shortUrl,
      hash,
      createdAt: Date.now()
    };

    history.value.unshift(newItem);
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value.pop();
    }
    saveHistory();
    inputUrl.value = '';
  } catch (e) {
    errorMessage.value = 'Ошибка при генерации ссылки';
    console.error(e);
  }
}

function clearHistory() {
  history.value = [];
  saveHistory();
}

function removeHistoryItem(id: string) {
  history.value = history.value.filter(item => item.id !== id);
  saveHistory();
}

function cancelRedirect() {
  isRedirecting.value = false;
  redirectTarget.value = null;
  window.location.hash = '';
}

onMounted(() => {
  loadHistory();

  // Проверяем, есть ли хэш для перенаправления
  const rawHash = window.location.hash.replace(/^#/, '');
  if (rawHash) {
    try {
      const decodedUrl = toUrl(rawHash);
      if (decodedUrl && /^https?:\/\//i.test(decodedUrl)) {
        redirectTarget.value = decodedUrl;
        isRedirecting.value = true;

        const interval = setInterval(() => {
          if (!isRedirecting.value) {
            clearInterval(interval);
            return;
          }
          redirectCountdown.value -= 1;
          if (redirectCountdown.value <= 0) {
            clearInterval(interval);
            window.location.replace(decodedUrl);
          }
        }, 1000);
      }
    } catch (e) {
      console.warn('Не удалось декодировать хэш ссылки:', e);
    }
  }
});
</script>

<template>
  <div id="center">
    <!-- Блок редиректа при переходе по короткой ссылке -->
    <div v-if="redirectTarget" class="redirect-card">
      <h2>Перенаправление...</h2>
      <p class="redirect-info">
        Вы будете перенаправлены на:
      </p>
      <a :href="redirectTarget" class="target-link" rel="noopener noreferrer">
        {{ redirectTarget }}
      </a>
      <div class="countdown-badge">Через {{ redirectCountdown }} сек.</div>
      <div class="redirect-actions">
        <a :href="redirectTarget" class="btn btn-primary" rel="noopener noreferrer">
          Перейти сейчас
        </a>
        <button class="btn btn-secondary" @click="cancelRedirect">
          Отмена
        </button>
      </div>
    </div>

    <!-- Основной интерфейс сокращателя -->
    <div v-else class="shortener-container">
      <div class="hero-header">
        <h2 class="brand-title">VIO</h2>
      </div>

      <form class="url-form" @submit.prevent="handleShorten">
        <div class="input-wrapper">
          <input
            v-model="inputUrl"
            type="text"
            placeholder="Вставьте ссылку..."
            class="url-input"
            autofocus
          />
          <button type="submit" class="btn btn-primary shorten-btn">
            Сократить
          </button>
        </div>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>

      <!-- Результат последнего сокращения -->
      <LatestResult
        v-if="history.length > 0"
        :item="history[0]"
      />

      <!-- История сокращений -->
      <History
        :items="history"
        @remove="removeHistoryItem"
        @clear="clearHistory"
      />
    </div>
  </div>
</template>

<style scoped>
.shortener-container {
  width: 100%;
  max-width: 680px;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.hero-header {
  margin-bottom: 28px;
  text-align: center;
}

.brand-title {
  font-size: 56px;
  line-height: 1.2;
  margin: 0;
  padding: 4px 8px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(to right, #aa3bff 0%, #c084fc 25%, #e879f9 50%, #818cf8 75%, #aa3bff 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 4s linear infinite;
  display: inline-block;

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none;   /* Chrome, Safari, Opera */
  -khtml-user-select: none;    /* Konqueror */
  -moz-user-select: none;      /* Firefox */
  -ms-user-select: none;       /* Internet Explorer / Edge */
  user-select: none;
}

@keyframes shine {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

.url-form {
  width: 100%;
  margin-bottom: 28px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 6px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.input-wrapper:focus-within {
  border-color: var(--accent);
}

.url-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text-h);
  outline: none;
  min-width: 0;
}

.url-input::placeholder {
  color: var(--text);
  opacity: 0.7;
}

.btn {
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px var(--accent-border);
}

.btn-secondary {
  background: var(--code-bg);
  color: var(--text-h);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--border);
}

.error-msg {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  text-align: left;
  padding-left: 8px;
}

/* Стили для экрана редиректа */
.redirect-card {
  max-width: 520px;
  width: 100%;
  padding: 40px 30px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--code-bg);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.redirect-info {
  color: var(--text);
  font-size: 15px;
}

.target-link {
  color: var(--accent);
  font-weight: 600;
  font-size: 16px;
  word-break: break-all;
  max-width: 100%;
}

.countdown-badge {
  font-family: var(--mono);
  font-size: 14px;
  background: var(--accent-bg);
  color: var(--accent);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--accent-border);
}

.redirect-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .input-wrapper {
    flex-direction: column;
  }
  .shorten-btn {
    width: 100%;
  }
}
</style>
