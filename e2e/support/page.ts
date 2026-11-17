import { expect, type Page } from '@playwright/test'

export const PINNED_TODAY = new Date('2026-11-17T10:00:00')

export const SENDER_NAME = 'Jordan Lee'
export const BACKUP_NAME = 'Sam Patel'
export const BACKUP_EMAIL = 'sam@company.com'

export const LEAVE_START = { iso: '2026-12-21', display: '21/12/2026' }
export const LEAVE_END = { iso: '2027-01-04', display: '04/01/2027' }

export const FIRST_DAY_AWAY_LABEL = 'First day away'
export const BACK_ON_LABEL = 'Back on'

export const nameField = (page: Page) => page.getByRole('textbox', { name: 'Your Name' })
export const leaveStartField = (page: Page) =>
  page.getByRole('textbox', { name: FIRST_DAY_AWAY_LABEL, exact: true })
export const leaveEndField = (page: Page) =>
  page.getByRole('textbox', { name: BACK_ON_LABEL, exact: true })
export const backupNameField = (page: Page) => page.getByRole('textbox', { name: 'Backup contact' })
export const backupEmailField = (page: Page) => page.getByRole('textbox', { name: 'Their email' })
export const subjectField = (page: Page) =>
  page.getByRole('textbox', { name: 'Subject:', exact: true })
export const messageField = (page: Page) =>
  page.getByRole('textbox', { name: 'Message', exact: true })
export const reasonGroup = (page: Page) => page.getByRole('group', { name: 'Reason' })
export const toneGroup = (page: Page) => page.getByRole('radiogroup', { name: 'Tone' })

export async function pickDateThroughHiddenNativeInput(page: Page, label: string, isoDate: string) {
  const readonlyDisplayField = page.getByRole('textbox', { name: label, exact: true })
  await page
    .locator('.date-input', { has: readonlyDisplayField })
    .locator('input[type="date"]')
    .fill(isoDate)
  return readonlyDisplayField
}

export async function expandAdvancedOptions(page: Page) {
  const toggle = page.getByRole('button', { name: 'Advanced options' })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
}
