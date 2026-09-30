<script setup lang="ts">
import HistoryItem from './HistoryItem.vue';
import type { ShortenedItem } from '../models';

defineProps<{
  items: ShortenedItem[];
}>();

const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'clear'): void;
}>();
</script>

<template>
  <div v-if="items.length > 0" class="history-section">
    <div class="history-header">
      <h3>История ссылок</h3>
      <button class="btn-clear" @click="emit('clear')">Очистить всё</button>
    </div>
    <div class="history-list">
      <HistoryItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.history-section {
  width: 100%;
  text-align: left;
  margin-top: 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header h3 {
  font-size: 18px;
  margin: 0;
  color: var(--text-h);
}

.btn-clear {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  padding: 4px 8px;
}

.btn-clear:hover {
  color: #ef4444;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
