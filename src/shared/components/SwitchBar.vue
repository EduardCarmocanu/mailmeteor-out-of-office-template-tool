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
  border: 1px solid #e6e8ef;
  border-radius: 8px;
  background: #f4f5f8;
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
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  color: #5c6185;
  cursor: pointer;
  user-select: none;
}

.switch-bar__option--selected {
  border-color: #e6e8ef;
  background: #fff;
  box-shadow: 0 1px 2px rgba(43, 49, 82, 0.06);
  font-weight: var(--font-weight-semibold);
  color: #1f2340;
}

.switch-bar__option:has(.switch-bar__input:focus-visible) {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
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
