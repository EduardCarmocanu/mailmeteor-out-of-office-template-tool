import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PillButton from './PillButton.vue'

function mountPillButton(
  props: Partial<InstanceType<typeof PillButton>['$props']> = {},
  attrs: Record<string, unknown> = {},
) {
  return mount(PillButton, {
    props: {
      label: 'Vacation',
      ...props,
    },
    attrs,
  })
}

describe('PillButton', () => {
  it('renders a button with type="button" so it never submits a form', () => {
    const wrapper = mountPillButton()

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
  })

  it('renders the label text', () => {
    const wrapper = mountPillButton({ label: 'Parental leave' })

    expect(wrapper.text()).toBe('Parental leave')
  })

  it('exposes the label as data-label for width reservation', () => {
    const wrapper = mountPillButton({ label: 'Parental leave' })

    expect(wrapper.find('.pill-button__label').attributes('data-label')).toBe('Parental leave')
  })

  it('updates the label when the prop changes', async () => {
    const wrapper = mountPillButton({ label: 'Vacation' })

    await wrapper.setProps({ label: 'Sick leave' })

    expect(wrapper.text()).toBe('Sick leave')
    expect(wrapper.find('.pill-button__label').attributes('data-label')).toBe('Sick leave')
  })

  describe('selected state', () => {
    it('is not selected by default', () => {
      const wrapper = mountPillButton()

      const button = wrapper.find('button')
      expect(button.classes()).not.toContain('pill-button--selected')
      expect(button.attributes('aria-pressed')).toBe('false')
    })

    it('applies the selected class and aria-pressed when selected is true', () => {
      const wrapper = mountPillButton({ selected: true })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('pill-button--selected')
      expect(button.attributes('aria-pressed')).toBe('true')
    })

    it('updates when selected toggles', async () => {
      const wrapper = mountPillButton({ selected: false })

      await wrapper.setProps({ selected: true })
      expect(wrapper.find('button').attributes('aria-pressed')).toBe('true')
      expect(wrapper.find('button').classes()).toContain('pill-button--selected')

      await wrapper.setProps({ selected: false })
      expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')
      expect(wrapper.find('button').classes()).not.toContain('pill-button--selected')
    })
  })

  it('forwards click listeners to the button', async () => {
    const onClick = vi.fn<(event: MouseEvent) => void>()
    const wrapper = mountPillButton({}, { onClick })

    await wrapper.find('button').trigger('click')

    expect(onClick).toHaveBeenCalledOnce()
  })
})
