<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import CalendarIcon from '@/assets/icons/calendar.svg?component'
import InputLabel from './InputLabel.vue'
import { formatDisplayDate, parseIsoDate, toIsoDate } from '../utils/date'

const props = defineProps<{
  label: string
  /** Earliest allowed day, or `null` for no lower bound. */
  min: Date | null
  /** Latest allowed day, or `null` for no upper bound. */
  max: Date | null
}>()

/** The picked day, or `null` when empty. */
const model = defineModel<Date | null>({ default: null })

const id = useId()
const nativeInput = useTemplateRef<HTMLInputElement>('native')

const displayValue = computed(() => formatDisplayDate(model.value))

// The native date input only speaks `YYYY-MM-DD`; convert at that boundary only.
// Its `min`/`max` keep out-of-range days from being picked in the calendar.
const nativeValue = computed(() => (model.value ? toIsoDate(model.value) : ''))
const nativeMin = computed(() => (props.min ? toIsoDate(props.min) : undefined))
const nativeMax = computed(() => (props.max ? toIsoDate(props.max) : undefined))

const openPicker = () => {
  const input = nativeInput.value
  if (!input) return
  try {
    input.showPicker()
  } catch {
    // Older browsers without showPicker().
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
      <!-- Only used for its calendar popup, anchored to the field. -->
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
  padding: 0 44px 0 14px;
  border: 1px solid #dcdfe8;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  color: #2b3152;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.date-input__field::placeholder {
  color: #9ca1b9;
}

.date-input__field:focus {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
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
  border-radius: 4px;
  background: transparent;
  color: #2b3152;
  cursor: pointer;
  transform: translateY(-50%);
}

.date-input__picker-button:hover {
  background: #f1f2f7;
}

.date-input__picker-button:focus-visible {
  outline: 2px solid #6b72f2;
  outline-offset: 1px;
}
</style>
