import { describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import DateInput from './DateInput.vue'

type DateInputProps = {
  label?: string
  min?: Date | null
  max?: Date | null
  modelValue?: Date | null
}

/**
 * Mounts DateInput wired like `v-model`: every emitted value is fed back in as
 * the `modelValue` prop, the way a parent component would.
 */
function mountDateInput(props: DateInputProps = {}) {
  const wrapper: VueWrapper = mount(DateInput, {
    props: {
      label: 'First day away',
      min: null,
      max: null,
      modelValue: null,
      ...props,
      'onUpdate:modelValue': (value: Date | null) => wrapper.setProps({ modelValue: value }),
    },
  })
  return wrapper
}

const field = (wrapper: VueWrapper) => wrapper.find('.date-input__field')
const nativeInput = (wrapper: VueWrapper) => wrapper.find('.date-input__native')
const pickerButton = (wrapper: VueWrapper) => wrapper.find('.date-input__picker-button')
const emittedValues = (wrapper: VueWrapper) =>
  (wrapper.emitted('update:modelValue') ?? []).map(([value]) => value)

/** Simulates the user picking a day in the native calendar popup. */
async function pick(wrapper: VueWrapper, iso: string) {
  await nativeInput(wrapper).setValue(iso)
}

describe('DateInput', () => {
  describe('rendering', () => {
    it('renders the label text', () => {
      const wrapper = mountDateInput()

      expect(wrapper.find('label').text()).toBe('First day away')
    })

    it('associates the label with the visible field via a shared id', () => {
      const wrapper = mountDateInput()

      const id = field(wrapper).attributes('id')
      expect(id).toBeTruthy()
      expect(wrapper.find('label').attributes('for')).toBe(id)
    })

    it('renders a read-only text field with a DD/MM/YYYY placeholder', () => {
      const wrapper = mountDateInput()

      const input = field(wrapper)
      expect(input.attributes('type')).toBe('text')
      expect(input.attributes('readonly')).toBeDefined()
      expect(input.attributes('placeholder')).toBe('DD/MM/YYYY')
    })

    it('hides the native date input from keyboard and assistive tech', () => {
      const wrapper = mountDateInput()

      const native = nativeInput(wrapper)
      expect(native.attributes('type')).toBe('date')
      expect(native.attributes('tabindex')).toBe('-1')
      expect(native.attributes('aria-hidden')).toBe('true')
    })

    it('labels the picker button with the field label', () => {
      const wrapper = mountDateInput({ label: 'Back on' })

      expect(pickerButton(wrapper).attributes('aria-label')).toBe('Choose Back on from calendar')
    })
  })

  describe('displayed value', () => {
    it('is empty when modelValue is null', () => {
      const wrapper = mountDateInput()

      expect((field(wrapper).element as HTMLInputElement).value).toBe('')
      expect((nativeInput(wrapper).element as HTMLInputElement).value).toBe('')
    })

    it('shows modelValue as DD/MM/YYYY in the field and as ISO in the native input', () => {
      const wrapper = mountDateInput({ modelValue: new Date(2026, 11, 21) })

      expect((field(wrapper).element as HTMLInputElement).value).toBe('21/12/2026')
      expect((nativeInput(wrapper).element as HTMLInputElement).value).toBe('2026-12-21')
    })

    it('updates when the parent changes modelValue', async () => {
      const wrapper = mountDateInput({ modelValue: new Date(2026, 11, 21) })

      await wrapper.setProps({ modelValue: new Date(2027, 0, 4) })

      expect((field(wrapper).element as HTMLInputElement).value).toBe('04/01/2027')
    })

    it('clears when the parent sets modelValue to null', async () => {
      const wrapper = mountDateInput({ modelValue: new Date(2026, 11, 21) })

      await wrapper.setProps({ modelValue: null })

      expect((field(wrapper).element as HTMLInputElement).value).toBe('')
    })
  })

  describe('bounds on the native input', () => {
    it('omits min and max when there are no bounds', () => {
      const wrapper = mountDateInput()

      expect(nativeInput(wrapper).attributes('min')).toBeUndefined()
      expect(nativeInput(wrapper).attributes('max')).toBeUndefined()
    })

    it('passes min and max as ISO dates', () => {
      const wrapper = mountDateInput({
        min: new Date(2026, 10, 17),
        max: new Date(2027, 1, 3),
      })

      expect(nativeInput(wrapper).attributes('min')).toBe('2026-11-17')
      expect(nativeInput(wrapper).attributes('max')).toBe('2027-02-03')
    })
  })

  describe('picking a date', () => {
    it('emits the picked day as a local-midnight Date', async () => {
      const wrapper = mountDateInput()

      await pick(wrapper, '2026-12-21')

      expect(emittedValues(wrapper)).toEqual([new Date(2026, 11, 21)])
      expect((field(wrapper).element as HTMLInputElement).value).toBe('21/12/2026')
    })

    it('emits null when the native input is cleared', async () => {
      const wrapper = mountDateInput({ modelValue: new Date(2026, 11, 21) })

      await pick(wrapper, '')

      expect(emittedValues(wrapper)).toEqual([null])
      expect((field(wrapper).element as HTMLInputElement).value).toBe('')
    })
  })

  describe('opening the calendar', () => {
    it.each([
      ['the field', field],
      ['the picker button', pickerButton],
    ])('calls showPicker on the native input when %s is clicked', async (_, target) => {
      const wrapper = mountDateInput()
      const native = nativeInput(wrapper).element as HTMLInputElement
      const showPicker = vi.fn<HTMLInputElement['showPicker']>()
      native.showPicker = showPicker

      await target(wrapper).trigger('click')

      expect(showPicker).toHaveBeenCalledOnce()
    })

    it('falls back to focusing and clicking the native input when showPicker throws', async () => {
      const wrapper = mountDateInput()
      const native = nativeInput(wrapper).element as HTMLInputElement
      native.showPicker = () => {
        throw new Error('Not supported')
      }
      const focus = vi.spyOn(native, 'focus')
      const click = vi.spyOn(native, 'click')

      await pickerButton(wrapper).trigger('click')

      expect(focus).toHaveBeenCalledOnce()
      expect(click).toHaveBeenCalledOnce()
    })
  })
})
