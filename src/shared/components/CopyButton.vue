<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const { text, label = 'Copy' } = defineProps<{
  /** Text written to the clipboard on click. */
  text: string
  /** Accessible name of the button before copying. */
  label?: string
}>()

const COPIED_DURATION_MS = 2000

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const clearResetTimer = () => {
  if (resetTimer !== undefined) {
    clearTimeout(resetTimer)
    resetTimer = undefined
  }
}

const copy = async () => {
  try {
    // `navigator.clipboard` is undefined outside secure contexts.
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
    await navigator.clipboard.writeText(text)

    clearResetTimer()
    copied.value = true
    resetTimer = setTimeout(() => {
      copied.value = false
      resetTimer = undefined
    }, COPIED_DURATION_MS)
  } catch {
    // Copy errors are intentionally not surfaced to the user for now.
    clearResetTimer()
    copied.value = false
  }
}

// The check mark only applies to the text that was copied.
watch(
  () => text,
  () => {
    clearResetTimer()
    copied.value = false
  },
)

onBeforeUnmount(clearResetTimer)
</script>

<template>
  <button
    type="button"
    class="copy-button"
    :class="{ 'copy-button--copied': copied }"
    :aria-label="copied ? 'Copied' : label"
    @click="copy"
  >
    <svg
      v-if="copied"
      class="copy-button__icon"
      data-icon="check"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 9.5l3.5 3.5 7.5-8"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <svg
      v-else
      class="copy-button__icon"
      data-icon="copy"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H11"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <rect x="6" y="6" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5" />
    </svg>
    <span class="copy-button__status" aria-live="polite">{{ copied ? 'Copied' : '' }}</span>
  </button>
</template>

<style scoped>
.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #2b3152;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.copy-button:hover {
  background: #e6e8ef;
}

.copy-button:focus-visible {
  outline: 2px solid #6b72f2;
  outline-offset: 1px;
}

.copy-button--copied {
  color: #2f9e62;
}

/* Visually hidden, still announced by screen readers. */
.copy-button__status {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
