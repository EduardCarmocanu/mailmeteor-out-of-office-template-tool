<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    onClick?: (event: MouseEvent | KeyboardEvent) => void
  }>(),
  { variant: 'primary' },
)

const clickable = computed(() => !!props.onClick)

function onKeydown(event: KeyboardEvent) {
  if (!props.onClick || event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  props.onClick(event)
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
  width: 100%;
  height: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.panel--secondary {
  background-color: var(--color-surface-muted);
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
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.panel--secondary.panel--clickable:hover {
  background-color: var(--color-primary-subtle);
}

.panel--clickable:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
</style>
