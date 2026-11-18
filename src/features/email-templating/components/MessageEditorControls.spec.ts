import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageEditorControls from './MessageEditorControls.vue'

function mountMessageEditorControls(
  props: Partial<InstanceType<typeof MessageEditorControls>['$props']> = {},
) {
  return mount(MessageEditorControls, {
    props: {
      wordCount: 42,
      edited: false,
      ...props,
    },
  })
}

function findLink(wrapper: ReturnType<typeof mountMessageEditorControls>, text: string) {
  const link = wrapper.findAll('a').find((a) => a.text() === text)
  if (!link) throw new Error(`Link "${text}" not found`)
  return link
}

describe('MessageEditorControls', () => {
  describe('word count', () => {
    it('renders the word count as the first item', () => {
      const wrapper = mountMessageEditorControls({ wordCount: 42 })

      expect(wrapper.findAll('li')[0]!.text()).toBe('42 words')
    })

    it('uses the singular "word" when the count is 1', () => {
      const wrapper = mountMessageEditorControls({ wordCount: 1 })

      expect(wrapper.findAll('li')[0]!.text()).toBe('1 word')
    })

    it('uses the plural "words" when the count is 0', () => {
      const wrapper = mountMessageEditorControls({ wordCount: 0 })

      expect(wrapper.findAll('li')[0]!.text()).toBe('0 words')
    })

    it('updates the displayed count when wordCount changes', async () => {
      const wrapper = mountMessageEditorControls({ wordCount: 1 })

      await wrapper.setProps({ wordCount: 2 })

      expect(wrapper.findAll('li')[0]!.text()).toBe('2 words')
    })
  })

  describe('reset action', () => {
    it('is hidden when the message has not been edited', () => {
      const wrapper = mountMessageEditorControls({ edited: false })

      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Edited')
    })

    it('shows the edited indicator with a reset button when the message has been edited', () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Reset')
      expect(wrapper.text()).toContain('Edited')
    })

    it('renders the edited indicator right after the word count', () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      const items = wrapper.findAll('li')
      expect(items).toHaveLength(4)
      expect(items[1]!.text()).toMatch(/^Edited —\s+Reset$/)
    })

    it('renders the reset button with type="button" so it never submits a form', () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      expect(wrapper.find('button').attributes('type')).toBe('button')
    })

    it('emits reset when the user clicks the reset button', async () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('reset')).toEqual([[]])
    })

    it('emits reset once per click', async () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      await wrapper.find('button').trigger('click')
      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('reset')).toHaveLength(2)
    })

    it('does not emit reset on mount', () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      expect(wrapper.emitted('reset')).toBeUndefined()
    })

    it('appears and disappears as the edited prop toggles', async () => {
      const wrapper = mountMessageEditorControls({ edited: false })

      await wrapper.setProps({ edited: true })
      expect(wrapper.find('button').exists()).toBe(true)

      await wrapper.setProps({ edited: false })
      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('setup links', () => {
    it('renders the Gmail and Outlook links after the other items', () => {
      const wrapper = mountMessageEditorControls({ edited: false })

      const items = wrapper.findAll('li')
      expect(items).toHaveLength(3)
      expect(items[1]!.text()).toBe('Configure in Gmail')
      expect(items[2]!.text()).toBe('Configure in Outlook')
    })

    it.each([
      ['Configure in Gmail', 'https://mailmeteor.com/blog/gmail-out-of-office'],
      ['Configure in Outlook', 'https://mailmeteor.com/blog/out-of-office-outlook'],
    ])('points "%s" to %s', (text, href) => {
      const wrapper = mountMessageEditorControls()

      expect(findLink(wrapper, text).attributes('href')).toBe(href)
    })

    it.each(['Configure in Gmail', 'Configure in Outlook'])('opens "%s" in a new tab', (text) => {
      const wrapper = mountMessageEditorControls()

      const link = findLink(wrapper, text)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('does not emit reset when a setup link is clicked', async () => {
      const wrapper = mountMessageEditorControls({ edited: true })

      await findLink(wrapper, 'Configure in Gmail').trigger('click')
      await findLink(wrapper, 'Configure in Outlook').trigger('click')

      expect(wrapper.emitted('reset')).toBeUndefined()
    })
  })
})
