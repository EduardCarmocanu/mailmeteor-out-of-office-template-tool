import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MessageBodyEditor from './MessageBodyEditor.vue'
import CopyButton from '../../../shared/components/CopyButton.vue'

const writeText = vi.fn<(text: string) => Promise<void>>()

const MULTI_PARAGRAPH_BODY = 'Hi,\n\nI am out of the office until Monday.\n\nBest,\nJane'

function mountMessageBodyEditor(
  props: Partial<InstanceType<typeof MessageBodyEditor>['$props']> = {},
) {
  return mount(MessageBodyEditor, { props })
}

describe('MessageBodyEditor', () => {
  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders a textarea labelled "Message" for assistive technology', () => {
      const wrapper = mountMessageBodyEditor()

      expect(wrapper.find('textarea').attributes('aria-label')).toBe('Message')
    })

    it('enables spellchecking on the textarea', () => {
      const wrapper = mountMessageBodyEditor()

      expect(wrapper.find('textarea').attributes('spellcheck')).toBe('true')
    })

    it('renders a copy button labelled "Copy message"', () => {
      const wrapper = mountMessageBodyEditor()

      expect(wrapper.find('button').attributes('aria-label')).toBe('Copy message')
    })
  })

  describe('v-model', () => {
    it('defaults to an empty value when no modelValue is provided', () => {
      const wrapper = mountMessageBodyEditor()

      expect(wrapper.find('textarea').element.value).toBe('')
    })

    it('displays the provided modelValue', () => {
      const wrapper = mountMessageBodyEditor({ modelValue: 'Out of office' })

      expect(wrapper.find('textarea').element.value).toBe('Out of office')
    })

    it('preserves line breaks and blank lines between paragraphs', () => {
      const wrapper = mountMessageBodyEditor({ modelValue: MULTI_PARAGRAPH_BODY })

      expect(wrapper.find('textarea').element.value).toBe(MULTI_PARAGRAPH_BODY)
    })

    it('updates the displayed value when modelValue changes', async () => {
      const wrapper = mountMessageBodyEditor({ modelValue: 'First draft' })

      await wrapper.setProps({ modelValue: 'Second draft' })

      expect(wrapper.find('textarea').element.value).toBe('Second draft')
    })

    it('emits update:modelValue when the user types', async () => {
      const wrapper = mountMessageBodyEditor()

      await wrapper.find('textarea').setValue('Back on Monday')

      expect(wrapper.emitted('update:modelValue')).toEqual([['Back on Monday']])
    })

    it('emits multi-line text unchanged', async () => {
      const wrapper = mountMessageBodyEditor()

      await wrapper.find('textarea').setValue(MULTI_PARAGRAPH_BODY)

      expect(wrapper.emitted('update:modelValue')).toEqual([[MULTI_PARAGRAPH_BODY]])
    })

    it('emits an empty string when the user clears the message', async () => {
      const wrapper = mountMessageBodyEditor({ modelValue: 'Out of office' })

      await wrapper.find('textarea').setValue('')

      expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    })

    it('does not emit update:modelValue on mount', () => {
      const wrapper = mountMessageBodyEditor({ modelValue: 'Out of office' })

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('copy button', () => {
    it('passes the current message to the copy button', () => {
      const wrapper = mountMessageBodyEditor({ modelValue: 'Out of office' })

      expect(wrapper.findComponent(CopyButton).props('text')).toBe('Out of office')
    })

    it('keeps the copy button text in sync when modelValue changes', async () => {
      const wrapper = mountMessageBodyEditor({ modelValue: 'First draft' })

      await wrapper.setProps({ modelValue: 'Second draft' })

      expect(wrapper.findComponent(CopyButton).props('text')).toBe('Second draft')
    })

    it('copies the message to the clipboard when clicked', async () => {
      const wrapper = mountMessageBodyEditor({ modelValue: MULTI_PARAGRAPH_BODY })

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(writeText).toHaveBeenCalledExactlyOnceWith(MULTI_PARAGRAPH_BODY)
    })

    it('copies what the user typed even without a parent v-model binding', async () => {
      const wrapper = mountMessageBodyEditor()

      await wrapper.find('textarea').setValue('Typed locally')
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(writeText).toHaveBeenCalledWith('Typed locally')
    })

    it('copies an empty string when the message is empty', async () => {
      const wrapper = mountMessageBodyEditor()

      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(writeText).toHaveBeenCalledWith('')
    })
  })
})
