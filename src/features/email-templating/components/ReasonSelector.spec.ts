import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ReasonSelector from './ReasonSelector.vue'
import type { Reason } from '../models/Reason.model.ts'

const REASONS: { label: string; value: Reason }[] = [
  { label: 'Vacation', value: 'vacation' },
  { label: 'Holidays', value: 'holidays' },
  { label: 'Business trip', value: 'business-trip' },
  { label: 'Conference', value: 'conference' },
  { label: 'Sick leave', value: 'sick-leave' },
  { label: 'Parental leave', value: 'parental-leave' },
]

function mountReasonSelector(props: Partial<InstanceType<typeof ReasonSelector>['$props']> = {}) {
  return mount(ReasonSelector, { props })
}

function mountWithVModel(initial: Reason) {
  const wrapper: VueWrapper = mount(ReasonSelector, {
    props: {
      modelValue: initial,
      'onUpdate:modelValue': (value: Reason) => wrapper.setProps({ modelValue: value }),
    },
  })
  return wrapper
}

function findOption(wrapper: VueWrapper, label: string) {
  const option = wrapper.findAll('button').find((button) => button.text() === label)
  if (!option) throw new Error(`Option not found: ${label}`)
  return option
}

function selectedLabels(wrapper: VueWrapper) {
  return wrapper
    .findAll('button')
    .filter((button) => button.attributes('aria-pressed') === 'true')
    .map((button) => button.text())
}

describe('ReasonSelector', () => {
  describe('rendering', () => {
    it('renders the "Reason" label', () => {
      const wrapper = mountReasonSelector()

      expect(wrapper.find('label').text()).toBe('Reason')
    })

    it('renders one option per reason, in order', () => {
      const wrapper = mountReasonSelector()

      expect(wrapper.findAll('button').map((button) => button.text())).toEqual(
        REASONS.map((reason) => reason.label),
      )
    })

    it('renders the options as non-submitting buttons', () => {
      const wrapper = mountReasonSelector()

      for (const button of wrapper.findAll('button')) {
        expect(button.attributes('type')).toBe('button')
      }
    })
  })

  describe('accessibility', () => {
    it('wraps the options in a group labelled by the "Reason" label', () => {
      const wrapper = mountReasonSelector()

      const group = wrapper.find('[role="group"]')
      const labelId = wrapper.find('label').attributes('id')
      expect(labelId).toBeTruthy()
      expect(group.attributes('aria-labelledby')).toBe(labelId)
      expect(group.findAll('button')).toHaveLength(REASONS.length)
    })

    it('gives each instance within the same app a unique label id', () => {
      const wrapper = mount(
        defineComponent({
          render: () => [h(ReasonSelector), h(ReasonSelector)],
        }),
      )

      const [first, second] = wrapper.findAll('label')
      expect(first!.attributes('id')).not.toBe(second!.attributes('id'))
      const [firstGroup, secondGroup] = wrapper.findAll('[role="group"]')
      expect(firstGroup!.attributes('aria-labelledby')).toBe(first!.attributes('id'))
      expect(secondGroup!.attributes('aria-labelledby')).toBe(second!.attributes('id'))
    })
  })

  describe('selection', () => {
    it('selects "Vacation" by default when no modelValue is provided', () => {
      const wrapper = mountReasonSelector()

      expect(selectedLabels(wrapper)).toEqual(['Vacation'])
      expect(findOption(wrapper, 'Vacation').classes()).toContain('pill-button--selected')
    })

    it.each(REASONS)(
      'marks only "$label" as selected when modelValue is "$value"',
      ({ label, value }) => {
        const wrapper = mountReasonSelector({ modelValue: value })

        expect(selectedLabels(wrapper)).toEqual([label])
      },
    )

    it('updates the selected option when modelValue changes', async () => {
      const wrapper = mountReasonSelector({ modelValue: 'vacation' })

      await wrapper.setProps({ modelValue: 'sick-leave' })

      expect(selectedLabels(wrapper)).toEqual(['Sick leave'])
    })
  })

  describe('user interaction', () => {
    it('emits update:modelValue with the clicked reason', async () => {
      const wrapper = mountReasonSelector({ modelValue: 'vacation' })

      await findOption(wrapper, 'Business trip').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([['business-trip']])
    })

    it.each(REASONS.filter((reason) => reason.value !== 'vacation'))(
      'emits "$value" when the user clicks "$label"',
      async ({ label, value }) => {
        const wrapper = mountReasonSelector({ modelValue: 'vacation' })

        await findOption(wrapper, label).trigger('click')

        expect(wrapper.emitted('update:modelValue')).toEqual([[value]])
      },
    )

    it('does not emit when the user clicks the already selected reason', async () => {
      const wrapper = mountReasonSelector({ modelValue: 'conference' })

      await findOption(wrapper, 'Conference').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('moves the selection to the clicked option with a two-way bound v-model', async () => {
      const wrapper = mountWithVModel('vacation')

      await findOption(wrapper, 'Parental leave').trigger('click')

      expect(selectedLabels(wrapper)).toEqual(['Parental leave'])
    })

    it('emits each change in order across successive clicks', async () => {
      const wrapper = mountWithVModel('vacation')

      await findOption(wrapper, 'Holidays').trigger('click')
      await findOption(wrapper, 'Conference').trigger('click')
      await findOption(wrapper, 'Vacation').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([
        ['holidays'],
        ['conference'],
        ['vacation'],
      ])
      expect(selectedLabels(wrapper)).toEqual(['Vacation'])
    })

    it('tracks the selection locally when used without a bound modelValue', async () => {
      const wrapper = mountReasonSelector()

      await findOption(wrapper, 'Holidays').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toEqual([['holidays']])
      expect(selectedLabels(wrapper)).toEqual(['Holidays'])
    })
  })
})
