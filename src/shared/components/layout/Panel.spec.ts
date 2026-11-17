import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Panel from './Panel.vue'

type PanelClickHandler = NonNullable<InstanceType<typeof Panel>['$props']['onClick']>

function mountPanel(props: Partial<InstanceType<typeof Panel>['$props']> = {}, slot = 'Content') {
  return mount(Panel, {
    props,
    slots: { default: slot },
  })
}

describe('Panel', () => {
  it('renders the default slot content', () => {
    const wrapper = mountPanel({}, '<p class="inner">Hello</p>')

    expect(wrapper.find('.inner').text()).toBe('Hello')
  })

  describe('variant', () => {
    it('uses the default variant when none is provided', () => {
      const wrapper = mountPanel()

      expect(wrapper.classes()).toContain('panel')
      expect(wrapper.classes()).not.toContain('panel--secondary')
    })

    it('applies the secondary class when variant is secondary', () => {
      const wrapper = mountPanel({ variant: 'secondary' })

      expect(wrapper.classes()).toContain('panel--secondary')
    })
  })

  describe('when no onClick is provided', () => {
    it('is not styled as clickable', () => {
      const wrapper = mountPanel()

      expect(wrapper.classes()).not.toContain('panel--clickable')
    })

    it('has no button role and is not focusable', () => {
      const wrapper = mountPanel()

      expect(wrapper.attributes('role')).toBeUndefined()
      expect(wrapper.attributes('tabindex')).toBeUndefined()
    })

    it.each(['Enter', ' '])('does not prevent the default action of %j', (key) => {
      const wrapper = mountPanel()

      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      wrapper.element.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('when onClick is provided', () => {
    it('is styled as clickable', () => {
      const wrapper = mountPanel({ onClick: vi.fn<PanelClickHandler>() })

      expect(wrapper.classes()).toContain('panel--clickable')
    })

    it('exposes a button role and is keyboard focusable', () => {
      const wrapper = mountPanel({ onClick: vi.fn<PanelClickHandler>() })

      expect(wrapper.attributes('role')).toBe('button')
      expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('calls onClick with the mouse event when clicked', async () => {
      const onClick = vi.fn<PanelClickHandler>()
      const wrapper = mountPanel({ onClick })

      await wrapper.trigger('click')

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    })

    it.each(['Enter', ' '])('calls onClick when %j is pressed on the panel', async (key) => {
      const onClick = vi.fn<PanelClickHandler>()
      const wrapper = mountPanel({ onClick })

      await wrapper.trigger('keydown', { key })

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0]![0]).toBeInstanceOf(KeyboardEvent)
    })

    it.each(['Enter', ' '])('prevents the default action of %j', (key) => {
      const wrapper = mountPanel({ onClick: vi.fn<PanelClickHandler>() })

      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      wrapper.element.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
    })

    it('ignores other keys', async () => {
      const onClick = vi.fn<PanelClickHandler>()
      const wrapper = mountPanel({ onClick })

      await wrapper.trigger('keydown', { key: 'a' })
      await wrapper.trigger('keydown', { key: 'Tab' })

      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not intercept Enter or Space pressed in a nested element', async () => {
      const onClick = vi.fn<PanelClickHandler>()
      const wrapper = mountPanel({ onClick }, '<input type="text" />')

      const input = wrapper.find('input')
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
      input.element.dispatchEvent(event)
      await input.trigger('keydown', { key: 'Enter' })

      expect(onClick).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
    })
  })
})
