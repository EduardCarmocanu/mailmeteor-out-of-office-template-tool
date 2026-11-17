<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from 'vue'
import InputLabel from './InputLabel.vue'
import { formatDisplayDate, parseDisplayDate } from '../utils/date'

const props = defineProps<{
  label: string
  /** Earliest allowed date as ISO `YYYY-MM-DD`, or `null` for no lower bound. */
  min: string | null
  /** Latest allowed date as ISO `YYYY-MM-DD`, or `null` for no upper bound. */
  max: string | null
}>()

/** A valid, in-bounds ISO `YYYY-MM-DD` date, or `''` when empty or invalid. */
const model = defineModel<string>({ default: '' })

const FORMAT_ERROR = 'Please enter a date in DD/MM/YYYY format.'

const id = useId()
const errorId = useId()
const nativeInput = useTemplateRef<HTMLInputElement>('native')

/** What the user typed, in `DD/MM/YYYY`. */
const text = ref(formatDisplayDate(model.value))
const error = ref<string | null>(null)

/** Lets the hidden picker open on the typed date, even when it is out of bounds. */
const nativeValue = computed(() => parseDisplayDate(text.value) ?? '')

/** All errors for a non-empty value, most important first. */
const getErrors = (value: string): string[] => {
  const iso = parseDisplayDate(value)
  // Bounds can't be checked without a real date.
  if (iso === null) return [FORMAT_ERROR]

  const errors: string[] = []
  if (props.min !== null && iso < props.min) {
    errors.push(`Date must be on or after ${formatDisplayDate(props.min)}.`)
  }
  if (props.max !== null && iso > props.max) {
    errors.push(`Date must be on or before ${formatDisplayDate(props.max)}.`)
  }
  return errors
}

// Last value written to the model by this component, to tell our own updates
// apart from changes made by the parent.
let committed = model.value
const commit = (value: string) => {
  committed = value
  model.value = value
}

// Validation runs when the field loses focus, on Enter, after a calendar pick,
// and when the bounds change; typing never changes the error state.
const validate = () => {
  const value = text.value.trim()
  if (value === '') {
    error.value = null
    commit('')
    return
  }

  const errors = getErrors(value)
  error.value = errors[0] ?? null
  commit(error.value === null ? (parseDisplayDate(value) ?? '') : '')
}

watch(model, (value) => {
  if (value === committed) return
  committed = value
  text.value = formatDisplayDate(value)
  validate()
})

// e.g. "Back on" must re-check itself when "First day away" moves.
watch(
  () => [props.min, props.max],
  () => {
    if (text.value.trim() !== '') validate()
  },
)

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
  const value = (event.target as HTMLInputElement).value
  text.value = formatDisplayDate(value)
  validate()
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
        :min="min ?? undefined"
        :max="max ?? undefined"
        @change="onNativeChange"
      />
      <input
        :id="id"
        v-model="text"
        class="date-input__field"
        :class="{ 'date-input__field--invalid': error }"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="DD/MM/YYYY"
        :aria-invalid="error !== null"
        :aria-describedby="error ? errorId : undefined"
        @blur="validate"
        @keydown.enter="validate"
      />
      <button
        type="button"
        class="date-input__picker-button"
        :aria-label="`Choose ${label} from calendar`"
        @click="openPicker"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M4 1h1.5v1.5h5V1H12v1.5h1A1.5 1.5 0 0 1 14.5 4v9a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 13V4A1.5 1.5 0 0 1 3 2.5h1V1Zm-1 5v7h10V6H3Z"
          />
        </svg>
      </button>
    </div>
    <p v-if="error" :id="errorId" class="date-input__error" role="alert">
      {{ error }}
    </p>
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
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 0 44px 0 14px;
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

.date-input__field::placeholder {
  color: #9ca1b9;
}

.date-input__field:focus {
  border-color: #6b72f2;
  box-shadow: 0 0 0 3px rgba(107, 114, 242, 0.15);
}

.date-input__field--invalid,
.date-input__field--invalid:focus {
  border-color: #e5484d;
}

.date-input__field--invalid:focus {
  box-shadow: 0 0 0 3px rgba(229, 72, 77, 0.15);
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

.date-input__error {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: #e5484d;
}
</style>
