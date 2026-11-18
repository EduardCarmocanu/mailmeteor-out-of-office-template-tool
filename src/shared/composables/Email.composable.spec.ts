import { describe, expect, it } from 'vitest'
import { useEmail } from './Email.composable.ts'

const { isValidEmail } = useEmail()

describe('useEmail', () => {
  describe('isValidEmail', () => {
    it.each(['sam@company.com', 'sam.patel+ooo@mail.company.co.uk'])('accepts %s', (email) => {
      expect(isValidEmail(email)).toBe(true)
    })

    it.each([
      '',
      'sam',
      'sam@company',
      '@company.com',
      'sam@.com',
      'sam patel@company.com',
      ' sam@company.com',
    ])('rejects "%s"', (email) => {
      expect(isValidEmail(email)).toBe(false)
    })
  })
})
