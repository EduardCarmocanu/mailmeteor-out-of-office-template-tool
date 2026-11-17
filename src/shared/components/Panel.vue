<script setup lang="ts">
import { computed } from 'vue'

// `onClick` is declared as a prop (rather than left as a fallthrough listener)
// so the panel knows when it is clickable and can style itself accordingly.
const { variant = 'default', onClick } = defineProps<{
  variant?: 'default' | 'secondary'
  onClick?: (event: MouseEvent | KeyboardEvent) => void
}>()

const clickable = computed(() => !!onClick)

// Enter/Space activate the panel like a button, but only when the panel itself has
// focus, so typing in a nested input is never intercepted.
function onKeydown(event: KeyboardEvent) {
  if (!onClick || event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  onClick(event)
}
</script>

<template>
  <div
    :class="[
      'panel',
      { 'panel--secondary': variant === 'secondary', 'panel--clickable': clickable },
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="onClick?.($event)"
    @keydown="onKeydown"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.panel {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 1px solid #e6e8ef;
  border-radius: 8px;
  padding: 24px;
}

.panel--secondary {
  background-color: #f4f5f8;
}

.panel--clickable {
  cursor: pointer;
  user-select: none;
  outline: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.panel--clickable:hover {
  border-color: #6b72f2;
  box-shadow: 0 2px 8px rgba(31, 35, 64, 0.08);
}

.panel--secondary.panel--clickable:hover {
  background-color: #eceefd;
}

.panel--clickable:focus-visible {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}
</style>
