<script setup lang="ts">
import { useId } from 'vue'
import InputLabel from './InputLabel.vue'

withDefaults(
  defineProps<{
    label: string
    placeholder: string
    optional?: boolean
    maxLength?: number
  }>(),
  { maxLength: 100 },
)

const model = defineModel<string>({ default: '' })

const id = useId()
</script>

<template>
  <div class="text-input">
    <InputLabel :for="id" :optional="optional">{{ label }}</InputLabel>
    <input
      :id="id"
      v-model="model"
      class="text-input__field"
      type="text"
      :placeholder="placeholder"
      :maxlength="maxLength"
    />
  </div>
</template>

<style scoped>
.text-input__field {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font: inherit;
  font-size: var(--font-size-base);
  color: var(--color-text);
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.text-input__field::placeholder {
  color: var(--color-text-placeholder);
}

.text-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
</style>
