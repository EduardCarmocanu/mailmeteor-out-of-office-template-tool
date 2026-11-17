<script setup lang="ts">
import { ref, useId } from 'vue'
import InputLabel from './InputLabel.vue'

defineProps<{
  label: string
  placeholder: string
}>()

const model = defineModel<string>({ default: '' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const id = useId()
const errorId = useId()

// Validation runs only when the field loses focus, and only if the value changed
// since the last check; typing never changes the error state.
const showError = ref(false)
let lastValidatedValue = model.value

const validate = () => {
  if (model.value === lastValidatedValue) return
  lastValidatedValue = model.value

  const value = model.value.trim()
  showError.value = value !== '' && !EMAIL_RE.test(value)
}
</script>

<template>
  <div class="email-input">
    <InputLabel :for="id">{{ label }}</InputLabel>
    <input
      :id="id"
      v-model="model"
      class="email-input__field"
      :class="{ 'email-input__field--invalid': showError }"
      type="email"
      autocomplete="email"
      :placeholder="placeholder"
      :aria-invalid="showError"
      :aria-describedby="showError ? errorId : undefined"
      @blur="validate"
    />
    <p v-if="showError" :id="errorId" class="email-input__error" role="alert">
      Please enter a valid email address.
    </p>
  </div>
</template>

<style scoped>
.email-input__field {
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

.email-input__field::placeholder {
  color: #9ca1b9;
}

.email-input__field:focus {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}

.email-input__field--invalid,
.email-input__field--invalid:focus {
  border-color: #e5484d;
}

.email-input__field--invalid:focus {
  box-shadow: 0 0 0 3px rgba(229, 72, 77, 0.15);
}

.email-input__error {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: #e5484d;
}
</style>
