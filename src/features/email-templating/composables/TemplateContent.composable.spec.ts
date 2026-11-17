import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick, reactive, type EffectScope } from 'vue'
import {
  BASE_TEMPLATES,
  generateTemplate,
  toTemplateValues,
  useTemplateContent,
  type TemplateValues,
} from './TemplateContent.composable.ts'
import type { Reason } from '../models/Reason.model.ts'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'
import type { Tone } from '../models/Tone.model.ts'

// Local-midnight calendar days, as produced by the date input.
const MONDAY_DEC_21 = new Date(2026, 11, 21)
const MONDAY_JAN_4 = new Date(2027, 0, 4)

function makeConfiguration(overrides: Partial<TemplateConfiguration> = {}): TemplateConfiguration {
  return {
    name: 'Alex Morgan',
    leaveStart: MONDAY_DEC_21,
    leaveEnd: MONDAY_JAN_4,
    tone: 'formal',
    reason: 'vacation',
    backupName: 'Sam Patel',
    backupEmail: 'sam@company.com',
    ...overrides,
  }
}

function makeValues(overrides: Partial<TemplateValues> = {}): TemplateValues {
  return {
    name: 'Alex Morgan',
    leaveStart: 'Monday, December 21',
    leaveEnd: 'Monday, January 4',
    leaveEndShort: 'Jan 4',
    reasonPhrase: 'on vacation',
    backup: { name: 'Sam Patel', email: 'sam@company.com' },
    ...overrides,
  }
}

describe('toTemplateValues', () => {
  it('formats a fully filled configuration for insertion into a template', () => {
    expect(toTemplateValues(makeConfiguration())).toEqual(makeValues())
  })

  it('trims the name', () => {
    expect(toTemplateValues(makeConfiguration({ name: '  Alex Morgan  ' })).name).toBe(
      'Alex Morgan',
    )
  })

  it('uses a placeholder when the name is empty', () => {
    expect(toTemplateValues(makeConfiguration({ name: '' })).name).toBe('[Your name]')
  })

  it('uses a placeholder when the name is only whitespace', () => {
    expect(toTemplateValues(makeConfiguration({ name: '   ' })).name).toBe('[Your name]')
  })

  it('uses a placeholder when the leave start is not set', () => {
    expect(toTemplateValues(makeConfiguration({ leaveStart: null })).leaveStart).toBe(
      '[first day away]',
    )
  })

  it('uses a placeholder and no short date when the leave end is not set', () => {
    const values = toTemplateValues(makeConfiguration({ leaveEnd: null }))

    expect(values.leaveEnd).toBe('[back on]')
    expect(values.leaveEndShort).toBeNull()
  })

  it.each<[Reason, string]>([
    ['vacation', 'on vacation'],
    ['holidays', 'away for the holidays'],
    ['business-trip', 'on a business trip'],
    ['conference', 'at a conference'],
    ['sick-leave', 'on sick leave'],
    ['parental-leave', 'on parental leave'],
  ])('phrases the %s reason as "%s"', (reason, phrase) => {
    expect(toTemplateValues(makeConfiguration({ reason })).reasonPhrase).toBe(phrase)
  })

  describe('backup', () => {
    it('trims the backup name and email', () => {
      const values = toTemplateValues(
        makeConfiguration({ backupName: ' Sam Patel ', backupEmail: ' sam@company.com ' }),
      )

      expect(values.backup).toEqual({ name: 'Sam Patel', email: 'sam@company.com' })
    })

    it('sets the email to null when only the backup name is given', () => {
      const values = toTemplateValues(makeConfiguration({ backupEmail: '' }))

      expect(values.backup).toEqual({ name: 'Sam Patel', email: null })
    })

    it('treats a whitespace-only backup email as missing', () => {
      const values = toTemplateValues(makeConfiguration({ backupEmail: '   ' }))

      expect(values.backup).toEqual({ name: 'Sam Patel', email: null })
    })

    it('omits the backup when the backup name is empty', () => {
      expect(toTemplateValues(makeConfiguration({ backupName: '' })).backup).toBeNull()
    })

    it('omits the backup when only a backup email is given', () => {
      const values = toTemplateValues(
        makeConfiguration({ backupName: '   ', backupEmail: 'sam@company.com' }),
      )

      expect(values.backup).toBeNull()
    })
  })
})

