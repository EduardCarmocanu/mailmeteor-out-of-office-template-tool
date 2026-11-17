<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    selected?: boolean
  }>(),
  { selected: false },
)
</script>

<template>
  <button
    type="button"
    class="pill-button"
    :class="{ 'pill-button--selected': selected }"
    :aria-pressed="selected"
  >
    <span class="pill-button__label" :data-label="label">{{ label }}</span>
  </button>
</template>

<style scoped>
.pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 var(--space-4-5);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  font: inherit;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  color: var(--color-text);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  outline: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.pill-button__label {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.pill-button__label::after {
  content: attr(data-label);
  height: 0;
  overflow: hidden;
  visibility: hidden;
  font-weight: var(--font-weight-semibold);
  user-select: none;
  pointer-events: none;
}

.pill-button:hover {
  background: var(--color-surface-muted);
}

.pill-button--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.pill-button--selected:hover {
  background: var(--color-primary-subtle-hover);
}

.pill-button:focus-visible {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}
</style>
