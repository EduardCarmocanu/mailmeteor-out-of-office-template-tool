<script lang="ts">
export interface SwitchBarOption<V extends string | number = string> {
  label: string
  value: V
}
</script>

<script setup lang="ts" generic="T extends string | number">
import { useId } from 'vue'

defineProps<{
  options: SwitchBarOption<T>[]
  name?: string
}>()

const model = defineModel<T>()

const groupName = useId()
</script>

<template>
  <div class="switch-bar" role="radiogroup">
    <label
      v-for="option in options"
      :key="option.value"
      class="switch-bar__option"
      :class="{ 'switch-bar__option--selected': option.value === model }"
    >
      <input
        v-model="model"
        class="switch-bar__input"
        type="radio"
        :name="name ?? groupName"
        :value="option.value"
      />
      {{ option.label }}
    </label>
  </div>
</template>

<style scoped>
.switch-bar {
  display: flex;
  gap: 4px;
  width: 100%;
  padding: 4px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-muted);
}

.switch-bar__option {
  position: relative;
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font: inherit;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
}

.switch-bar__option--selected {
  border-color: var(--color-border-subtle);
  background: var(--color-surface);
  box-shadow: 0 1px 2px var(--color-shadow-subtle);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.switch-bar__option:has(.switch-bar__input:focus-visible) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.switch-bar__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