describe('BASE_TEMPLATES', () => {
  it('provides one template per tone', () => {
    expect(Object.keys(BASE_TEMPLATES).sort()).toEqual(['formal', 'friendly', 'funny', 'short'])
  })

  describe('formal', () => {
    it('builds the full message with a backup contact', () => {
      expect(BASE_TEMPLATES.formal(makeValues())).toEqual({
        subject: 'Out of office until Jan 4',
        body: [
          'Hello,',
          'Thank you for your email. I am on vacation from Monday, December 21 and will be back on Monday, January 4, with limited access to email in the meantime.',
          'For urgent matters, please contact Sam Patel (sam@company.com).',
          'I will respond to your message as soon as possible after my return.',
          'Kind regards,\nAlex Morgan',
        ].join('\n\n'),
      })
    })

    it('mentions only the backup name when there is no backup email', () => {
      const { body } = BASE_TEMPLATES.formal(
        makeValues({ backup: { name: 'Sam Patel', email: null } }),
      )

      expect(body).toContain('For urgent matters, please contact Sam Patel.')
    })

    it('leaves out the backup paragraph when there is no backup', () => {
      const { body } = BASE_TEMPLATES.formal(makeValues({ backup: null }))

      expect(body).not.toContain('urgent')
      expect(body.split('\n\n')).toHaveLength(4)
    })

    it('drops the return date from the subject when there is no short date', () => {
      expect(BASE_TEMPLATES.formal(makeValues({ leaveEndShort: null })).subject).toBe(
        'Out of office',
      )
    })
  })

  describe('friendly', () => {
    it('builds the full message with a backup contact', () => {
      expect(BASE_TEMPLATES.friendly(makeValues())).toEqual({
        subject: 'Away until Jan 4',
        body: [
          'Hi there!',
          "Thanks so much for reaching out. I'm on vacation from Monday, December 21 and will be back on Monday, January 4.",
          "If something can't wait, Sam Patel (sam@company.com) will be happy to help.",
          "I'll get back to you as soon as I can once I'm back.",
          'Talk soon,\nAlex Morgan',
        ].join('\n\n'),
      })
    })

    it('leaves out the backup paragraph when there is no backup', () => {
      const { body } = BASE_TEMPLATES.friendly(makeValues({ backup: null }))

      expect(body).not.toContain("can't wait")
      expect(body.split('\n\n')).toHaveLength(4)
    })

    it('drops the return date from the subject when there is no short date', () => {
      expect(BASE_TEMPLATES.friendly(makeValues({ leaveEndShort: null })).subject).toBe('Away')
    })
  })

  describe('funny', () => {
    it('builds the full message with a backup contact', () => {
      expect(BASE_TEMPLATES.funny(makeValues())).toEqual({
        subject: 'Gone (temporarily) until Jan 4',
        body: [
          'Hey!',
          "Your email has arrived safely, but I haven't.",
          "I'm on vacation from Monday, December 21 and will return to my inbox on Monday, January 4, coffee in hand.",
          "If it's truly urgent, Sam Patel (sam@company.com) has kindly agreed to be me while I'm away.",
          "Until then, your message will wait patiently. I'll reply once I'm back.",
          'Cheers,\nAlex Morgan',
        ].join('\n\n'),
      })
    })

    it('leaves out the backup paragraph when there is no backup', () => {
      const { body } = BASE_TEMPLATES.funny(makeValues({ backup: null }))

      expect(body).not.toContain('truly urgent')
      expect(body.split('\n\n')).toHaveLength(5)
    })

    it('drops the return date from the subject when there is no short date', () => {
      expect(BASE_TEMPLATES.funny(makeValues({ leaveEndShort: null })).subject).toBe(
        'Gone (temporarily)',
      )
    })
  })

  describe('short', () => {
    it('builds the full message with a backup contact', () => {
      expect(BASE_TEMPLATES.short(makeValues())).toEqual({
        subject: 'Out of office until Jan 4',
        body: [
          "I'm on vacation until Monday, January 4.",
          'For anything urgent, contact Sam Patel (sam@company.com).',
          'Thanks,\nAlex Morgan',
        ].join('\n\n'),
      })
    })

    it('does not mention the leave start', () => {
      const { body } = BASE_TEMPLATES.short(makeValues())

      expect(body).not.toContain('December 21')
    })

    it('leaves out the backup paragraph when there is no backup', () => {
      const { body } = BASE_TEMPLATES.short(makeValues({ backup: null }))

      expect(body).toBe("I'm on vacation until Monday, January 4.\n\nThanks,\nAlex Morgan")
    })
  })
})

