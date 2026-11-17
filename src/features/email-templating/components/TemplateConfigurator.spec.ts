import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import TemplateConfigurator from './TemplateConfigurator.vue'
import ToneSelector from './ToneSelector.vue'
import ReasonSelector from './ReasonSelector.vue'
import DateInput from '../../../shared/components/DateInput.vue'
import CollapsibleSection from '../../../shared/components/CollapsibleSection.vue'
import { useTemplateConfiguration } from '../composables/TemplateConfiguration.composable.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'

const { templateConfiguration } = useTemplateConfiguration()

async function resetConfiguration(overrides: Partial<TemplateConfiguration> = {}) {
  templateConfiguration.value = {
    name: '',
    leaveStart: null,
    leaveEnd: null,
    tone: 'formal',
    reason: 'vacation',
    backupName: '',
    backupEmail: '',
    ...overrides,
  }
  await nextTick()
}

function mountConfigurator() {
  return mount(TemplateConfigurator)
}

const nameInput = (wrapper: VueWrapper) => wrapper.find('input[placeholder="e.g. Jordan Lee"]')
const backupNameInput = (wrapper: VueWrapper) => wrapper.find('input[placeholder="e.g. Sam Patel"]')
const backupEmailInput = (wrapper: VueWrapper) =>
  wrapper.find('input[placeholder="sam@company.com"]')
const dateFields = (wrapper: VueWrapper) => wrapper.findAll('.date-input__field')
const nativeDateInputs = (wrapper: VueWrapper) => wrapper.findAll('.date-input__native')
const advancedToggle = (wrapper: VueWrapper) => wrapper.find('.collapsible-section__header')
const advancedContent = (wrapper: VueWrapper) => wrapper.find('.collapsible-section__content')

function labelFor(wrapper: VueWrapper, input: ReturnType<VueWrapper['find']>) {
  return wrapper.find(`label[for="${input.attributes('id')}"]`)
}

function findPill(wrapper: VueWrapper, label: string) {
  const pill = wrapper.findAll('.pill-button').find((button) => button.text() === label)
  if (!pill) throw new Error(`Reason pill not found: ${label}`)
  return pill
}

function findToneRadio(wrapper: VueWrapper, value: string) {
  return wrapper.find(`input[type="radio"][value="${value}"]`)
}

