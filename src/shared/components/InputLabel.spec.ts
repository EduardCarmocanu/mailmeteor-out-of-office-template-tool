import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InputLabel from './InputLabel.vue'

function mountInputLabel(
  props: Partial<InstanceType<typeof InputLabel>['$props']> = {},
  label = 'First name',
) {
  return mount(InputLabel, {
    props,
    slots: { default: label },
  })
}

describe('InputLabel', () => {
  it('renders a label element', () => {
    const wrapper = mountInputLabel()

    expect(wrapper.element.tagName).toBe('LABEL')
  })

  it('renders the default slot content', () => {
    const wrapper = mountInputLabel({}, 'Email address')

    expect(wrapper.text()).toBe('Email address')
  })

  it('renders markup passed through the default slot', () => {
    const wrapper = mountInputLabel({}, '<strong>Start date</strong>')

    expect(wrapper.find('strong').text()).toBe('Start date')
  })

  it('sets the for attribute from the for prop', () => {
    const wrapper = mountInputLabel({ for: 'email-input' })

    expect(wrapper.attributes('for')).toBe('email-input')
  })

  it('omits the for attribute when the for prop is not provided', () => {
    const wrapper = mountInputLabel()

    expect(wrapper.attributes('for')).toBeUndefined()
  })

  it('does not show the optional hint by default', () => {
    const wrapper = mountInputLabel()

    expect(wrapper.find('.input-label__optional').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('(optional)')
  })

  it('shows the optional hint when optional is true', () => {
    const wrapper = mountInputLabel({ optional: true })

    expect(wrapper.find('.input-label__optional').text()).toBe('(optional)')
  })

  it('separates the label text and the optional hint with a space', () => {
    const wrapper = mountInputLabel({ optional: true })

    expect(wrapper.element.textContent).toBe('First name (optional)')
  })

  it('toggles the optional hint when the optional prop changes', async () => {
    const wrapper = mountInputLabel({ optional: false })

    await wrapper.setProps({ optional: true })
    expect(wrapper.find('.input-label__optional').exists()).toBe(true)

    await wrapper.setProps({ optional: false })
    expect(wrapper.find('.input-label__optional').exists()).toBe(false)
  })
})