describe('generateTemplate', () => {
  it.each<Tone>(['formal', 'friendly', 'funny', 'short'])(
    'uses the %s base template for the %s tone',
    (tone) => {
      const config = makeConfiguration({ tone })

      expect(generateTemplate(config)).toEqual(BASE_TEMPLATES[tone](toTemplateValues(config)))
    },
  )

  it('inserts the reason phrase into the message', () => {
    const { body } = generateTemplate(makeConfiguration({ reason: 'parental-leave' }))

    expect(body).toContain('I am on parental leave from Monday, December 21')
  })

  it('keeps placeholders visible for an empty configuration', () => {
    const template = generateTemplate(
      makeConfiguration({
        name: '',
        leaveStart: null,
        leaveEnd: null,
        backupName: '',
        backupEmail: '',
      }),
    )

    expect(template).toEqual({
      subject: 'Out of office',
      body: [
        'Hello,',
        'Thank you for your email. I am on vacation from [first day away] and will be back on [back on], with limited access to email in the meantime.',
        'I will respond to your message as soon as possible after my return.',
        'Kind regards,\n[Your name]',
      ].join('\n\n'),
    })
  })
})

describe('useTemplateContent', () => {
  let scope: EffectScope | undefined

  // Runs the composable in an effect scope so its watcher is stopped after each test.
  function setup(overrides: Partial<TemplateConfiguration> = {}) {
    const configuration = reactive(makeConfiguration(overrides))
    scope = effectScope()
    const content = scope.run(() => useTemplateContent(configuration))!
    return { configuration, ...content }
  }

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  describe('initial state', () => {
    it('starts with the subject and body generated from the configuration', () => {
      const { configuration, subject, body } = setup()
      const expected = generateTemplate(configuration)

      expect(subject.value).toBe(expected.subject)
      expect(body.value).toBe(expected.body)
    })

    it('is not edited', () => {
      const { isEdited } = setup()

      expect(isEdited.value).toBe(false)
    })

    it('works with a plain, non-reactive configuration', () => {
      const config = makeConfiguration({ tone: 'short' })
      scope = effectScope()
      const { subject, body, isEdited } = scope.run(() => useTemplateContent(config))!

      expect(subject.value).toBe('Out of office until Jan 4')
      expect(body.value).toBe(generateTemplate(config).body)
      expect(isEdited.value).toBe(false)
    })
  })

  describe('isEdited', () => {
    it('becomes true when the subject is changed', () => {
      const { subject, isEdited } = setup()

      subject.value = 'Custom subject'

      expect(isEdited.value).toBe(true)
    })

    it('becomes true when the body is changed', () => {
      const { body, isEdited } = setup()

      body.value += '\n\nP.S. Back soon.'

      expect(isEdited.value).toBe(true)
    })

    it('becomes false again when the edits are manually undone', () => {
      const { subject, isEdited } = setup()
      const original = subject.value

      subject.value = 'Custom subject'
      subject.value = original

      expect(isEdited.value).toBe(false)
    })

    it('treats clearing the subject as an edit', () => {
      const { subject, isEdited } = setup()

      subject.value = ''

      expect(isEdited.value).toBe(true)
    })
  })

  describe('reset', () => {
    it('restores the generated subject and body after edits', () => {
      const { configuration, subject, body, isEdited, reset } = setup()

      subject.value = 'Custom subject'
      body.value = 'Custom body'
      reset()

      const expected = generateTemplate(configuration)
      expect(subject.value).toBe(expected.subject)
      expect(body.value).toBe(expected.body)
      expect(isEdited.value).toBe(false)
    })

    it('leaves unedited content unchanged', () => {
      const { subject, body, reset } = setup()
      const before = { subject: subject.value, body: body.value }

      reset()

      expect({ subject: subject.value, body: body.value }).toEqual(before)
    })

    it('restores content generated from the latest configuration', async () => {
      const { configuration, subject, reset } = setup()

      configuration.tone = 'friendly'
      await nextTick()
      subject.value = 'Custom subject'
      reset()

      expect(subject.value).toBe('Away until Jan 4')
    })
  })

  describe('reactivity', () => {
    it('regenerates the message when the tone changes', async () => {
      const { configuration, subject, body } = setup()

      configuration.tone = 'funny'
      await nextTick()

      expect(subject.value).toBe('Gone (temporarily) until Jan 4')
      expect(body.value).toBe(generateTemplate(configuration).body)
    })

    it('regenerates the message when the reason changes', async () => {
      const { configuration, body } = setup()

      configuration.reason = 'conference'
      await nextTick()

      expect(body.value).toContain('I am at a conference from')
    })

    it('regenerates the message when the name changes', async () => {
      const { configuration, body } = setup()

      configuration.name = 'Jordan Lee'
      await nextTick()

      expect(body.value).toMatch(/Kind regards,\nJordan Lee$/)
    })

    it('regenerates the message when the leave dates change', async () => {
      const { configuration, subject, body } = setup()

      configuration.leaveStart = new Date(2026, 11, 24)
      configuration.leaveEnd = new Date(2027, 0, 11)
      await nextTick()

      expect(subject.value).toBe('Out of office until Jan 11')
      expect(body.value).toContain(
        'from Thursday, December 24 and will be back on Monday, January 11',
      )
    })

    it('falls back to placeholders when the leave dates are cleared', async () => {
      const { configuration, subject, body } = setup()

      configuration.leaveStart = null
      configuration.leaveEnd = null
      await nextTick()

      expect(subject.value).toBe('Out of office')
      expect(body.value).toContain('from [first day away] and will be back on [back on]')
    })

    it('adds and removes the backup paragraph as the backup name changes', async () => {
      const { configuration, body } = setup({ backupName: '', backupEmail: '' })
      expect(body.value).not.toContain('For urgent matters')

      configuration.backupName = 'Sam Patel'
      await nextTick()
      expect(body.value).toContain('For urgent matters, please contact Sam Patel.')

      configuration.backupEmail = 'sam@company.com'
      await nextTick()
      expect(body.value).toContain(
        'For urgent matters, please contact Sam Patel (sam@company.com).',
      )

      configuration.backupName = ''
      await nextTick()
      expect(body.value).not.toContain('For urgent matters')
    })

    it('replaces manual edits when the configuration changes', async () => {
      const { configuration, subject, body, isEdited } = setup()

      subject.value = 'Custom subject'
      body.value = 'Custom body'
      configuration.tone = 'short'
      await nextTick()

      expect(subject.value).toBe('Out of office until Jan 4')
      expect(body.value).toBe(generateTemplate(configuration).body)
      expect(isEdited.value).toBe(false)
    })

    it('replaces manual edits even when the change does not alter the generated message', async () => {
      // With no backup name the backup email is unused, but editing it still regenerates.
      const { configuration, subject, isEdited } = setup({ backupName: '', backupEmail: '' })

      subject.value = 'Custom subject'
      configuration.backupEmail = 'sam@company.com'
      await nextTick()

      expect(subject.value).toBe('Out of office until Jan 4')
      expect(isEdited.value).toBe(false)
    })

    it('does not track a configuration object that replaces the one it was given', async () => {
      const state = reactive({ configuration: makeConfiguration() })
      scope = effectScope()
      const { subject } = scope.run(() => useTemplateContent(state.configuration))!

      state.configuration = makeConfiguration({ tone: 'funny' })
      await nextTick()

      expect(subject.value).toBe('Out of office until Jan 4')
    })
  })
})
