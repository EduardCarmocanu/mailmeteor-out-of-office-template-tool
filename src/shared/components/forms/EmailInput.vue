<script setup lang="ts">
import { ref, useId } from 'vue'
import { useEmail } from '../../composables/Email.composable.ts'
import InputLabel from './InputLabel.vue'

defineProps<{
  label: string
  placeholder: string
  optional?: boolean
}>()

const model = defineModel<string>({ default: '' })

const { isValidEmail } = useEmail()

const id = useId()
const errorId = useId()

const showError = ref(false)
let lastValidatedValue = model.value

const validate = () => {
  if (model.value === lastValidatedValue) return
  lastValidatedValue = model.value

  const value = model.value.trim()
  showError.value = value !== '' && !isValidEmail(value)
}
</script>

<template>
  <div class="email-input">
    <InputLabel :for="id" :optional="optional">{{ label }}</InputLabel>
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
  width: 100%;
  height: 44px;
  padding: 0 var(--space-3-5);
  border: var(--border-width) solid var(--color-border);
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

.email-input__field::placeholder {
  color: var(--color-text-placeholder);
}

.email-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.email-input__field--invalid,
.email-input__field--invalid:focus {
  border-color: var(--color-danger);
}

.email-input__field--invalid:focus {
  box-shadow: var(--shadow-focus-danger);
}

.email-input__error {
  margin: var(--space-1-5) 0 0;
  font-size: var(--font-size-sm);
  line-height: 1.4;
  color: var(--color-danger);
}
</style>
