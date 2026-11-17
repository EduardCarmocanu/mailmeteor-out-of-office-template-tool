import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DateInput from '../DateInput.vue'

const FORMAT_ERROR = 'Please enter a date in DD/MM/YYYY format.'

const mountDateInput = (
  props: Partial<{ min: string | null; max: string | null; modelValue: string }> = {},
) =>
  mount(DateInput, {
    props: { label: 'First day away', min: '2026-11-17', max: '2027-11-17', ...props },
  })

const typeAndBlur = async (wrapper: ReturnType<typeof mountDateInput>, value: string) => {
  const field = wrapper.get('input[type="text"]')
  await field.setValue(value)
  await field.trigger('blur')
}

const lastEmitted = (wrapper: ReturnType<typeof mountDateInput>) =>
  wrapper.emitted<[string]>('update:modelValue')?.slice(-1)[0]?.[0]

describe('DateInput', () => {
  it('emits the ISO date for a valid typed date', async () => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, '21/12/2026')

    expect(lastEmitted(wrapper)).toBe('2026-12-21')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('does not show errors while typing', async () => {
    const wrapper = mountDateInput()
    await wrapper.get('input[type="text"]').setValue('21/1')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows no error for an empty field', async () => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, '')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it.each(['12/2026', '2026-12-21', '31/02/2027'])('shows a format error for %j', async (value) => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, value)

    expect(wrapper.get('[role="alert"]').text()).toBe(FORMAT_ERROR)
    expect(wrapper.get('input[type="text"]').attributes('aria-invalid')).toBe('true')
    expect(lastEmitted(wrapper) ?? '').toBe('')
  })

  it('shows an error for a date before min', async () => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, '16/11/2026')

    expect(wrapper.get('[role="alert"]').text()).toBe('Date must be on or after 17/11/2026.')
    expect(lastEmitted(wrapper) ?? '').toBe('')
  })

  it('shows an error for a date after max', async () => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, '18/11/2027')

    expect(wrapper.get('[role="alert"]').text()).toBe('Date must be on or before 17/11/2027.')
  })

  it('accepts dates on the bounds', async () => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, '17/11/2026')
    expect(lastEmitted(wrapper)).toBe('2026-11-17')

    await typeAndBlur(wrapper, '17/11/2027')
    expect(lastEmitted(wrapper)).toBe('2027-11-17')
  })

  it('has no upper limit when max is null', async () => {
    const wrapper = mountDateInput({ max: null })
    await typeAndBlur(wrapper, '01/01/2099')

    expect(lastEmitted(wrapper)).toBe('2099-01-01')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows only the first error when several apply', async () => {
    // min > max: a date can fail both bound checks at once.
    const wrapper = mountDateInput({ min: '2027-01-01', max: '2026-01-01' })
    await typeAndBlur(wrapper, '01/06/2026')

    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts).toHaveLength(1)
    expect(alerts[0]!.text()).toBe('Date must be on or after 01/01/2027.')
  })

  it('re-validates when min changes', async () => {
    const wrapper = mountDateInput()
    await typeAndBlur(wrapper, '21/12/2026')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await wrapper.setProps({ min: '2027-01-01' })
    expect(wrapper.get('[role="alert"]').text()).toBe('Date must be on or after 01/01/2027.')
    expect(lastEmitted(wrapper)).toBe('')

    await wrapper.setProps({ min: '2026-11-17' })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(lastEmitted(wrapper)).toBe('2026-12-21')
  })

  it('fills the field from the calendar picker', async () => {
    const wrapper = mountDateInput()
    const native = wrapper.get('input[type="date"]')
    await native.setValue('2027-01-04')

    expect((wrapper.get('input[type="text"]').element as HTMLInputElement).value).toBe('04/01/2027')
    expect(lastEmitted(wrapper)).toBe('2027-01-04')
  })

  it('passes bounds to the calendar picker', () => {
    const wrapper = mountDateInput({ max: null })
    const native = wrapper.get('input[type="date"]')

    expect(native.attributes('min')).toBe('2026-11-17')
    expect(native.attributes('max')).toBeUndefined()
  })

  it('shows a model value set by the parent', async () => {
    const wrapper = mountDateInput({ modelValue: '2026-12-21' })
    const field = wrapper.get('input[type="text"]').element as HTMLInputElement
    expect(field.value).toBe('21/12/2026')

    await wrapper.setProps({ modelValue: '2027-01-04' })
    expect(field.value).toBe('04/01/2027')
  })
})
