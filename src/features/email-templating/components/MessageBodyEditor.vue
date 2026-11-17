<script setup lang="ts">
import CopyButton from '../../../shared/components/CopyButton.vue'

defineProps<{
  /** Plain-text message; blank lines separate paragraphs. */
  body: string
}>()
</script>

<template>
  <div class="message-body">
    <p class="message-body__text">{{ body }}</p>
    <CopyButton class="message-body__copy" :text="body" label="Copy message" />
  </div>
</template>

<style scoped>
.message-body {
  position: relative;
  box-sizing: border-box;
  padding: 18px;
}

.message-body__text {
  margin: 0;
  /* Keep clear of the copy button. */
  padding-right: 40px;
  font-size: 14px;
  line-height: 1.6;
  color: #2b3152;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message-body__copy {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
