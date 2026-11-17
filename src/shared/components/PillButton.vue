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
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 18px;
  border: 1px solid #dcdfe8;
  border-radius: 999px;
  background: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 400;
  color: #2b3152;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  outline: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

/*
 * Reserve the width of the bold (selected) label with an invisible copy,
 * so the pill doesn't resize when it becomes selected.
 */
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
  font-weight: 600;
  user-select: none;
  pointer-events: none;
}

.pill-button:hover {
  background: #f4f5f8;
}

.pill-button--selected {
  border-color: #6b72f2;
  background: #eceefd;
  font-weight: 600;
  color: #1f2340;
}

.pill-button--selected:hover {
  background: #e2e5fb;
}

.pill-button:focus-visible {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}
</style>
