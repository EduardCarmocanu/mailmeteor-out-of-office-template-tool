import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import SwitchBar, { type SwitchBarOption } from './SwitchBar.vue'

const options: SwitchBarOption[] = [
  { label: 'Formal', value: 'formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Friendly', value: 'friendly' },
]

function mountSwitchBar(
  props: {
    options?: SwitchBarOption<string | number>[]
    name?: string
    modelValue?: string | number
  } = {},
) {
  return mount(SwitchBar, {
    props: {
      options,
      ...props,
    },
  })
}

describe('SwitchBar', () => {
  it('renders a radiogroup', () => {
    const wrapper = mountSwitchBar()

    expect(wrapper.find('.switch-bar').attributes('role')).toBe('radiogroup')
  })

  it('renders one radio option per entry with its label', () => {
    const wrapper = mountSwitchBar()

    const labels = wrapper.findAll('label')
    expect(labels.map((label) => label.text())).toEqual(['Formal', 'Casual', 'Friendly'])
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)
  })

  it('renders nothing selectable when options is empty', () => {
    const wrapper = mountSwitchBar({ options: [] })

    expect(wrapper.findAll('input')).toHaveLength(0)
  })

  describe('name', () => {
    it('gives all radios the same generated name by default', () => {
      const wrapper = mountSwitchBar()

      const names = wrapper.findAll('input').map((input) => input.attributes('name'))
      expect(names[0]).toBeTruthy()
      expect(new Set(names).size).toBe(1)
    })

    it('generates a different name for each instance within the same app', () => {
      const wrapper = mount(
        defineComponent({
          components: { SwitchBar },
          setup: () => ({ options }),
          template: `
            <SwitchBar :options="options" />
            <SwitchBar :options="options" />
          `,
        }),
      )

      const [first, second] = wrapper.findAllComponents(SwitchBar)
      expect(first!.find('input').attributes('name')).not.toBe(
        second!.find('input').attributes('name'),
      )
    })

    it('uses the provided name for all radios', () => {
      const wrapper = mountSwitchBar({ name: 'tone' })

      const names = wrapper.findAll('input').map((input) => input.attributes('name'))
      expect(names).toEqual(['tone', 'tone', 'tone'])
    })
  })

  describe('selection', () => {
    it('selects nothing when no modelValue is provided', () => {
      const wrapper = mountSwitchBar()

      expect(wrapper.findAll('input').some((input) => input.element.checked)).toBe(false)
      expect(wrapper.findAll('.switch-bar__option--selected')).toHaveLength(0)
    })

    it('checks and highlights the option matching modelValue', () => {
      const wrapper = mountSwitchBar({ modelValue: 'casual' })

      const inputs = wrapper.findAll('input')
      expect(inputs.map((input) => input.element.checked)).toEqual([false, true, false])

      const selected = wrapper.findAll('.switch-bar__option--selected')
      expect(selected).toHaveLength(1)
      expect(selected[0]!.text()).toBe('Casual')
    })

    it('updates the selected option when modelValue changes', async () => {
      const wrapper = mountSwitchBar({ modelValue: 'formal' })

      await wrapper.setProps({ modelValue: 'friendly' })

      expect(wrapper.findAll('input').map((input) => input.element.checked)).toEqual([
        false,
        false,
        true,
      ])
      expect(wrapper.find('.switch-bar__option--selected').text()).toBe('Friendly')
    })

    it('emits update:modelValue with the option value when the user picks an option', async () => {
      const wrapper = mountSwitchBar({ modelValue: 'formal' })

      await wrapper.findAll('input')[2]!.setValue(true)

      expect(wrapper.emitted('update:modelValue')).toEqual([['friendly']])
    })

    it('emits numeric values unchanged for numeric options', async () => {
      const wrapper = mountSwitchBar({
        options: [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
        ],
        modelValue: 1,
      })

      await wrapper.findAll('input')[1]!.setValue(true)

      expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    })
  })
})
