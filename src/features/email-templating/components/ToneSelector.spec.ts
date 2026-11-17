import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToneSelector from './ToneSelector.vue'
import type { Tone } from '../models/Tone.model.ts'

function mountToneSelector(props: { modelValue?: Tone } = {}) {
  return mount(ToneSelector, { props })
}

function checkedStates(wrapper: ReturnType<typeof mountToneSelector>) {
  return wrapper
    .findAll('input[type="radio"]')
    .map((input) => (input.element as HTMLInputElement).checked)
}

function findOption(wrapper: ReturnType<typeof mountToneSelector>, label: string) {
  const option = wrapper.findAll('.switch-bar__option').find((option) => option.text() === label)
  if (!option) throw new Error(`Option not found: ${label}`)
  return option
}

describe('ToneSelector', () => {
  describe('rendering', () => {
    it('renders a "Tone" label', () => {
      const wrapper = mountToneSelector()

      expect(wrapper.find('.input-label').text()).toBe('Tone')
    })

    it('renders the four tones in order inside a radiogroup', () => {
      const wrapper = mountToneSelector()

      expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
      expect(wrapper.findAll('.switch-bar__option').map((option) => option.text())).toEqual([
        'Formal',
        'Friendly',
        'Funny',
        'Short',
      ])
      expect(wrapper.findAll('input[type="radio"]')).toHaveLength(4)
    })

    it('uses the tone values as radio values', () => {
      const wrapper = mountToneSelector()

      const values = wrapper
        .findAll('input[type="radio"]')
        .map((input) => (input.element as HTMLInputElement).value)
      expect(values).toEqual(['formal', 'friendly', 'funny', 'short'])
    })

    it('groups all radios under one shared name', () => {
      const wrapper = mountToneSelector()

      const names = wrapper.findAll('input[type="radio"]').map((input) => input.attributes('name'))
      expect(names[0]).toBeTruthy()
      expect(new Set(names)).toEqual(new Set([names[0]]))
    })

    it('gives each instance within the same app its own radio group name', () => {
      const wrapper = mount({
        components: { ToneSelector },
        template: '<ToneSelector /><ToneSelector />',
      })

      const [first, second] = wrapper.findAll('.switch-bar').map((group) => group.find('input'))
      expect(first!.attributes('name')).not.toBe(second!.attributes('name'))
    })

    it('keeps the selection of each instance independent', async () => {
      const wrapper = mount(
        {
          components: { ToneSelector },
          template: '<ToneSelector /><ToneSelector />',
        },
        { attachTo: document.body },
      )

      const [first, second] = wrapper.findAll('.switch-bar')
      await first!.findAll('input')[2]!.setValue(true)

      expect(
        first!.findAll('input').map((input) => (input.element as HTMLInputElement).checked),
      ).toEqual([false, false, true, false])
      expect(
        second!.findAll('input').map((input) => (input.element as HTMLInputElement).checked),
      ).toEqual([true, false, false, false])

      wrapper.unmount()
    })
  })

  describe('accessibility', () => {
    it('labels the radiogroup with the "Tone" label', () => {
      const wrapper = mountToneSelector()

      const labelId = wrapper.find('.input-label').attributes('id')
      expect(labelId).toBeTruthy()
      expect(wrapper.find('[role="radiogroup"]').attributes('aria-labelledby')).toBe(labelId)
    })

    it('gives each instance within the same app a unique label id', () => {
      const wrapper = mount({
        components: { ToneSelector },
        template: '<ToneSelector /><ToneSelector />',
      })

      const ids = wrapper.findAll('.input-label').map((label) => label.attributes('id'))
      expect(ids[0]).not.toBe(ids[1])
    })

    it('does not point the label at a missing form control', () => {
      const wrapper = mountToneSelector()

      expect(wrapper.find('.input-label').attributes('for')).toBeUndefined()
    })
  })

  describe('selection', () => {
    it('selects the formal tone by default when no modelValue is provided', () => {
      const wrapper = mountToneSelector()

      expect(checkedStates(wrapper)).toEqual([true, false, false, false])
      expect(wrapper.findAll('.switch-bar__option--selected')).toHaveLength(1)
      expect(wrapper.find('.switch-bar__option--selected').text()).toBe('Formal')
    })

    it('does not emit update:modelValue on mount when falling back to the default', () => {
      const wrapper = mountToneSelector()

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('checks and highlights the option matching modelValue', () => {
      const wrapper = mountToneSelector({ modelValue: 'funny' })

      expect(checkedStates(wrapper)).toEqual([false, false, true, false])
      expect(wrapper.find('.switch-bar__option--selected').text()).toBe('Funny')
    })

    it('updates the selected option when modelValue changes', async () => {
      const wrapper = mountToneSelector({ modelValue: 'formal' })

      await wrapper.setProps({ modelValue: 'short' })

      expect(checkedStates(wrapper)).toEqual([false, false, false, true])
      expect(wrapper.find('.switch-bar__option--selected').text()).toBe('Short')
    })
  })

  describe('user interaction', () => {
    it.each<[string, Tone]>([
      ['Friendly', 'friendly'],
      ['Funny', 'funny'],
      ['Short', 'short'],
    ])('emits update:modelValue with "%s" -> %s when the user picks it', async (label, tone) => {
      const wrapper = mountToneSelector({ modelValue: 'formal' })

      await findOption(wrapper, label).find('input').setValue(true)

      expect(wrapper.emitted('update:modelValue')).toEqual([[tone]])
    })

    it('emits formal when the user switches back to it', async () => {
      const wrapper = mountToneSelector({ modelValue: 'short' })

      await findOption(wrapper, 'Formal').find('input').setValue(true)

      expect(wrapper.emitted('update:modelValue')).toEqual([['formal']])
    })

    it('updates its own selection when the user picks a tone without a bound modelValue', async () => {
      const wrapper = mountToneSelector()

      await findOption(wrapper, 'Friendly').find('input').setValue(true)

      expect(wrapper.emitted('update:modelValue')).toEqual([['friendly']])
      expect(checkedStates(wrapper)).toEqual([false, true, false, false])
      expect(wrapper.find('.switch-bar__option--selected').text()).toBe('Friendly')
    })
  })
})
