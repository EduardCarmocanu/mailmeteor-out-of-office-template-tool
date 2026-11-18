<script setup lang="ts">
defineProps<{
  wordCount: number
  edited: boolean
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <ul class="message-editor-controls">
    <li>{{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}</li>
    <li v-if="edited">
      Edited —
      <button type="button" class="message-editor-controls__link" @click="emit('reset')">
        Reset
      </button>
    </li>
    <li>
      <a
        class="message-editor-controls__link"
        href="https://mailmeteor.com/blog/gmail-out-of-office"
        @click.prevent
        >Configure in Gmail</a
      >
    </li>
    <li>
      <a
        class="message-editor-controls__link"
        href="https://mailmeteor.com/blog/out-of-office-outlook"
        @click.prevent
        >Configure in Outlook</a
      >
    </li>
  </ul>
</template>

<style scoped>
.message-editor-controls {
  display: flex;
  flex-wrap: wrap;
  row-gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-size-xs);
  line-height: 1.2;
  color: var(--color-text-muted);
}

.message-editor-controls li:not(:last-child)::after {
  content: '·';
  margin: 0 var(--space-1);
}

.message-editor-controls__link {
  padding: 0;
  border: 0;
  border-radius: var(--radius-xs);
  background: none;
  font: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.message-editor-controls__link:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.message-editor-controls__link:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset);
}
</style>