describe('TemplateConfigurator', () => {
  beforeEach(async () => {
    await resetConfiguration()
  })

  describe('rendering', () => {
    it('renders the name field with its label and placeholder', () => {
      const wrapper = mountConfigurator()

      const input = nameInput(wrapper)
      expect(input.exists()).toBe(true)
      expect(labelFor(wrapper, input).text()).toBe('Your Name')
    })

    it('does not mark the name field as optional', () => {
      const wrapper = mountConfigurator()

      expect(labelFor(wrapper, nameInput(wrapper)).text()).not.toContain('(optional)')
    })

    it('renders the leave start and leave end date fields, in order', () => {
      const wrapper = mountConfigurator()

      const fields = dateFields(wrapper)
      expect(fields).toHaveLength(2)
      expect(labelFor(wrapper, fields[0]!).text()).toBe('First day away')
      expect(labelFor(wrapper, fields[1]!).text()).toBe('Back on')
    })

    it('renders the tone selector', () => {
      const wrapper = mountConfigurator()

      expect(wrapper.findComponent(ToneSelector).exists()).toBe(true)
    })

    it('renders an "Advanced options" section with its subtitle', () => {
      const wrapper = mountConfigurator()

      const section = wrapper.findComponent(CollapsibleSection)
      expect(section.find('.collapsible-section__title').text()).toBe('Advanced options')
      expect(section.find('.collapsible-section__subtitle').text()).toBe('Reason, backup contact')
    })

    it('places the reason selector and backup contact fields inside the advanced section', () => {
      const wrapper = mountConfigurator()

      const section = wrapper.findComponent(CollapsibleSection)
      expect(section.findComponent(ReasonSelector).exists()).toBe(true)
      expect(section.find('input[placeholder="e.g. Sam Patel"]').exists()).toBe(true)
      expect(section.find('input[placeholder="sam@company.com"]').exists()).toBe(true)
    })

    it('marks the backup contact fields as optional', () => {
      const wrapper = mountConfigurator()

      const backupNameLabel = labelFor(wrapper, backupNameInput(wrapper))
      const backupEmailLabel = labelFor(wrapper, backupEmailInput(wrapper))
      expect(backupNameLabel.text()).toBe('Backup contact (optional)')
      expect(backupEmailLabel.text()).toBe('Their email (optional)')
    })

    it('renders the backup email field as an email input', () => {
      const wrapper = mountConfigurator()

      expect(backupEmailInput(wrapper).attributes('type')).toBe('email')
    })
  })

  describe('date bounds', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 17, 15, 30))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('prevents picking a day before today on both date fields', () => {
      const wrapper = mountConfigurator()

      for (const native of nativeDateInputs(wrapper)) {
        expect(native.attributes('min')).toBe('2026-11-17')
      }
    })

    it('passes today at local midnight as the minimum date', () => {
      const wrapper = mountConfigurator()

      for (const dateInput of wrapper.findAllComponents(DateInput)) {
        expect(dateInput.props('min')).toEqual(new Date(2026, 10, 17))
      }
    })

    it('sets no upper bound on either date field', () => {
      const wrapper = mountConfigurator()

      for (const native of nativeDateInputs(wrapper)) {
        expect(native.attributes('max')).toBeUndefined()
      }
    })
  })

  describe('advanced options section', () => {
    it('is collapsed by default', () => {
      const wrapper = mountConfigurator()

      expect(advancedToggle(wrapper).attributes('aria-expanded')).toBe('false')
      expect(advancedContent(wrapper).isVisible()).toBe(false)
    })

    it('expands when the user clicks its header', async () => {
      const wrapper = mountConfigurator()

      await advancedToggle(wrapper).trigger('click')

      expect(advancedToggle(wrapper).attributes('aria-expanded')).toBe('true')
      expect(advancedContent(wrapper).isVisible()).toBe(true)
    })

    it('collapses again when the user clicks its header a second time', async () => {
      const wrapper = mountConfigurator()

      await advancedToggle(wrapper).trigger('click')
      await advancedToggle(wrapper).trigger('click')

      expect(advancedContent(wrapper).isVisible()).toBe(false)
    })
  })

  describe('displaying the shared configuration', () => {
    it('shows the configured values in each field', async () => {
      await resetConfiguration({
        name: 'Jordan Lee',
        leaveStart: new Date(2030, 0, 4),
        leaveEnd: new Date(2030, 0, 18),
        tone: 'friendly',
        reason: 'conference',
        backupName: 'Sam Patel',
        backupEmail: 'sam@company.com',
      })

      const wrapper = mountConfigurator()

      expect((nameInput(wrapper).element as HTMLInputElement).value).toBe('Jordan Lee')
      const [start, end] = dateFields(wrapper)
      expect((start!.element as HTMLInputElement).value).toBe('04/01/2030')
      expect((end!.element as HTMLInputElement).value).toBe('18/01/2030')
      expect((findToneRadio(wrapper, 'friendly').element as HTMLInputElement).checked).toBe(true)
      expect(findPill(wrapper, 'Conference').attributes('aria-pressed')).toBe('true')
      expect((backupNameInput(wrapper).element as HTMLInputElement).value).toBe('Sam Patel')
      expect((backupEmailInput(wrapper).element as HTMLInputElement).value).toBe('sam@company.com')
    })

    it('shows empty fields and the default tone and reason for a fresh configuration', () => {
      const wrapper = mountConfigurator()

      expect((nameInput(wrapper).element as HTMLInputElement).value).toBe('')
      for (const field of dateFields(wrapper)) {
        expect((field.element as HTMLInputElement).value).toBe('')
      }
      expect((findToneRadio(wrapper, 'formal').element as HTMLInputElement).checked).toBe(true)
      expect(findPill(wrapper, 'Vacation').attributes('aria-pressed')).toBe('true')
    })

    it('updates the fields when the shared configuration changes elsewhere', async () => {
      const wrapper = mountConfigurator()

      templateConfiguration.value.name = 'Alex Kim'
      templateConfiguration.value.reason = 'sick-leave'
      await nextTick()

      expect((nameInput(wrapper).element as HTMLInputElement).value).toBe('Alex Kim')
      expect(findPill(wrapper, 'Sick leave').attributes('aria-pressed')).toBe('true')
      expect(findPill(wrapper, 'Vacation').attributes('aria-pressed')).toBe('false')
    })
  })

  describe('editing the shared configuration', () => {
    it('updates the name when the user types', async () => {
      const wrapper = mountConfigurator()

      await nameInput(wrapper).setValue('Jordan Lee')

      expect(templateConfiguration.value.name).toBe('Jordan Lee')
    })

    it('updates the leave start when the user picks a day', async () => {
      const wrapper = mountConfigurator()

      await nativeDateInputs(wrapper)[0]!.setValue('2030-01-04')

      expect(templateConfiguration.value.leaveStart).toEqual(new Date(2030, 0, 4))
      expect((dateFields(wrapper)[0]!.element as HTMLInputElement).value).toBe('04/01/2030')
    })

    it('updates the leave end when the user picks a day', async () => {
      const wrapper = mountConfigurator()

      await nativeDateInputs(wrapper)[1]!.setValue('2030-01-18')

      expect(templateConfiguration.value.leaveEnd).toEqual(new Date(2030, 0, 18))
      expect((dateFields(wrapper)[1]!.element as HTMLInputElement).value).toBe('18/01/2030')
    })

    it('updates the tone when the user selects one', async () => {
      const wrapper = mountConfigurator()

      await findToneRadio(wrapper, 'funny').setValue(true)

      expect(templateConfiguration.value.tone).toBe('funny')
    })

    it('updates the reason when the user clicks a reason', async () => {
      const wrapper = mountConfigurator()
      await advancedToggle(wrapper).trigger('click')

      await findPill(wrapper, 'Business trip').trigger('click')

      expect(templateConfiguration.value.reason).toBe('business-trip')
      expect(findPill(wrapper, 'Business trip').attributes('aria-pressed')).toBe('true')
    })

    it('updates the backup contact name when the user types', async () => {
      const wrapper = mountConfigurator()

      await backupNameInput(wrapper).setValue('Sam Patel')

      expect(templateConfiguration.value.backupName).toBe('Sam Patel')
    })

    it('updates the backup email when the user types', async () => {
      const wrapper = mountConfigurator()

      await backupEmailInput(wrapper).setValue('sam@company.com')

      expect(templateConfiguration.value.backupEmail).toBe('sam@company.com')
    })

    it('keeps an invalid backup email in the configuration while showing an error', async () => {
      const wrapper = mountConfigurator()

      await backupEmailInput(wrapper).setValue('not-an-email')
      await backupEmailInput(wrapper).trigger('blur')

      expect(templateConfiguration.value.backupEmail).toBe('not-an-email')
      expect(wrapper.find('[role="alert"]').text()).toBe('Please enter a valid email address.')
    })

    it('clears the leave start when the user empties the date', async () => {
      await resetConfiguration({ leaveStart: new Date(2030, 0, 4) })
      const wrapper = mountConfigurator()

      await nativeDateInputs(wrapper)[0]!.setValue('')

      expect(templateConfiguration.value.leaveStart).toBeNull()
      expect((dateFields(wrapper)[0]!.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('keeping the leave range ordered', () => {
    it('moves the leave end forward when the user picks a start after it', async () => {
      await resetConfiguration({ leaveEnd: new Date(2030, 0, 10) })
      const wrapper = mountConfigurator()

      await nativeDateInputs(wrapper)[0]!.setValue('2030-01-15')

      expect(templateConfiguration.value.leaveEnd).toEqual(new Date(2030, 0, 15))
      expect((dateFields(wrapper)[1]!.element as HTMLInputElement).value).toBe('15/01/2030')
    })

    it('moves the leave start back when the user picks an end before it', async () => {
      await resetConfiguration({ leaveStart: new Date(2030, 0, 15) })
      const wrapper = mountConfigurator()

      await nativeDateInputs(wrapper)[1]!.setValue('2030-01-10')

      expect(templateConfiguration.value.leaveStart).toEqual(new Date(2030, 0, 10))
      expect((dateFields(wrapper)[0]!.element as HTMLInputElement).value).toBe('10/01/2030')
    })

    it('leaves a correctly ordered range untouched', async () => {
      await resetConfiguration({ leaveStart: new Date(2030, 0, 4) })
      const wrapper = mountConfigurator()

      await nativeDateInputs(wrapper)[1]!.setValue('2030-01-18')

      expect(templateConfiguration.value.leaveStart).toEqual(new Date(2030, 0, 4))
      expect(templateConfiguration.value.leaveEnd).toEqual(new Date(2030, 0, 18))
    })
  })
})
