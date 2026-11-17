import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import EmailInput from './EmailInput.vue'

const ERROR_MESSAGE = 'Please enter a valid email address.'

function mountEmailInput(props: Partial<InstanceType<typeof EmailInput>['$props']> = {}) {
  const wrapper: VueWrapper = mount(EmailInput, {
    props: {
      label: 'Email',
      placeholder: 'jane@example.com',
      // Mirror v-model so the component receives the updated value back, as in real usage.
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      ...props,
    },
  })
  return wrapper
}

async function typeAndBlur(wrapper: VueWrapper, value: string) {
  const input = wrapper.find('input')
  await input.setValue(value)
  await input.trigger('blur')
}

describe('EmailInput', () => {
  describe('rendering', () => {
    it('renders the label text', () => {
      const wrapper = mountEmailInput()

      expect(wrapper.find('label').text()).toBe('Email')
    })

    it('associates the label with the input via a shared id', () => {
      const wrapper = mountEmailInput()

      const id = wrapper.find('input').attributes('id')
      expect(id).toBeTruthy()
      expect(wrapper.find('label').attributes('for')).toBe(id)
    })

    it('gives each instance within the same app a unique id', () => {
      const wrapper = mount(
        defineComponent({
          render: () => [
            h(EmailInput, { label: 'Email', placeholder: 'jane@example.com' }),
            h(EmailInput, { label: 'Backup email', placeholder: 'john@example.com' }),
          ],
        }),
      )

      const [first, second] = wrapper.findAll('input')
      expect(first!.attributes('id')).not.toBe(second!.attributes('id'))
    })

    it('renders an email input with the given placeholder', () => {
      const wrapper = mountEmailInput({ placeholder: 'you@company.com' })

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('email')
      expect(input.attributes('placeholder')).toBe('you@company.com')
    })

    it('enables email autocomplete', () => {
      const wrapper = mountEmailInput()

      expect(wrapper.find('input').attributes('autocomplete')).toBe('email')
    })

    it('does not show the optional hint by default', () => {
      const wrapper = mountEmailInput()

      expect(wrapper.text()).not.toContain('(optional)')
    })

    it('shows the optional hint when optional is true', () => {
      const wrapper = mountEmailInput({ optional: true })

      expect(wrapper.find('label').text()).toContain('(optional)')
    })
  })

  describe('v-model', () => {
    it('defaults to an empty value when no modelValue is provided', () => {
      const wrapper = mountEmailInput()

      expect(wrapper.find('input').element.value).toBe('')
    })

    it('displays the provided modelValue', () => {
      const wrapper = mountEmailInput({ modelValue: 'jane@example.com' })

      expect(wrapper.find('input').element.value).toBe('jane@example.com')
    })

    it('updates the displayed value when modelValue changes', async () => {
      const wrapper = mountEmailInput({ modelValue: 'jane@example.com' })

      await wrapper.setProps({ modelValue: 'john@example.com' })

      expect(wrapper.find('input').element.value).toBe('john@example.com')
    })

    it('emits update:modelValue when the user types', async () => {
      const wrapper = mountEmailInput()

      await wrapper.find('input').setValue('jane@example.com')

      expect(wrapper.emitted('update:modelValue')).toEqual([['jane@example.com']])
    })
  })

  describe('validation', () => {
    it('does not show an error initially', () => {
      const wrapper = mountEmailInput()

      const input = wrapper.find('input')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      expect(input.attributes('aria-invalid')).toBe('false')
      expect(input.attributes('aria-describedby')).toBeUndefined()
      expect(input.classes()).not.toContain('email-input__field--invalid')
    })

    it('does not show an error while the user is typing an invalid value', async () => {
      const wrapper = mountEmailInput()

      await wrapper.find('input').setValue('not-an-email')

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('shows an error on blur when the value is invalid', async () => {
      const wrapper = mountEmailInput()

      await typeAndBlur(wrapper, 'not-an-email')

      const alert = wrapper.find('[role="alert"]')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toBe(ERROR_MESSAGE)
    })

    it('marks the input as invalid and links it to the error message', async () => {
      const wrapper = mountEmailInput()

      await typeAndBlur(wrapper, 'not-an-email')

      const input = wrapper.find('input')
      const errorId = wrapper.find('[role="alert"]').attributes('id')
      expect(errorId).toBeTruthy()
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')).toBe(errorId)
      expect(input.classes()).toContain('email-input__field--invalid')
    })

    it.each(['jane@example.com', 'first.last+tag@sub.example.co.uk', '  jane@example.com  '])(
      'does not show an error on blur for the valid value %j',
      async (value) => {
        const wrapper = mountEmailInput()

        await typeAndBlur(wrapper, value)

        expect(wrapper.find('[role="alert"]').exists()).toBe(false)
      },
    )

    it.each([
      'jane',
      'jane@',
      'jane@example',
      '@example.com',
      'jane doe@example.com',
      'jane@@example.com',
    ])('shows an error on blur for the invalid value %j', async (value) => {
      const wrapper = mountEmailInput()

      await typeAndBlur(wrapper, value)

      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    it('does not show an error on blur when the value is empty or whitespace', async () => {
      const wrapper = mountEmailInput({ modelValue: 'jane@example.com' })

      await typeAndBlur(wrapper, '   ')

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('keeps the error visible while the user corrects the value, until the next blur', async () => {
      const wrapper = mountEmailInput()
      await typeAndBlur(wrapper, 'not-an-email')

      await wrapper.find('input').setValue('jane@example.com')
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)

      await wrapper.find('input').trigger('blur')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('clears the error on blur when the value is emptied', async () => {
      const wrapper = mountEmailInput()
      await typeAndBlur(wrapper, 'not-an-email')

      await typeAndBlur(wrapper, '')

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('does not re-validate on blur when the value has not changed since the last check', async () => {
      const wrapper = mountEmailInput({ modelValue: 'not-an-email' })

      await wrapper.find('input').trigger('blur')

      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('keeps the error on repeated blurs without changes', async () => {
      const wrapper = mountEmailInput()
      await typeAndBlur(wrapper, 'not-an-email')

      await wrapper.find('input').trigger('blur')

      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })
  })
})
