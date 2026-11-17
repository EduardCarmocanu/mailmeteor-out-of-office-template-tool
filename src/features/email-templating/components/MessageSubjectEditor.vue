<script setup lang="ts">
import { useId } from 'vue'
import CopyButton from '../../../shared/components/buttons/CopyButton.vue'

const subject = defineModel<string>({ default: '' })

const subjectId = useId()
</script>

<template>
  <div class="message-subject">
    <label class="message-subject__label" :for="subjectId">Subject:</label>
    <input
      :id="subjectId"
      v-model="subject"
      class="message-subject__field"
      type="text"
      autocomplete="off"
    />
    <CopyButton class="message-subject__copy" :text="subject" label="Copy subject" />
  </div>
</template>

<style scoped>
.message-subject {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
  padding: var(--space-2-5) var(--space-4) var(--space-2-5) var(--space-4-5);
}

.message-subject__label {
  flex: none;
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}

.message-subject__copy {
  flex: none;
}

.message-subject__field {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 var(--space-1-5);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font: inherit;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-strong);
  outline: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.message-subject__field:hover {
  border-color: var(--color-border);
}

.message-subject__field:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-focus);
}
</style>
