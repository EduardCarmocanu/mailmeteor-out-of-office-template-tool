<script setup lang="ts">
defineProps<{
  wordCount: number
  /** Whether the subject or body has been edited, which shows the reset action. */
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
      <!-- Placeholder link until the Gmail setup guide exists. -->
      <a class="message-editor-controls__link" href="#" @click.prevent>Configure in Gmail</a>
    </li>
    <li>
      <!-- Placeholder link until the Outlook setup guide exists. -->
      <a class="message-editor-controls__link" href="#" @click.prevent>Configure in Outlook</a>
    </li>
  </ul>
</template>

<style scoped>
.message-editor-controls {
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  line-height: 1.2;
  color: #6b7190;
}

/* The dot trails each item so it stays at the end of the line when the row wraps. */
.message-editor-controls li:not(:last-child)::after {
  content: '·';
  margin: 0 4px;
}

.message-editor-controls__link {
  padding: 0;
  border: 0;
  border-radius: 2px;
  background: none;
  font: inherit;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.message-editor-controls__link:hover {
  color: #2b3152;
  text-decoration: underline;
}

.message-editor-controls__link:focus-visible {
  outline: 2px solid #6b72f2;
  outline-offset: 2px;
}
</style>
