import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isRef, nextTick } from 'vue'
import type { TemplateConfiguration } from '../models/TemplateConfiguration.model.ts'

type UseTemplateConfiguration =
  typeof import('./TemplateConfiguration.composable.ts').useTemplateConfiguration

let useTemplateConfiguration: UseTemplateConfiguration

// The configuration and its watchers live at module level, so each test loads a fresh copy
// of the module to start from the default state with its own watchers.
beforeEach(async () => {
  vi.resetModules()
  ;({ useTemplateConfiguration } = await import('./TemplateConfiguration.composable.ts'))
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

  describe('applyPreset', () => {
    it('overwrites the fields set in the preset', () => {
      const { templateConfiguration, applyPreset } = useTemplateConfiguration()

      applyPreset({ tone: 'friendly', reason: 'conference' })

      expect(templateConfiguration.value.tone).toBe('friendly')
      expect(templateConfiguration.value.reason).toBe('conference')
    })

    it('keeps the fields not set in the preset', () => {
      const { templateConfiguration, applyPreset } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 5)
      templateConfiguration.value.name = 'Jane'
      templateConfiguration.value.backupName = 'John'
      templateConfiguration.value.backupEmail = 'john@example.com'
      templateConfiguration.value.leaveStart = leaveStart

      applyPreset({ reason: 'holidays' })

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

    it('leaves the configuration unchanged for an empty preset', () => {
      const { templateConfiguration, applyPreset } = useTemplateConfiguration()
      const before = { ...templateConfiguration.value }

      applyPreset({})

      expect(templateConfiguration.value).toEqual(before)
    })

    it('mutates the existing configuration object instead of replacing it', () => {
      const { templateConfiguration, applyPreset } = useTemplateConfiguration()
      const before = templateConfiguration.value

      applyPreset({ tone: 'short' })

      expect(templateConfiguration.value).toBe(before)
    })

    it('applies to the configuration shared with other callers', () => {
      const { applyPreset } = useTemplateConfiguration()
      const { templateConfiguration } = useTemplateConfiguration()

      applyPreset({ reason: 'parental-leave' })

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

    it('reorders the dates when a preset sets the leave start after the current leave end', async () => {
      const { templateConfiguration, applyPreset } = useTemplateConfiguration()
      templateConfiguration.value.leaveEnd = new Date(2026, 0, 10)
      await nextTick()

      const leaveStart = new Date(2026, 0, 20)
      applyPreset({ leaveStart })
      await nextTick()

      expect(templateConfiguration.value.leaveEnd?.getTime()).toBe(leaveStart.getTime())
    })

    it('moves the leave end to the leave start when both are set out of order at once', async () => {
      const { templateConfiguration, applyPreset } = useTemplateConfiguration()
      const leaveStart = new Date(2026, 0, 20)

      applyPreset({ leaveStart, leaveEnd: new Date(2026, 0, 10) })
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
})
