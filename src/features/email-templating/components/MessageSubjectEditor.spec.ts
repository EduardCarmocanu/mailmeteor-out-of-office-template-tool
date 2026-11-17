import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import MessageSubjectEditor from './MessageSubjectEditor.vue'
import CopyButton from '../../../shared/components/buttons/CopyButton.vue'

const writeText = vi.fn<(text: string) => Promise<void>>()

function mountSubjectEditor(
  props: Partial<InstanceType<typeof MessageSubjectEditor>['$props']> = {},
) {
  return mount(MessageSubjectEditor, { props })
}

describe('MessageSubjectEditor', () => {
  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders a "Subject:" label', () => {
      const wrapper = mountSubjectEditor()

      expect(wrapper.find('label').text()).toBe('Subject:')
    })

    it('associates the label with the input via a shared id', () => {
      const wrapper = mountSubjectEditor()

      const id = wrapper.find('input').attributes('id')
      expect(id).toBeTruthy()
      expect(wrapper.find('label').attributes('for')).toBe(id)
    })

    it('gives each instance within the same app a unique id', () => {
      const wrapper = mount(
        defineComponent({
          render: () => [h(MessageSubjectEditor), h(MessageSubjectEditor)],
        }),
      )

      const [first, second] = wrapper.findAll('input')
      expect(first!.attributes('id')).not.toBe(second!.attributes('id'))
    })

    it('renders a text input with autocomplete disabled', () => {
      const wrapper = mountSubjectEditor()

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('text')
      expect(input.attributes('autocomplete')).toBe('off')
    })

    it('does not limit the subject length', () => {
      const wrapper = mountSubjectEditor()

      expect(wrapper.find('input').attributes('maxlength')).toBeUndefined()
    })

    it('renders a copy button labelled "Copy subject"', () => {
      const wrapper = mountSubjectEditor()

      expect(wrapper.findComponent(CopyButton).exists()).toBe(true)
      expect(wrapper.find('button').attributes('aria-label')).toBe('Copy subject')
    })
  })

  describe('v-model', () => {
    it('defaults to an empty subject when no modelValue is provided', () => {
      const wrapper = mountSubjectEditor()

      expect(wrapper.find('input').element.value).toBe('')
      expect(wrapper.findComponent(CopyButton).props('text')).toBe('')
    })

    it('displays the provided modelValue', () => {
      const wrapper = mountSubjectEditor({ modelValue: 'Out of office' })

      expect(wrapper.find('input').element.value).toBe('Out of office')
    })

    it('updates the displayed value when modelValue changes', async () => {
      const wrapper = mountSubjectEditor({ modelValue: 'Out of office' })

      await wrapper.setProps({ modelValue: 'Back on Monday' })

      expect(wrapper.find('input').element.value).toBe('Back on Monday')
    })

    it('emits update:modelValue when the user types', async () => {
      const wrapper = mountSubjectEditor()

      await wrapper.find('input').setValue('Away until Friday')

      expect(wrapper.emitted('update:modelValue')).toEqual([['Away until Friday']])
    })

    it('emits an empty string when the user clears the subject', async () => {
      const wrapper = mountSubjectEditor({ modelValue: 'Out of office' })

      await wrapper.find('input').setValue('')

      expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    })

    it('keeps the parent state in sync through v-model', async () => {
      const subject = ref('Initial subject')
      const wrapper = mount(
        defineComponent({
          render: () =>
            h(MessageSubjectEditor, {
              modelValue: subject.value,
              'onUpdate:modelValue': (value: string) => (subject.value = value),
            }),
        }),
      )

      await wrapper.find('input').setValue('Edited subject')
      expect(subject.value).toBe('Edited subject')

      subject.value = 'Reset by parent'
      await flushPromises()
      expect(wrapper.find('input').element.value).toBe('Reset by parent')
    })
  })

  describe('copying', () => {
    it('passes the current subject to the copy button', () => {
      const wrapper = mountSubjectEditor({ modelValue: 'Out of office' })

      expect(wrapper.findComponent(CopyButton).props('text')).toBe('Out of office')
    })

    it('copies the provided subject to the clipboard', async () => {
      const wrapper = mountSubjectEditor({ modelValue: 'Out of office' })

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(writeText).toHaveBeenCalledWith('Out of office')
    })

    it('copies the subject the user typed, even without a parent v-model binding', async () => {
      const wrapper = mountSubjectEditor()

      await wrapper.find('input').setValue('Typed subject')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(writeText).toHaveBeenCalledWith('Typed subject')
    })

    it('copies an empty string when the subject is empty', async () => {
      const wrapper = mountSubjectEditor()

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(writeText).toHaveBeenCalledWith('')
    })
  })
})
