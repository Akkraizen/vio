<script setup lang="ts">
import { useClipboard } from '../composables/useClipboard';
import type { ShortenedItem } from '../models';

const props = defineProps<{
  item: ShortenedItem;
}>();

const emit = defineEmits<{
  (e: 'copy', url: string): void;
  (e: 'remove', id: string): void;
}>();

const { copied, copy } = useClipboard();

async function handleCopy() {
  await copy(props.item.shortUrl);
  emit('copy', props.item.shortUrl);
}
</script>

<template>
  <div class="history-item">
    <div class="history-content">
      <a :href="item.shortUrl" target="_blank" class="history-short">
        {{ item.shortUrl }}
      </a>
      <a
        :href="item.originalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="history-original"
        :title="item.originalUrl"
      >
        {{ item.originalUrl }}
      </a>
    </div>
    <div class="history-actions">
      <button
        class="btn-icon btn-copy-item"
        :class="{ 'copied': copied, 'not-copied': !copied }"
        :title="copied ? 'Скопировано!' : 'Копировать'"
        @click="handleCopy"
      >
        {{ copied ? 'Скопировано ✓' : 'Копировать' }}
      </button>
      <button class="btn-icon btn-delete" title="Удалить" @click="emit('remove', item.id)">
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  gap: 12px;
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-short {
  font-family: var(--mono), monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  display: block;
  margin-bottom: 2px;
}

.history-short:hover {
  text-decoration: underline;
}

.history-original {
  font-size: 12px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  text-decoration: none;
}

.history-original:hover {
  text-decoration: underline;
  color: var(--text-h);
}

.history-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-h);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

.btn-icon:hover {
  background: var(--border);
}

.btn-icon:active {
  transform: scale(0.96);
}

.btn-copy-item {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-copy-item.not-copied {
  animation: revertCopy 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-copy-item.copied {
  background: #10b981;
  color: #fff;
  border-color: #059669;
  animation: copyPulse 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-copy-item.copied:hover {
  background: #059669;
  color: #fff;
}

@keyframes copyPulse {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.05);
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

.btn-delete:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

@media (max-width: 640px) {
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .history-actions {
    width: 100%;
  }

  .history-actions .btn-icon {
    flex: 1;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .history-actions .btn-delete {
    flex: 0 0 auto;
    padding: 6px 14px;
  }
}
</style>
