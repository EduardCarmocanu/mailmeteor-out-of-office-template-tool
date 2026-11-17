import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageTemplateEditor from './MessageTemplateEditor.vue'
import MessageEditorControls from './MessageEditorControls.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'
import { generateTemplate } from '../composables/TemplateContent.composable.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'

const { templateConfiguration } = useTemplateConfiguration()

function resetConfiguration(overrides: Partial<TemplateConfiguration> = {}) {
  templateConfiguration.value = {
    name: 'Ada',
    leaveStart: null,
    leaveEnd: null,
    tone: 'short',
    reason: 'vacation',
    backupName: '',
    backupEmail: '',
    ...overrides,
  }
}

const SHORT_SUBJECT = 'Out of office'
const SHORT_BODY = "I'm on vacation until [back on].\n\nThanks,\nAda"

function mountEditor() {
  return mount(MessageTemplateEditor)
}

type Wrapper = ReturnType<typeof mountEditor>

const subjectInput = (wrapper: Wrapper) => wrapper.find<HTMLInputElement>('input[type="text"]')
const bodyTextarea = (wrapper: Wrapper) =>
  wrapper.find<HTMLTextAreaElement>('textarea[aria-label="Message"]')
const wordCountText = (wrapper: Wrapper) => wrapper.findAll('li')[0]!.text()
const resetButton = (wrapper: Wrapper) =>
  wrapper.findAll('button').find((button) => button.text() === 'Reset')

