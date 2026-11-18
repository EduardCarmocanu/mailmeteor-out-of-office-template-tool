import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isRef, nextTick } from 'vue'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'

const { getAll, update } = vi.hoisted(() => ({
  getAll: vi.fn<() => Record<string, string>>(),
  update: vi.fn<(params: Record<string, string | null>) => void>(),
}))

vi.mock('../../../shared/infrastructure/QueryParamClient.ts', () => ({
  queryParamClient: { getAll, update },
}))

type UseTemplateConfiguration =
  typeof import('./TemplateConfiguration.composable.ts').useTemplateConfiguration

let useTemplateConfiguration: UseTemplateConfiguration

async function loadComposable(queryParams: Record<string, string> = {}) {
  vi.resetModules()
  getAll.mockReset().mockReturnValue(queryParams)
  update.mockReset()
  ;({ useTemplateConfiguration } = await import('./TemplateConfiguration.composable.ts'))
}

beforeEach(async () => {
  await loadComposable()
})

describe('useTemplateConfiguration', () => {
  describe('initial state', () => {
    it('exposes the configuration as a ref', () => {
      const { templateConfiguration } = useTemplateConfiguration()

      expect(isRef(templateConfiguration)).toBe(true)
    })

    it('starts with an empty formal vacation configuration', () => {
      const { templateConfiguration } = useTemplateConfiguration()

      expect(templateConfiguration.value).toEqual<TemplateConfiguration>({
        name: '',
        leaveStart: null,
        leaveEnd: null,
        tone: 'formal',
        reason: 'vacation',
        backupName: '',
        backupEmail: '',
      })
    })
  })

  describe('shared state', () => {
    it('returns the same configuration ref on every call', () => {
      const first = useTemplateConfiguration()
      const second = useTemplateConfiguration()

      expect(first.templateConfiguration).toBe(second.templateConfiguration)
    })

    it('makes changes from one caller visible to another', () => {
      const first = useTemplateConfiguration()
      const second = useTemplateConfiguration()

      first.templateConfiguration.value.name = 'Jane'

      expect(second.templateConfiguration.value.name).toBe('Jane')
    })
  })

  describe('applyConfiguration', () => {
    it('overwrites the fields set in the configuration', () => {
      const { templateConfiguration, applyConfiguration } = useTemplateConfiguration()

      applyConfiguration({ tone: 'friendly', reason: 'conference' })

      expect(templateConfiguration.value.tone).toBe('friendly')
      expect(templateConfiguration.value.reason).toBe('conference')
    })

    it('keeps the fields not set in the configuration', () => {
      const { templateConfiguration, applyConfiguration } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 5)
      templateConfiguration.value.name = 'Jane'
      templateConfiguration.value.backupName = 'John'
      templateConfiguration.value.backupEmail = 'john@example.com'
      templateConfiguration.value.leaveStart = leaveStart

      applyConfiguration({ reason: 'holidays' })

      expect(templateConfiguration.value).toEqual<TemplateConfiguration>({
        name: 'Jane',
        leaveStart,
        leaveEnd: null,
        tone: 'formal',
        reason: 'holidays',
        backupName: 'John',
        backupEmail: 'john@example.com',
      })
    })

    it('leaves the configuration unchanged for an empty configuration', () => {
      const { templateConfiguration, applyConfiguration } = useTemplateConfiguration()
      const before = { ...templateConfiguration.value }

      applyConfiguration({})

      expect(templateConfiguration.value).toEqual(before)
    })

    it('mutates the existing configuration object instead of replacing it', () => {
      const { templateConfiguration, applyConfiguration } = useTemplateConfiguration()
      const before = templateConfiguration.value

      applyConfiguration({ tone: 'short' })

      expect(templateConfiguration.value).toBe(before)
    })

    it('applies to the configuration shared with other callers', () => {
      const { applyConfiguration } = useTemplateConfiguration()
      const { templateConfiguration } = useTemplateConfiguration()

      applyConfiguration({ reason: 'parental-leave' })

      expect(templateConfiguration.value.reason).toBe('parental-leave')
    })
  })

  describe('leave date ordering', () => {
    it('moves the leave end forward when the leave start is set after it', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10)
      await nextTick()

      const leaveStart = new Date(2026, 0, 15)
      templateConfiguration.value.leaveStart = leaveStart
      await nextTick()

      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveStart.getTime())
      expect(templateConfiguration.value.leaveStart?.getTime()).toBe(leaveStart.getTime())
    })

    it('moves the leave start back when the leave end is set before it', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      templateConfiguration.value.leaveStart = new Date(2026, 0, 15)
      await nextTick()

      const leaveEnd = new Date(2026, 0, 10)
      templateConfiguration.value.leaveEnd = leaveEnd
      await nextTick()

      expect(templateConfiguration.value.leaveStart?.getTime()).toBe(leaveEnd.getTime())
      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveEnd.getTime())
    })

    it('copies the date instead of sharing the same Date instance', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10)
      await nextTick()

      templateConfiguration.value.leaveStart = new Date(2026, 0, 15)
      await nextTick()

      expect(templateConfiguration.value.leaveEnd).not.toBe(templateConfiguration.value.leaveStart)
    })

    it('keeps valid dates untouched when the leave start is before the leave end', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 5)
      const leaveEnd = new Date(2026, 0, 10)

      templateConfiguration.value.leaveStart = leaveStart
      templateConfiguration.value.leaveEnd = leaveEnd
      await nextTick()

      expect(templateConfiguration.value.leaveStart).toBe(leaveStart)
      expect(templateConfiguration.value.leaveEnd).toBe(leaveEnd)
    })

    it('keeps the dates untouched when the leave start equals the leave end', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 10)
      const leaveEnd = new Date(2026, 0, 10)

      templateConfiguration.value.leaveStart = leaveStart
      templateConfiguration.value.leaveEnd = leaveEnd
      await nextTick()

      expect(templateConfiguration.value.leaveStart).toBe(leaveStart)
      expect(templateConfiguration.value.leaveEnd).toBe(leaveEnd)
    })

    it('compares down to the millisecond, not just the calendar day', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10, 9, 0)
      await nextTick()

      const leaveStart = new Date(2026, 0, 10, 17, 0)
      templateConfiguration.value.leaveStart = leaveStart
      await nextTick()

      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveStart.getTime())
    })

    it('does not set the leave end when only the leave start is set', async () => {
      const { templateConfiguration } = useTemplateConfiguration()

      templateConfiguration.value.leaveStart = new Date(2026, 0, 15)
      await nextTick()

      expect(templateConfiguration.value.leaveEnd).toBeNull()
    })

    it('does not set the leave start when only the leave end is set', async () => {
      const { templateConfiguration } = useTemplateConfiguration()

      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10)
      await nextTick()

      expect(templateConfiguration.value.leaveStart).toBeNull()
    })

    it('keeps the leave end when the leave start is cleared', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      const leaveEnd = new Date(2026, 0, 10)
      templateConfiguration.value.leaveStart = new Date(2026, 0, 5)
      templateConfiguration.value.leaveEnd = leaveEnd
      await nextTick()

      templateConfiguration.value.leaveStart = null
      await nextTick()

      expect(templateConfiguration.value.leaveStart).toBeNull()
      expect(templateConfiguration.value.leaveEnd).toBe(leaveEnd)
    })

    it('keeps the leave start when the leave end is cleared', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 5)
      templateConfiguration.value.leaveStart = leaveStart
      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10)
      await nextTick()

      templateConfiguration.value.leaveEnd = null
      await nextTick()

      expect(templateConfiguration.value.leaveStart).toBe(leaveStart)
      expect(templateConfiguration.value.leaveEnd).toBeNull()
    })

    it('reorders the dates when an applied configuration sets the leave start after the current leave end', async () => {
      const { templateConfiguration, applyConfiguration } = useTemplateConfiguration()
      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10)
      await nextTick()

      const leaveStart = new Date(2026, 0, 20)
      applyConfiguration({ leaveStart })
      await nextTick()

      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveStart.getTime())
    })

    it('moves the leave end to the leave start when both are set out of order at once', async () => {
      const { templateConfiguration, applyConfiguration } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 20)

      applyConfiguration({ leaveStart, leaveEnd: new Date(2026, 0, 10) })
      await nextTick()

      expect(templateConfiguration.value.leaveStart).toBe(leaveStart)
      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveStart.getTime())
    })

    it('reorders the dates when the whole configuration is replaced', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 20)

      templateConfiguration.value = {
        ...templateConfiguration.value,
        leaveStart,
        leaveEnd: new Date(2026, 0, 10),
      }
      await nextTick()

      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveStart.getTime())
    })

    it('applies the correction asynchronously, before the next tick resolves', async () => {
      const { templateConfiguration } = useTemplateConfiguration()
      const leaveEnd = new Date(2026, 0, 10)
      templateConfiguration.value.leaveEnd = leaveEnd
      await nextTick()

      templateConfiguration.value.leaveStart = new Date(2026, 0, 15)

      expect(templateConfiguration.value.leaveEnd).toBe(leaveEnd)
      await nextTick()
      expect(templateConfiguration.value.leaveEnd).not.toBe(leaveEnd)
    })
  })

  describe('query parameters', () => {
    describe('loading', () => {
      it('sets every field from valid query parameters', async () => {
        await loadComposable({
          name: 'Jordan Lee',
          leaveStart: '2026-12-21',
          leaveEnd: '2027-01-04',
          tone: 'funny',
          reason: 'business-trip',
          backupName: 'Sam Patel',
          backupEmail: 'sam@company.com',
        })

        const { templateConfiguration } = useTemplateConfiguration()

        expect(templateConfiguration.value).toEqual<TemplateConfiguration>({
          name: 'Jordan Lee',
          leaveStart: new Date(2026, 11, 21),
          leaveEnd: new Date(2027, 0, 4),
          tone: 'funny',
          reason: 'business-trip',
          backupName: 'Sam Patel',
          backupEmail: 'sam@company.com',
        })
      })

      it('keeps the defaults for fields missing from the query parameters', async () => {
        await loadComposable({ tone: 'short' })

        const { templateConfiguration } = useTemplateConfiguration()

        expect(templateConfiguration.value).toEqual<TemplateConfiguration>({
          name: '',
          leaveStart: null,
          leaveEnd: null,
          tone: 'short',
          reason: 'vacation',
          backupName: '',
          backupEmail: '',
        })
      })

      it('ignores an unknown tone', async () => {
        await loadComposable({ tone: 'rude' })

        expect(useTemplateConfiguration().templateConfiguration.value.tone).toBe('formal')
      })

      it('ignores an unknown reason', async () => {
        await loadComposable({ reason: 'sabbatical' })

        expect(useTemplateConfiguration().templateConfiguration.value.reason).toBe('vacation')
      })

      it('ignores dates that are not in the YYYY-MM-DD format', async () => {
        await loadComposable({ leaveStart: '21/12/2026', leaveEnd: 'tomorrow' })

        const { templateConfiguration } = useTemplateConfiguration()

        expect(templateConfiguration.value.leaveStart).toBeNull()
        expect(templateConfiguration.value.leaveEnd).toBeNull()
      })

      it('ignores dates that do not exist in the calendar', async () => {
        await loadComposable({ leaveStart: '2026-02-30' })

        expect(useTemplateConfiguration().templateConfiguration.value.leaveStart).toBeNull()
      })

      it('ignores empty values', async () => {
        await loadComposable({ name: '', tone: '', leaveStart: '' })

        const { templateConfiguration } = useTemplateConfiguration()

        expect(templateConfiguration.value.name).toBe('')
        expect(templateConfiguration.value.tone).toBe('formal')
        expect(templateConfiguration.value.leaveStart).toBeNull()
      })

      it('accepts text values of exactly 100 characters', async () => {
        const maxLengthText = 'a'.repeat(100)
        await loadComposable({
          name: maxLengthText,
          backupName: maxLengthText,
          backupEmail: maxLengthText,
        })

        const { templateConfiguration } = useTemplateConfiguration()

        expect(templateConfiguration.value.name).toBe(maxLengthText)
        expect(templateConfiguration.value.backupName).toBe(maxLengthText)
        expect(templateConfiguration.value.backupEmail).toBe(maxLengthText)
      })

      it('ignores text values longer than 100 characters', async () => {
        const tooLongText = 'a'.repeat(101)
        await loadComposable({
          name: tooLongText,
          backupName: tooLongText,
          backupEmail: tooLongText,
        })

        const { templateConfiguration } = useTemplateConfiguration()

        expect(templateConfiguration.value.name).toBe('')
        expect(templateConfiguration.value.backupName).toBe('')
        expect(templateConfiguration.value.backupEmail).toBe('')
      })

      it('moves the leave end to the leave start when they are out of order', async () => {
        await loadComposable({ leaveStart: '2026-12-21', leaveEnd: '2026-12-01' })
        const { templateConfiguration } = useTemplateConfiguration()
        await nextTick()

        expect(templateConfiguration.value.leaveEnd).toEqual(new Date(2026, 11, 21))
      })
    })

    describe('writing', () => {
      it('writes the initial configuration as soon as it loads', () => {
        expect(update).toHaveBeenCalledExactlyOnceWith({
          name: null,
          leaveStart: null,
          leaveEnd: null,
          tone: 'formal',
          reason: 'vacation',
          backupName: null,
          backupEmail: null,
        })
      })

      it('writes the configuration loaded from the query parameters', async () => {
        await loadComposable({ name: 'Jordan Lee', tone: 'rude' })

        expect(update).toHaveBeenLastCalledWith(
          expect.objectContaining({ name: 'Jordan Lee', tone: 'formal' }),
        )
      })

      it('writes the configuration when a field changes', async () => {
        const { templateConfiguration } = useTemplateConfiguration()

        templateConfiguration.value.name = 'Jordan Lee'
        await nextTick()

        expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Jordan Lee' }))
      })

      it('writes the leave dates in the YYYY-MM-DD format', async () => {
        const { templateConfiguration } = useTemplateConfiguration()

        templateConfiguration.value.leaveStart = new Date(2026, 11, 21)
        templateConfiguration.value.leaveEnd = new Date(2027, 0, 4)
        await nextTick()

        expect(update).toHaveBeenLastCalledWith(
          expect.objectContaining({ leaveStart: '2026-12-21', leaveEnd: '2027-01-04' }),
        )
      })

      it('writes null for fields that are cleared', async () => {
        await loadComposable({ name: 'Jordan Lee', leaveStart: '2026-12-21' })
        const { templateConfiguration } = useTemplateConfiguration()

        templateConfiguration.value.name = ''
        templateConfiguration.value.leaveStart = null
        await nextTick()

        expect(update).toHaveBeenLastCalledWith(
          expect.objectContaining({ name: null, leaveStart: null }),
        )
      })

      it('writes the configuration when a configuration is applied', async () => {
        const { applyConfiguration } = useTemplateConfiguration()

        applyConfiguration({ tone: 'friendly', reason: 'conference' })
        await nextTick()

        expect(update).toHaveBeenLastCalledWith(
          expect.objectContaining({ tone: 'friendly', reason: 'conference' }),
        )
      })

      it('writes the configuration when it is replaced as a whole', async () => {
        const { templateConfiguration } = useTemplateConfiguration()

        templateConfiguration.value = { ...templateConfiguration.value, backupName: 'Sam Patel' }
        await nextTick()

        expect(update).toHaveBeenLastCalledWith(
          expect.objectContaining({ backupName: 'Sam Patel' }),
        )
      })
    })
  })
})
