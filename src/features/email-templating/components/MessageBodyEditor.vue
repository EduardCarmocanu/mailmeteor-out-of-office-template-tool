<script setup lang="ts">
import CopyButton from '../../../shared/components/buttons/CopyButton.vue'

const body = defineModel<string>({ default: '' })
</script>

<template>
  <div class="message-body">
    <textarea v-model="body" class="message-body__text" aria-label="Message" spellcheck="true" />
    <CopyButton class="message-body__copy" :text="body" label="Copy message" />
  </div>
</template>

<style scoped>
.message-body {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-2);
}

.message-body__text {
  flex: 1;
  margin: 0;
  padding: var(--space-3) 36px var(--space-3) var(--space-3);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-family: inherit;
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  resize: none;
  outline: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.message-body__text:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-focus);
}

.message-body__copy {
  position: absolute;
  z-index: 1;
  top: 18px;
  right: 16px;
}
</style>
