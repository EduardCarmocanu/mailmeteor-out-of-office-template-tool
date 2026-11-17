import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import CopyButton from './CopyButton.vue'

const writeText = vi.fn<(text: string) => Promise<void>>()

function mountCopyButton(props: Partial<InstanceType<typeof CopyButton>['$props']> = {}) {
  return mount(CopyButton, {
    props: {
      text: 'Hello world',
      ...props,
    },
  })
}

async function clickAndSettle(wrapper: ReturnType<typeof mountCopyButton>) {
  await wrapper.find('button').trigger('click')
  await flushPromises()
}

function iconName(wrapper: ReturnType<typeof mountCopyButton>) {
  return wrapper.find('[data-icon]').attributes('data-icon')
}

describe('CopyButton', () => {
  beforeEach(() => {
    // Only fake the timers the component uses so flushPromises (setImmediate/setTimeout-based) still works.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    writeText.mockReset().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('idle state', () => {
    it('renders a button with type="button" so it never submits a form', () => {
      const wrapper = mountCopyButton()

      expect(wrapper.find('button').attributes('type')).toBe('button')
    })

    it('uses "Copy" as the default accessible name', () => {
      const wrapper = mountCopyButton()

      expect(wrapper.find('button').attributes('aria-label')).toBe('Copy')
    })

    it('uses the label prop as the accessible name', () => {
      const wrapper = mountCopyButton({ label: 'Copy subject' })

      expect(wrapper.find('button').attributes('aria-label')).toBe('Copy subject')
    })

    it('shows the copy icon and no feedback classes', () => {
      const wrapper = mountCopyButton()

      const button = wrapper.find('button')
      expect(iconName(wrapper)).toBe('copy')
      expect(button.classes()).not.toContain('copy-button--copied')
      expect(button.classes()).not.toContain('copy-button--error')
    })

    it('renders an empty polite live region', () => {
      const wrapper = mountCopyButton()

      const status = wrapper.find('.copy-button__status')
      expect(status.attributes('aria-live')).toBe('polite')
      expect(status.text()).toBe('')
    })

    it('hides icons from assistive technology', () => {
      const wrapper = mountCopyButton()

      const icon = wrapper.find('[data-icon]')
      expect(icon.attributes('aria-hidden')).toBe('true')
      expect(icon.attributes('focusable')).toBe('false')
    })
  })

  describe('when copying succeeds', () => {
    it('writes the text prop to the clipboard', async () => {
      const wrapper = mountCopyButton({ text: 'Out of office until Monday' })

      await clickAndSettle(wrapper)

      expect(writeText).toHaveBeenCalledOnce()
      expect(writeText).toHaveBeenCalledWith('Out of office until Monday')
    })

    it('shows the copied feedback', async () => {
      const wrapper = mountCopyButton()

      await clickAndSettle(wrapper)

      const button = wrapper.find('button')
      expect(iconName(wrapper)).toBe('check')
      expect(button.classes()).toContain('copy-button--copied')
      expect(button.attributes('aria-label')).toBe('Copied')
      expect(wrapper.find('.copy-button__status').text()).toBe('Copied')
    })

    it('returns to idle after 2 seconds', async () => {
      const wrapper = mountCopyButton({ label: 'Copy body' })
      await clickAndSettle(wrapper)

      vi.advanceTimersByTime(1999)
      await flushPromises()
      expect(iconName(wrapper)).toBe('check')

      vi.advanceTimersByTime(1)
      await flushPromises()
      const button = wrapper.find('button')
      expect(iconName(wrapper)).toBe('copy')
      expect(button.classes()).not.toContain('copy-button--copied')
      expect(button.attributes('aria-label')).toBe('Copy body')
      expect(wrapper.find('.copy-button__status').text()).toBe('')
    })

    it('restarts the 2 second window when clicked again', async () => {
      const wrapper = mountCopyButton()
      await clickAndSettle(wrapper)

      vi.advanceTimersByTime(1500)
      await clickAndSettle(wrapper)

      vi.advanceTimersByTime(1500)
      await flushPromises()
      expect(iconName(wrapper)).toBe('check')

      vi.advanceTimersByTime(500)
      await flushPromises()
      expect(iconName(wrapper)).toBe('copy')
    })
  })

  describe('when copying fails', () => {
    beforeEach(() => {
      writeText.mockRejectedValue(new Error('Permission denied'))
    })

    it('shows the error feedback', async () => {
      const wrapper = mountCopyButton()

      await clickAndSettle(wrapper)

      const button = wrapper.find('button')
      expect(iconName(wrapper)).toBe('error')
      expect(button.classes()).toContain('copy-button--error')
      expect(button.classes()).not.toContain('copy-button--copied')
      expect(button.attributes('aria-label')).toBe('Copy failed')
      expect(wrapper.find('.copy-button__status').text()).toBe('Copy failed')
    })

    it('applies the shake animation class to the error icon', async () => {
      const wrapper = mountCopyButton()

      await clickAndSettle(wrapper)

      expect(wrapper.find('[data-icon="error"]').classes()).toContain('copy-button__icon--shake')
    })

    it('remounts the error icon on repeated failures so the shake replays', async () => {
      const wrapper = mountCopyButton()
      await clickAndSettle(wrapper)
      const firstIcon = wrapper.find('[data-icon="error"]').element

      await clickAndSettle(wrapper)
      const secondIcon = wrapper.find('[data-icon="error"]').element

      expect(secondIcon).not.toBe(firstIcon)
    })

    it('returns to idle after 2 seconds', async () => {
      const wrapper = mountCopyButton()
      await clickAndSettle(wrapper)

      vi.advanceTimersByTime(2000)
      await flushPromises()

      expect(iconName(wrapper)).toBe('copy')
      expect(wrapper.find('button').classes()).not.toContain('copy-button--error')
      expect(wrapper.find('button').attributes('aria-label')).toBe('Copy')
    })

    it('shows the error feedback when the clipboard API is unavailable', async () => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
      const wrapper = mountCopyButton()

      await clickAndSettle(wrapper)

      expect(iconName(wrapper)).toBe('error')
    })
  })

  it('switches from error to copied feedback when a retry succeeds', async () => {
    writeText.mockRejectedValueOnce(new Error('Permission denied'))
    const wrapper = mountCopyButton()

    await clickAndSettle(wrapper)
    expect(iconName(wrapper)).toBe('error')

    await clickAndSettle(wrapper)
    expect(iconName(wrapper)).toBe('check')
  })

  describe('when the text prop changes', () => {
    it('resets the feedback to idle immediately', async () => {
      const wrapper = mountCopyButton({ text: 'First' })
      await clickAndSettle(wrapper)
      expect(iconName(wrapper)).toBe('check')

      await wrapper.setProps({ text: 'Second' })

      expect(iconName(wrapper)).toBe('copy')
      expect(wrapper.find('button').attributes('aria-label')).toBe('Copy')
    })

    it('cancels the pending reset so it does not clear later feedback early', async () => {
      const wrapper = mountCopyButton({ text: 'First' })
      await clickAndSettle(wrapper)

      vi.advanceTimersByTime(1500)
      await wrapper.setProps({ text: 'Second' })
      await clickAndSettle(wrapper)

      vi.advanceTimersByTime(1000)
      await flushPromises()
      expect(iconName(wrapper)).toBe('check')
    })

    it('copies the latest text', async () => {
      const wrapper = mountCopyButton({ text: 'First' })

      await wrapper.setProps({ text: 'Second' })
      await clickAndSettle(wrapper)

      expect(writeText).toHaveBeenCalledWith('Second')
    })
  })

  it('clears the pending reset timer on unmount', async () => {
    const wrapper = mountCopyButton()
    await clickAndSettle(wrapper)
    expect(vi.getTimerCount()).toBe(1)

    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
