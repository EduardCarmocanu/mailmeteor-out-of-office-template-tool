<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import CheckIcon from '@/assets/icons/check.svg?component'
import CopyIcon from '@/assets/icons/copy.svg?component'
import CrossIcon from '@/assets/icons/cross.svg?component'

const props = withDefaults(
  defineProps<{
    /** Text written to the clipboard on click. */
    text: string
    /** Accessible name of the button before copying. */
    label?: string
  }>(),
  { label: 'Copy' },
)

type CopyStatus = 'idle' | 'copied' | 'error'

const FEEDBACK_DURATION_MS = 2000

const status = ref<CopyStatus>('idle')
// Bumped on every feedback so the error icon remounts and its shake replays on repeated failures.
const feedbackId = ref(0)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const statusLabel = computed(() => {
  if (status.value === 'copied') return 'Copied'
  if (status.value === 'error') return 'Copy failed'
  return ''
})

const clearResetTimer = () => {
  if (resetTimer !== undefined) {
    clearTimeout(resetTimer)
    resetTimer = undefined
  }
}

const showFeedback = (next: Exclude<CopyStatus, 'idle'>) => {
  clearResetTimer()
  status.value = next
  feedbackId.value++
  resetTimer = setTimeout(() => {
    status.value = 'idle'
    resetTimer = undefined
  }, FEEDBACK_DURATION_MS)
}

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.text)
    showFeedback('copied')
  } catch {
    showFeedback('error')
  }
}

// Feedback only applies to the text that was (or failed to be) copied.
watch(
  () => props.text,
  () => {
    clearResetTimer()
    status.value = 'idle'
  },
)

onBeforeUnmount(clearResetTimer)
</script>

<template>
  <button
    type="button"
    class="copy-button"
    :class="{
      'copy-button--copied': status === 'copied',
      'copy-button--error': status === 'error',
    }"
    :aria-label="statusLabel || label"
    @click="copy"
  >
    <CheckIcon
      v-if="status === 'copied'"
      class="copy-button__icon"
      data-icon="check"
      aria-hidden="true"
      focusable="false"
    />
    <CrossIcon
      v-else-if="status === 'error'"
      :key="feedbackId"
      class="copy-button__icon copy-button__icon--shake"
      data-icon="error"
      aria-hidden="true"
      focusable="false"
    />
    <CopyIcon
      v-else
      class="copy-button__icon"
      data-icon="copy"
      aria-hidden="true"
      focusable="false"
    />
    <span class="copy-button__status" aria-live="polite">{{ statusLabel }}</span>
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

.copy-button--error {
  color: #d14343;
}

.copy-button__icon--shake {
  animation: copy-button-shake 0.4s ease-in-out;
}

@keyframes copy-button-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-2px);
  }
  40%,
  80% {
    transform: translateX(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .copy-button__icon--shake {
    animation: none;
  }
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
