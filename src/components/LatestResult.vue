<script setup lang="ts">
import { useClipboard } from '../composables/useClipboard';
import type { ShortenedItem } from '../models';

const props = defineProps<{
  item: ShortenedItem;
}>();

const emit = defineEmits<{
  (e: 'copy', url: string): void;
}>();

const { copied, copy } = useClipboard();

async function handleCopy() {
  await copy(props.item.shortUrl);
  emit('copy', props.item.shortUrl);
}
</script>

<template>
  <div class="latest-result-card">
    <div class="result-content">
      <a :href="item.shortUrl" target="_blank" class="short-link">
        {{ item.shortUrl }}
      </a>
      <div class="original-preview" :title="item.originalUrl">
        Оригинал: <a :href="item.originalUrl" target="_blank" rel="noopener noreferrer" class="original-link">{{ item.originalUrl }}</a>
      </div>
    </div>
    <button
      class="btn btn-copy"
      :class="{ 'copied': copied, 'not-copied': !copied }"
      @click="handleCopy"
    >
      {{ copied ? 'Скопировано ✓' : 'Копировать' }}
    </button>
  </div>
</template>

<style scoped>
.latest-result-card {
  width: 100%;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  box-sizing: border-box;
  text-align: left;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.short-link {
  font-family: var(--mono), monospace;
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  display: block;
  word-break: break-all;
  margin-bottom: 4px;
}

.short-link:hover {
  text-decoration: underline;
}

.original-preview {
  font-size: 13px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.original-preview span,
.original-link {
  color: var(--text-h);
  text-decoration: none;
}

.original-link:hover {
  text-decoration: underline;
  color: var(--accent);
}

.btn {
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
}

.btn:active {
  transform: scale(0.97);
}

.btn-copy {
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-copy.not-copied {
  animation: revertCopy 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-copy:hover {
  background: var(--accent);
  color: #fff;
  transform: translateY(-1px);
}

.btn-copy.copied {
  background: #10b981;
  color: #fff;
  border-color: #059669;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  animation: copySuccess 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-copy.copied:hover {
  background: #059669;
  color: #fff;
}

@keyframes copySuccess {
  0% {
    transform: scale(0.92);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes revertCopy {
  0% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .latest-result-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .btn-copy {
    width: 100%;
  }
}
</style>
