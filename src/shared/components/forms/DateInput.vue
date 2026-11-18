<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import CalendarIcon from '@/assets/icons/calendar.svg?component'
import InputLabel from './InputLabel.vue'
import { useDate } from '../../composables/Date.composable.ts'

const props = defineProps<{
  label: string
  min: Date | null
  max: Date | null
}>()

const model = defineModel<Date | null>({ default: null })

const { formatDisplayDate, parseIsoDate, toIsoDate } = useDate()

const id = useId()
const nativeInput = useTemplateRef<HTMLInputElement>('native')

const displayValue = computed(() => formatDisplayDate(model.value))

const nativeValue = computed(() => (model.value ? toIsoDate(model.value) : ''))
const nativeMin = computed(() => (props.min ? toIsoDate(props.min) : undefined))
const nativeMax = computed(() => (props.max ? toIsoDate(props.max) : undefined))

const openPicker = () => {
  const input = nativeInput.value
  if (!input) return
  try {
    input.showPicker()
  } catch {
    input.focus()
    input.click()
  }
}

const onNativeChange = (event: Event) => {
  model.value = parseIsoDate((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="date-input">
    <InputLabel :for="id">{{ label }}</InputLabel>
    <div class="date-input__control">
      <input
        ref="native"
        class="date-input__native"
        type="date"
        tabindex="-1"
        aria-hidden="true"
        :value="nativeValue"
        :min="nativeMin"
        :max="nativeMax"
        @change="onNativeChange"
      />
      <input
        :id="id"
        :value="displayValue"
        class="date-input__field"
        type="text"
        readonly
        autocomplete="off"
        placeholder="DD/MM/YYYY"
        @click="openPicker"
      />
      <button
        type="button"
        class="date-input__picker-button"
        :aria-label="`Choose ${label} from calendar`"
        @click="openPicker"
      >
        <CalendarIcon aria-hidden="true" focusable="false" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.date-input__control {
  position: relative;
}

.date-input__native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  pointer-events: none;
}

.date-input__field {
  position: relative;
  width: 100%;
  height: 44px;
  padding: 0 44px 0 var(--space-3-5);
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

.date-input__field::placeholder {
  color: var(--color-text-placeholder);
}

.date-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.date-input__picker-button {
  position: absolute;
  top: 50%;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transform: translateY(-50%);
}

.date-input__picker-button:hover {
  background: var(--color-surface-hover);
}

.date-input__picker-button:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset-sm);
}
</style>
