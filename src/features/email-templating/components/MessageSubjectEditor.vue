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
  gap: 6px;
  padding: 10px 16px 10px 18px;
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
  padding: 0 6px;
  border: 1px solid transparent;
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
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
</style>