describe('MessageTemplateEditor', () => {
  beforeEach(() => {
    resetConfiguration()
  })

  describe('rendering', () => {
    it('fills the subject with the message generated from the configuration', () => {
      const wrapper = mountEditor()

      expect(subjectInput(wrapper).element.value).toBe(SHORT_SUBJECT)
    })

    it('fills the body with the message generated from the configuration', () => {
      const wrapper = mountEditor()

      expect(bodyTextarea(wrapper).element.value).toBe(SHORT_BODY)
    })

    it('uses the configured tone and dates for the generated message', () => {
      resetConfiguration({ tone: 'friendly', leaveEnd: new Date(2026, 0, 4) })
      const wrapper = mountEditor()

      expect(subjectInput(wrapper).element.value).toBe('Away until Jan 4')
      expect(bodyTextarea(wrapper).element.value).toMatch(/^Hi there!/)
    })

    it('renders copy buttons for the subject and the message', () => {
      const wrapper = mountEditor()

      expect(wrapper.find('button[aria-label="Copy subject"]').exists()).toBe(true)
      expect(wrapper.find('button[aria-label="Copy message"]').exists()).toBe(true)
    })

    it('does not show the edited state or reset action initially', () => {
      const wrapper = mountEditor()

      expect(wrapper.text()).not.toContain('Edited')
      expect(resetButton(wrapper)).toBeUndefined()
      expect(wrapper.findComponent(MessageEditorControls).props('edited')).toBe(false)
    })
  })

  describe('word count', () => {
    it('counts the words of the generated body', () => {
      const wrapper = mountEditor()

      expect(wordCountText(wrapper)).toBe('8 words')
    })

    it('updates when the user edits the body', async () => {
      const wrapper = mountEditor()

      await bodyTextarea(wrapper).setValue('one two three')

      expect(wordCountText(wrapper)).toBe('3 words')
    })

    it('treats runs of spaces, tabs and blank lines as a single separator', async () => {
      const wrapper = mountEditor()

      await bodyTextarea(wrapper).setValue('  one   two\t\tthree\n\n\nfour  ')

      expect(wordCountText(wrapper)).toBe('4 words')
    })

    it('uses the singular for a single word', async () => {
      const wrapper = mountEditor()

      await bodyTextarea(wrapper).setValue('Hello')

      expect(wordCountText(wrapper)).toBe('1 word')
    })

    it('shows 0 words for an empty body', async () => {
      const wrapper = mountEditor()

      await bodyTextarea(wrapper).setValue('')

      expect(wordCountText(wrapper)).toBe('0 words')
    })

    it('shows 0 words for a whitespace-only body', async () => {
      const wrapper = mountEditor()

      await bodyTextarea(wrapper).setValue('   \n\n\t ')

      expect(wordCountText(wrapper)).toBe('0 words')
    })

    it('does not count words in the subject', async () => {
      const wrapper = mountEditor()

      await subjectInput(wrapper).setValue('a much longer subject line than before')

      expect(wordCountText(wrapper)).toBe('8 words')
    })
  })

  describe('editing', () => {
    it('shows the edited state when the user changes the subject', async () => {
      const wrapper = mountEditor()

      await subjectInput(wrapper).setValue('Back soon')

      expect(wrapper.text()).toContain('Edited')
      expect(resetButton(wrapper)?.exists()).toBe(true)
    })

    it('shows the edited state when the user changes the body', async () => {
      const wrapper = mountEditor()

      await bodyTextarea(wrapper).setValue('Gone fishing.')

      expect(wrapper.text()).toContain('Edited')
      expect(resetButton(wrapper)?.exists()).toBe(true)
    })

    it('hides the edited state when the user types the generated content back', async () => {
      const wrapper = mountEditor()

      await subjectInput(wrapper).setValue('Back soon')
      await subjectInput(wrapper).setValue(SHORT_SUBJECT)

      expect(wrapper.text()).not.toContain('Edited')
    })

    it('copies the edited subject and message', async () => {
      const wrapper = mountEditor()

      await subjectInput(wrapper).setValue('Back soon')
      await bodyTextarea(wrapper).setValue('Gone fishing.')

      const copyButtons = wrapper.findAllComponents({ name: 'CopyButton' })
      expect(copyButtons.map((button) => button.props('text'))).toEqual([
        'Back soon',
        'Gone fishing.',
      ])
    })
  })

  describe('reset', () => {
    it('restores the generated subject and body when Reset is clicked', async () => {
      const wrapper = mountEditor()
      await subjectInput(wrapper).setValue('Back soon')
      await bodyTextarea(wrapper).setValue('Gone fishing.')

      await resetButton(wrapper)!.trigger('click')

      expect(subjectInput(wrapper).element.value).toBe(SHORT_SUBJECT)
      expect(bodyTextarea(wrapper).element.value).toBe(SHORT_BODY)
    })

    it('hides the edited state and reset action after resetting', async () => {
      const wrapper = mountEditor()
      await bodyTextarea(wrapper).setValue('Gone fishing.')

      await resetButton(wrapper)!.trigger('click')

      expect(wrapper.text()).not.toContain('Edited')
      expect(resetButton(wrapper)).toBeUndefined()
    })

    it('restores the word count of the generated body', async () => {
      const wrapper = mountEditor()
      await bodyTextarea(wrapper).setValue('Gone fishing.')

      await resetButton(wrapper)!.trigger('click')

      expect(wordCountText(wrapper)).toBe('8 words')
    })

    it('restores the content generated from the latest configuration', async () => {
      const wrapper = mountEditor()
      templateConfiguration.value.name = 'Grace'
      await wrapper.vm.$nextTick()
      await bodyTextarea(wrapper).setValue('Gone fishing.')

      await resetButton(wrapper)!.trigger('click')

      expect(bodyTextarea(wrapper).element.value).toBe(
        "I'm on vacation until [back on].\n\nThanks,\nGrace",
      )
    })
  })

  describe('when the configuration changes', () => {
    it('regenerates the subject and body', async () => {
      const wrapper = mountEditor()

      templateConfiguration.value.tone = 'formal'
      templateConfiguration.value.leaveEnd = new Date(2026, 11, 31)
      await wrapper.vm.$nextTick()

      expect(subjectInput(wrapper).element.value).toBe('Out of office until Dec 31')
      expect(bodyTextarea(wrapper).element.value).toMatch(/^Hello,\n\nThank you for your email\./)
      expect(bodyTextarea(wrapper).element.value).toContain('Thursday, December 31')
    })

    it('replaces manual edits and clears the edited state', async () => {
      const wrapper = mountEditor()
      await subjectInput(wrapper).setValue('Back soon')
      await bodyTextarea(wrapper).setValue('Gone fishing.')

      templateConfiguration.value.name = 'Grace'
      await wrapper.vm.$nextTick()

      expect(subjectInput(wrapper).element.value).toBe(SHORT_SUBJECT)
      expect(bodyTextarea(wrapper).element.value).toBe(
        "I'm on vacation until [back on].\n\nThanks,\nGrace",
      )
      expect(wrapper.text()).not.toContain('Edited')
    })

    it('includes the backup contact once one is configured', async () => {
      const wrapper = mountEditor()

      templateConfiguration.value.backupName = 'Charles'
      templateConfiguration.value.backupEmail = 'charles@example.com'
      await wrapper.vm.$nextTick()

      expect(bodyTextarea(wrapper).element.value).toContain(
        'For anything urgent, contact Charles (charles@example.com).',
      )
    })

    it('regenerates when the configuration object is replaced', async () => {
      const wrapper = mountEditor()

      resetConfiguration({ name: 'Grace', tone: 'formal' })
      await wrapper.vm.$nextTick()

      const expected = generateTemplate(templateConfiguration.value)
      expect(subjectInput(wrapper).element.value).toBe(expected.subject)
      expect(bodyTextarea(wrapper).element.value).toBe(expected.body)
      expect(bodyTextarea(wrapper).element.value).toContain('Kind regards,\nGrace')
    })
  })
})
