import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDate } from './Date.composable.ts'

const {
  formatDisplayDate,
  formatLongDate,
  formatShortDate,
  parseIsoDate,
  startOfDay,
  toIsoDate,
  today,
} = useDate()

describe('useDate', () => {
  describe('startOfDay', () => {
    it('returns the same calendar day at local midnight', () => {
      const result = startOfDay(new Date(2026, 11, 21, 15, 42, 7, 123))

      expect(result).toEqual(new Date(2026, 11, 21))
    })

    it('keeps a date that is already at local midnight unchanged', () => {
      const midnight = new Date(2026, 0, 4)

      expect(startOfDay(midnight).getTime()).toBe(midnight.getTime())
    })

    it('stays on the same day one millisecond before midnight', () => {
      const result = startOfDay(new Date(2026, 0, 4, 23, 59, 59, 999))

      expect(result).toEqual(new Date(2026, 0, 4))
    })

    it('returns a new Date instead of mutating its argument', () => {
      const input = new Date(2026, 5, 10, 9, 30)
      const before = input.getTime()

      const result = startOfDay(input)

      expect(result).not.toBe(input)
      expect(input.getTime()).toBe(before)
    })
  })

  describe('today', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns the current day at local midnight', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 10, 17, 18, 5, 30))

      expect(today()).toEqual(new Date(2026, 10, 17))
    })

    it('returns a fresh Date on every call', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 10, 17, 8))

      expect(today()).not.toBe(today())
    })
  })

  describe('toIsoDate', () => {
    it('formats a date as YYYY-MM-DD', () => {
      expect(toIsoDate(new Date(2026, 11, 21))).toBe('2026-12-21')
    })

    it('zero-pads single-digit months and days', () => {
      expect(toIsoDate(new Date(2026, 0, 4))).toBe('2026-01-04')
    })

    it('uses the local calendar day regardless of the time of day', () => {
      expect(toIsoDate(new Date(2026, 2, 1, 0, 0, 0))).toBe('2026-03-01')
      expect(toIsoDate(new Date(2026, 2, 1, 23, 59, 59))).toBe('2026-03-01')
    })

    it('zero-pads the year to four digits', () => {
      const date = new Date(2026, 0, 1)
      date.setFullYear(987)

      expect(toIsoDate(date)).toBe('0987-01-01')
    })
  })

  describe('parseIsoDate', () => {
    it('parses a YYYY-MM-DD string into a local-midnight Date', () => {
      expect(parseIsoDate('2026-12-21')).toEqual(new Date(2026, 11, 21))
    })

    it('parses single-digit months and days written with leading zeros', () => {
      expect(parseIsoDate('2026-01-04')).toEqual(new Date(2026, 0, 4))
    })

    it('accepts February 29 in a leap year', () => {
      expect(parseIsoDate('2028-02-29')).toEqual(new Date(2028, 1, 29))
    })

    it('returns null for an empty string', () => {
      expect(parseIsoDate('')).toBeNull()
    })

    it.each([
      ['2026-02-31', 'a day past the end of the month'],
      ['2027-02-29', 'February 29 in a non-leap year'],
      ['2026-04-31', 'day 31 in a 30-day month'],
      ['2026-13-01', 'month 13'],
      ['2026-00-10', 'month 0'],
      ['2026-05-00', 'day 0'],
    ])('returns null for %s (%s) instead of rolling over', (iso) => {
      expect(parseIsoDate(iso)).toBeNull()
    })

    it.each([
      ['21/12/2026', 'a display-format date'],
      ['2026-1-4', 'missing zero padding'],
      ['2026/12/21', 'slash separators'],
      ['2026-12-21T00:00', 'a trailing time component'],
      [' 2026-12-21', 'leading whitespace'],
      ['2026-12-21 ', 'trailing whitespace'],
      ['abcd-ef-gh', 'non-numeric parts'],
    ])('returns null for %s (%s)', (iso) => {
      expect(parseIsoDate(iso)).toBeNull()
    })

    it('round-trips with toIsoDate', () => {
      const date = new Date(2026, 6, 9)

      expect(parseIsoDate(toIsoDate(date))!.getTime()).toBe(date.getTime())
    })
  })

  describe('formatDisplayDate', () => {
    it('formats a date as DD/MM/YYYY', () => {
      expect(formatDisplayDate(new Date(2026, 11, 21))).toBe('21/12/2026')
    })

    it('zero-pads single-digit days and months', () => {
      expect(formatDisplayDate(new Date(2026, 0, 4))).toBe('04/01/2026')
    })

    it('returns an empty string for null', () => {
      expect(formatDisplayDate(null)).toBe('')
    })
  })

  describe('formatLongDate', () => {
    it('formats a date as weekday, month and day', () => {
      expect(formatLongDate(new Date(2026, 11, 21))).toBe('Monday, December 21')
    })

    it('does not zero-pad the day', () => {
      expect(formatLongDate(new Date(2026, 0, 4))).toBe('Sunday, January 4')
    })
  })

  describe('formatShortDate', () => {
    it('formats a date as abbreviated month and day', () => {
      expect(formatShortDate(new Date(2026, 0, 4))).toBe('Jan 4')
    })

    it('formats a two-digit day', () => {
      expect(formatShortDate(new Date(2026, 11, 21))).toBe('Dec 21')
    })
  })
})
