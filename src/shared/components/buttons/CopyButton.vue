<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CheckIcon from '@/assets/icons/check.svg?component'
import CopyIcon from '@/assets/icons/copy.svg?component'
import CrossIcon from '@/assets/icons/cross.svg?component'
import { useClipboard } from '../../composables/Clipboard.composable.ts'

const props = withDefaults(
  defineProps<{
    text: string
    label?: string
  }>(),
  { label: 'Copy' },
)

const { status, copy, reset } = useClipboard()
const feedbackId = ref(0)

const statusLabel = computed(() => {
  if (status.value === 'copied') return 'Copied'
  if (status.value === 'error') return 'Copy failed'
  return ''
})

const copyText = async () => {
  await copy(props.text)
  feedbackId.value++
}

watch(() => props.text, reset)
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
    @click="copyText"
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
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.copy-button:hover {
  background: var(--color-surface-hover-strong);
}

.copy-button:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset-sm);
}

.copy-button--copied {
  color: var(--color-success);
}

.copy-button--error {
  color: var(--color-danger-strong);
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
