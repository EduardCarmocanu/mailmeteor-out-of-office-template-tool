import { describe, it, expect } from 'vitest'
import { formatDisplayDate, parseDisplayDate, toIsoDate } from '../date'

describe('parseDisplayDate', () => {
  it('parses DD/MM/YYYY into ISO', () => {
    expect(parseDisplayDate('21/12/2026')).toBe('2026-12-21')
    expect(parseDisplayDate(' 04/01/2027 ')).toBe('2027-01-04')
  })

  it('accepts leap days only in leap years', () => {
    expect(parseDisplayDate('29/02/2028')).toBe('2028-02-29')
    expect(parseDisplayDate('29/02/2027')).toBeNull()
  })

  it.each(['', '21/12/26', '1/12/2026', '2026-12-21', '21-12-2026', '12/2026', 'abc'])(
    'rejects badly formatted %j',
    (text) => {
      expect(parseDisplayDate(text)).toBeNull()
    },
  )

  it.each(['31/02/2027', '00/01/2027', '21/13/2026', '31/04/2027'])(
    'rejects non-existent date %j',
    (text) => {
      expect(parseDisplayDate(text)).toBeNull()
    },
  )
})

describe('formatDisplayDate', () => {
  it('formats ISO as DD/MM/YYYY', () => {
    expect(formatDisplayDate('2027-01-04')).toBe('04/01/2027')
  })

  it('returns an empty string for non-ISO input', () => {
    expect(formatDisplayDate('')).toBe('')
    expect(formatDisplayDate('04/01/2027')).toBe('')
  })
})

describe('toIsoDate', () => {
  it('uses local date parts', () => {
    expect(toIsoDate(new Date(2026, 11, 21, 23, 59))).toBe('2026-12-21')
  })
})
