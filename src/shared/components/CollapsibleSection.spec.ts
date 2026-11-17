import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import CollapsibleSection from './CollapsibleSection.vue'

function mountCollapsibleSection(
  props: { title?: string; subtitle?: string; open?: boolean } = {},
  slot = '<p class="inner">Content</p>',
) {
  return mount(CollapsibleSection, {
    props: {
      title: 'Settings',
      ...props,
    },
    slots: { default: slot },
    attachTo: document.body,
  })
}

enableAutoUnmount(afterEach)

describe('CollapsibleSection', () => {
  it('renders the title in the header button', () => {
    const wrapper = mountCollapsibleSection({ title: 'Signature' })

    expect(wrapper.find('.collapsible-section__title').text()).toBe('Signature')
  })

  it('renders a non-submitting button as the header', () => {
    const wrapper = mountCollapsibleSection()

    expect(wrapper.find('button').attributes('type')).toBe('button')
  })

  it('renders the default slot content', () => {
    const wrapper = mountCollapsibleSection({ open: true })

    expect(wrapper.find('.inner').text()).toBe('Content')
  })

  describe('subtitle', () => {
    it('does not render a subtitle when none is provided', () => {
      const wrapper = mountCollapsibleSection()

      expect(wrapper.find('.collapsible-section__subtitle').exists()).toBe(false)
    })

    it('renders the subtitle when provided', () => {
      const wrapper = mountCollapsibleSection({ subtitle: 'Optional' })

      expect(wrapper.find('.collapsible-section__subtitle').text()).toBe('Optional')
    })
  })

  describe('chevron', () => {
    it('is hidden from assistive technology', () => {
      const wrapper = mountCollapsibleSection()

      expect(wrapper.find('.collapsible-section__chevron').attributes('aria-hidden')).toBe('true')
    })

    it('is not rotated when closed', () => {
      const wrapper = mountCollapsibleSection({ open: false })

      expect(wrapper.find('.collapsible-section__chevron').classes()).not.toContain(
        'collapsible-section__chevron--open',
      )
    })

    it('is rotated when open', () => {
      const wrapper = mountCollapsibleSection({ open: true })

      expect(wrapper.find('.collapsible-section__chevron').classes()).toContain(
        'collapsible-section__chevron--open',
      )
    })
  })

  describe('open state', () => {
    it('is closed by default', () => {
      const wrapper = mountCollapsibleSection()

      expect(wrapper.find('.collapsible-section__content').isVisible()).toBe(false)
      expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    })

    it('keeps the slot content mounted while closed', () => {
      const wrapper = mountCollapsibleSection()

      expect(wrapper.find('.inner').exists()).toBe(true)
    })

    it('shows the content and marks the header expanded when open is true', () => {
      const wrapper = mountCollapsibleSection({ open: true })

      expect(wrapper.find('.collapsible-section__content').isVisible()).toBe(true)
      expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    })

    it('updates when the open prop changes', async () => {
      const wrapper = mountCollapsibleSection({ open: false })

      await wrapper.setProps({ open: true })

      expect(wrapper.find('.collapsible-section__content').isVisible()).toBe(true)
      expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    })
  })

  describe('toggling', () => {
    it('emits update:open with true when the user clicks a closed header', async () => {
      const wrapper = mountCollapsibleSection({ open: false })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('update:open')).toEqual([[true]])
    })

    it('emits update:open with false when the user clicks an open header', async () => {
      const wrapper = mountCollapsibleSection({ open: true })

      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('update:open')).toEqual([[false]])
    })

    it('opens and closes on successive clicks when uncontrolled', async () => {
      const wrapper = mountCollapsibleSection()
      const button = wrapper.find('button')
      const content = wrapper.find('.collapsible-section__content')

      await button.trigger('click')
      expect(content.isVisible()).toBe(true)
      expect(button.attributes('aria-expanded')).toBe('true')

      await button.trigger('click')
      expect(content.isVisible()).toBe(false)
      expect(button.attributes('aria-expanded')).toBe('false')

      expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    })

    it('stays in sync with a parent using v-model:open', async () => {
      const wrapper = mount(
        defineComponent({
          components: { CollapsibleSection },
          data: () => ({ open: false }),
          template: `
            <CollapsibleSection v-model:open="open" title="Settings">
              <p>Content</p>
            </CollapsibleSection>
          `,
        }),
      )

      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.open).toBe(true)

      await wrapper.find('button').trigger('click')
      expect(wrapper.vm.open).toBe(false)
    })
  })

  describe('accessibility', () => {
    it('links the header to the content region via aria-controls', () => {
      const wrapper = mountCollapsibleSection()

      const contentId = wrapper.find('.collapsible-section__content').attributes('id')
      expect(contentId).toBeTruthy()
      expect(wrapper.find('button').attributes('aria-controls')).toBe(contentId)
    })

    it('generates a different content id for each instance within the same app', () => {
      const wrapper = mount(
        defineComponent({
          components: { CollapsibleSection },
          template: `
            <CollapsibleSection title="First" />
            <CollapsibleSection title="Second" />
          `,
        }),
      )

      const [first, second] = wrapper.findAllComponents(CollapsibleSection)
      expect(first!.find('.collapsible-section__content').attributes('id')).not.toBe(
        second!.find('.collapsible-section__content').attributes('id'),
      )
    })
  })
})
