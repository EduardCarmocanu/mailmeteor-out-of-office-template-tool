<script setup lang="ts">
import { useId } from 'vue'
import InputLabel from './InputLabel.vue'

defineProps<{
  label: string
  placeholder: string
}>()

const model = defineModel<string>({ default: '' })

const MAX_LENGTH = 100
const id = useId()
</script>

<template>
  <div class="text-input">
    <InputLabel v-if="label" :for="id">{{ label }}</InputLabel>
    <input
      :id="id"
      v-model="model"
      class="text-input__field"
      type="text"
      :placeholder="placeholder"
      :maxlength="MAX_LENGTH"
    />
  </div>
</template>

<style scoped>
.text-input__field {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #dcdfe8;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 15px;
  color: #2b3152;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.text-input__field::placeholder {
  color: #9ca1b9;
}

.text-input__field:focus {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}
</style>
