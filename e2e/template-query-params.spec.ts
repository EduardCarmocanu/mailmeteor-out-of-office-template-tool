import { test, expect, type Page } from '@playwright/test'
import {
  BACKUP_EMAIL,
  BACKUP_NAME,
  LEAVE_END,
  LEAVE_START,
  PINNED_TODAY,
  SENDER_NAME,
  backupEmailField,
  backupNameField,
  expandAdvancedOptions,
  leaveEndField,
  leaveStartField,
  nameField,
  reasonGroup,
  subjectField,
  toneGroup,
} from './support/page.ts'

const FULL_CONFIGURATION_QUERY = new URLSearchParams({
  name: SENDER_NAME,
  leaveStart: LEAVE_START.iso,
  leaveEnd: LEAVE_END.iso,
  tone: 'funny',
  reason: 'business-trip',
  backupName: BACKUP_NAME,
  backupEmail: BACKUP_EMAIL,
}).toString()

const currentQueryParams = (page: Page) => Object.fromEntries(new URL(page.url()).searchParams)

test.describe('Template query parameters', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(PINNED_TODAY)
  })

  test('fills the configuration from the query parameters', async ({ page }) => {
    await page.goto(`/?${FULL_CONFIGURATION_QUERY}`)

    await expect(nameField(page)).toHaveValue(SENDER_NAME)
    await expect(leaveStartField(page)).toHaveValue(LEAVE_START.display)
    await expect(leaveEndField(page)).toHaveValue(LEAVE_END.display)
    await expect(toneGroup(page).getByRole('radio', { name: 'Funny' })).toBeChecked()
    await expect(subjectField(page)).toHaveValue('Gone (temporarily) until Jan 4')

    await expandAdvancedOptions(page)
    await expect(reasonGroup(page).getByRole('button', { name: 'Business trip' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(backupNameField(page)).toHaveValue(BACKUP_NAME)
    await expect(backupEmailField(page)).toHaveValue(BACKUP_EMAIL)
  })

  test('updates the query parameters when the configuration changes', async ({ page }) => {
    await page.goto('/')
    await expect
      .poll(() => currentQueryParams(page))
      .toEqual({ tone: 'formal', reason: 'vacation' })

    await nameField(page).fill(SENDER_NAME)
    await toneGroup(page).getByText('Short', { exact: true }).click()

    await expect
      .poll(() => currentQueryParams(page))
      .toEqual({ name: SENDER_NAME, tone: 'short', reason: 'vacation' })

    await nameField(page).fill('')

    await expect.poll(() => currentQueryParams(page)).toEqual({ tone: 'short', reason: 'vacation' })
  })

  test('keeps the configuration after a reload', async ({ page }) => {
    await page.goto('/')
    await nameField(page).fill(SENDER_NAME)
    await toneGroup(page).getByText('Friendly', { exact: true }).click()
    await expect.poll(() => currentQueryParams(page)).toMatchObject({ tone: 'friendly' })

    await page.reload()

    await expect(nameField(page)).toHaveValue(SENDER_NAME)
    await expect(toneGroup(page).getByRole('radio', { name: 'Friendly' })).toBeChecked()
  })

  test('falls back to the defaults for invalid query parameters', async ({ page }) => {
    await page.goto(
      '/?tone=rude&reason=sabbatical&leaveStart=2026-02-30&backupEmail=not-an-email&utm_source=newsletter',
    )

    await expect(toneGroup(page).getByRole('radio', { name: 'Formal' })).toBeChecked()
    await expect(leaveStartField(page)).toHaveValue('')
    await expandAdvancedOptions(page)
    await expect(backupEmailField(page)).toHaveValue('')
    await expect
      .poll(() => currentQueryParams(page))
      .toEqual({ tone: 'formal', reason: 'vacation', utm_source: 'newsletter' })
  })
})
