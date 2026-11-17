import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import TextInput from './TextInput.vue'

function mountTextInput(props: Partial<InstanceType<typeof TextInput>['$props']> = {}) {
  return mount(TextInput, {
    props: {
      label: 'First name',
      placeholder: 'Jane',
      ...props,
    },
  })
}

describe('TextInput', () => {
  it('renders the label text', () => {
    const wrapper = mountTextInput()

    expect(wrapper.find('label').text()).toBe('First name')
  })

  it('associates the label with the input via a shared id', () => {
    const wrapper = mountTextInput()

    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  it('gives each instance within the same app a unique id', () => {
    const wrapper = mount(
      defineComponent({
        render: () => [
          h(TextInput, { label: 'First name', placeholder: 'Jane' }),
          h(TextInput, { label: 'Last name', placeholder: 'Doe' }),
        ],
      }),
    )

    const [first, second] = wrapper.findAll('input')
    expect(first!.attributes('id')).not.toBe(second!.attributes('id'))
  })

  it('renders a text input with the given placeholder', () => {
    const wrapper = mountTextInput({ placeholder: 'Enter your name' })

    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('placeholder')).toBe('Enter your name')
  })

  it('limits input length to 100 characters by default', () => {
    const wrapper = mountTextInput()

    expect(wrapper.find('input').attributes('maxlength')).toBe('100')
  })

  it('limits input length to the given maxLength', () => {
    const wrapper = mountTextInput({ maxLength: 20 })

    expect(wrapper.find('input').attributes('maxlength')).toBe('20')
  })

  it('does not show the optional hint by default', () => {
    const wrapper = mountTextInput()

    expect(wrapper.text()).not.toContain('(optional)')
  })

  it('shows the optional hint when optional is true', () => {
    const wrapper = mountTextInput({ optional: true })

    expect(wrapper.find('label').text()).toContain('(optional)')
  })

  it('defaults to an empty value when no modelValue is provided', () => {
    const wrapper = mountTextInput()

    expect(wrapper.find('input').element.value).toBe('')
  })

  it('displays the provided modelValue', () => {
    const wrapper = mountTextInput({ modelValue: 'Alice' })

    expect(wrapper.find('input').element.value).toBe('Alice')
  })

  it('updates the displayed value when modelValue changes', async () => {
    const wrapper = mountTextInput({ modelValue: 'Alice' })

    await wrapper.setProps({ modelValue: 'Bob' })

    expect(wrapper.find('input').element.value).toBe('Bob')
  })

  it('emits update:modelValue when the user types', async () => {
    const wrapper = mountTextInput()

    await wrapper.find('input').setValue('Hello')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Hello']])
  })
})
